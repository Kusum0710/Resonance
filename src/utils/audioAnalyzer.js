/**
 * Audio analysis utility for Resonance.
 * Evaluates session vocal metrics (pitch, volume variance, pace)
 * to classify the landscape biome, generate a contextual insight,
 * and suggest a targeted mindfulness exercise.
 */

export const BIOMES = {
  'mountain-range': {
    id: 'mountain-range',
    name: 'Mountain Range',
    palette: 'mountain-range',
    tag: 'High Energy & Focus',
    description: 'Elevated pitch variation and steady vocal strength.',
    insight:
      'Your vocal tone carried high clarity and strong dynamics today. You sound determined, focused, and ready to tackle challenges.',
    mindfulness: {
      title: 'Box Breathing (4-4-4-4)',
      type: 'breathing',
      pattern: [4, 4, 4, 4],
      labels: ['Inhale', 'Hold', 'Exhale', 'Hold'],
      instruction: 'Focus your strong energy with rhythmic box breathing to maintain cognitive clarity.',
      color: '#e8a091',
    },
  },
  meadow: {
    id: 'meadow',
    name: 'Flowing Meadow',
    palette: 'meadow',
    tag: 'Balanced & Peaceful',
    description: 'Smooth, rhythmic transitions with gentle pitch contours.',
    insight:
      'Smooth pitch transitions and balanced pacing detected. Your vocal landscape feels grounded, harmonious, and at ease.',
    mindfulness: {
      title: '5-4-3-2-1 Grounding',
      type: 'grounding',
      steps: [
        'Acknowledge 5 things you can see around you.',
        'Acknowledge 4 things you can physically touch.',
        'Acknowledge 3 things you can hear right now.',
        'Acknowledge 2 things you can smell.',
        'Acknowledge 1 deep breath of gratitude.',
      ],
      instruction: 'Savor your calm state by tuning in to your immediate surroundings.',
      color: '#87bd8f',
    },
  },
  'gray-plateau': {
    id: 'gray-plateau',
    name: 'Quiet Plateau',
    palette: 'gray-plateau',
    tag: 'Reflective & Low Energy',
    description: 'Soft volume, steady low pitch, and extended pauses.',
    insight:
      'Your voice was soft, steady, and quiet today. You seem to be in a reflective or lower-energy state, carrying quiet thoughts.',
    mindfulness: {
      title: 'Energizing Breath (3-3)',
      type: 'breathing',
      pattern: [3, 0, 3, 0],
      labels: ['Inhale', '', 'Exhale', ''],
      instruction: 'Gently awaken your vitality with smooth, upbeat diaphragmatic breathing.',
      color: '#a3a19b',
    },
  },
  thunderstorm: {
    id: 'thunderstorm',
    name: 'Stormy Peaks',
    palette: 'thunderstorm',
    tag: 'High Intensity & Tension',
    description: 'Rapid pace, volume spikes, and tense pitch variations.',
    insight:
      'Rapid pacing and pitch spikes suggest elevated stress or emotional intensity. You might be processing heavy thoughts or fatigue.',
    mindfulness: {
      title: '4-7-8 Relaxing Breath',
      type: 'breathing',
      pattern: [4, 7, 8, 0],
      labels: ['Inhale', 'Hold', 'Exhale', ''],
      instruction: 'Release nervous system tension with a long, soothing 8-second exhale.',
      color: '#54527a',
    },
  },
};

/**
 * Classifies session audio metrics into a biome & mindfulness payload.
 * @param {Object} metrics
 * @param {number} metrics.avgVolume (0 to 1)
 * @param {number} metrics.volumeVariance (0 to 1)
 * @param {number} metrics.pitchVariance (0 to 1)
 * @param {number} metrics.durationSeconds
 */
export function analyzeAudioSession(metrics = {}) {
  const {
    avgVolume = 0.4,
    volumeVariance = 0.3,
    pitchVariance = 0.4,
    durationSeconds = 15,
  } = metrics;

  // Simple classification logic based on acoustic energy & variance
  let biomeKey = 'meadow';

  if (volumeVariance > 0.45 || pitchVariance > 0.5) {
    biomeKey = 'thunderstorm';
  } else if (avgVolume > 0.5 && pitchVariance > 0.3) {
    biomeKey = 'mountain-range';
  } else if (avgVolume < 0.25 || volumeVariance < 0.2) {
    biomeKey = 'gray-plateau';
  } else {
    biomeKey = 'meadow';
  }

  const biome = BIOMES[biomeKey];

  return {
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dateFormatted: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
    durationFormatted: formatDuration(durationSeconds),
    biomeKey,
    biomeName: biome.name,
    palette: biome.palette,
    tag: biome.tag,
    insightMessage: biome.insight,
    mindfulness: biome.mindfulness,
    metricsSummary: {
      intensityScore: Math.round(avgVolume * 100),
      varianceScore: Math.round(pitchVariance * 100),
    },
  };
}

function formatDuration(sec) {
  const mins = Math.floor(sec / 60);
  const remainderSec = Math.floor(sec % 60);
  if (mins === 0) return `${remainderSec}s`;
  return `${mins}m ${remainderSec}s`;
}
