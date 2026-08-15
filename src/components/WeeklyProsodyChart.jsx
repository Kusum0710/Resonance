import { useState } from "react";
import { getBiome } from "../lib/biomes";
import './WeeklyProsodyChart.css';


export default function WeeklyProsodyChart({
    sessions = [],
    onSelectDay = () => { },
    onOpenCalendar = () => { },
}) {
    //Taking last 7 days sessions
    const weekData = sessions.slice(0, 7).reverse();
    const [activeIndex, setActiveIndex] = useState(weekData.length - 1);

    if (!weekData.length || !sessions.length) {
        return (
            <div className="empty-chart">
                <h2>No sessions yet</h2>
                <p>Record your first session to see your prosody terrain</p>
            </div>
        )
    }

    //chart dimensions
    const width = 360;
    const height = 180;
    const paddingLeft = 32;
    const paddingRight = 20;
    const paddingTop = 28;
    const paddingBottom = 36;


    const innerWidth = width - paddingLeft - paddingRight;
    const innerHeight = height - paddingTop - paddingBottom;

    //Mapping Intensity(0-10) to SVG points
    const points = weekData.map((d, i) => {
        const x = paddingLeft + (i / Math.max(1, weekData.length - 1)) * innerWidth;
        const val = typeof d.intensity === "number" ? d.intensity : 5.0;

        //we keep val 0 at bottom, val 10 at top
        const y = paddingTop + innerHeight - (val / 10) * innerHeight;

        return { x, y, data: d, val };
    })
    //Generating smooth cubic SVG path from points

    const makeSmooth = (points) => {
        if (points.length === 0) return "";
        if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;


        let path = `M ${points[0].x} ${points[0].y} `;
        for (let i = 0; i < points.length; i++) {
            const p0 = i > 0 ? points[i - 1] : points[i];
            const p1 = points[i];
            const p2 = points[i + 1];
            // eslint-disable-next-line no-unused-vars
            const p3 = i < points.length - 2 ? points[i + 2] : p2;

            //Control points
            const cp1x = p0.x + (p1.x - p0.x) * 6;
            const cp1y = p0.y + (p1.y - p0.y) * 6;
            const cp2x = p1.x - (p2.x - p1.x) * 6;
            const cp2y = p1.y - (p2.y - p1.y) * 6;

            //add segment
            path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
            //Close loop
        }
        return path;
    };

    const linePath = makeSmooth(points);
    const areaPath = points.length ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + innerHeight} L ${points[0].x} ${paddingTop + innerHeight} Z` : "";

    const activePoint = points[activeIndex] || points[points.length - 1];
    const activeSession = activePoint?.data;
    const activeBiome = activeSession ? getBiome(activeSession.palette) : null;

    // Tooltip position clamped within SVG bounds
    const tooltipX = activePoint ? Math.max(80, Math.min(270, activePoint.x)) : 180;
    const tooltipY = activePoint ? Math.max(42, activePoint.y - 12) : 60;

    const handleCardClick = (e) => {
        // If user clicks on card background, trigger calendar/list view
        if (e.target.closest('.chart-svg-interactive') || e.target.closest('.chart-open-calendar-btn')) {
            return;
        }
        onOpenCalendar();
    };

    return (
        <div
            className="weekly-prosody-card"
            onClick={handleCardClick}
            role="region"
            aria-label="Weekly prosody trend"
        >
            {/* Top Header Row matching Screenshot */}
            <div className="weekly-card-header">
                <div className="weekly-badge-group">
                    <span className="weekly-pill-eyebrow">WEEKLY PROSODY TREND</span>
                    <span className="weekly-pill-sub">• Past 7 Days</span>
                </div>

                <button
                    type="button"
                    className="chart-open-calendar-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenCalendar();
                    }}
                >
                    Open Calendar &gt;
                </button>
            </div>

            <h2 className="weekly-card-title">Acoustic Intensity &amp; Biome Trajectory</h2>

            {/* SVG Interactive Chart */}
            <div className="chart-container">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="chart-svg-interactive"
                    preserveAspectRatio="none"
                >
                    <defs>
                        {/* Gradient matching light mode aesthetic */}
                        <linearGradient id="prosodyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4ea899" stopOpacity="0.32" />
                            <stop offset="60%" stopColor="#5aa5b8" stopOpacity="0.12" />
                            <stop offset="100%" stopColor="#6f93d1" stopOpacity="0.01" />
                        </linearGradient>
                        <linearGradient id="prosodyStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#439e8f" />
                            <stop offset="50%" stopColor="#4aa6aa" />
                            <stop offset="100%" stopColor="#6391d4" />
                        </linearGradient>
                        <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3f887b" floodOpacity="0.25" />
                        </filter>
                    </defs>

                    {/* Grid lines & Y-axis labels: 10, 6, 3, 0 */}
                    {[
                        { val: 10, label: '10' },
                        { val: 6, label: '6' },
                        { val: 3, label: '3' },
                        { val: 0, label: '0' },
                    ].map((grid) => {
                        const gy = paddingTop + innerHeight - (grid.val / 10) * innerHeight;
                        return (
                            <g key={grid.val}>
                                <line
                                    x1={paddingLeft}
                                    y1={gy}
                                    x2={width - paddingRight}
                                    y2={gy}
                                    className="chart-grid-line"
                                />
                                <text x={paddingLeft - 8} y={gy + 3.5} className="chart-y-axis-text">
                                    {grid.label}
                                </text>
                            </g>
                        );
                    })}

                    {/* Gradient Area Fill */}
                    {areaPath && <path d={areaPath} fill="url(#prosodyAreaGrad)" />}

                    {/* Smooth Curve Stroke */}
                    {linePath && (
                        <path
                            d={linePath}
                            fill="none"
                            stroke="url(#prosodyStrokeGrad)"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#glowEffect)"
                        />
                    )}

                    {/* Active Vertical Crosshair Guide */}
                    {activePoint && (
                        <line
                            x1={activePoint.x}
                            y1={paddingTop - 4}
                            x2={activePoint.x}
                            y2={paddingTop + innerHeight}
                            className="chart-crosshair-line"
                        />
                    )}

                    {/* Data Points on Curve */}
                    {points.map((pt, idx) => {
                        const isSelected = idx === activeIndex;
                        return (
                            <g
                                key={pt.data.id || idx}
                                className="chart-point-group"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveIndex(idx);
                                    onSelectDay(pt.data);
                                }}
                            >
                                {/* Touch hit area */}
                                <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" style={{ cursor: 'pointer' }} />

                                {isSelected ? (
                                    <>
                                        <circle cx={pt.x} cy={pt.y} r="8" fill="#ffffff" stroke="#3b9586" strokeWidth="2.5" />
                                        <circle cx={pt.x} cy={pt.y} r="3.5" fill="#3b9586" />
                                    </>
                                ) : (
                                    <circle cx={pt.x} cy={pt.y} r="3.2" fill="#52a498" className="chart-point-dot" />
                                )}
                            </g>
                        );
                    })}

                    {/* X-axis Day Labels */}
                    {points.map((pt, idx) => {
                        const isSelected = idx === activeIndex;
                        const dayLabel = pt.data.dayOfWeek || pt.data.date?.slice(-2) || `D${idx + 1}`;
                        return (
                            <text
                                key={`label-${idx}`}
                                x={pt.x}
                                y={paddingTop + innerHeight + 18}
                                className={`chart-x-axis-text${isSelected ? ' chart-x-axis-text--active' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveIndex(idx);
                                    onSelectDay(pt.data);
                                }}
                            >
                                {dayLabel}
                            </text>
                        );
                    })}
                </svg>

                {/* Floating Tooltip matching image structure */}
                {activePoint && activeSession && (
                    <div
                        className="chart-floating-tooltip"
                        style={{
                            left: `${(tooltipX / width) * 100}%`,
                            top: `${(tooltipY / height) * 100}%`,
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectDay(activeSession);
                        }}
                    >
                        <div className="tooltip-title-row">
                            <span
                                className="tooltip-biome-dot"
                                style={{ background: activeBiome?.swatch[1] || '#4ea899' }}
                            />
                            <span className="tooltip-title">
                                {activeSession.dayOfWeek} • {activeSession.biomeName || activeBiome?.label}
                            </span>
                        </div>
                        <div className="tooltip-intensity">
                            Intensity: {activeSession.intensity?.toFixed(1) || '5.0'}/10
                        </div>
                        <div className="tooltip-submetrics">
                            Pitch: {activeSession.pitchHz || 180} Hz | Energy: {activeSession.energyPct || 45}%
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Footer Row matching Screenshot */}
            <div className="weekly-card-footer">
                <span className="footer-tap-hint">
                    Tap anywhere on this card to open the interactive Calendar view
                </span>
                <button
                    type="button"
                    className="footer-entries-link"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenCalendar();
                    }}
                >
                    {weekData.length} recorded entries &gt;
                </button>
            </div>
        </div>
    );
}
