import { useState, useEffect, useRef } from 'react';
import { MINDFULNESS_TECHNIQUES } from '../utils/audioAnalyzer';
import './BreathingExercise.css';

// Natural mountain/valley landscape palettes per exercise
const EXERCISE_THEMES = {
  'deep-rest': {
    name: 'Twilight Rest',
    bg: ['#12101f', '#19152b', '#0a0912'],
    layers: ['rgba(138, 133, 200, 0.35)', 'rgba(105, 100, 168, 0.55)', 'rgba(75, 71, 133, 0.75)', '#363359'],
  },
  'box-breathing': {
    name: 'Ocean Calm',
    bg: ['#0e1724', '#15243a', '#080d16'],
    layers: ['rgba(111, 147, 209, 0.35)', 'rgba(85, 122, 186, 0.55)', 'rgba(57, 93, 153, 0.75)', '#2d4e87'],
  },
  'resonant-coherence': {
    name: 'Meadow Valley',
    bg: ['#0e1a13', '#16281d', '#08100c'],
    layers: ['rgba(135, 189, 143, 0.35)', 'rgba(102, 161, 111, 0.55)', 'rgba(71, 130, 80, 0.75)', '#3b784a'],
  },
  'physiological-sigh': {
    name: 'Warm Sunset',
    bg: ['#1f1210', '#301a17', '#120a09'],
    layers: ['rgba(217, 94, 56, 0.35)', 'rgba(189, 71, 36, 0.55)', 'rgba(153, 49, 18, 0.75)', '#8c2d11'],
  },
  'grounding-54321': {
    name: 'Forest Horizon',
    bg: ['#161911', '#23291c', '#0d100a'],
    layers: ['rgba(163, 201, 125, 0.35)', 'rgba(130, 171, 91, 0.55)', 'rgba(97, 135, 61, 0.75)', '#577d33'],
  },
};

// Rich, reassuring, anxiety-free 5-4-3-2-1 Sensory Grounding Questions
const GROUNDING_QUESTIONS = [
  {
    count: 5,
    icon: '👁️',
    title: '5 Things You Can See',
    prompt: 'Take your time. No rush at all...',
    detail: 'Look around your room gently. Find 5 objects right now — notice their shapes, colors, light reflections, or soft shadows.',
  },
  {
    count: 4,
    icon: '✋',
    title: '4 Things You Can Feel',
    prompt: 'Bring soft awareness to physical touch...',
    detail: 'Notice 4 soothing sensations — your feet grounded on the floor, soft fabric against skin, warmth in your hands, or cool air.',
  },
  {
    count: 3,
    icon: '👂',
    title: '3 Things You Can Hear',
    prompt: 'Pause and listen with calm curiosity...',
    detail: 'Identify 3 peaceful sounds — the gentle hum of the room, distant birds outside, wind rustling, or your own rhythm of breathing.',
  },
  {
    count: 2,
    icon: '👃',
    title: '2 Things You Can Smell',
    prompt: 'Breathe in slowly and softly...',
    detail: 'Notice 2 subtle scents around you — fresh morning air, coffee, clean paper, wood, clothing, or a soothing essential oil.',
  },
  {
    count: 1,
    icon: '👅',
    title: '1 Thing You Can Taste',
    prompt: 'Rest inward on your sense of taste...',
    detail: 'Notice 1 subtle taste in your mouth right now — a recent warm drink, fresh breath, or take a peaceful sip of water.',
  },
];

