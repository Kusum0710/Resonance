import { useState, useRef, useEffect } from 'react';
import BreathingExercise from './BreathingExercise';
import { normalizeSessionDetails, FEELING_LEVELS, getFeelingByLevel } from '../utils/audioAnalyzer';
import './DayDetailModal.css';

export default function DayDetailModal({ session, onClose, onUpdateSession = () => { } }) {
  const normalized = normalizeSessionDetails(session);
  const initialNoteText = normalized?.notes || normalized?.transcript || (normalized?.quote ? normalized.quote.replace(/^"|"$/g, '') : '') || '';
  const initialFeelingObj = normalized?.feeling || getFeelingByLevel(normalized?.feelingLevel || 7);

  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNote, setEditedNote] = useState(initialNoteText);
  const [currentFeeling, setCurrentFeeling] = useState(initialFeelingObj);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioRef = useRef(null);

  // Background animated terrain ridges
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let time = 0;
    const colors = normalized?.terrainColors || ['rgba(247, 162, 139, 0.3)', 'rgba(232, 116, 90, 0.4)', '#b83218'];

    const render = () => {
      time += 0.015;
      const width = (canvas.width = canvas.clientWidth || 430);
      const height = (canvas.height = canvas.clientHeight || 800);

      ctx.clearRect(0, 0, width, height);

      const layers = [
        { color: colors[0] || 'rgba(111, 147, 209, 0.25)', base: 0.3, amp: 35, speed: 0.5 },
        { color: colors[1] || 'rgba(92, 127, 190, 0.4)', base: 0.45, amp: 45, speed: 0.8 },
        { color: colors[2] || '#5c7fbe', base: 0.6, amp: 55, speed: 1.1 },
      ];

      layers.forEach((l, idx) => {
        ctx.fillStyle = l.color;
        ctx.beginPath();
        ctx.moveTo(0, height);

        const steps = 24;
        const sliceWidth = width / steps;

        for (let i = 0; i <= steps; i++) {
          const x = i * sliceWidth;
          const noise = Math.sin(i * 0.4 + time * l.speed + idx) * Math.cos(i * 0.25 - time * 0.3);
          const y = height * l.base - noise * l.amp;
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
  }, [normalized]);

  if (!normalized) return null;

  const {
    id,
    biomeName,
    tagline,
    analysisLines = [],
    intensity,
    pitchHz,
    duration,
    dayOfWeek,
    dateFormatted,
    timestamp,
    energyPct,
    speechRate,
    pauseDensity,
    tryThisNext,
    audioURL,
  } = normalized;

  const currentNotes = editedNote || normalized.notes || normalized.transcript || normalized.quote || '';

  const handleSaveNote = () => {
    onUpdateSession(id, {
      notes: editedNote,
      transcript: editedNote,
      quote: editedNote ? `"${editedNote}"` : normalized.quote,
    });
    setIsEditingNote(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleToggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  return (
    <div
      className="notebook-detail-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="notebook-detail-overlay">
        <canvas ref={canvasRef} className="notebook-detail-canvas" />

        {/* Header Bar */}
        <header className="notebook-detail-header">
          <button type="button" className="notebook-back-btn" onClick={onClose} aria-label="Close notebook">
            ←
          </button>
          <div className="notebook-header-tag">
            <span>📖</span>
            <span>Logbook Journal</span>
          </div>
        </header>

        {/* Main Notebook Card */}
        <div className="notebook-book-card">
          {/* Date & Intensity Strip */}
          <div className="notebook-meta-strip">
            <div className="notebook-date-text">
              {dayOfWeek ? `${dayOfWeek}, ` : ''}{dateFormatted} {timestamp ? `· ${timestamp}` : ''}
            </div>
            {typeof intensity === 'number' && (
              <span className="notebook-intensity-chip">
                Intensity {intensity.toFixed(1)}/10
              </span>
            )}
          </div>

          {/* 1. Biome Message & Title */}
          <div className="notebook-biome-section">
            <span className="notebook-eyebrow-label">BIOME CLASSIFICATION</span>
            <h1 className="notebook-biome-title">{biomeName}</h1>
            <p className="notebook-tagline">{tagline}</p>
          </div>

          {/* 2. Self-Analysis Note (Acoustic Insight Bullet Points) */}
          {analysisLines && analysisLines.length > 0 && (
            <div className="notebook-analysis-box">
              <span className="notebook-analysis-header">SELF-ANALYSIS NOTE</span>
              <div className="notebook-analysis-list">
                {analysisLines.map((line, idx) => (
                  <div key={idx} className="notebook-analysis-item">
                    <span className="notebook-analysis-bullet">•</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Logged Feeling Bar (10 Levels with Dynamic Gradient) */}
          {currentFeeling && (
            <div className="notebook-feeling-box">
              <div className="notebook-feeling-header">
                <span className="notebook-feeling-eyebrow">LOGGED FEELING AT REFLECTION</span>
                <span
                  className="notebook-feeling-chip"
                  style={{ color: currentFeeling.color, backgroundColor: currentFeeling.bg }}
                >
                  <span className="notebook-feeling-emoji">{currentFeeling.emoji || '🌿'}</span>
                  <span className="notebook-feeling-text">
                    {currentFeeling.label} ({currentFeeling.level}/10)
                  </span>
                </span>
              </div>
              <div className="notebook-feeling-track-wrap">
                <span className="notebook-feeling-anchor notebook-feeling-anchor--left" title="Level 1: Gloomy">
                  ≡(▔﹏▔)≡
                </span>
                <div className="notebook-feeling-track" role="radiogroup" aria-label="Feeling score">
                  {FEELING_LEVELS.map((item) => {
                    const isSelected = item.level === currentFeeling.level;
                    return (
                      <button
                        key={item.level}
                        type="button"
                        className={`notebook-feeling-step ${isSelected ? 'notebook-feeling-step--active' : ''}`}
                        style={{
                          '--nb-color': item.color,
                          '--nb-glow': item.glow,
                        }}
                        onClick={() => {
                          setCurrentFeeling(item);
                          onUpdateSession(id, {
                            feeling: item,
                            feelingLevel: item.level,
                          });
                        }}
                        title={`Level ${item.level}: ${item.label} ${item.emoji}`}
                        aria-label={`Level ${item.level}: ${item.label}`}
                      >
                        <span className="notebook-feeling-fill" />
                      </button>
                    );
                  })}
                </div>
                <span className="notebook-feeling-anchor notebook-feeling-anchor--right" title="Level 10: Happy">
                  (❁´◡`❁)
                </span>
              </div>
            </div>
          )}

          {/* 4. Vocal Prosody Metrics Grid */}
          <div className="notebook-stats-grid">
            <div className="notebook-stat-pill">
              <span className="notebook-stat-label">Pitch</span>
              <span className="notebook-stat-val">{pitchHz || 210} Hz</span>
            </div>
            <div className="notebook-stat-pill">
              <span className="notebook-stat-label">Duration</span>
              <span className="notebook-stat-val">{duration || '25s'}</span>
            </div>
            {energyPct !== undefined && (
              <div className="notebook-stat-pill">
                <span className="notebook-stat-label">Energy</span>
                <span className="notebook-stat-val">{energyPct}%</span>
              </div>
            )}
            {speechRate && (
              <div className="notebook-stat-pill">
                <span className="notebook-stat-label">Rate</span>
                <span className="notebook-stat-val">{speechRate}</span>
              </div>
            )}
            {pauseDensity && (
              <div className="notebook-stat-pill">
                <span className="notebook-stat-label">Pauses</span>
                <span className="notebook-stat-val">{pauseDensity}</span>
              </div>
            )}
          </div>

          {/* 5. YOUR NOTES Section (Audio Transcription & Journal Reflection) */}
          <div className="notebook-notes-container">
            <div className="notebook-notes-header">
              <div className="notebook-notes-title-wrap">
                <span className="notebook-notes-icon">📝</span>
                <span className="notebook-notes-title">YOUR NOTES</span>
              </div>
              <button
                type="button"
                className="notebook-edit-toggle-btn"
                onClick={() => setIsEditingNote(!isEditingNote)}
              >
                {isEditingNote ? 'Cancel' : 'Edit note ✏️'}
              </button>
            </div>

            {/* Audio Player if recorded */}
            {audioURL && (
              <div className="notebook-audio-bar">
                <audio
                  ref={audioRef}
                  src={audioURL}
                  onEnded={() => setIsPlayingAudio(false)}
                />
                <button
                  type="button"
                  className="notebook-audio-play-btn"
                  onClick={handleToggleAudio}
                  aria-label={isPlayingAudio ? 'Pause recording' : 'Play recording'}
                >
                  {isPlayingAudio ? '⏸' : '▶'}
                </button>
                <span className="notebook-audio-label">Original Voice Recording</span>
              </div>
            )}

            {/* Lined Ruled Paper Content */}
            <div className="notebook-ruled-content">
              {isEditingNote ? (
                <div>
                  <textarea
                    className="notebook-note-textarea"
                    value={editedNote}
                    onChange={(e) => setEditedNote(e.target.value)}
                    placeholder="Type your notes or reflections here..."
                  />
                  <div className="notebook-edit-actions">
                    {showSavedToast && <span className="notebook-saved-toast">Saved to journal ✓</span>}
                    <button type="button" className="notebook-save-note-btn" onClick={handleSaveNote}>
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="notebook-note-paragraph">
                    {currentNotes || 'No spoken transcript logged for this session.'}
                  </p>
                  {showSavedToast && <span className="notebook-saved-toast">Updated in journal ✓</span>}
                </div>
              )}
            </div>
          </div>

          {/* 5. Recommended Next Action / Breathing */}
          {tryThisNext && (
            <button
              type="button"
              className="notebook-try-card"
              onClick={() => setIsBreathingOpen(true)}
            >
              <span className="notebook-try-eyebrow">RECOMMENDED MINDFULNESS &gt;</span>
              <h3 className="notebook-try-title">{tryThisNext.title}</h3>
              <p className="notebook-try-desc">{tryThisNext.description}</p>
            </button>
          )}

          {/* Footer Close */}
          <div className="notebook-footer-row">
            <button type="button" className="notebook-close-btn" onClick={onClose}>
              Done Reading
            </button>
          </div>
        </div>

        {/* Guided Breathing Overlay */}
        {isBreathingOpen && (
          <BreathingExercise
            initialTechniqueKey={tryThisNext?.techniqueKey || 'box-breathing'}
            onClose={() => setIsBreathingOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
