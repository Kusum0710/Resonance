import { useEffect, useRef } from 'react';
import './ResultCardModal.css';

export default function ResultCardModal({ sessionResult, onSave = () => { }, onClose = () => { } }) {
  const bgCanvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const terrainColors = sessionResult?.terrainColors;

  // Render rich animated background terrain atmosphere
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let time = 0;
    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.6,
      r: Math.random() * 2 + 1,
      speed: Math.random() * 0.0008 + 0.0004,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    const render = () => {
      time += 0.015;
      const width = (canvas.width = canvas.clientWidth || 430);
      const height = (canvas.height = canvas.clientHeight || 800);

      // Rich ambient gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#fdf4ef');
      bgGrad.addColorStop(0.4, '#f8ded3');
      bgGrad.addColorStop(1, '#ecc3b2');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Soft ambient glowing orb
      const orbX = width * 0.5;
      const orbY = height * 0.22;
      const sunGrad = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, 120);
      sunGrad.addColorStop(0, 'rgba(255, 220, 200, 0.8)');
      sunGrad.addColorStop(0.5, 'rgba(247, 162, 139, 0.35)');
      sunGrad.addColorStop(1, 'rgba(247, 162, 139, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 120, 0, Math.PI * 2);
      ctx.fill();

      // Floating ambient particles
      particles.forEach((p) => {
        p.y -= p.speed;
        if (p.y < 0) p.y = 0.6;
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Layered procedural mountain & valley ridges
      const colors = terrainColors || ['rgba(247, 162, 139, 0.45)', 'rgba(232, 116, 90, 0.65)', 'rgba(217, 75, 48, 0.8)', '#b83218'];
      const layers = [
        { color: colors[0] || 'rgba(247, 162, 139, 0.45)', base: 0.32, amp: 40, speed: 0.5 },
        { color: colors[1] || 'rgba(232, 116, 90, 0.65)', base: 0.42, amp: 50, speed: 0.8 },
        { color: colors[2] || 'rgba(217, 75, 48, 0.8)', base: 0.52, amp: 60, speed: 1.1 },
        { color: colors[3] || '#b83218', base: 0.62, amp: 70, speed: 1.4 },
      ];

      layers.forEach((l, idx) => {
        ctx.fillStyle = l.color;
        ctx.beginPath();
        ctx.moveTo(0, height);

        const steps = 30;
        const sliceWidth = width / steps;

        for (let i = 0; i <= steps; i++) {
          const x = i * sliceWidth;
          const noise =
            Math.sin(i * 0.35 + time * l.speed + idx) *
            Math.cos(i * 0.2 - time * 0.3);
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
  }, [sessionResult, terrainColors]);

  if (!sessionResult) return null;

  const {
    biomeName,
    tagline,
    insightMessage,
    tryThisNext,
    analysisLines = [],
    intensity,
    pitchHz,
  } = sessionResult;

  return (
    <div className="screenshot-result-overlay">
      {/* Background Volcanic/Terrain Canvas */}
      <canvas ref={bgCanvasRef} className="screenshot-bg-canvas" />

      {/* Top back navigation */}
      <header className="screenshot-result-header">
        <button type="button" className="screenshot-back-btn" onClick={onClose} aria-label="Go back">
          ←
        </button>
      </header>

      {/* Main White Card Modal matching Screenshot 2 (No 51/100 score badge) */}
      <div className="screenshot-result-card">
        {/* Header row: Eyebrow only */}
        <div className="screenshot-card-header">
          <span className="screenshot-eyebrow">TODAY'S BIOME</span>
          {typeof intensity === 'number' && (
            <span className="screenshot-intensity">
              Intensity: {intensity.toFixed(1)}/10
            </span>
          )}
        </div>

        {/* Biome Title & Tagline */}
        <h1 className="screenshot-biome-title">{biomeName}</h1>
        <p className="screenshot-tagline">{tagline}</p>

        {/* 2-3 Line Self-Analysis Note */}
        {analysisLines && analysisLines.length > 0 ? (
          <div className="screenshot-self-analysis-box">
            <span className="screenshot-analysis-eyebrow">SELF-ANALYSIS NOTE</span>
            <div className="screenshot-analysis-lines">
              {analysisLines.map((line, idx) => (
                <p key={idx} className="screenshot-analysis-line">
                  <span className="line-dot">•</span> {line}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <p className="screenshot-insight-body">{insightMessage}</p>
        )}

        {/* Vocal Prosody Quick Stats */}
        <div className="screenshot-prosody-stats-row">
          <span className="result-stat-pill">Pitch: {pitchHz || 210} Hz</span>
          <span className="result-stat-pill">Duration: {sessionResult.duration || '20s'}</span>
        </div>

        {/* Inner Box: TRY THIS NEXT */}
        {tryThisNext && (
          <div className="try-this-next-box">
            <span className="try-this-eyebrow">TRY THIS NEXT</span>
            <h3 className="try-this-title">{tryThisNext.title}</h3>
            <p className="try-this-desc">{tryThisNext.description}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="screenshot-card-actions">
          <button type="button" className="screenshot-btn-secondary" onClick={onClose}>
            Discard
          </button>
          <button type="button" className="screenshot-btn-primary" onClick={onSave}>
            Save Reflection
          </button>
        </div>
      </div>
    </div>
  );
}
