'use client';
import { usePlayerStore } from '@/store/playerStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { HomeView } from '@/components/views/HomeView';
import { SearchPanel } from '@/components/player/SearchPanel';
import { LibraryView } from '@/components/views/LibraryView';
import { PlaylistsView } from '@/components/views/PlaylistsView';
import { HistoryView } from '@/components/views/HistoryView';
import { Amplifier } from '@/components/amplifier/Amplifier';
import { QueuePanel } from '@/components/player/QueuePanel';
import { PlayerBar } from '@/components/player/PlayerBar';
import { X, SlidersHorizontal, ListMusic } from 'lucide-react';

export default function Home() {
  const { 
    activeTab, 
    showAmplifier, 
    setShowAmplifier, 
    showQueue, 
    setShowQueue 
  } = usePlayerStore();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      {/* Main Workspace Area (Sidebar + View + Drawers) */}
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Center Dynamic Content Area */}
        <main style={{
          flex: 1,
          height: '100%',
          overflowY: 'auto',
          position: 'relative',
          background: 'linear-gradient(180deg, rgba(20,20,20,0.4) 0%, rgba(8,8,8,0.95) 100%)'
        }}>
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'search' && <SearchPanel />}
          {activeTab === 'library' && <LibraryView />}
          {activeTab === 'playlists' && <PlaylistsView />}
          {activeTab === 'history' && <HistoryView />}
        </main>

        {/* Queue Side Panel (Drawer) */}
        {showQueue && (
          <aside style={{
            width: '320px',
            height: '100%',
            borderLeft: '1px solid var(--border)',
            background: 'rgba(12, 12, 12, 0.95)',
            backdropFilter: 'blur(32px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 30,
            flexShrink: 0
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                <ListMusic size={16} />
                <span>Play Queue</span>
              </div>
              <button
                onClick={() => setShowQueue(false)}
                className="btn-icon"
                style={{ width: '28px', height: '28px' }}
                title="Close Queue"
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <QueuePanel />
            </div>
          </aside>
        )}

        {/* Amplifier DSP Studio Side Panel (Drawer) */}
        {showAmplifier && (
          <aside style={{
            width: '360px',
            height: '100%',
            borderLeft: '1px solid var(--border)',
            background: 'rgba(12, 12, 12, 0.95)',
            backdropFilter: 'blur(32px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 20,
            flexShrink: 0
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                <SlidersHorizontal size={16} />
                <span>DSP Amplifier Studio</span>
              </div>
              <button
                onClick={() => setShowAmplifier(false)}
                className="btn-icon"
                style={{ width: '28px', height: '28px' }}
                title="Close Studio"
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Amplifier />
            </div>
          </aside>
        )}
      </div>

      {/* Fixed Persistent Bottom Player Bar */}
      <footer style={{ flexShrink: 0, zIndex: 50 }}>
        <PlayerBar />
      </footer>
    </div>
  );
}
