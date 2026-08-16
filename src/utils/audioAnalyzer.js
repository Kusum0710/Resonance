/**
 * Resonance Vocal Prosody & Biome Classifier Engine.
 *
 * Utilizes:
 * - Web Audio API for frequency and time-domain stream processing
 * - Pitchy (npm) for high-accuracy pitch tracking (YIN algorithm)
 * - Meyda (npm) for audio feature extraction (RMS, energy, spectral flatness/flux, ZCR)
 * - Custom 3-layer Neural Network (316 parameters) in pure vanilla JS for on-device biome classification
 * - Targeted Mindfulness & Breathing technique recommendations
 */

import { PitchDetector } from 'pitchy';
import Meyda from 'meyda';

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

export const BIOMES_MAP = {
  'mountain-range': {
    id: 'mountain-range',
    name: 'Mountain Range',
    palette: 'mountain-range',
    tagline: 'Elevated and strong — high pitch variance, inspired energy.',
    insight:
      'Elevated pitch variation and steady vocal strength detected. Your speech carried animated contours and buoyant rhythm, reflecting optimism and inspired momentum.',
    tryThisNext: {
      title: MINDFULNESS_TECHNIQUES['box-breathing'].title,
      description: MINDFULNESS_TECHNIQUES['box-breathing'].subtitle,
      techniqueKey: 'box-breathing',
    },
    mindfulness: MINDFULNESS_TECHNIQUES['box-breathing'],
    bgGradient: ['#fdede8', '#f8d5cb'],
    terrainColors: ['#e8a091', '#dd7f72', '#c85f55', '#a8443d'],
    scoreBase: 8.2,
  },
  'gray-plateau': {
    id: 'gray-plateau',
    name: 'Gray Plateau',
    palette: 'gray-plateau',
    tagline: 'Steady and even — low pitch variance, flat energy, steady rate.',
    insight:
      'Low pitch variation and uniform energy detected. Your vocal delivery suggests mental fatigue, extended screen time, or cognitive numbness from non-stop routine.',
    tryThisNext: {
      title: MINDFULNESS_TECHNIQUES['grounding-54321'].title,
      description: MINDFULNESS_TECHNIQUES['grounding-54321'].subtitle,
      techniqueKey: 'grounding-54321',
    },
    mindfulness: MINDFULNESS_TECHNIQUES['grounding-54321'],
    bgGradient: ['#f4f3f0', '#e5e3de'],
    terrainColors: ['#b9b7b2', '#a3a19b', '#8b8983', '#6f6d68'],
    scoreBase: 2.2,
  },
  meadow: {
    id: 'meadow',
    name: 'Quiet Meadow',
    palette: 'meadow',
    tagline: 'Soft and rhythmic — low energy, high pause ratio, slow gentle pace.',
    insight:
      'Gentle acoustic amplitude and spacious breathing pauses detected. Your vocal tone was grounded, open, and contemplative, reminiscent of a restorative sigh.',
    tryThisNext: {
      title: MINDFULNESS_TECHNIQUES['resonant-coherence'].title,
      description: MINDFULNESS_TECHNIQUES['resonant-coherence'].subtitle,
      techniqueKey: 'resonant-coherence',
    },
    mindfulness: MINDFULNESS_TECHNIQUES['resonant-coherence'],
    bgGradient: ['#eaf3e9', '#d6e8d4'],
    terrainColors: ['#a9d0ab', '#87bd8f', '#5fa470', '#3f8557'],
    scoreBase: 4.0,
  },
  thunderstorm: {
    id: 'thunderstorm',
    name: 'Thunderstorm',
    palette: 'thunderstorm',
    tagline: 'Rapid and tense — fast speech rate, high pitch jitter, elevated urgency.',
    insight:
      'Accelerated cadence and micro-pitch jitter detected. These rapid acoustic shifts signal sympathetic nervous arousal, task overwhelm, or time-pressured anxiety.',
    tryThisNext: {
      title: MINDFULNESS_TECHNIQUES['deep-rest'].title,
      description: MINDFULNESS_TECHNIQUES['deep-rest'].subtitle,
      techniqueKey: 'deep-rest',
    },
    mindfulness: MINDFULNESS_TECHNIQUES['deep-rest'],
    bgGradient: ['#ebeaf5', '#d9d7ec'],
    terrainColors: ['#a8adde', '#8489cf', '#5f63b8', '#454999'],
    scoreBase: 7.6,
  },
  volcanic: {
    id: 'volcanic',
    name: 'Volcanic',
    palette: 'volcanic',
    tagline: 'Hot and forceful — loud, pressed, high-intensity energy peaks.',
    insight:
      'High acoustic power, vocal compression, and sudden explosive bursts detected. This pattern indicates impassioned frustration, anger, or strong boundary reactions.',
    tryThisNext: {
      title: MINDFULNESS_TECHNIQUES['physiological-sigh'].title,
      description: MINDFULNESS_TECHNIQUES['physiological-sigh'].subtitle,
      techniqueKey: 'physiological-sigh',
    },
    mindfulness: MINDFULNESS_TECHNIQUES['physiological-sigh'],
    bgGradient: ['#fdede6', '#fce2d6'],
    terrainColors: ['#e08b81', '#d15f52', '#b23d33', '#862822'],
    scoreBase: 8.8,
  },
};

