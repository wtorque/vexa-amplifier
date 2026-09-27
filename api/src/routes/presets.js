'use strict';

const BUILT_IN_PRESETS = [
  { id: 'pure', name: 'Pure', icon: '◈', eq: Array(10).fill(0), preamp: 0, bass: { amount: 0, frequency: 100, width: 1 }, clarity: 0, stereoWidth: 100, compressor: { threshold: -18, ratio: 2, attack: 10, release: 100 }, limiter: { ceiling: -1, release: 50 }, loudnessTarget: -14, enhanced: true },
  { id: 'balanced', name: 'Balanced', icon: '◉', eq: [2, 1, 0, 0, 0, 0, 0, 1, 2, 1], preamp: -1, bass: { amount: 0.1, frequency: 80, width: 1 }, clarity: 0.2, stereoWidth: 105, compressor: { threshold: -18, ratio: 2, attack: 10, release: 100 }, limiter: { ceiling: -1, release: 50 }, loudnessTarget: -14, enhanced: true },
  { id: 'bass-boost', name: 'Bass Boost', icon: '◎', eq: [8, 6, 4, 2, 0, 0, 0, 0, 0, 0], preamp: -3, bass: { amount: 0.6, frequency: 80, width: 1.2 }, clarity: 0, stereoWidth: 110, compressor: { threshold: -16, ratio: 3, attack: 5, release: 80 }, limiter: { ceiling: -1, release: 30 }, loudnessTarget: -12, enhanced: true },
  { id: 'vocal', name: 'Vocal', icon: '◍', eq: [-2, -1, 0, 2, 4, 5, 4, 2, 1, 0], preamp: -1, bass: { amount: 0, frequency: 100, width: 1 }, clarity: 0.5, stereoWidth: 95, compressor: { threshold: -20, ratio: 3, attack: 8, release: 120 }, limiter: { ceiling: -1, release: 50 }, loudnessTarget: -14, enhanced: true },
  { id: 'clarity', name: 'Clarity', icon: '◌', eq: [-1, -1, 0, 0, 2, 3, 5, 6, 5, 4], preamp: -2, bass: { amount: 0, frequency: 100, width: 1 }, clarity: 0.8, stereoWidth: 110, compressor: { threshold: -18, ratio: 2, attack: 10, release: 100 }, limiter: { ceiling: -1, release: 50 }, loudnessTarget: -14, enhanced: true },
  { id: 'studio', name: 'Studio', icon: '◈', eq: [1, 1, 0, 0, -1, 0, 1, 2, 2, 1], preamp: -2, bass: { amount: 0.2, frequency: 60, width: 1 }, clarity: 0.3, stereoWidth: 100, compressor: { threshold: -16, ratio: 2.5, attack: 8, release: 90 }, limiter: { ceiling: -0.5, release: 40 }, loudnessTarget: -12, enhanced: true },
  { id: 'headphones', name: 'Headphones', icon: '⊙', eq: [4, 2, 1, 0, -1, 0, 1, 2, 3, 2], preamp: -2, bass: { amount: 0.3, frequency: 80, width: 1.1 }, clarity: 0.4, stereoWidth: 120, compressor: { threshold: -20, ratio: 2, attack: 10, release: 100 }, limiter: { ceiling: -1, release: 50 }, loudnessTarget: -14, enhanced: true },
  { id: 'car', name: 'Car', icon: '◐', eq: [5, 4, 2, 1, 0, 0, 1, 2, 3, 2], preamp: -3, bass: { amount: 0.4, frequency: 80, width: 1.2 }, clarity: 0.2, stereoWidth: 100, compressor: { threshold: -16, ratio: 3, attack: 5, release: 80 }, limiter: { ceiling: -1, release: 30 }, loudnessTarget: -12, enhanced: true },
  { id: 'gaming', name: 'Gaming', icon: '◑', eq: [3, 2, 1, 0, 1, 2, 3, 3, 3, 2], preamp: -2, bass: { amount: 0.3, frequency: 60, width: 1 }, clarity: 0.5, stereoWidth: 130, compressor: { threshold: -18, ratio: 2, attack: 10, release: 100 }, limiter: { ceiling: -1, release: 50 }, loudnessTarget: -12, enhanced: true },
  { id: 'night', name: 'Night', icon: '◒', eq: [2, 2, 1, 0, 0, 1, 2, 1, 0, -1], preamp: 0, bass: { amount: 0.2, frequency: 80, width: 1 }, clarity: 0.1, stereoWidth: 95, compressor: { threshold: -22, ratio: 4, attack: 15, release: 150 }, limiter: { ceiling: -3, release: 80 }, loudnessTarget: -16, enhanced: true },
];

// In-memory custom presets (in prod these go to PostgreSQL)
const customPresets = [];

async function presetsRoutes(fastify) {
  fastify.get('/presets', async (req, reply) => {
    return reply.send([...BUILT_IN_PRESETS, ...customPresets]);
  });

  fastify.post('/presets', async (req, reply) => {
    const body = req.body;
    if (!body || !body.name) return reply.code(400).send({ error: 'name required' });
    const preset = { ...body, id: `custom-${Date.now()}`, custom: true };
    customPresets.push(preset);
    return reply.code(201).send(preset);
  });

  fastify.delete('/presets/:id', async (req, reply) => {
    const idx = customPresets.findIndex(p => p.id === req.params.id);
    if (idx === -1) return reply.code(404).send({ error: 'not found' });
    customPresets.splice(idx, 1);
    return reply.send({ ok: true });
  });
}

module.exports = presetsRoutes;
