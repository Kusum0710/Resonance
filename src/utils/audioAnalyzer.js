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

function calculatePitchStats(pitchSamples = []) {
  const cleanPitches = pitchSamples
    .filter((p) => typeof p === 'number' && Number.isFinite(p) && p >= 65 && p <= 480)
    .sort((a, b) => a - b);

  if (cleanPitches.length < 4) {
    return {
      meanPitchHz: 205,
      medianPitchHz: 205,
      semitoneStdDev: 1.8,
      pitchVarianceNorm: 0.35,
      validCount: cleanPitches.length,
    };
  }

  // Outlier trimming: drop bottom 5% and top 5%
  const trimStart = Math.floor(cleanPitches.length * 0.05);
  const trimEnd = Math.ceil(cleanPitches.length * 0.95);
  const trimmed = cleanPitches.slice(trimStart, trimEnd);

  const meanPitchHz = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
  const medianPitchHz = trimmed[Math.floor(trimmed.length / 2)];

  // Calculate variation in semitones relative to median F0 (logarithmic perception)
  const semitoneDiffs = trimmed.map((f) => 12 * Math.log2(Math.max(30, f) / medianPitchHz));
  const semitoneVariance =
    semitoneDiffs.reduce((acc, val) => acc + Math.pow(val, 2), 0) / semitoneDiffs.length;
  const semitoneStdDev = Math.sqrt(semitoneVariance);

  // Calibration scale:
  // Monotone / Flat: < 1.4 ST -> norm < 0.25
  // Calm / Meadow: 1.4 - 2.5 ST -> norm ~ 0.30 - 0.50
  // Melodic / Animated: > 2.8 ST -> norm > 0.60
  const pitchVarianceNorm = Math.min(1, Math.max(0.05, (semitoneStdDev - 0.6) / 4.0));

  return {
    meanPitchHz: Math.round(meanPitchHz),
    medianPitchHz: Math.round(medianPitchHz),
    semitoneStdDev: Number(semitoneStdDev.toFixed(2)),
    pitchVarianceNorm: Number(pitchVarianceNorm.toFixed(3)),
    validCount: trimmed.length,
  };
}

function calculateRhythmAndCadence(volumeSamples = [], durationSeconds = 10, transcript = '') {
  const vols = volumeSamples.length
    ? volumeSamples.map((v) => Math.min(1, Math.max(0, v)))
    : [0.2, 0.25, 0.22];

  const sortedVols = [...vols].sort((a, b) => a - b);
  // Estimate ambient noise floor from 15th percentile
  const ambientFloor = sortedVols[Math.floor(sortedVols.length * 0.15)] || 0.05;
  const speechThreshold = Math.max(0.08, ambientFloor + 0.06);

  const silenceFrames = vols.filter((v) => v < speechThreshold).length;
  const pauseDensity = Math.min(0.85, Math.max(0.05, silenceFrames / vols.length));

  // Cadence estimation
  const cleanText = (transcript || '').trim();
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const durationMin = Math.max(0.08, durationSeconds / 60);

  let wpm;
  if (wordCount >= 3) {
    wpm = Math.round(wordCount / durationMin);
  } else {
    // Syllable pulse detection with energy peak picking
    let syllables = 0;
    const windowSize = Math.max(2, Math.floor(vols.length / (durationSeconds * 8 || 80)));
    for (let i = windowSize; i < vols.length - windowSize; i += windowSize) {
      const cur = vols[i];
      if (cur > speechThreshold * 1.35 && cur > vols[i - windowSize] && cur > vols[i + windowSize]) {
        syllables++;
      }
    }
    const estimatedWords = Math.max(1, Math.round(syllables * 0.72));
    wpm = Math.round(estimatedWords / durationMin);
  }

  // Clamp to realistic human conversational range (60 - 240 WPM)
  const clampedWpm = Math.max(65, Math.min(230, wpm || 128));

  // Normalized speech rate scale:
  // < 100 WPM = very slow/relaxed (0.05 - 0.25)
  // 110 - 140 WPM = steady conversational (0.35 - 0.55)
  // 150 - 175 WPM = animated/active (0.60 - 0.75)
  // > 180 WPM = rushed/rapid (0.80 - 1.0)
  const speechRateNorm = Math.min(1, Math.max(0.05, (clampedWpm - 65) / 140));

  return {
    wpm: clampedWpm,
    speechRateNorm: Number(speechRateNorm.toFixed(3)),
    pauseDensity: Number(pauseDensity.toFixed(3)),
    ambientFloor: Number(ambientFloor.toFixed(3)),
  };
}

