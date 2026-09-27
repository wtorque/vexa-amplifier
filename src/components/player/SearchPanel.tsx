'use client';
import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { usePlayerStore, Track } from '@/store/playerStore';
import { searchTracks } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { formatTime } from '@/components/ui/WaveformSeekbar';

export function SearchPanel() {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    addToQueue,
    addToQueueNext,
    currentTrack,
    favorites,
    addToFavorites,
    removeFromFavorites,
  } = usePlayerStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ track: Track; x: number; y: number } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    if (q.trim().length < 2) return;

    const thisRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await searchTracks(q.trim());
      if (thisRequestId !== requestIdRef.current) return; // a newer search superseded this one
      setSearchResults(data.results || []);
    } catch {
      if (thisRequestId !== requestIdRef.current) return;
      setError('Search failed. Make sure the API server is running on port 3001.');
      setSearchResults([]);
    } finally {
      if (thisRequestId === requestIdRef.current) setLoading(false);
    }
  }, [setSearchQuery, setSearchResults]);

  const handleInput = (q: string) => {
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(q), 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} onClick={() => setContextMenu(null)}>
      {/* Search input */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)', fontSize: 14, pointerEvents: 'none',
          }}>⌕</span>
          <input
            type="text"
            placeholder="Search music..."
            value={searchQuery}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={e => {
              if (e.key !== 'Enter') return;
              if (debounceRef.current) clearTimeout(debounceRef.current);
              handleSearch(searchQuery);
            }}
            className="input"
            style={{ width: '100%', padding: '10px 12px 10px 32px' }}
            autoFocus
          />
          {loading && (
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <Spinner size={16} />
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {error && (
          <div style={{ padding: '16px 20px', color: '#ff8888', fontSize: 12, background: 'rgba(255,68,68,0.05)' }}>
            ⚠ {error}
          </div>
        )}

        {!loading && searchResults.length === 0 && searchQuery && !error && (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
            {`No results for "${searchQuery}"`}
          </div>
        )}

        {!searchQuery && (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
            <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.2 }}>⌕</div>
            Search for any song, artist, or album
          </div>
        )}

        {searchResults.map((track) => {
          const isFav = favorites.some(f => f.id === track.id);
          const isPlaying = currentTrack?.id === track.id;
          return (
            <div
              key={track.id}
              onContextMenu={(e) => { e.preventDefault(); setContextMenu({ track, x: e.clientX, y: e.clientY }); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 20px',
                cursor: 'pointer',
                background: isPlaying ? 'var(--bg-glass)' : 'transparent',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => !isPlaying && (e.currentTarget.style.background = 'var(--bg-glass)')}
              onMouseLeave={e => !isPlaying && (e.currentTarget.style.background = 'transparent')}
              onClick={() => { usePlayerStore.getState().playTrack(track); usePlayerStore.getState().setPlaying(true); }}
            >
              {/* Thumbnail */}
              <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-glass)', position: 'relative' }}>
                {track.thumbnail && (
                  <Image src={track.thumbnail} alt="" width={44} height={44} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                {isPlaying && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>
                    ▶
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: isPlaying ? 600 : 400,
                  color: isPlaying ? 'white' : 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {track.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {track.artist}
                </div>
              </div>

              {/* Duration */}
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0 }}>
                {formatTime(track.duration * 1000)}
              </span>

              {/* Fav */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  if (isFav) removeFromFavorites(track.id);
                  else addToFavorites(track);
                }}
                style={{
                  background: 'transparent', border: 'none',
                  color: isFav ? 'white' : 'var(--text-tertiary)',
                  cursor: 'pointer', fontSize: 14, flexShrink: 0, padding: '2px 4px',
                }}
              >
                {isFav ? '♥' : '♡'}
              </button>

              {/* Add to queue */}
              <button
                onClick={e => { e.stopPropagation(); addToQueue(track); }}
                style={{
                  background: 'transparent', border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer', fontSize: 14, flexShrink: 0, padding: '2px 4px',
                }}
                title="Add to queue"
              >
                +
              </button>
            </div>
          );
        })}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: '#1a1a1a',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '6px',
            zIndex: 1000,
            minWidth: 160,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {[
            { label: 'Play Now', action: () => { usePlayerStore.getState().playTrack(contextMenu.track); usePlayerStore.getState().setPlaying(true); } },
            { label: 'Play Next', action: () => addToQueueNext(contextMenu.track) },
            { label: 'Add to Queue', action: () => addToQueue(contextMenu.track) },
            { label: favorites.some(f => f.id === contextMenu.track.id) ? 'Remove from Favorites' : 'Add to Favorites', action: () => {
              const fav = favorites.some(f => f.id === contextMenu.track.id);
              if (fav) removeFromFavorites(contextMenu.track.id);
              else addToFavorites(contextMenu.track);
            }},
          ].map(item => (
            <button
              key={item.label}
              onClick={() => { item.action(); setContextMenu(null); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px', borderRadius: 6,
                background: 'transparent', border: 'none',
                color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13,
                transition: 'background 0.1s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-glass)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
