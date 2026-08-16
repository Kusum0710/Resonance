import { useState, useEffect } from 'react';
import { MINDFULNESS_TECHNIQUES } from '../utils/audioAnalyzer';
import './BreathingExercise.css';

export default function BreathingExercise({ initialTechniqueKey = 'box-breathing', onClose = () => {} }) {
  const [selectedKey, setSelectedKey] = useState(initialTechniqueKey);
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [groundingStep, setGroundingStep] = useState(0);

  const currentTechnique = MINDFULNESS_TECHNIQUES[selectedKey] || MINDFULNESS_TECHNIQUES['box-breathing'];

  // Timer loop for breathing patterns
  useEffect(() => {
    if (!isActive || currentTechnique.type !== 'breathing') return;

    const pattern = currentTechnique.pattern || [4, 4, 4, 4];
    const durationMs = (pattern[phaseIndex] || 4) * 1000;

    const timer = setTimeout(() => {
      setPhaseIndex((prev) => (prev + 1) % pattern.length);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [isActive, phaseIndex, currentTechnique]);

  const toggleExercise = () => {
    setIsActive(!isActive);
    setPhaseIndex(0);
  };

  return (
    <div className="breathing-modal-overlay">
      <div className="breathing-modal-container">
        <header className="breathing-modal-header">
          <button type="button" className="breathing-close-btn" onClick={onClose} aria-label="Close">
            ←
          </button>
          <h2 className="breathing-modal-title">Mindfulness Exercises</h2>
        </header>

        {/* Technique Selector Tabs */}
        <div className="technique-tabs">
          {Object.values(MINDFULNESS_TECHNIQUES).map((tech) => (
            <button
              key={tech.id}
              type="button"
              className={`technique-tab-btn ${selectedKey === tech.id ? 'technique-tab-btn--active' : ''}`}
              onClick={() => {
                setSelectedKey(tech.id);
                setIsActive(false);
                setPhaseIndex(0);
                setGroundingStep(0);
              }}
            >
              <span className="tech-icon">{tech.icon}</span>
              <span className="tech-name">{tech.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Active Technique Display Card */}
        <div className="technique-card" style={{ borderTopColor: currentTechnique.color }}>
          <div className="technique-meta">
            <span className="technique-icon-lg">{currentTechnique.icon}</span>
            <div>
              <h3 className="technique-title">{currentTechnique.title}</h3>
              <p className="technique-subtitle">{currentTechnique.subtitle}</p>
            </div>
          </div>

          <p className="technique-instruction">{currentTechnique.instruction}</p>

          {/* Interactive Breathing Ring */}
          {currentTechnique.type === 'breathing' && (
            <div className="breathing-interactive-area">
              <div
                className={`breathing-ring-orb ${isActive ? 'breathing-ring-orb--active' : ''}`}
                style={{
                  animationDuration: `${currentTechnique.pattern[phaseIndex] || 4}s`,
                  borderColor: currentTechnique.color,
                }}
              >
                <span className="breathing-phase-text">
                  {isActive
                    ? currentTechnique.labels[phaseIndex] || 'Breathe'
                    : 'Breathe'}
                </span>
              </div>

              <button
                type="button"
                className={`breathing-action-btn ${isActive ? 'breathing-action-btn--active' : ''}`}
                onClick={toggleExercise}
              >
                {isActive ? 'Pause Exercise' : 'Start Breathe'}
              </button>
            </div>
          )}

          {/* Grounding Interactive List */}
          {currentTechnique.type === 'grounding' && (
            <div className="grounding-interactive-area">
              <div className="grounding-step-list">
                {currentTechnique.steps.map((stepText, idx) => (
                  <div
                    key={idx}
                    className={`grounding-step-item ${idx === groundingStep ? 'grounding-step-item--active' : ''}`}
                    onClick={() => setGroundingStep(idx)}
                  >
                    <span className="grounding-step-badge">{idx + 1}</span>
                    <span className="grounding-step-desc">{stepText}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="grounding-next-btn"
                onClick={() => setGroundingStep((prev) => (prev + 1) % currentTechnique.steps.length)}
              >
                Next Grounding Step ({groundingStep + 1}/5)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
