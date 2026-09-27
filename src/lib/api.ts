const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function searchTracks(query: string) {
  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getTrack(id: string) {
  const res = await fetch(`${API_BASE}/api/tracks/${id}`);
  if (!res.ok) throw new Error('Track not found');
  return res.json();
}

export async function getStreamUrl(id: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/stream-url/${id}`);
  if (!res.ok) throw new Error('Stream URL failed');
  const data = await res.json();
  return data.url;
}

export function buildStreamUrl(id: string, settings?: object, startSeconds?: number): string {
  const params = new URLSearchParams();
  if (settings) params.set('settings', JSON.stringify(settings));
  if (startSeconds && startSeconds > 0) params.set('t', startSeconds.toFixed(2));
  const qs = params.toString();
  return `${API_BASE}/api/stream/${id}${qs ? `?${qs}` : ''}`;
}

export async function getPresets() {
  const res = await fetch(`${API_BASE}/api/presets`);
  if (!res.ok) throw new Error('Failed to load presets');
  return res.json();
}

export async function savePreset(preset: object) {
  const res = await fetch(`${API_BASE}/api/presets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preset),
  });
  if (!res.ok) throw new Error('Failed to save preset');
  return res.json();
}

export async function deletePreset(id: string) {
  const res = await fetch(`${API_BASE}/api/presets/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete preset');
  return res.json();
}

export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}