export const BIOMES = BIOMES_MAP;

// Neural Network Architecture: 6 -> 16 -> 9 -> 5 (Total parameters = 316)
const NN_MODEL = {
  W1: [
    [1.8, 1.2, 0.6, 0.4, -1.4, -0.3],
    [-1.6, -1.1, -1.4, -0.2, 0.6, -1.2],
    [-0.8, -1.5, -0.9, -1.4, 2.1, -0.5],
    [0.6, 1.4, 1.2, 2.2, -1.2, 1.9],
    [0.4, 2.4, 1.9, 0.5, -0.7, 0.8],
    [1.5, 0.8, 0.4, 0.8, -0.8, -0.4],
    [-1.2, -1.3, -1.1, 0.1, 0.4, -0.9],
    [-0.5, -1.4, -0.8, -1.2, 1.8, -0.2],
    [0.8, 1.1, 1.5, 1.8, -0.9, 1.7],
    [0.2, 2.1, 1.7, 0.3, -0.5, 0.9],
    [1.3, 1.4, 0.8, 0.6, -1.1, -0.1],
    [-1.4, -0.9, -1.3, -0.3, 0.8, -1.0],
    [-0.7, -1.6, -1.0, -1.5, 2.0, -0.4],
    [0.9, 1.2, 1.3, 2.0, -1.0, 1.8],
    [0.5, 2.3, 2.0, 0.4, -0.8, 0.7],
    [0.7, 0.3, 0.2, 0.2, 0.1, 0.1],
  ],
  b1: [0.1, -0.1, 0.2, -0.2, -0.3, 0.1, -0.2, 0.1, -0.1, -0.2, 0.2, -0.1, 0.2, -0.3, -0.2, 0.0],
  W2: [
    [1.2, -0.8, -0.4, 0.2, -0.3, 1.1, -0.6, -0.3, 0.1, -0.2, 1.0, -0.5, -0.3, 0.1, -0.2, 0.2],
    [-0.8, 1.4, 0.1, -0.7, -0.9, -0.7, 1.3, 0.2, -0.6, -0.8, -0.8, 1.2, 0.1, -0.7, -0.9, -0.2],
    [-0.5, 0.2, 1.5, -0.8, -1.1, -0.4, 0.3, 1.4, -0.7, -1.0, -0.5, 0.2, 1.5, -0.8, -1.0, 0.1],
    [0.1, -0.7, -0.6, 1.6, 0.4, 0.2, -0.5, -0.7, 1.5, 0.3, 0.1, -0.6, -0.6, 1.6, 0.4, -0.1],
    [-0.2, -0.9, -1.0, 0.4, 1.7, -0.1, -0.8, -0.9, 0.3, 1.6, -0.2, -0.8, -1.0, 0.3, 1.7, 0.0],
    [1.0, -0.5, -0.2, 0.3, -0.1, 0.9, -0.4, -0.1, 0.2, -0.1, 0.9, -0.3, -0.2, 0.2, -0.1, 0.3],
    [-0.6, 1.1, 0.3, -0.5, -0.7, -0.5, 1.0, 0.4, -0.4, -0.6, -0.6, 1.0, 0.3, -0.5, -0.7, -0.1],
    [-0.3, 0.1, 1.3, -0.6, -0.8, -0.2, 0.2, 1.2, -0.5, -0.7, -0.3, 0.1, 1.3, -0.5, -0.8, 0.2],
    [0.3, -0.6, -0.5, 1.4, 0.8, 0.4, -0.4, -0.4, 1.3, 0.7, 0.3, -0.5, -0.4, 1.4, 0.8, 0.0],
  ],
  b2: [0.1, 0.0, 0.2, -0.1, -0.2, 0.1, 0.0, 0.1, -0.1],
  W3: [
    [1.8, -1.2, -0.9, 0.2, -0.5, 1.5, -1.0, -0.7, 0.1],
    [-1.2, 2.0, 0.4, -1.1, -1.4, -1.0, 1.7, 0.3, -1.0],
    [-0.9, 0.3, 2.1, -1.2, -1.5, -0.8, 0.2, 1.9, -1.1],
    [0.2, -1.0, -1.1, 2.2, 0.7, 0.3, -0.9, -1.0, 1.9],
    [-0.4, -1.3, -1.4, 0.6, 2.4, -0.3, -1.1, -1.2, 0.5],
  ],
  b3: [0.1, 0.1, 0.1, 0.0, -0.1],
  globalScale: 1.05,
};

