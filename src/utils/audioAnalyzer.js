/**
 * Audio analysis utility for Resonance.
 * Evaluates session vocal metrics (pitch, volume variance, pace)
 * to classify the landscape biome, generate a contextual insight,
 * and suggest a targeted "TRY THIS NEXT" exercise matching the exact design.
 */

export const BIOMES = {
  volcanic: {
    id: 'volcanic',
    name: 'Volcanic',
    palette: 'volcanic',
    tagline: 'Hot and forceful — loud, pressed, urgent delivery.',
    insight:
      "Your voice was loud and pressed, with force behind every phrase. That's the sound of something you're holding at full strength. This one was read purely from sound, so the terrain is the whole story. Worth noting: you paused a lot. Silence is data too — something may be unfinished.",
    tryThisNext: {
      title: 'Move it out, then cool down',
      description:
        'Two minutes of hard movement — stairs, push-ups, a fast walk — then long exhales. Heat needs somewhere to go before words help.',
    },
    bgGradient: ['#fdede6', '#fce2d6'],
    terrainColors: ['#f7a28b', '#e8745a', '#d94b30', '#b83218'],
    scoreBase: 51,
  },
  meadow: {
    id: 'meadow',
    name: 'Quiet Meadow',
    palette: 'meadow',
    tagline: 'Soft and rhythmic — calm, gentle, open pacing.',
    insight:
      'Your vocal tone carried smooth pitch transitions and gentle, steady pauses. You sound grounded, open, and at peace with your thoughts today.',
    tryThisNext: {
      title: 'Savor the calm space',
      description:
        'Take three long diaphragmatic breaths and write down one quiet reflection or memory before moving on with your day.',
    },
    bgGradient: ['#eaf3e9', '#d6e8d4'],
    terrainColors: ['#a9d0ab', '#87bd8f', '#5fa470', '#3f8557'],
    scoreBase: 78,
  },
  'mountain-range': {
    id: 'mountain-range',
    name: 'Mountain Range',
    palette: 'mountain-range',
    tagline: 'Elevated and strong — clear, energetic, focused pitch.',
    insight:
      'Elevated pitch variation and steady vocal strength detected. You sound determined, focused, and ready to tackle upcoming goals.',
    tryThisNext: {
      title: 'Channel your momentum',
      description:
        'Write down your top priority action item for the day and execute it while your energy and clarity are at their peak.',
    },
    bgGradient: ['#fdede8', '#f8d5cb'],
    terrainColors: ['#e8a091', '#dd7f72', '#c85f55', '#a8443d'],
    scoreBase: 84,
  },
  thunderstorm: {
    id: 'thunderstorm',
    name: 'Stormy Peaks',
    palette: 'thunderstorm',
    tagline: 'Rapid and intense — high variance, tense pitch spikes.',
    insight:
      'Rapid pacing and pitch spikes suggest elevated emotional intensity or stress. Taking a brief physical pause will help clear your mind.',
    tryThisNext: {
      title: 'Box Breathing (4-4-4-4)',
      description:
        'Inhale 4s, hold 4s, exhale 4s, hold 4s. Rhythmic box breathing lowers heart rate and calms your nervous system.',
    },
    bgGradient: ['#ebeaf5', '#d9d7ec'],
    terrainColors: ['#7c79a8', '#5e5a91', '#474378', '#322f5e'],
    scoreBase: 42,
  },
};

/**
 * Classifies session audio metrics into a biome & payload payload.
 */
export function analyzeAudioSession(metrics = {}) {
  const {
    avgVolume = 0.4,
    volumeVariance = 0.3,
    pitchVariance = 0.4,
    durationSeconds = 15,
  } = metrics;

  let biomeKey;

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
  const score = Math.min(99, Math.max(20, biome.scoreBase + Math.floor(pitchVariance * 20 - volumeVariance * 10)));

  return {
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dateFormatted: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
    durationFormatted: formatDuration(durationSeconds),
    biomeKey,
    biomeName: biome.name,
    palette: biome.palette,
    tagline: biome.tagline,
    insightMessage: biome.insight,
    tryThisNext: biome.tryThisNext,
    bgGradient: biome.bgGradient,
    terrainColors: biome.terrainColors,
    score: score,
  };
}

function formatDuration(sec) {
  const mins = Math.floor(sec / 60);
  const remainderSec = Math.floor(sec % 60);
  const m = String(mins).padStart(2, '0');
  const s = String(remainderSec).padStart(2, '0');
  return `${m}:${s}`;
}
