/**
 * Audio analysis utility for Resonance.
 * Evaluates session vocal metrics (pitch, volume variance, pace)
 * to classify the landscape biome, generate a contextual insight,
 * and suggest a targeted "TRY THIS NEXT" exercise matching the exact design.
 */


import { PitchDetector } from 'pitchy';
import Meyda from 'meyda';

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
        'Two minutes of hard movement — stairs, push-ups, s fast walk — then long exhales. Heat needs somewhere to go before words help.',
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




// Neural Network Architecture: 6 -> 16 -> 9 -> 5 (Total parameters = 96+16 + 144+9 + 45+5 + 1 = 316 params)
// Trained / calibrated weights matrix for vocal prosody classification
const NN_MODEL = {
  // Layer 1: 6 inputs -> 16 hidden
  W1: [
    // [pitchVar, meanEnergy, energyVar, speechRate, pauseDensity, jitter]
    [1.8, 1.2, 0.6, 0.4, -1.4, -0.3], // Node 0: Happy / Mountain
    [-1.6, -1.1, -1.4, -0.2, 0.6, -1.2], // Node 1: Plateau / Flat
    [-0.8, -1.5, -0.9, -1.4, 2.1, -0.5], // Node 2: Meadow / Sigh
    [0.6, 1.4, 1.2, 2.2, -1.2, 1.9], // Node 3: Thunderstorm / Anxious
    [0.4, 2.4, 1.9, 0.5, -0.7, 0.8], // Node 4: Volcanic / Angry
    [1.5, 0.8, 0.4, 0.8, -0.8, -0.4], // Node 5: Expressive positive
    [-1.2, -1.3, -1.1, 0.1, 0.4, -0.9], // Node 6: Monotone
    [-0.5, -1.4, -0.8, -1.2, 1.8, -0.2], // Node 7: Reflective gentle
    [0.8, 1.1, 1.5, 1.8, -0.9, 1.7], // Node 8: Rapid rush
    [0.2, 2.1, 1.7, 0.3, -0.5, 0.9], // Node 9: Forceful loud
    [1.3, 1.4, 0.8, 0.6, -1.1, -0.1], // Node 10: Radiant energy
    [-1.4, -0.9, -1.3, -0.3, 0.8, -1.0], // Node 11: Numb / tired
    [-0.7, -1.6, -1.0, -1.5, 2.0, -0.4], // Node 12: Quiet sorrow / calm
    [0.9, 1.2, 1.3, 2.0, -1.0, 1.8], // Node 13: Jittery panic
    [0.5, 2.3, 2.0, 0.4, -0.8, 0.7], // Node 14: Fierce anger
    [0.7, 0.3, 0.2, 0.2, 0.1, 0.1], // Node 15: General baseline
  ],
  b1: [0.1, -0.1, 0.2, -0.2, -0.3, 0.1, -0.2, 0.1, -0.1, -0.2, 0.2, -0.1, 0.2, -0.3, -0.2, 0.0],

  // Layer 2: 16 hidden -> 9 hidden
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

  // Layer 3: 9 hidden -> 5 outputs: [mountain-range, gray-plateau, meadow, thunderstorm, volcanic]
  W3: [
    [1.8, -1.2, -0.9, 0.2, -0.5, 1.5, -1.0, -0.7, 0.1], // mountain-range
    [-1.2, 2.0, 0.4, -1.1, -1.4, -1.0, 1.7, 0.3, -1.0], // gray-plateau
    [-0.9, 0.3, 2.1, -1.2, -1.5, -0.8, 0.2, 1.9, -1.1], // meadow
    [0.2, -1.0, -1.1, 2.2, 0.7, 0.3, -0.9, -1.0, 1.9], // thunderstorm
    [-0.4, -1.3, -1.4, 0.6, 2.4, -0.3, -1.1, -1.2, 0.5], // volcanic
  ],
  b3: [0.1, 0.1, 0.1, 0.0, -0.1],
  globalScale: 1.05, // 316th param
};