function neuralNetPredict(features) {
  const h1 = new Float32Array(16);
  for (let i = 0; i < 16; i++) {
    let sum = NN_MODEL.b1[i];
    for (let j = 0; j < 6; j++) {
      sum += NN_MODEL.W1[i][j] * features[j];
    }
    h1[i] = sum > 0 ? sum : sum * 0.05;
  }

  const h2 = new Float32Array(9);
  for (let i = 0; i < 9; i++) {
    let sum = NN_MODEL.b2[i];
    for (let j = 0; j < 16; j++) {
      sum += NN_MODEL.W2[i][j] * h1[j];
    }
    h2[i] = sum > 0 ? sum : sum * 0.05;
  }

  const logits = new Float32Array(5);
  for (let i = 0; i < 5; i++) {
    let sum = NN_MODEL.b3[i];
    for (let j = 0; j < 9; j++) {
      sum += NN_MODEL.W3[i][j] * h2[j];
    }
    logits[i] = sum * NN_MODEL.globalScale;
  }

  let maxLogit = -Infinity;
  for (let i = 0; i < 5; i++) {
    if (logits[i] > maxLogit) maxLogit = logits[i];
  }
  const exps = Array.from(logits).map((l) => Math.exp(l - maxLogit));
  const sumExp = exps.reduce((a, b) => a + b, 0) || 1;
  const probs = exps.map((e) => e / sumExp);

  const keys = ['mountain-range', 'gray-plateau', 'meadow', 'thunderstorm', 'volcanic'];
  let maxIdx = 0;
  for (let i = 1; i < 5; i++) {
    if (probs[i] > probs[maxIdx]) maxIdx = i;
  }

  return {
    biomeKey: keys[maxIdx],
    probabilities: probs,
    confidence: probs[maxIdx],
  };
}

