'use client';
import { useState } from 'react';
import Image from 'next/image';
import { usePlayerStore, Playlist } from '@/store/playerStore';
import { ListMusic, Play, Trash2, Plus, Music, ArrowLeft } from 'lucide-react';
import { formatTime } from '@/components/ui/WaveformSeekbar';

export function PlaylistsView() {
  const { 
    playlists, 
    createPlaylist, 
    deletePlaylist, 
    removeTrackFromPlaylist,
    playTrack, 
    addToQueue, 
    currentTrack, 
    playing,
    setActiveTab 
  } = usePlayerStore();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎵');

  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createPlaylist(name.trim(), icon || '🎵');
    setName('');
    setShowModal(false);
  };

  const handlePlayPlaylist = (pl: Playlist) => {
    if (pl.tracks.length === 0) return;
    playTrack(pl.tracks[0]);
    pl.tracks.slice(1).forEach(t => addToQueue(t));
  };

  if (selectedPlaylist) {
    return (
      <div style={{ padding: '32px 40px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <button
          onClick={() => setSelectedPlaylistId(null)}
          className="btn btn-ghost"
          style={{ width: 'fit-content', gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Playlists</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            flexShrink: 0
          }}>
            {selectedPlaylist.icon || '🎵'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
              Custom Playlist
            </span>
            <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              {selectedPlaylist.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>{selectedPlaylist.tracks.length} tracks</span>
              <span>•</span>
              <span>Created {new Date(selectedPlaylist.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => handlePlayPlaylist(selectedPlaylist)}
            disabled={selectedPlaylist.tracks.length === 0}
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: '14px', borderRadius: '99px', opacity: selectedPlaylist.tracks.length === 0 ? 0.4 : 1 }}
          >
            <Play size={16} fill="currentColor" />
            <span>Play Playlist</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this playlist?')) {
                deletePlaylist(selectedPlaylist.id);
                setSelectedPlaylistId(null);
              }
            }}
            className="btn btn-ghost"
            style={{ color: '#ff4444' }}
          >
            <Trash2 size={16} />
            <span>Delete Playlist</span>
          </button>
        </div>

        {/* Tracks */}
        {selectedPlaylist.tracks.length === 0 ? (
          <div style={{
            padding: '64px 20px',
            textAlign: 'center',
            borderRadius: '16px',
            border: '1px dashed var(--border)',
            background: 'rgba(255,255,255,0.01)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>This playlist is empty</div>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '300px' }}>
              Search tracks and use the right-click menu or track actions to add songs.
            </p>
            <button
              onClick={() => setActiveTab('search')}
              className="btn btn-ghost"
              style={{ marginTop: '8px' }}
            >
              Search Tracks
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 1fr 100px 60px',
              padding: '8px 16px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderBottom: '1px solid var(--border)'
            }}>
              <span>#</span>
              <span>Title</span>
              <span>Artist</span>
              <span style={{ textAlign: 'right' }}>Duration</span>
              <span style={{ textAlign: 'right' }}>Action</span>
            </div>

            {selectedPlaylist.tracks.map((track, idx) => {
              const isPlayingThis = currentTrack?.id === track.id && playing;
              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 1fr 100px 60px',
                    alignItems: 'center',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: isPlayingThis ? '#ffffff' : 'var(--text-primary)',
                    background: isPlayingThis ? 'rgba(255,255,255,0.06)' : 'transparent',
                    transition: 'background 0.1s ease'
                  }}
                  onMouseEnter={(e) => !isPlayingThis && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={(e) => !isPlayingThis && (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                    {idx + 1}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: '#222' }}>
                      {track.thumbnail ? (
                        <Image src={track.thumbnail} alt="" width={36} height={36} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Music size={16} color="gray" />
                        </div>
                      )}
                    </div>
                    <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {track.title}
                    </span>
                  </div>

                  <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {track.artist}
                  </span>

                  <span style={{ textAlign: 'right', color: 'var(--text-tertiary)', fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '12px' }}>
                    {formatTime(track.duration * 1000)}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrackFromPlaylist(selectedPlaylist.id, track.id);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
                      title="Remove from playlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>Playlists</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Create curated audio sequences for different acoustic listening environments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>New Playlist</span>
        </button>
      </div>

      {playlists.length === 0 ? (
        <div style={{
          padding: '64px 20px',
          textAlign: 'center',
          borderRadius: '16px',
          border: '1px dashed var(--border)',
          background: 'rgba(255,255,255,0.01)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ListMusic size={32} color="var(--text-tertiary)" />
          <div style={{ fontSize: '15px', fontWeight: 600 }}>No Playlists Yet</div>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '300px' }}>
            Build your personal sound collections tailored to your favorite audio presets.
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: '8px' }}>
            Create First Playlist
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => setSelectedPlaylistId(pl.id)}
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-glass-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-glass)')}
            >
              <div style={{
                height: '140px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}>
                {pl.icon || '🎵'}
              </div>

              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pl.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  {pl.tracks.length} tracks
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <form
            onSubmit={handleCreate}
            style={{
              width: '360px',
              padding: '24px',
              borderRadius: '16px',
              background: '#141414',
              border: '1px solid var(--border-active)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: 600 }}>Create New Playlist</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['🎵', '🔥', '🎧', '🌙', '⚡', '✨'].map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  style={{
                    fontSize: '20px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: icon === emoji ? 'rgba(255,255,255,0.2)' : 'var(--bg-glass)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              autoFocus
              placeholder="Playlist Title..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              style={{ width: '100%', padding: '10px 14px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
