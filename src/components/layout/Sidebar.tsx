'use client';
import { usePlayerStore, AppTab } from '@/store/playerStore';
import {
  Home,
  Search,
  Heart,
  ListMusic,
  History,
  SlidersHorizontal,
  Plus,
  Music2,
  type LucideIcon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getHealth } from '@/lib/api';

export function Sidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    favorites, 
    history, 
    playlists, 
    createPlaylist,
    showAmplifier,
    setShowAmplifier,
    settings,
    setEnhanced
  } = usePlayerStore();

  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        await getHealth();
        if (mounted) setApiOnline(true);
      } catch {
        if (mounted) setApiOnline(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems: { tab: AppTab; label: string; icon: LucideIcon; count?: number }[] = [
    { tab: 'home', label: 'Discover', icon: Home },
    { tab: 'search', label: 'Search', icon: Search },
    { tab: 'library', label: 'Liked Tracks', icon: Heart, count: favorites.length },
    { tab: 'playlists', label: 'Playlists', icon: ListMusic, count: playlists.length },
    { tab: 'history', label: 'History', icon: History, count: history.length },
  ];

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName.trim(), '🎧');
    setNewPlaylistName('');
    setShowAddModal(false);
  };

  return (
    <aside style={{
      width: '260px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border)',
      background: 'rgba(10, 10, 10, 0.85)',
      backdropFilter: 'blur(24px)',
      userSelect: 'none',
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #ffffff 0%, #737373 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          boxShadow: '0 4px 16px rgba(255,255,255,0.15)'
        }}>
          <Music2 size={20} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            VEXA <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)' }}>DSP</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', letterSpacing: '0.02em' }}>
            Audiophile Engine
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ padding: '0 8px 6px', fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                width: '100%',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)')}
              onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} style={{ color: isActive ? '#fff' : 'inherit' }} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-tertiary)'
                }}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Amplifier DSP Quick Bar */}
      <div style={{ padding: '8px 12px' }}>
        <div style={{
          padding: '14px',
          borderRadius: '12px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
              <SlidersHorizontal size={14} />
              <span>Studio DSP</span>
            </div>
            <button
              onClick={() => setEnhanced(!settings.enhanced)}
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '99px',
                border: 'none',
                cursor: 'pointer',
                background: settings.enhanced ? '#ffffff' : 'rgba(255,255,255,0.1)',
                color: settings.enhanced ? '#000000' : 'var(--text-tertiary)',
                transition: 'all 0.15s ease'
              }}
            >
              {settings.enhanced ? 'ACTIVE' : 'BYPASS'}
            </button>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            10-Band EQ • Mid/Side • True Peak Limiter
          </div>
          <button
            onClick={() => setShowAmplifier(!showAmplifier)}
            className="btn btn-ghost"
            style={{ fontSize: '11px', padding: '6px 10px', width: '100%', justifyContent: 'center' }}
          >
            {showAmplifier ? 'Hide Studio Drawer' : 'Open Studio Drawer'}
          </button>
        </div>
      </div>

      {/* Playlists Quick Section */}
      <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px 6px'
        }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Your Playlists
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
            title="Create Playlist"
          >
            <Plus size={14} />
          </button>
        </div>

        {playlists.length === 0 ? (
          <div style={{ padding: '12px 8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            No playlists yet. Click + to create one.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => setActiveTab('playlists')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span>{pl.icon || '🎵'}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {pl.name}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                  {pl.tracks.length}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Backend API Connectivity Footer */}
      <div style={{
        padding: '14px 18px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: apiOnline === true ? '#22c55e' : apiOnline === false ? '#ef4444' : '#eab308',
            boxShadow: apiOnline === true ? '0 0 8px #22c55e' : 'none'
          }} />
          <span style={{ color: 'var(--text-tertiary)' }}>
            {apiOnline === true ? 'API Engine Active' : apiOnline === false ? 'API Offline (Port 3001)' : 'Connecting...'}
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '10px', color: 'var(--text-tertiary)' }}>
          v1.0.0
        </span>
      </div>

      {/* Create Playlist Modal */}
      {showAddModal && (
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
            onSubmit={handleCreatePlaylist}
            style={{
              width: '320px',
              padding: '24px',
              borderRadius: '16px',
              background: '#141414',
              border: '1px solid var(--border-active)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: 600 }}>Create New Playlist</div>
            <input
              type="text"
              autoFocus
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="input"
              style={{ width: '100%', padding: '10px 14px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowAddModal(false)}
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
    </aside>
  );
}