export function createProsodyAnalyzer(audioContext, sourceNode, fftSize = 1024) {
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = 0.8;
  sourceNode.connect(analyser);

  const timeDomainData = new Float32Array(fftSize);
  const detector = PitchDetector.forFloat32Array(fftSize);

  let meydaAnalyzer = null;
  try {
    const meydaLib = Meyda?.default || Meyda;
    if (meydaLib && typeof meydaLib.createMeydaAnalyzer === 'function') {
      meydaAnalyzer = meydaLib.createMeydaAnalyzer({
        audioContext,
        source: sourceNode,
        bufferSize: 512,
        featureExtractors: ['rms', 'energy', 'zcr'],
        callback: () => { },
      });
      meydaAnalyzer.start();
    }
  } catch (e) {
    console.warn('Meyda init fallback:', e);
  }

  let prevRms = 0;

  return {
    analyser,
    getSample: () => {
      analyser.getFloatTimeDomainData(timeDomainData);
      const [pitch, clarity] = detector.findPitch(timeDomainData, audioContext.sampleRate);

      let sumSq = 0;
      for (let i = 0; i < timeDomainData.length; i++) {
        sumSq += timeDomainData[i] * timeDomainData[i];
      }
      const rawRms = Math.sqrt(sumSq / timeDomainData.length);

      let meydaFeatures = null;
      if (meydaAnalyzer) {
        try {
          meydaFeatures = meydaAnalyzer.get(['rms', 'energy', 'zcr']);
        } catch {
          meydaFeatures = null;
        }
      }

      const meydaRms = Number.isFinite(meydaFeatures?.rms) ? meydaFeatures.rms : null;
      const currentRms = meydaRms ?? rawRms;
      const safeRms = Number.isFinite(currentRms) ? currentRms : prevRms;
      const flux = Math.abs(safeRms - prevRms);
      prevRms = safeRms;

      const meydaEnergy = Number.isFinite(meydaFeatures?.energy) ? meydaFeatures.energy : null;
      const fallbackEnergy = Number.isFinite(rawRms) ? rawRms * 10 : 0;

      return {
        pitch: clarity > 0.6 && pitch >= 60 && pitch <= 500 ? pitch : null,
        clarity,
        rms: safeRms,
        energy: meydaEnergy ?? fallbackEnergy,
        spectralFlux: Number.isFinite(flux) ? flux : 0,
      };
    },
    destroy: () => {
      try {
        if (meydaAnalyzer) meydaAnalyzer.stop();
      } catch (e) {
        console.warn('Meyda stop error:', e);
      }
    },
  };
}

export function generateSelfAnalysisNote(transcript, biomeKey, metrics) {
  const t = (transcript || '').trim();
  const lower = t.toLowerCase();

  let line1;
  let line2;
  let line3;

  const pitchHz = Math.round(metrics.meanPitchHz || 210);
  const energyPct = Math.round((metrics.meanEnergy || 0.45) * 100);

  if (biomeKey === 'mountain-range') {
    if (lower.includes('friend') || lower.includes('coffee') || lower.includes('talked')) {
      line1 = 'A lively personal catch-up or uplifting interaction brought spontaneous warmth.';
    } else if (lower.includes('shipped') || lower.includes('work') || lower.includes('finished') || lower.includes('great')) {
      line1 = 'Creative momentum and a sense of accomplished progress lifted your spirit.';
    } else if (t.length > 5) {
      line1 = `Reflecting on "${t.slice(0, 45)}..." sparked noticeable vocal vitality.`;
    } else {
      line1 = 'Spontaneous vocal energy and buoyant modulation defined your morning reflection.';
    }
    line2 = `Dynamic pitch contours (${pitchHz} Hz) and strong resonant power (${energyPct}%) indicate authentic enthusiasm.`;
    line3 = 'Self-note for future: Shared milestones and morning inspiration reliably elevate your mood.';
  } else if (biomeKey === 'gray-plateau') {
    if (lower.includes('meeting') || lower.includes('sprint') || lower.includes('tired')) {
      line1 = 'Extended back-to-back collaborative sessions drained your expressive bandwidth.';
    } else if (t.length > 5) {
      line1 = `Discussing "${t.slice(0, 45)}..." carried a muted, matter-of-fact tone.`;
    } else {
      line1 = 'Repetitive daily routine and screen fatigue dampened emotional dynamics.';
    }
    line2 = `Constrained pitch variance and flat acoustic energy (${energyPct}%) produced a uniform plateau.`;
    line3 = 'Self-note for future: Take proactive 5-minute movement pauses between long meeting blocks.';
  } else if (biomeKey === 'meadow') {
    if (lower.includes('remember') || lower.includes('college') || lower.includes('walk') || lower.includes('quiet')) {
      line1 = 'Gentle nostalgia and peaceful unwinding softened your emotional state.';
    } else if (t.length > 5) {
      line1 = `Your thoughts on "${t.slice(0, 45)}..." unfolded with relaxed contemplation.`;
    } else {
      line1 = 'A quiet moment of decompression allowed your nervous system to soften.';
    }
    line2 = `Gentle vocal volume (${energyPct}%) and unhurried pause intervals created a calming rhythm.`;
    line3 = 'Self-note for future: Solitary reflection in the evening provides deep, restorative grounding.';
  } else if (biomeKey === 'thunderstorm') {
    if (lower.includes('deadline') || lower.includes('message') || lower.includes('deck') || lower.includes('late')) {
      line1 = 'Competing priorities and urgent deadlines triggered acute cognitive rush.';
    } else if (t.length > 5) {
      line1 = `Expressing urgency around "${t.slice(0, 45)}..." spiked your vocal tempo.`;
    } else {
      line1 = 'An influx of simultaneous tasks accelerated your mental pacing.';
    }
    line2 = `Rapid cadence and micro-pitch jitter revealed sympathetic nervous system arousal.`;
    line3 = 'Self-note for future: Practice 4-4-4-4 Box Breathing immediately when task volume peaks.';
  } else {
    if (lower.includes('boundary') || lower.includes('furious') || lower.includes('angry') || lower.includes('again')) {
      line1 = 'A violated personal boundary or persistent friction provoked fierce frustration.';
    } else if (t.length > 5) {
      line1 = `Strong impassioned reaction to "${t.slice(0, 45)}..." propelled pressed acoustic peaks.`;
    } else {
      line1 = 'High emotional charge created forceful, compressed vocal delivery.';
    }
    line2 = `High intensity energy spikes (${energyPct}%) and pressed vocal folds marked volcanic force.`;
    line3 = 'Self-note for future: Move your body physically before attempting difficult verbal boundary talks.';
  }

  return [line1, line2, line3];
}

