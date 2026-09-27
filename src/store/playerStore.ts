import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPresets } from '@/lib/api';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  thumbnail?: string;
  sourceUrl: string;
  sourceType: 'youtube' | 'upload' | 'direct';
}

export interface CompressorSettings {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
}

export interface LimiterSettings {
  ceiling: number;
  release: number;
}

export interface BassSettings {
  amount: number;
  frequency: number;
  width: number;
}

export interface AudioSettings {
  eq: number[];           // 10 bands: 31,62,125,250,500,1k,2k,4k,8k,16k dB
  preamp: number;
  bass: BassSettings;
  clarity: number;
  stereoWidth: number;
  compressor: CompressorSettings;
  limiter: LimiterSettings;
  loudnessTarget: number;
  enhanced: boolean;
}

export interface Preset {
  id: string;
  name: string;
  icon?: string;
  custom?: boolean;
  eq: number[];
  preamp: number;
  bass: BassSettings;
  clarity: number;
  stereoWidth: number;
  compressor: CompressorSettings;
  limiter: LimiterSettings;
  loudnessTarget: number;
  enhanced: boolean;
}

export interface HistoryEntry {
  track: Track;
  playedAt: number;
  duration: number;
}

export interface Playlist {
  id: string;
  name: string;
  icon?: string;
  tracks: Track[];
  createdAt: number;
}

export type RepeatMode = 'none' | 'track' | 'queue';
export type AppTab = 'home' | 'search' | 'library' | 'playlists' | 'history';

const DEFAULT_SETTINGS: AudioSettings = {
  eq: Array(10).fill(0),
  preamp: 0,
  bass: { amount: 0, frequency: 100, width: 1 },
  clarity: 0,
  stereoWidth: 100,
  compressor: { threshold: -18, ratio: 2, attack: 10, release: 100 },
  limiter: { ceiling: -1, release: 50 },
  loudnessTarget: -14,
  enhanced: true,
};

interface PlayerState {
  // Playback
  currentTrack: Track | null;
  queue: Track[];
  history: HistoryEntry[];
  position: number;
  duration: number;
  volume: number;
  playing: boolean;
  paused: boolean;
  repeat: RepeatMode;
  shuffle: boolean;
  muted: boolean;

  // Audio settings
  settings: AudioSettings;
  activePresetId: string | null;
  presets: Preset[];
  presetsLoaded: boolean;

  // UI
  activeTab: AppTab;
  searchQuery: string;
  searchResults: Track[];
  playlists: Playlist[];
  favorites: Track[];
  showQueue: boolean;
  showAmplifier: boolean;
  currentView: 'main' | 'playlist' | 'search';

  // Actions
  setCurrentTrack: (track: Track | null) => void;
  playTrack: (track: Track, addToQueue?: boolean) => void;
  addToQueue: (track: Track) => void;
  addToQueueNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setPosition: (pos: number) => void;
  setDuration: (dur: number) => void;
  setVolume: (vol: number) => void;
  setPlaying: (p: boolean) => void;
  togglePlay: () => void;
  setRepeat: (r: RepeatMode) => void;
  toggleShuffle: () => void;
  toggleMute: () => void;

  updateEq: (band: number, value: number) => void;
  setPreamp: (v: number) => void;
  setBass: (b: Partial<BassSettings>) => void;
  setClarity: (v: number) => void;
  setStereoWidth: (v: number) => void;
  setCompressor: (c: Partial<CompressorSettings>) => void;
  setLimiter: (l: Partial<LimiterSettings>) => void;
  setEnhanced: (e: boolean) => void;
  applyPreset: (preset: Preset) => void;
  resetSettings: () => void;
  setActivePreset: (id: string | null) => void;
  fetchPresets: () => Promise<void>;