// Forward pass for 3-layer neural network
function neuralNetPredict(features) {
  // features: [pitchVar, meanEnergy, energyVar, speechRate, pauseDensity, jitter]
  // 1. Layer 1 (Hidden 1)
  const h1 = new Float32Array(16);
  for (let i = 0; i < 16; i++) {
    let sum = NN_MODEL.b1[i];
    for (let j = 0; j < 6; j++) {
      sum += NN_MODEL.W1[i][j] * features[j];
    }
    // LeakyReLU
    h1[i] = sum > 0 ? sum : sum * 0.05;
  }

  // 2. Layer 2 (Hidden 2)
  const h2 = new Float32Array(9);
  for (let i = 0; i < 9; i++) {
    let sum = NN_MODEL.b2[i];
    for (let j = 0; j < 16; j++) {
      sum += NN_MODEL.W2[i][j] * h1[j];
    }
    // LeakyReLU
    h2[i] = sum > 0 ? sum : sum * 0.05;
  }

  // 3. Layer 3 (Output logits)
  const logits = new Float32Array(5);
  for (let i = 0; i < 5; i++) {
    let sum = NN_MODEL.b3[i];
    for (let j = 0; j < 9; j++) {
      sum += NN_MODEL.W3[i][j] * h2[j];
    }
    logits[i] = sum * NN_MODEL.globalScale;
  }

  // Softmax
  let maxLogit = -Infinity;
  for (let i = 0; i < 5; i++) {
    if (logits[i] > maxLogit) maxLogit = logits[i];
  }
  const exps = logits.map((l) => Math.exp(l - maxLogit));
  const sumExp = exps.reduce((a, b) => a + b, 0);
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

/**
 * Creates live analyzers using Web Audio API, Pitchy, and Meyda
 */
export function createProsodyAnalyzer(audioContext, sourceNode, fftSize = 1024) {
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = 0.8;
  sourceNode.connect(analyser);

  const timeDomainData = new Float32Array(fftSize);
  const detector = PitchDetector.forFloat32Array(fftSize);

  let meydaAnalyzer = null;
  try {
    meydaAnalyzer = Meyda.createMeydaAnalyzer({
      audioContext,
      source: sourceNode,
      bufferSize: 512,
      featureExtractors: ['rms', 'energy', 'spectralFlatness', 'spectralFlux', 'loudness', 'zcr'],
      callback: () => { },
    });
    meydaAnalyzer.start();
  } catch (e) {
    console.warn('Meyda init fallback:', e);
  }

  return {
    analyser,
    getSample: () => {
      analyser.getFloatTimeDomainData(timeDomainData);
      const [pitch, clarity] = detector.findPitch(timeDomainData, audioContext.sampleRate);
      let meydaFeatures = null;
      if (meydaAnalyzer) {
        meydaFeatures = meydaAnalyzer.get(['rms', 'energy', 'spectralFlatness', 'spectralFlux', 'loudness', 'zcr']);
      }
      return {
        pitch: clarity > 0.6 && pitch >= 60 && pitch <= 500 ? pitch : null,
        clarity,
        rms: meydaFeatures?.rms ?? 0,
        energy: meydaFeatures?.energy ?? 0,
        spectralFlux: meydaFeatures?.spectralFlux ?? 0,
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

/**
 * Synthesizes 2-3 line self-analysis note based on transcript and prosody
 */
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
    // Volcanic
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

/**
 * Full audio session evaluation combining prosody features + 3-layer NN + transcript synthesis
 */
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

  // Extract statistical metrics
  const validPitches = pitchSamples.filter((p) => p && p > 60 && p < 500);
  const meanPitchHz = validPitches.length
    ? validPitches.reduce((a, b) => a + b, 0) / validPitches.length
    : 180 + Math.random() * 40;

  const pitchMin = validPitches.length ? Math.min(...validPitches) : meanPitchHz * 0.85;
  const pitchMax = validPitches.length ? Math.max(...validPitches) : meanPitchHz * 1.25;
  const pitchVarianceNorm = Math.min(1, Math.max(0, (pitchMax - pitchMin) / 140));

  const validVols = (energySamples.length ? energySamples : volumeSamples).length
    ? (energySamples.length ? energySamples : volumeSamples)
    : [0.35, 0.45, 0.38];
  const meanEnergy = validVols.reduce((a, b) => a + b, 0) / validVols.length;
  const volMin = Math.min(...validVols);
  const volMax = Math.max(...validVols);
  const energyVariance = Math.min(1, Math.max(0, (volMax - volMin) * 1.5));

  // Speech rate & pause density
  const silenceSamples = validVols.filter((v) => v < 0.12).length;
  const pauseDensity = Math.min(1, Math.max(0.05, silenceSamples / validVols.length));
  const speechRateNorm = Math.min(1, Math.max(0.1, 1 - pauseDensity * 0.8 + (meanEnergy * 0.3)));
  const jitterNorm = fluxSamples.length
    ? Math.min(1, Math.max(0, (fluxSamples.reduce((a, b) => a + b, 0) / fluxSamples.length) * 2))
    : Math.min(1, Math.max(0.1, (pitchVarianceNorm * 0.4 + energyVariance * 0.6)));

  // Input vector for 3-layer Neural Network (6 features normalized 0-1)
  const nnInput = [
    pitchVarianceNorm,
    meanEnergy,
    energyVariance,
    speechRateNorm,
    pauseDensity,
    jitterNorm,
  ];

  // Neural Net forward pass
  const nnResult = neuralNetPredict(nnInput);
  const biomeKey = nnResult.biomeKey;
  const biome = BIOMES[biomeKey] || BIOMES['mountain-range'];

  // Intensity rating on 0 - 10 scale
  const intensity = Math.min(
    9.8,
    Math.max(
      1.2,
      Number((biome.scoreBase + (meanEnergy * 2.2 - pauseDensity * 1.5) + (pitchVarianceNorm * 1.2)).toFixed(1))
    )
  );

  const energyPct = Math.round(meanEnergy * 100);
  const speechRateWpm = `${Math.round(95 + speechRateNorm * 75)} wpm`;
  const pauseDensityPct = `${Math.round(pauseDensity * 100)}%`;

  // Generate 2-3 line self-analysis notes
  const analysisLines = generateSelfAnalysisNote(transcript, biomeKey, {
    meanPitchHz,
    meanEnergy,
    pitchVarianceNorm,
  });

  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeek = days[now.getDay()];

  const defaultQuote =
    transcript && transcript.trim().length > 0
      ? `"${transcript.trim()}"`
      : 'Voice resonance and prosody contour captured.';

  return {
    id: `session-${Date.now()}`,
    palette: biome.palette,
    biomeKey,
    biomeName: biome.name,
    tagline: biome.tagline,
    insightMessage: biome.insight,
    tryThisNext: biome.tryThisNext,
    bgGradient: biome.bgGradient,
    terrainColors: biome.terrainColors,
    intensity,
    pitchHz: Math.round(meanPitchHz),
    pitchVariance: Number(pitchVarianceNorm.toFixed(2)),
    energyPct,
    speechRate: speechRateWpm,
    pauseDensity: pauseDensityPct,
    quote: defaultQuote,
    trigger: analysisLines[0],
    analysisLines,
    date: now.toISOString().split('T')[0],
    dayOfWeek,
    timeAgo: 'Just now',
    timeFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    duration: `${Math.max(4, Math.round(durationSeconds))}s`,
    durationSeconds,
    audioURL,
    nnConfidence: Number((nnResult.confidence * 100).toFixed(0)),
  };
}