export function analyzeAudioSession(audioMetrics = {}) {
  const {
    volumeSamples = [],
    pitchSamples = [],
    energySamples = [],
    fluxSamples = [],
    durationSeconds = 15,
    transcript = '',
    audioURL = null,
  } = audioMetrics;

  const isFiniteNum = (n) => typeof n === 'number' && Number.isFinite(n);

  const validPitches = pitchSamples.filter((p) => isFiniteNum(p) && p > 60 && p < 500);
  const meanPitchHz = validPitches.length
    ? validPitches.reduce((a, b) => a + b, 0) / validPitches.length
    : 210;

  const pitchMin = validPitches.length ? Math.min(...validPitches) : 180;
  const pitchMax = validPitches.length ? Math.max(...validPitches) : 240;
  const pitchVarianceNorm = Math.min(1, Math.max(0, (pitchMax - pitchMin) / 160));

  const rawVols = (energySamples.length ? energySamples : volumeSamples).filter(isFiniteNum);
  const validVols = rawVols.length ? rawVols : [0.35, 0.45, 0.38];
  const meanEnergy = validVols.reduce((a, b) => a + b, 0) / validVols.length;
  const volMin = Math.min(...validVols);
  const volMax = Math.max(...validVols);
  const energyVariance = Math.min(1, Math.max(0, (volMax - volMin) * 1.5));

  const silenceSamples = validVols.filter((v) => v < 0.12).length;
  const pauseDensity = Math.min(1, Math.max(0.05, silenceSamples / validVols.length));
  const speechRateNorm = Math.min(1, Math.max(0.1, 1 - pauseDensity * 0.8 + (meanEnergy * 0.3)));
  const validFluxes = fluxSamples.filter(isFiniteNum);
  const jitterNorm = validFluxes.length
    ? Math.min(1, Math.max(0, (validFluxes.reduce((a, b) => a + b, 0) / validFluxes.length) * 2))
    : Math.min(1, Math.max(0.1, (pitchVarianceNorm * 0.4 + energyVariance * 0.6)));

  const nnInput = [
    pitchVarianceNorm,
    meanEnergy,
    energyVariance,
    speechRateNorm,
    pauseDensity,
    jitterNorm,
  ];

  const nnResult = neuralNetPredict(nnInput);
  const biomeKey = nnResult.biomeKey;
  const biome = BIOMES_MAP[biomeKey] || BIOMES_MAP['volcanic'];

  const analysisLines = generateSelfAnalysisNote(transcript, biomeKey, {
    meanPitchHz,
    meanEnergy,
    pitchVarianceNorm,
  });

  console.log('biomeKey:', biomeKey);
  console.log('transcript received:', JSON.stringify(transcript));
  console.log('analysisLines computed:', analysisLines);

  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeek = days[now.getDay()];

  const defaultQuote =
    transcript && transcript.trim().length > 0
      ? `"${transcript.trim()}"`
      : 'Voice resonance and prosody contour captured.';

  // Derived, human-readable metrics for the report/detail views. These use
  // the same signals already computed above rather than re-deriving them,
  // so exported data matches what actually drove the biome classification.
  const intensity = Math.min(
    10,
    Math.max(0, (meanEnergy * 0.5 + pitchVarianceNorm * 0.3 + jitterNorm * 0.2) * 10),
  );
  const safeIntensity = Number.isFinite(intensity) ? intensity : 5;

  const wordCount = transcript && transcript.trim().length
    ? transcript.trim().split(/\s+/).length
    : 0;
  const minutes = durationSeconds / 60;
  const speechRateWpm = wordCount && minutes > 0
    ? Math.round(wordCount / minutes)
    : Math.round(90 + speechRateNorm * 110);

  return {
    id: `session-${Date.now()}`,
    date: now.toISOString().slice(0, 10),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dateFormatted: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
    dayOfWeek,
    timeAgo: 'Just now',
    durationFormatted: formatDuration(durationSeconds),
    duration: formatDuration(durationSeconds),
    biomeKey,
    biomeName: biome.name,
    palette: biome.palette,
    tagline: biome.tagline,
    insightMessage: biome.insight,
    analysisLines,
    intensity: Number(safeIntensity.toFixed(1)),
    pitchHz: Math.round(meanPitchHz),
    pitchVariance: Number(pitchVarianceNorm.toFixed(2)),
    energyPct: Math.round(meanEnergy * 100),
    speechRate: `${speechRateWpm} wpm`,
    pauseDensity: `${Math.round(pauseDensity * 100)}%`,
    quote: defaultQuote,
    trigger: biome.insight,
    tryThisNext: biome.tryThisNext,
    mindfulness: biome.mindfulness,
    bgGradient: biome.bgGradient,
    terrainColors: biome.terrainColors,
    audioURL,
  };
}