  setActiveTab: (t: AppTab) => void;
  setSearchQuery: (q: string) => void;
  setSearchResults: (r: Track[]) => void;
  addToHistory: (track: Track) => void;
  addToFavorites: (track: Track) => void;
  removeFromFavorites: (id: string) => void;
  isFavorite: (id: string) => boolean;
  createPlaylist: (name: string, icon?: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  setShowQueue: (v: boolean) => void;
  setShowAmplifier: (v: boolean) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      history: [],
      position: 0,
      duration: 0,
      volume: 80,
      playing: false,
      paused: false,
      repeat: 'none',
      shuffle: false,
      muted: false,
      settings: DEFAULT_SETTINGS,
      activePresetId: 'pure',
      presets: [],
      presetsLoaded: false,
      activeTab: 'home',
      searchQuery: '',
      searchResults: [],
      playlists: [],
      favorites: [],
      showQueue: false,
      showAmplifier: true,
      currentView: 'main',

      setCurrentTrack: (track) => set({ currentTrack: track, duration: track ? track.duration * 1000 : 0 }),

      playTrack: (track, addToQueue = false) => {
        const { currentTrack, queue, addToHistory } = get();
        if (currentTrack) addToHistory(currentTrack);
        if (addToQueue) {
          set({ queue: [...queue, track] });
        } else {
          set({ currentTrack: track, playing: true, paused: false, position: 0, duration: track.duration * 1000 });
        }
      },

      addToQueue: (track) => set((s) => ({ queue: [...s.queue, track] })),
      addToQueueNext: (track) => set((s) => ({ queue: [track, ...s.queue] })),
      removeFromQueue: (index) => set((s) => {
        const q = [...s.queue];
        q.splice(index, 1);
        return { queue: q };
      }),
      clearQueue: () => set({ queue: [] }),

      nextTrack: () => {
        const { queue, currentTrack, repeat, shuffle, addToHistory } = get();
        if (currentTrack) addToHistory(currentTrack);
        if (repeat === 'track') { set({ position: 0, playing: true }); return; }
        if (queue.length === 0) { set({ playing: false, currentTrack: null }); return; }
        let nextIdx = 0;
        if (shuffle) nextIdx = Math.floor(Math.random() * queue.length);
        const next = queue[nextIdx];
        const newQueue = [...queue];
        newQueue.splice(nextIdx, 1);
        if (repeat === 'queue' && currentTrack) newQueue.push(currentTrack);
        set({ currentTrack: next, queue: newQueue, playing: true, paused: false, position: 0, duration: next.duration * 1000 });
      },

      prevTrack: () => {
        const { history, currentTrack, queue } = get();
        if (history.length === 0) { set({ position: 0 }); return; }
        const prev = history[0];
        set({
          currentTrack: prev.track,
          history: history.slice(1),
          queue: currentTrack ? [currentTrack, ...queue] : queue,
          playing: true,
          paused: false,
          position: 0,
          duration: prev.track.duration * 1000,
        });
      },

      setPosition: (pos) => set({ position: pos }),
      setDuration: (dur) => set({ duration: dur }),
      setVolume: (vol) => set({ volume: Math.max(0, Math.min(150, vol)) }),
      setPlaying: (p) => set({ playing: p }),
      togglePlay: () => set((s) => ({ playing: !s.playing, paused: s.playing })),
      setRepeat: (r) => set({ repeat: r }),
      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
      toggleMute: () => set((s) => ({ muted: !s.muted })),

      updateEq: (band, value) => set((s) => {
        const eq = [...s.settings.eq];
        eq[band] = Math.max(-12, Math.min(12, value));
        return { settings: { ...s.settings, eq }, activePresetId: null };
      }),
      setPreamp: (v) => set((s) => ({ settings: { ...s.settings, preamp: Math.max(-12, Math.min(12, v)) } })),
      setBass: (b) => set((s) => ({ settings: { ...s.settings, bass: { ...s.settings.bass, ...b } } })),
      setClarity: (v) => set((s) => ({ settings: { ...s.settings, clarity: Math.max(0, Math.min(1, v)) } })),
      setStereoWidth: (v) => set((s) => ({ settings: { ...s.settings, stereoWidth: Math.max(0, Math.min(150, v)) } })),
      setCompressor: (c) => set((s) => ({ settings: { ...s.settings, compressor: { ...s.settings.compressor, ...c } } })),
      setLimiter: (l) => set((s) => ({ settings: { ...s.settings, limiter: { ...s.settings.limiter, ...l } } })),
      setEnhanced: (e) => set((s) => ({ settings: { ...s.settings, enhanced: e } })),

      applyPreset: (preset) => set({
        settings: {
          eq: preset.eq,
          preamp: preset.preamp,
          bass: preset.bass,
          clarity: preset.clarity,
          stereoWidth: preset.stereoWidth,
          compressor: preset.compressor,
          limiter: preset.limiter,
          loudnessTarget: preset.loudnessTarget,
          enhanced: preset.enhanced,
        },
        activePresetId: preset.id,
      }),

      resetSettings: () => set({ settings: DEFAULT_SETTINGS, activePresetId: 'pure' }),
      setActivePreset: (id) => set({ activePresetId: id }),

      fetchPresets: async () => {
        if (get().presetsLoaded) return;
        set({ presetsLoaded: true });
        try {
          const presets = await getPresets();
          set({ presets });
        } catch {
          set({ presetsLoaded: false });
        }
      },

      setActiveTab: (t) => set({ activeTab: t }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSearchResults: (r) => set({ searchResults: r }),

      addToHistory: (track) => set((s) => ({
        history: [{ track, playedAt: Date.now(), duration: s.position }, ...s.history].slice(0, 50),
      })),

      addToFavorites: (track) => set((s) => {
        if (s.favorites.find(f => f.id === track.id)) return s;
        return { favorites: [track, ...s.favorites] };
      }),
      removeFromFavorites: (id) => set((s) => ({ favorites: s.favorites.filter(f => f.id !== id) })),
      isFavorite: (id) => get().favorites.some(f => f.id === id),

      createPlaylist: (name, icon) => set((s) => ({
        playlists: [...s.playlists, { id: `pl-${Date.now()}`, name, icon: icon || '♫', tracks: [], createdAt: Date.now() }],
      })),
      deletePlaylist: (id) => set((s) => ({ playlists: s.playlists.filter(p => p.id !== id) })),
      addTrackToPlaylist: (playlistId, track) => set((s) => ({
        playlists: s.playlists.map(p => p.id === playlistId && !p.tracks.find(t => t.id === track.id)
          ? { ...p, tracks: [...p.tracks, track] } : p),
      })),
      removeTrackFromPlaylist: (playlistId, trackId) => set((s) => ({
        playlists: s.playlists.map(p => p.id === playlistId
          ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) } : p),
      })),

      setShowQueue: (v) => set({ showQueue: v }),
      setShowAmplifier: (v) => set({ showAmplifier: v }),
    }),
    {
      name: 'vexa-amplifier-state',
      partialize: (s) => ({
        volume: s.volume,
        repeat: s.repeat,
        shuffle: s.shuffle,
        settings: s.settings,
        activePresetId: s.activePresetId,
        playlists: s.playlists,
        favorites: s.favorites,
        history: s.history.slice(0, 20),
        showAmplifier: s.showAmplifier,
      }),
    }
  )
);