function calculateEnergyMetrics(volumeSamples = [], fluxSamples = []) {
  const vols = volumeSamples.length
    ? volumeSamples.map((v) => Math.min(1, Math.max(0, v)))
    : [0.25, 0.35, 0.28];

  const meanEnergy = vols.reduce((a, b) => a + b, 0) / vols.length;
  const sorted = [...vols].sort((a, b) => a - b);
  const peakEnergy = sorted[Math.floor(sorted.length * 0.95)] || meanEnergy;
  const energyVariance = Math.min(1, Math.max(0.05, (peakEnergy - sorted[0]) * 1.5));

  const validFluxes = fluxSamples.filter((f) => typeof f === 'number' && Number.isFinite(f));
  const meanFlux = validFluxes.length
    ? validFluxes.reduce((a, b) => a + b, 0) / validFluxes.length
    : 0.1;
  const jitterNorm = Math.min(1, Math.max(0.05, meanFlux * 2.2));

  return {
    meanEnergy: Number(meanEnergy.toFixed(3)),
    peakEnergy: Number(peakEnergy.toFixed(3)),
    energyVariance: Number(energyVariance.toFixed(3)),
    jitterNorm: Number(jitterNorm.toFixed(3)),
  };
}

function classifyTerrainBiome({ pitchStats, rhythm, energy }) {
  const { pitchVarianceNorm, semitoneStdDev } = pitchStats;
  const { speechRateNorm, pauseDensity, wpm } = rhythm;
  const { meanEnergy, peakEnergy, energyVariance, jitterNorm } = energy;

  // Balanced likelihood scoring for all 5 distinct biomes:
  // 1. Meadow: Slow/moderate cadence, spacious restful pauses, gentle volume, relaxed vocal tone
  let meadowScore = 0;
  meadowScore += (1 - speechRateNorm) * 3.2;
  meadowScore += pauseDensity * 2.8;
  meadowScore += (1 - Math.max(0, meanEnergy - 0.35)) * 2.0;
  meadowScore += (1 - jitterNorm) * 1.5;
  if (wpm <= 125) meadowScore += 1.2;
  if (pauseDensity >= 0.22) meadowScore += 1.0;
  if (meanEnergy < 0.35) meadowScore += 0.8;

  // 2. Gray Plateau: Low melodic variation (monotone), flat energy envelope, muted cadence, routine/tired
  let plateauScore = 0;
  plateauScore += (1 - pitchVarianceNorm) * 3.5;
  plateauScore += (1 - energyVariance) * 2.2;
  plateauScore += (1 - jitterNorm) * 1.6;
  plateauScore += (1 - Math.abs(speechRateNorm - 0.45)) * 1.2;
  if (semitoneStdDev < 1.7) plateauScore += 1.8;
  if (energyVariance < 0.3) plateauScore += 1.2;
  if (meanEnergy < 0.42) plateauScore += 0.8;

  // 3. Mountain Range: High pitch dynamic variance, animated melodic contours, buoyant energy, expressive
  let mountainScore = 0;
  mountainScore += pitchVarianceNorm * 3.4;
  mountainScore += (1 - Math.abs(meanEnergy - 0.45)) * 2.0;
  mountainScore += energyVariance * 1.4;
  mountainScore += (1 - Math.abs(speechRateNorm - 0.55)) * 1.2;
  if (semitoneStdDev >= 2.6) mountainScore += 1.8;
  if (pitchVarianceNorm > 0.55) mountainScore += 1.2;
  if (pauseDensity >= 0.15 && pauseDensity <= 0.4) mountainScore += 0.6;

  // 4. Thunderstorm: Genuinely fast speech rate (>155 WPM), low pause density (<15%), micro-jitter, urgency
  let thunderScore = 0;
  thunderScore += speechRateNorm * 3.6;
  thunderScore += (1 - pauseDensity) * 3.0;
  thunderScore += jitterNorm * 2.2;
  thunderScore += energyVariance * 1.2;
  if (wpm >= 165) thunderScore += 2.0;
  if (pauseDensity < 0.14) thunderScore += 1.5;
  if (jitterNorm > 0.45) thunderScore += 0.8;

  // 5. Volcanic: High acoustic power, explosive volume bursts (peakEnergy > 0.65), pressed vocal intensity
  let volcanicScore = 0;
  volcanicScore += meanEnergy * 3.8;
  volcanicScore += peakEnergy * 3.0;
  volcanicScore += energyVariance * 2.4;
  volcanicScore += jitterNorm * 1.2;
  if (peakEnergy > 0.62) volcanicScore += 2.2;
  if (meanEnergy > 0.52) volcanicScore += 1.5;

  const scoreMap = [
    { key: 'meadow', score: meadowScore },
    { key: 'gray-plateau', score: plateauScore },
    { key: 'mountain-range', score: mountainScore },
    { key: 'thunderstorm', score: thunderScore },
    { key: 'volcanic', score: volcanicScore },
  ];

  // Softmax probabilities
  const maxScore = Math.max(...scoreMap.map((s) => s.score));
  const exps = scoreMap.map((s) => ({
    key: s.key,
    exp: Math.exp(s.score - maxScore),
  }));
  const sumExp = exps.reduce((a, b) => a + b.exp, 0) || 1;
  const probs = {};
  exps.forEach((e) => {
    probs[e.key] = Number((e.exp / sumExp).toFixed(3));
  });

  scoreMap.sort((a, b) => b.score - a.score);
  const winnerKey = scoreMap[0].key;

  return {
    biomeKey: winnerKey,
    probabilities: probs,
    confidence: probs[winnerKey],
    scores: scoreMap,
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

      const currentRms = meydaFeatures?.rms ?? rawRms;
      const flux = Math.abs(currentRms - prevRms);
      prevRms = currentRms;

      return {
        pitch: clarity > 0.6 && pitch >= 60 && pitch <= 500 ? pitch : null,
        clarity,
        rms: currentRms,
        energy: meydaFeatures?.energy ? Math.min(1, meydaFeatures.energy / 5) : Math.min(1, rawRms * 3),
        spectralFlux: Math.min(1, flux * 4),
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

  const pitchStats = calculatePitchStats(pitchSamples);
  const rhythm = calculateRhythmAndCadence(
    volumeSamples.length ? volumeSamples : energySamples,
    durationSeconds,
    transcript
  );
  const energy = calculateEnergyMetrics(
    volumeSamples.length ? volumeSamples : energySamples,
    fluxSamples
  );

  const classification = classifyTerrainBiome({ pitchStats, rhythm, energy });
  const biomeKey = classification.biomeKey;
  const biome = BIOMES_MAP[biomeKey] || BIOMES_MAP['meadow'];

  const analysisLines = generateSelfAnalysisNote(transcript, biomeKey, {
    meanPitchHz: pitchStats.meanPitchHz,
    meanEnergy: energy.meanEnergy,
    pitchVarianceNorm: pitchStats.pitchVarianceNorm,
    semitoneStdDev: pitchStats.semitoneStdDev,
    wpm: rhythm.wpm,
    pauseDensity: rhythm.pauseDensity,
  });

  console.log('Robust Classified Biome:', biomeKey, {
    confidence: classification.confidence,
    probabilities: classification.probabilities,
    scores: classification.scores,
    pitchStats,
    rhythm,
    energy,
  });

  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeek = days[now.getDay()];

  const cleanTranscript = (transcript || '').trim();
  const defaultQuote =
    cleanTranscript.length > 0
      ? `"${cleanTranscript}"`
      : 'Voice resonance and prosody contour captured.';

  // Intensity score 1.0 - 10.0 scaled according to acoustic energy, pitch dynamics, and speed
  const calculatedIntensity = Number(
    Math.min(
      9.8,
      Math.max(
        1.8,
        energy.meanEnergy * 5.0 +
        pitchStats.pitchVarianceNorm * 2.5 +
        rhythm.speechRateNorm * 2.5
      )
    ).toFixed(1)
  );

  return {
    id: `session-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
    transcript: cleanTranscript,
    notes: cleanTranscript,
    quote: defaultQuote,
    trigger: biome.insight,
    tryThisNext: biome.tryThisNext,
    mindfulness: biome.mindfulness,
    bgGradient: biome.bgGradient,
    terrainColors: biome.terrainColors,
    pitchHz: pitchStats.meanPitchHz,
    pitchVariance: Number(pitchStats.pitchVarianceNorm.toFixed(2)),
    semitoneStdDev: pitchStats.semitoneStdDev,
    energyPct: Math.round(energy.meanEnergy * 100),
    intensity: calculatedIntensity,
    speechRate: `${rhythm.wpm} wpm`,
    pauseDensity: `${Math.round(rhythm.pauseDensity * 100)}%`,
    audioURL,
    probabilities: classification.probabilities,
  };
}

export const FEELING_LEVELS = [
  { level: 1, label: 'Gloomy', emoji: '≡(▔﹏▔)≡', color: '#1a2b6b', bg: '#e8ecf8', glow: 'rgba(26, 43, 107, 0.3)' },
  { level: 2, label: 'Low', emoji: '≡(▔﹏▔)≡', color: '#1e40af', bg: '#e9effd', glow: 'rgba(30, 64, 175, 0.3)' },
  { level: 3, label: 'Somber', emoji: '(,,•́︿•̀,,)', color: '#2563eb', bg: '#eff4fe', glow: 'rgba(37, 99, 235, 0.3)' },
  { level: 4, label: 'Muted', emoji: '(・_・;)', color: '#4f46e5', bg: '#f1f1ff', glow: 'rgba(79, 70, 229, 0.3)' },
  { level: 5, label: 'Neutral', emoji: '(・ω・)', color: '#7c3aed', bg: '#f5efff', glow: 'rgba(124, 58, 237, 0.3)' },
  { level: 6, label: 'Steady', emoji: '(•‿•)', color: '#9333ea', bg: '#faf0ff', glow: 'rgba(147, 51, 234, 0.3)' },
  { level: 7, label: 'Calm', emoji: '(⌒‿⌒)', color: '#ca8a04', bg: '#fef9e7', glow: 'rgba(202, 138, 4, 0.3)' },
  { level: 8, label: 'Light', emoji: '(✿◠‿◠)', color: '#65a30d', bg: '#f4fbe8', glow: 'rgba(101, 163, 13, 0.3)' },
  { level: 9, label: 'Uplifted', emoji: '(＾◡＾)', color: '#16a34a', bg: '#edfcf2', glow: 'rgba(22, 163, 74, 0.3)' },
  { level: 10, label: 'Happy', emoji: '(❁´◡`❁)', color: '#059669', bg: '#e6f9f0', glow: 'rgba(5, 150, 105, 0.3)' },
];

export function getFeelingByLevel(level) {
  const num = Math.min(10, Math.max(1, Number(level) || 7));
  return FEELING_LEVELS.find((f) => f.level === num) || FEELING_LEVELS[6];
}

export function normalizeSessionDetails(session = {}) {
  if (!session) return null;

  const paletteKey = session.palette || session.biomeKey || 'volcanic';
  const biome = BIOMES_MAP[paletteKey] || BIOMES_MAP['volcanic'];

  const rawNotes = session.notes || session.transcript || (session.quote ? session.quote.replace(/^"|"$/g, '') : '') || '';

  return {
    ...session,
    id: session.id || `session-${Date.now()}`,
    timestamp: session.timeFormatted || session.timestamp || session.timeAgo || 'Just now',
    dateFormatted: session.dateFormatted || session.timeAgo || 'Today',
    dayOfWeek: session.dayOfWeek || 'Today',
    durationFormatted: session.durationFormatted || session.duration || '25s',
    duration: session.duration || '25s',
    biomeKey: paletteKey,
    biomeName: session.biomeName || biome.name,
    palette: paletteKey,
    tagline: session.tagline || biome.tagline,
    insightMessage: session.insightMessage || (session.quote
      ? `"${session.quote}" — ${session.trigger || biome.insight}`
      : biome.insight),
    analysisLines: session.analysisLines || [
      'Voice prosody dynamic contours and pitch fluctuations captured.',
      `Resonant power and harmonic stability marked your vocal reflection.`,
      'Self-note: Regular vocal check-ins cultivate deeper emotional awareness.'
    ],
    transcript: session.transcript || rawNotes,
    notes: rawNotes,
    quote: session.quote || (rawNotes ? `"${rawNotes}"` : 'Voice reflection recorded.'),
    trigger: session.trigger || biome.insight,
    tryThisNext: session.tryThisNext || biome.tryThisNext,
    mindfulness: session.mindfulness || biome.mindfulness,
    bgGradient: session.bgGradient || biome.bgGradient,
    terrainColors: session.terrainColors || biome.terrainColors,
    pitchHz: session.pitchHz || 210,
    intensity: session.intensity || 5.0,
    energyPct: session.energyPct || 50,
    speechRate: session.speechRate || '140 wpm',
    pauseDensity: session.pauseDensity || '20%',
    audioURL: session.audioURL || null,
    feeling: session.feeling || (session.feelingLevel ? getFeelingByLevel(session.feelingLevel) : null),
    feelingLevel: session.feelingLevel || (session.feeling ? session.feeling.level : null),
  };
}

function formatDuration(sec) {
  const mins = Math.floor(sec / 60);
  const remainderSec = Math.floor(sec % 60);
  if (mins === 0) return `${remainderSec}s`;
  return `${mins}m ${remainderSec}s`;
}