export default function BreathingExercise({ initialTechniqueKey = 'box-breathing', onClose = () => {} }) {
  const [selectedKey, setSelectedKey] = useState(initialTechniqueKey);
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);
  const [breathVolumePercent, setBreathVolumePercent] = useState(0);
  const [groundingStep, setGroundingStep] = useState(0);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const phaseStartTimeRef = useRef(0);
  const currentPhaseIndexRef = useRef(0);
  const isActiveRef = useRef(false);

  const currentTechnique = MINDFULNESS_TECHNIQUES[selectedKey] || MINDFULNESS_TECHNIQUES['box-breathing'];

  // Synchronize state refs for 60fps engine
  useEffect(() => {
    isActiveRef.current = isActive;
    currentPhaseIndexRef.current = phaseIndex;
  }, [isActive, phaseIndex]);

  // Master 60fps Animation & Phase Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let time = 0;
    phaseStartTimeRef.current = performance.now();

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 2 + 1,
      speed: Math.random() * 0.0006 + 0.0002,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const render = () => {
      time += 0.016;
      const now = performance.now();
      const width = (canvas.width = canvas.clientWidth || 430);
      const height = (canvas.height = canvas.clientHeight || 800);

      const active = isActiveRef.current;
      const pIdx = currentPhaseIndexRef.current;
      const tKey = selectedKey;
      const tech = MINDFULNESS_TECHNIQUES[tKey] || MINDFULNESS_TECHNIQUES['box-breathing'];
      const theme = EXERCISE_THEMES[tKey] || EXERCISE_THEMES['box-breathing'];
      const pattern = tech.pattern || [4, 4, 4, 4];
      const currentPhaseDurationSec = pattern[pIdx] || 4;

      let currentHeightFactor = 0.0;

      if (active && tech.type === 'breathing') {
        const elapsedSec = (now - phaseStartTimeRef.current) / 1000;
        const progressFraction = Math.max(0, Math.min(1, elapsedSec / currentPhaseDurationSec));

        // Sub-second countdown integer display
        const secondsRemaining = Math.max(1, Math.ceil(currentPhaseDurationSec - elapsedSec));
        setPhaseSecondsLeft(secondsRemaining);

        // Phase Advance State Machine: Advance phase strictly when duration completes
        if (elapsedSec >= currentPhaseDurationSec) {
          const nextIdx = (pIdx + 1) % pattern.length;
          currentPhaseIndexRef.current = nextIdx;
          phaseStartTimeRef.current = now;
          setPhaseIndex(nextIdx);
        }

        // STRICT SEQUENCE ANIMATION ENGINE:
        if (tKey === 'physiological-sigh') {
          // Sequence: Phase 0: First Inhale (2s) -> Phase 1: Extra Inhale (1.5s) -> Phase 2: Hold (2s) -> Phase 3: Exhale (5s)
          if (pIdx === 0) {
            // First Inhale: Swells 0.00 -> 0.60 (Starts at 0!)
            currentHeightFactor = progressFraction * 0.60;
          } else if (pIdx === 1) {
            // Extra Inhale: Swells 0.60 -> 1.00
            currentHeightFactor = 0.60 + progressFraction * 0.40;
          } else if (pIdx === 2) {
            // Hold: Locks at 1.00 Peak
            currentHeightFactor = 1.00;
          } else {
            // Exhale: Recedes 1.00 -> 0.00 (Ends at 0!)
            currentHeightFactor = 1.00 - progressFraction;
          }
        } else if (tKey === 'box-breathing') {
          // Sequence: Phase 0: Inhale (4s) -> Phase 1: Hold (4s) -> Phase 2: Exhale (4s) -> Phase 3: Hold (4s)
          if (pIdx === 0) {
            // Inhale: Swells 0.00 -> 1.00 (Starts at 0!)
            currentHeightFactor = progressFraction;
          } else if (pIdx === 1) {
            // Hold Peak: Locks at 1.00 Peak
            currentHeightFactor = 1.00;
          } else if (pIdx === 2) {
            // Exhale: Recedes 1.00 -> 0.00
            currentHeightFactor = 1.00 - progressFraction;
          } else {
            // Hold Empty: Locks at 0.00 Base (Ends at 0!)
            currentHeightFactor = 0.00;
          }
        } else {
          // Standard Sequence (e.g. 4-7-8 Deep Rest or Resonant):
          // Phase 0: Inhale -> Swells 0.00 -> 1.00 (Starts at 0!)
          // Phase 1: Hold   -> Locks at 1.00 Peak for full Hold duration
          // Phase 2: Exhale -> Recedes 1.00 -> 0.00 (Ends at 0!)
          if (pIdx === 0) {
            currentHeightFactor = progressFraction;
          } else if (pIdx === 1) {
            currentHeightFactor = 1.00;
          } else {
            currentHeightFactor = 1.00 - progressFraction;
          }
        }
      } else {
        currentHeightFactor = Math.sin(time * 1.2) * 0.04;
      }

      // Update Breath Volume Percent for Progress Arc (Starts at 0%, ends at 0%)
      const volumePct = active ? Math.max(0, Math.min(100, Math.round(currentHeightFactor * 100))) : 0;
      setBreathVolumePercent(volumePct);

      // Background Sky Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, theme.bg[0]);
      bgGrad.addColorStop(0.5, theme.bg[1]);
      bgGrad.addColorStop(1, theme.bg[2]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Soft Floating Starlight Particles
      particles.forEach((p) => {
        p.y -= p.speed * (active ? 1.3 : 1.0);
        if (p.y < 0) p.y = 1;

        const px = p.x * width + Math.sin(time + p.y * 6) * 10;
        const py = p.y * height;

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * (0.6 + currentHeightFactor * 0.4)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4 Layered Terrain Mountain Ridges
      const layers = theme.layers;
      const startBases = [0.55, 0.64, 0.73, 0.82];
      const heightLift = currentHeightFactor * 0.52;

      layers.forEach((layerColor, idx) => {
        ctx.fillStyle = layerColor;
        ctx.beginPath();
        ctx.moveTo(0, height);

        const steps = 36;
        const sliceWidth = width / steps;
        const baseH = startBases[idx] - heightLift;

        for (let i = 0; i <= steps; i++) {
          const x = i * sliceWidth;
          const noise =
            Math.sin(i * 0.26 + time * (0.4 + idx * 0.15) + idx) *
            Math.cos(i * 0.18 - time * 0.25);

          const amplitude = (40 + idx * 16) * (0.8 + currentHeightFactor * 0.7);
          const y = height * baseH - noise * amplitude;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedKey]);

  const toggleExercise = () => {
    if (!isActive) {
      if (currentTechnique.type === 'breathing') {
        setPhaseIndex(0);
        currentPhaseIndexRef.current = 0;
        phaseStartTimeRef.current = performance.now();
      } else {
        setGroundingStep(0);
      }
    }
    setIsActive(!isActive);
  };

  const handleNextGroundingStep = () => {
    if (groundingStep < GROUNDING_QUESTIONS.length - 1) {
      setGroundingStep((prev) => prev + 1);
    } else {
      setGroundingStep(0);
      setIsActive(false);
    }
  };

  const currentGroundingQ = GROUNDING_QUESTIONS[groundingStep] || GROUNDING_QUESTIONS[0];
  const totalPhases = (currentTechnique.labels || []).length;

  return (
    <div className="fullscreen-breathing-screen">
      {/* Dynamic Background Canvas */}
      <canvas ref={canvasRef} className="fullscreen-breathing-canvas" />

      {/* Top Header */}
      <header className="fullscreen-breathing-header">
        <button type="button" className="fullscreen-back-btn" onClick={onClose} aria-label="Go back">
          ←
        </button>
        <h2 className="fullscreen-header-title">
          {currentTechnique.type === 'grounding' ? '5-4-3-2-1 Grounding' : 'Guided Breathing'}
        </h2>
        <div className="header-spacer" />
      </header>

      {/* Technique Selector Tabs */}
      <div className="fullscreen-technique-tabs">
        {Object.values(MINDFULNESS_TECHNIQUES).map((tech) => (
          <button
            key={tech.id}
            type="button"
            className={`fullscreen-tab-btn ${selectedKey === tech.id ? 'fullscreen-tab-btn--active' : ''}`}
            onClick={() => {
              setSelectedKey(tech.id);
              setIsActive(false);
              setPhaseIndex(0);
              currentPhaseIndexRef.current = 0;
              setGroundingStep(0);
            }}
          >
            <span className="tab-icon">{tech.icon}</span>
            <span className="tab-label">{tech.title.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Center Stage: Sequential Instruction-Driven Breathing Arc */}
      <main className="fullscreen-breathing-center">
        {currentTechnique.type === 'breathing' && (
          <div className="floating-breath-stage">
            {/* Step Order Pill */}
            {isActive && (
              <div className="step-order-badge">
                Phase {phaseIndex + 1} of {totalPhases}
              </div>
            )}

            {/* Living Breath Progress Arc Ring (Starts at 0%, ends at 0%) */}
            <div className="living-breath-ring-wrap">
              <svg className="living-breath-svg" viewBox="0 0 160 160">
                <circle className="breath-track" cx="80" cy="80" r="70" />
                <circle
                  className="breath-progress"
                  cx="80"
                  cy="80"
                  r="70"
                  style={{
                    strokeDashoffset: 440 - (440 * breathVolumePercent) / 100,
                    stroke: currentTechnique.color || '#6f93d1',
                  }}
                />
              </svg>

              <div className="living-breath-ring-content">
                {isActive ? (
                  <>
                    <span className="floating-countdown-number">{phaseSecondsLeft}s</span>
                    <span className="floating-phase-label">
                      {currentTechnique.labels[phaseIndex] || 'Breathe'}
                    </span>
                  </>
                ) : (
                  <span className="floating-phase-label">Tap Start</span>
                )}
              </div>
            </div>

            {!isActive && (
              <p className="floating-subtext">Follow card instructions in exact sequence</p>
            )}
          </div>
        )}

        {/* 5-4-3-2-1 Reassuring Natural Sensory Card */}
        {currentTechnique.type === 'grounding' && (
          <div className="grounding-interactive-stage">
            {!isActive ? (
              /* Pre-Start Welcome Screen */
              <div className="grounding-start-view">
                <div className="grounding-badge-icon">🌿</div>
                <h3 className="grounding-welcome-title">5-4-3-2-1 Sensory Grounding</h3>
                <p className="grounding-welcome-desc">
                  Gently anchor your mind in peace by connecting with your 5 natural senses.
                </p>
              </div>
            ) : (
              /* Active Step Question: Reassuring Natural White-Ivory Card */
              <div key={groundingStep} className="grounding-nature-card">
                {/* Header Badge */}
                <div className="nature-card-top">
                  <div className="nature-icon-halo">
                    <span className="nature-emoji">{currentGroundingQ.icon}</span>
                  </div>
                  <div className="nature-step-pill">
                    Step {groundingStep + 1} of 5
                  </div>
                </div>

                {/* Content */}
                <div className="nature-card-body">
                  <h3 className="nature-card-title">{currentGroundingQ.title}</h3>
                  <p className="nature-card-prompt">{currentGroundingQ.prompt}</p>
                  <p className="nature-card-detail">{currentGroundingQ.detail}</p>
                </div>

                {/* 5 Step Progress Dots */}
                <div className="nature-progress-dots">
                  {GROUNDING_QUESTIONS.map((_, i) => (
                    <span
                      key={i}
                      className={`nature-dot ${i <= groundingStep ? 'nature-dot--active' : ''}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Control Section */}
      <footer className="fullscreen-breathing-footer">
        <div className="fullscreen-info-card">
          <div className="info-card-header">
            <span className="info-icon">{currentTechnique.icon}</span>
            <div>
              <h3 className="info-title">{currentTechnique.title}</h3>
              <p className="info-subtitle">{currentTechnique.subtitle}</p>
            </div>
          </div>
          <p className="info-instruction">
            {currentTechnique.type === 'grounding' && isActive
              ? `Focus gently on ${currentGroundingQ.title}. Take all the time you need.`
              : currentTechnique.instruction}
          </p>
        </div>

        {currentTechnique.type === 'breathing' && (
          <button
            type="button"
            className={`fullscreen-start-btn ${isActive ? 'fullscreen-start-btn--active' : ''}`}
            onClick={toggleExercise}
          >
            {isActive ? 'Pause Exercise' : 'Start Breathe'}
          </button>
        )}

        {currentTechnique.type === 'grounding' && (
          <>
            {!isActive ? (
              <button
                type="button"
                className="fullscreen-start-btn"
                onClick={toggleExercise}
              >
                Start Grounding
              </button>
            ) : (
              <button
                type="button"
                className="fullscreen-start-btn"
                onClick={handleNextGroundingStep}
              >
                {groundingStep < GROUNDING_QUESTIONS.length - 1
                  ? `Next Step (${groundingStep + 2}/5)`
                  : 'Complete Exercise ✨'}
              </button>
            )}
          </>
        )}
      </footer>
    </div>
  );
}