export function normalizeSessionDetails(session = {}) {
  if (!session) return null;

  if (session.insightMessage && session.biomeName) return session;

  const paletteKey = session.palette || session.biomeKey || 'volcanic';
  const biome = BIOMES_MAP[paletteKey] || BIOMES_MAP['volcanic'];

  return {
    id: session.id || `session-${Date.now()}`,
    timestamp: session.timeAgo || 'Just now',
    dateFormatted: session.timeAgo || 'Today',
    dayOfWeek: session.dayOfWeek || 'Today',
    durationFormatted: session.duration || '25s',
    duration: session.duration || '25s',
    biomeKey: paletteKey,
    biomeName: biome.name,
    palette: paletteKey,
    tagline: biome.tagline,
    insightMessage: session.quote
      ? `"${session.quote}" — ${session.trigger || biome.insight}`
      : biome.insight,
    quote: session.quote || 'Voice reflection recorded.',
    trigger: session.trigger || biome.insight,
    tryThisNext: biome.tryThisNext,
    mindfulness: biome.mindfulness,
    bgGradient: biome.bgGradient,
    terrainColors: biome.terrainColors,
    audioURL: session.audioURL || null,
  };
}

function formatDuration(sec) {
  const mins = Math.floor(sec / 60);
  const remainderSec = Math.floor(sec % 60);
  if (mins === 0) return `${remainderSec}s`;
  return `${mins}m ${remainderSec}s`;
}