import { useState, useRef, useEffect } from 'react';
import { getBiome } from '../lib/biomes';
import './TerrainShiftWave.css';

export default function TerrainShiftWave({ sessions = [], onSelectSession = () => { } }) {
    const weekSessions = sessions.slice(0, 7).reverse();
    const [selectedIdx, setSelectedIdx] = useState(weekSessions.length - 1);
    const canvasRef = useRef(null);
    const animRef = useRef(null);

    const activeSession = weekSessions[selectedIdx] || weekSessions[weekSessions.length - 1];
    const biome = activeSession ? getBiome(activeSession.palette) : null;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !activeSession) return;
        const ctx = canvas.getContext('2d');
        let t = 0;

        const render = () => {
            t += 0.02;
            const w = (canvas.width = canvas.clientWidth || 360);
            const h = (canvas.height = canvas.clientHeight || 90);

            ctx.clearRect(0, 0, w, h);

            // Soft sky background
            const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
            const skyColors = biome?.sky || ['#fbdcd2', '#f7c3b6'];
            skyGrad.addColorStop(0, skyColors[0]);
            skyGrad.addColorStop(1, skyColors[1]);
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, w, h);

            // Layered shifting terrain ridges
            const layers = biome?.layers || ['#e8a091', '#dd7f72', '#c85f55', '#a8443d'];
            const intensity = typeof activeSession.intensity === 'number' ? activeSession.intensity : 6;
            const heightFactor = 0.3 + (intensity / 10) * 0.45;

            layers.forEach((color, idx) => {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(0, h);

                const steps = 36;
                const slice = w / steps;

                for (let i = 0; i <= steps; i++) {
                    const x = i * slice;
                    const wave =
                        Math.sin(i * 0.28 + t * (0.4 + idx * 0.2) + idx * 1.5) *
                        Math.cos(i * 0.15 - t * 0.3);

                    const layerAmp = (idx + 1) * 8 * (intensity / 7);
                    const baseY = h * (0.35 + idx * 0.15) * heightFactor;
                    const y = baseY - wave * layerAmp;

                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                ctx.lineTo(w, h);
                ctx.lineTo(0, h);
                ctx.closePath();
                ctx.fill();
            });

            animRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [activeSession, biome]);

    if (!weekSessions.length) return null;

    return (
        <div className="terrain-shift-card">
            <div className="shift-header">
                <span className="shift-eyebrow">TERRAIN SHIFT</span>
                <span className="shift-active-tag">
                    {activeSession?.dayOfWeek} • {activeSession?.biomeName || biome?.label}
                </span>
            </div>

            {/* Shifting Wave Canvas */}
            <div className="shift-canvas-box">
                <canvas ref={canvasRef} className="shift-wave-canvas" />
            </div>

            {/* 7-Day Shifting Swatch Selector */}
            <div className="shift-pills-row">
                {weekSessions.map((s, idx) => {
                    const b = getBiome(s.palette);
                    const isSelected = idx === selectedIdx;
                    return (
                        <button
                            key={s.id || idx}
                            type="button"
                            className={`shift-pill-btn${isSelected ? ' shift-pill-btn--active' : ''}`}
                            onClick={() => {
                                setSelectedIdx(idx);
                                onSelectSession(s);
                            }}
                            title={`${s.dayOfWeek}: ${s.biomeName || b.label}`}
                        >
                            <div
                                className="shift-pill-swatch"
                                style={{
                                    background: `linear-gradient(135deg, ${b.swatch[0]}, ${b.swatch[1]})`,
                                }}
                            />
                            <span className="shift-pill-day">{s.dayOfWeek}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
