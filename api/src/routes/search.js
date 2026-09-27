'use strict';
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const yts = require('yt-search');
const YTMusic = require('ytmusic-api');

function getYtdlpPath() {
  if (process.platform === 'win32') return path.join(__dirname, '../../../../vexa music/yt-dlp.exe');
  if (process.platform === 'darwin') return path.join(__dirname, '../../../../vexa music/yt-dlp_macos');
  return 'yt-dlp';
}

const YTDLP = getYtdlpPath();

// A plain YouTube search (even scoped with the legacy `category=music`
// param) still surfaces news clips, speeches and full movies alongside
// songs — YouTube's own category filter no longer restricts results server
// side. ytmusic-api queries YouTube *Music*'s "Songs" search instead, which
// only ever returns actual songs. Initialized once and reused.
let ytmusicReady = null;
function getYtmusic() {
  if (!ytmusicReady) {
    const client = new YTMusic();
    ytmusicReady = client.initialize().then(() => client).catch(err => {
      ytmusicReady = null; // allow a later request to retry initialization
      throw err;
    });
  }
  return ytmusicReady;
}

function pickThumbnail(thumbnails) {
  if (!thumbnails || thumbnails.length === 0) return undefined;
  return thumbnails[thumbnails.length - 1].url;
}

async function searchRoutes(fastify) {
  // Search tracks — only real songs, never news/movies/talk shows.
  fastify.get('/search', async (req, reply) => {
    const { q } = req.query;
    if (!q) return reply.code(400).send({ error: 'query required' });
    try {
      const ytmusic = await getYtmusic();
      const songs = await ytmusic.searchSongs(q);
      const tracks = songs
        .filter(s => s.videoId)
        .slice(0, 20)
        .map(s => ({
          id: s.videoId,
          title: s.name,
          artist: s.artist?.name || 'Unknown',
          duration: s.duration || 0,
          thumbnail: pickThumbnail(s.thumbnails),
          sourceUrl: `https://www.youtube.com/watch?v=${s.videoId}`,
          sourceType: 'youtube',
        }));
      return reply.send({ results: tracks });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Search failed' });
    }
  });

  // Get track info / resolve
  fastify.get('/tracks/:id', async (req, reply) => {
    const { id } = req.params;
    try {
      const res = await yts({ videoId: id });
      if (!res || !res.title) return reply.code(404).send({ error: 'Track not found' });
      return reply.send({
        id: res.videoId || id,
        title: res.title,
        artist: res.author?.name || 'Unknown',
        duration: res.duration?.seconds || 0,
        thumbnail: res.thumbnail,
        sourceUrl: res.url,
        sourceType: 'youtube',
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Track lookup failed' });
    }
  });

  // Get direct stream URL from yt-dlp
  fastify.get('/stream-url/:id', async (req, reply) => {
    const { id } = req.params;
    const url = `https://www.youtube.com/watch?v=${id}`;
    return new Promise((resolve) => {
      const proc = spawn(YTDLP, [
        '-f', 'bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio',
        '--get-url', '--no-playlist', '--no-warnings', url,
      ]);
      let out = '';
      let errOut = '';
      proc.stdout.on('data', d => out += d.toString());
      proc.stderr.on('data', d => errOut += d.toString());
      proc.on('close', code => {
        const streamUrl = out.trim().split('\n')[0];
        if (code !== 0 || !streamUrl) {
          reply.code(500).send({ error: 'URL extraction failed', detail: errOut.slice(0, 200) });
          return resolve();
        }
        reply.send({ url: streamUrl, id });
        resolve();
      });
      proc.on('error', err => {
        reply.code(500).send({ error: 'yt-dlp not found', detail: err.message });
        resolve();
      });
    });
  });
}

module.exports = searchRoutes;
