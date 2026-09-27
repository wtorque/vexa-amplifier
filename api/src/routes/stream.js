'use strict';
const { spawn } = require('child_process');
const path = require('path');

function getYtdlpPath() {
  if (process.platform === 'win32') return path.join(__dirname, '../../../../vexa music/yt-dlp.exe');
  if (process.platform === 'darwin') return path.join(__dirname, '../../../../vexa music/yt-dlp_macos');
  return 'yt-dlp';
}
function getFfmpegPath() {
  try { return require('ffmpeg-static') || 'ffmpeg'; } catch { return 'ffmpeg'; }
}

const YTDLP = getYtdlpPath();
const FFMPEG = getFfmpegPath();

// Active stream processes keyed by streamId
const activeStreams = new Map();

// Resolved direct-media URLs from yt-dlp are cached briefly so switching
// amplifier settings on the same track doesn't re-spawn yt-dlp every time.
const directUrlCache = new Map(); // id -> { url, expiresAt }
const DIRECT_URL_TTL_MS = 3 * 60 * 60 * 1000; // googlevideo URLs expire ~6h; stay well inside that

function resolveDirectUrl(id) {
  const cached = directUrlCache.get(id);
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.url);

  const url = `https://www.youtube.com/watch?v=${id}`;
  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP, [
      '-f', 'bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio',
      '--get-url', '--no-playlist', '--no-warnings', url,
    ]);
    let out = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.on('close', code => {
      const directUrl = out.trim().split('\n')[0];
      if (code !== 0 || !directUrl) return reject(new Error('URL extraction failed'));
      directUrlCache.set(id, { url: directUrl, expiresAt: Date.now() + DIRECT_URL_TTL_MS });
      resolve(directUrl);
    });
    proc.on('error', reject);
  });
}

function buildFfmpegArgs(directUrl, settings, startSeconds = 0) {
  const eq = settings?.eq || Array(10).fill(0);
  const preamp = settings?.preamp || 0;
  const bassAmount = settings?.bass?.amount || 0;
  const bassFreq = settings?.bass?.frequency || 100;
  const bassWidth = settings?.bass?.width || 1;
  const stereoWidth = settings?.stereoWidth || 100;
  const compThreshold = settings?.compressor?.threshold || -18;
  const compRatio = settings?.compressor?.ratio || 2;
  const compAttack = settings?.compressor?.attack || 10;
  const compRelease = settings?.compressor?.release || 100;
  const limiterCeil = settings?.limiter?.ceiling || -1;
  const limiterRelease = settings?.limiter?.release || 50;
  const loudness = settings?.loudnessTarget;
  const enhanced = settings?.enhanced !== false;

  const args = [
    '-reconnect', '1',
    '-reconnect_streamed', '1',
    '-reconnect_delay_max', '5',
  ];
  // Input-side seek: lets the player resume mid-track (or after a settings
  // change) without ffmpeg re-encoding from the very beginning every time.
  if (startSeconds > 0) args.push('-ss', startSeconds.toFixed(2));
  args.push('-i', directUrl, '-vn');

  if (enhanced) {
    // Build equalizer filter string (10-band parametric EQ)
    const freqs = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    const eqFilters = freqs.map((f, i) => {
      const gain = (eq[i] || 0) + (preamp || 0);
      if (Math.abs(gain) < 0.1) return null;
      return `equalizer=f=${f}:t=o:w=1:g=${gain.toFixed(1)}`;
    }).filter(Boolean);

    // Bass enhancement
    const bassFilter = bassAmount > 0
      ? `bass=g=${Math.min(bassAmount * 12, 12).toFixed(1)}:f=${bassFreq}:w=${bassWidth.toFixed(2)}`
      : null;

    // Stereo width (mid-side processing) — slev scales the side (L-R)
    // channel, which is what actually widens/narrows the stereo image.
    // (mlev scales the mid/center channel and has no effect on width.)
    let stereoFilter = null;
    if (stereoWidth !== 100) {
      const w = (stereoWidth / 100).toFixed(2);
      stereoFilter = `stereotools=slev=${w}`;
    }

    // Compressor
    const compFilter = `acompressor=threshold=${Math.pow(10, compThreshold/20).toFixed(4)}:ratio=${compRatio}:attack=${compAttack}:release=${compRelease}:makeup=1`;

    // Limiter
    const limFilter = `alimiter=level_in=1:level_out=${Math.pow(10, limiterCeil/20).toFixed(4)}:limit=${Math.pow(10, limiterCeil/20).toFixed(4)}:attack=5:release=${limiterRelease}:level=enabled`;

    const filters = [
      ...eqFilters,
      bassFilter,
      stereoFilter,
      compFilter,
      limFilter,
    ].filter(Boolean);

    if (filters.length > 0) {
      args.push('-af', filters.join(','));
    }
  }

  args.push(
    '-c:a', 'libopus',
    '-b:a', '256k',
    '-ar', '48000',
    '-ac', '2',
    '-f', 'ogg',
    'pipe:1',
  );
  return args;
}

async function streamRoutes(fastify) {
  // Stream audio with optional DSP
  fastify.get('/stream/:id', async (req, reply) => {
    const { id } = req.params;
    const settings = req.query.settings ? JSON.parse(decodeURIComponent(req.query.settings)) : {};
    const startSeconds = Math.max(0, Number(req.query.t) || 0);
    const streamId = `${id}-${Date.now()}`;

    // Step 1: get direct URL (cached across settings changes on the same track)
    const directUrl = await resolveDirectUrl(id).catch(() => null);

    if (!directUrl) {
      return reply.code(503).send({ error: 'Could not extract audio URL. yt-dlp may not be available.' });
    }

    // Step 2: spawn ffmpeg and stream
    const ffArgs = buildFfmpegArgs(directUrl, settings, startSeconds);
    const ff = spawn(FFMPEG, ffArgs);
    activeStreams.set(streamId, ff);

    ff.on('error', err => fastify.log.error('[ffmpeg error]', err.message));
    ff.stderr.on('data', () => {}); // suppress ffmpeg output

    reply.raw.setHeader('Content-Type', 'audio/ogg');
    reply.raw.setHeader('Transfer-Encoding', 'chunked');
    reply.raw.setHeader('X-Stream-Id', streamId);
    reply.raw.setHeader('Cache-Control', 'no-cache');

    ff.stdout.pipe(reply.raw);

    req.raw.on('close', () => {
      try { ff.kill('SIGKILL'); } catch {}
      activeStreams.delete(streamId);
    });

    ff.on('close', () => {
      activeStreams.delete(streamId);
      try { reply.raw.end(); } catch {}
    });

    return reply;
  });
}

module.exports = streamRoutes;
