import { useState, useEffect } from 'react';
import TerrainPreview from './TerrainPreview';
import './ResultCardModal.css';

export default function ResultCardModal({ sessionResult, onSave = () => {}, onClose = () => {} }) {
  const [activeStep, setActiveStep] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);

  if (!sessionResult) return null;

  const {
    biomeName,
    palette,
    tag,
    dateFormatted,
    durationFormatted,
    insightMessage,
    mindfulness,
  } = sessionResult;

  // Rhythmic timer for breathing exercises
  useEffect(() => {
    if (!isBreathingActive || mindfulness.type !== 'breathing') return;

    const pattern = mindfulness.pattern || [4, 4, 4, 4];
    const duration = (pattern[breathPhase] || 4) * 1000;

    const timeout = setTimeout(() => {
      setBreathPhase((prev) => (prev + 1) % pattern.length);
    }, duration);

    return () => clearTimeout(timeout);
  }, [isBreathingActive, breathPhase, mindfulness]);

  return (
    <div className="result-card-overlay">
      <div className="result-card-container">
        <header className="result-header">
          <span className="result-eyebrow">Session Complete • {durationFormatted}</span>
          <button type="button" className="result-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        {/* Biome Landscape Preview Card */}
        <div className="result-biome-card">
          <TerrainPreview palette={palette} className="result-biome-art" />
          <div className="result-biome-content">
            <span className="result-tag" style={{ borderColor: mindfulness.color }}>
              {tag}
            </span>
            <h2 className="result-title">Today's Landscape: {biomeName}</h2>
            <p className="result-date">{dateFormatted}</p>
          </div>
        </div>

        {/* Contextual Emotional Insight Box */}
        <section className="insight-section">
          <div className="section-title-row">
            <span className="sparkle-icon">✨</span>
            <h3>Contextual Insight</h3>
          </div>
          <p className="insight-text">{insightMessage}</p>
        </section>

        {/* Mindfulness Technique Section */}
        <section className="mindfulness-section">
          <div className="section-title-row">
            <span className="leaf-icon">🧘</span>
            <h3>Recommended Mindfulness</h3>
          </div>

          <div className="mindfulness-card" style={{ borderLeftColor: mindfulness.color }}>
            <div className="mindfulness-header">
              <h4 className="mindfulness-name">{mindfulness.title}</h4>
              <p className="mindfulness-instruction">{mindfulness.instruction}</p>
            </div>

            {mindfulness.type === 'breathing' && (
              <div className="breathing-widget">
                <div
                  className={`breathing-circle ${isBreathingActive ? 'breathing-circle--active' : ''}`}
                  style={{
                    animationDuration: `${mindfulness.pattern[breathPhase] || 4}s`,
                    borderColor: mindfulness.color,
                  }}
                >
                  <span className="breathing-label">
                    {isBreathingActive
                      ? mindfulness.labels[breathPhase] || 'Breathe'
                      : 'Tap Start'}
                  </span>
                </div>

                <button
                  type="button"
                  className="breathing-toggle-btn"
                  onClick={() => {
                    setIsBreathingActive(!isBreathingActive);
                    setBreathPhase(0);
                  }}
                >
                  {isBreathingActive ? 'Pause Exercise' : 'Start Guided Breath'}
                </button>
              </div>
            )}

            {mindfulness.type === 'grounding' && (
              <ul className="grounding-list">
                {mindfulness.steps.map((step, idx) => (
                  <li
                    key={idx}
                    className={`grounding-item ${idx === activeStep ? 'grounding-item--active' : ''}`}
                    onClick={() => setActiveStep(idx)}
                  >
                    <span className="grounding-num">{idx + 1}</span>
                    <span className="grounding-text">{step}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <footer className="result-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Discard
          </button>
          <button type="button" className="btn-primary" onClick={onSave}>
            Save Reflection
          </button>
        </footer>
      </div>
    </div>
  );
}
