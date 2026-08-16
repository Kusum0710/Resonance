/**
 * Audio analysis utility for Resonance.
 * Classifies vocal metrics into landscape biomes and recommends
 * targeted mindfulness/breathing techniques.
 */

export const MINDFULNESS_TECHNIQUES = {
  'deep-rest': {
    id: 'deep-rest',
    icon: '🫁',
    title: '4-7-8 Deep Rest',
    subtitle: 'Parasympathetic nervous system activation.',
    type: 'breathing',
    pattern: [4, 7, 8],
    labels: ['Inhale (4s)', 'Hold (7s)', 'Exhale (8s)'],
    instruction: 'Inhale deeply through your nose for 4s, hold your breath for 7s, and exhale slowly through your mouth for 8s.',
    color: '#7c79a8',
  },
  'box-breathing': {
    id: 'box-breathing',
    icon: '📦',
    title: 'Box Breathing (4-4-4-4)',
    subtitle: 'Focus stabilization and stress reduction.',
    type: 'breathing',
    pattern: [4, 4, 4, 4],
    labels: ['Inhale (4s)', 'Hold (4s)', 'Exhale (4s)', 'Hold (4s)'],
    instruction: 'Inhale 4s, hold 4s, exhale 4s, hold 4s. Rhythmic box breathing lowers heart rate and restores cognitive focus.',
    color: '#e8a091',
  },
  'resonant-coherence': {
    id: 'resonant-coherence',
    icon: '🌊',
    title: 'Resonant Coherence (5.5s / 5.5s)',
    subtitle: 'Optimizes heart rate variability (HRV).',
    type: 'breathing',
    pattern: [5.5, 5.5],
    labels: ['Inhale (5.5s)', 'Exhale (5.5s)'],
    instruction: 'Inhale smoothly for 5.5 seconds, then exhale smoothly for 5.5 seconds. Balances sympathetic and parasympathetic tones.',
    color: '#6f93d1',
  },
  'physiological-sigh': {
    id: 'physiological-sigh',
    icon: '⚡',
    title: 'Physiological Sigh',
    subtitle: 'Fast-acting double-inhalation to immediately curb acute anxiety.',
    type: 'breathing',
    pattern: [2, 1.5, 5],
    labels: ['Inhale Nose (2s)', 'Extra Inhale (1.5s)', 'Long Exhale Mouth (5s)'],
    instruction: 'Take two quick inhales through your nose, then one long, relaxing exhale through your mouth to quickly pop off alveoli stress.',
    color: '#d95e38',
  },
  'grounding-54321': {
    id: 'grounding-54321',
    icon: '🧘',
    title: '5-4-3-2-1 Mindfulness Technique',
    subtitle: 'Sensory grounding for anxiety and overthinking.',
    type: 'grounding',
    steps: [
      'Acknowledge 5 things you can see around you right now.',
      'Acknowledge 4 things you can physically touch or feel.',
      'Acknowledge 3 distinct sounds you can hear in your environment.',
      'Acknowledge 2 things you can smell or enjoy smelling.',
      'Acknowledge 1 deep breath of gratitude.',
    ],
    instruction: 'Focus your attention sequentially on each sensory anchor to anchor yourself in the present moment.',
    color: '#87bd8f',
  },
};

export const BIOMES = {
  volcanic: {
    id: 'volcanic',
    name: 'Volcanic',
    palette: 'volcanic',
    tagline: 'Hot and forceful — loud, pressed, urgent delivery.',
    insight:
      "Your voice was loud and pressed, with force behind every phrase. That's the sound of something you're holding at full strength. This one was read purely from sound, so the terrain is the whole story. Worth noting: you paused a lot. Silence is data too — something may be unfinished.",
    tryThisNext: {
      title: MINDFULNESS_TECHNIQUES['physiological-sigh'].title,
      description: MINDFULNESS_TECHNIQUES['physiological-sigh'].subtitle,
      techniqueKey: 'physiological-sigh',
    },
    mindfulness: MINDFULNESS_TECHNIQUES['physiological-sigh'],
    bgGradient: ['#fdede6', '#fce2d6'],
    terrainColors: ['#f7a28b', '#e8745a', '#d94b30', '#b83218'],
  },
  meadow: {
    id: 'meadow',
    name: 'Quiet Meadow',
    palette: 'meadow',
    tagline: 'Soft and rhythmic — calm, gentle, open pacing.',
    insight:
      'Your vocal tone carried smooth pitch transitions and gentle, steady pauses. You sound grounded, open, and at peace with your thoughts today.',
    tryThisNext: {
      title: MINDFULNESS_TECHNIQUES['resonant-coherence'].title,
      description: MINDFULNESS_TECHNIQUES['resonant-coherence'].subtitle,
      techniqueKey: 'resonant-coherence',
    },
    mindfulness: MINDFULNESS_TECHNIQUES['resonant-coherence'],
    bgGradient: ['#eaf3e9', '#d6e8d4'],
    terrainColors: ['#a9d0ab', '#87bd8f', '#5fa470', '#3f8557'],
  },
  'mountain-range': {
    id: 'mountain-range',
    name: 'Mountain Range',
    palette: 'mountain-range',
    tagline: 'Elevated and strong — clear, energetic, focused pitch.',
    insight:
      'Elevated pitch variation and steady vocal strength detected. You sound determined, focused, and ready to tackle upcoming goals.',
    tryThisNext: {
      title: MINDFULNESS_TECHNIQUES['box-breathing'].title,
      description: MINDFULNESS_TECHNIQUES['box-breathing'].subtitle,
      techniqueKey: 'box-breathing',
    },
    mindfulness: MINDFULNESS_TECHNIQUES['box-breathing'],
    bgGradient: ['#fdede8', '#f8d5cb'],
    terrainColors: ['#e8a091', '#dd7f72', '#c85f55', '#a8443d'],
  },
  thunderstorm: {
    id: 'thunderstorm',
    name: 'Stormy Peaks',
    palette: 'thunderstorm',
    tagline: 'Rapid and intense — high variance, tense pitch spikes.',
    insight:
      'Rapid pacing and pitch spikes suggest elevated emotional intensity or stress. Taking a brief physical pause will help clear your mind.',
    tryThisNext: {
      title: MINDFULNESS_TECHNIQUES['deep-rest'].title,
      description: MINDFULNESS_TECHNIQUES['deep-rest'].subtitle,
      techniqueKey: 'deep-rest',
    },
    mindfulness: MINDFULNESS_TECHNIQUES['deep-rest'],
    bgGradient: ['#ebeaf5', '#d9d7ec'],
    terrainColors: ['#7c79a8', '#5e5a91', '#474378', '#322f5e'],
  },
};

/**
 * Classifies session audio metrics into a biome & payload.
 */
export function analyzeAudioSession(metrics = {}) {
  const {
    avgVolume = 0.4,
    volumeVariance = 0.3,
    pitchVariance = 0.4,
    durationSeconds = 15,
  } = metrics;

  let biomeKey = 'volcanic';

  if (volumeVariance > 0.45 || pitchVariance > 0.5) {
    biomeKey = 'volcanic';
  } else if (avgVolume > 0.5 && pitchVariance > 0.3) {
    biomeKey = 'mountain-range';
  } else if (avgVolume < 0.35 && volumeVariance < 0.25) {
    biomeKey = 'meadow';
  } else {
    biomeKey = 'volcanic';
  }

  const biome = BIOMES[biomeKey];

  return {
    id: `session-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dateFormatted: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
    durationFormatted: formatDuration(durationSeconds),
    duration: formatDuration(durationSeconds),
    biomeKey,
    biomeName: biome.name,
    palette: biome.palette,
    tagline: biome.tagline,
    insightMessage: biome.insight,
    tryThisNext: biome.tryThisNext,
    mindfulness: biome.mindfulness,
    bgGradient: biome.bgGradient,
    terrainColors: biome.terrainColors,
  };
}

/**
 * Normalizes legacy or simple session objects into a full result payload.
 */
export function normalizeSessionDetails(session = {}) {
  if (!session) return null;

  // If already normalized
  if (session.insightMessage && session.biomeName) return session;

  const paletteKey = session.palette || 'volcanic';
  const biome = BIOMES[paletteKey] || BIOMES['volcanic'];

  return {
    id: session.id || `session-${Date.now()}`,
    timestamp: session.timeAgo || 'Just now',
    dateFormatted: session.timeAgo || 'Today',
    durationFormatted: session.duration || '25s',
    duration: session.duration || '25s',
    biomeKey: paletteKey,
    biomeName: biome.name,
    palette: paletteKey,
    tagline: biome.tagline,
    insightMessage: session.quote
      ? `"${session.quote}" — ${session.trigger || biome.insight}`
      : biome.insight,
    tryThisNext: biome.tryThisNext,
    mindfulness: biome.mindfulness,
    bgGradient: biome.bgGradient,
    terrainColors: biome.terrainColors,
  };
}

function formatDuration(sec) {
  const mins = Math.floor(sec / 60);
  const remainderSec = Math.floor(sec % 60);
  if (mins === 0) return `${remainderSec}s`;
  return `${mins}m ${remainderSec}s`;
}
