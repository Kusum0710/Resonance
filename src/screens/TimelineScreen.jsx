import { useState } from 'react';
import { ChevronRightIcon } from '../components/icons';
import TerrainSwatch from '../components/TerrainSwatch';
import MonthCalendar from '../components/MonthCalendar';
import ViewToggle from '../components/ViewToggle';
import BottomNav from '../components/BottomNav';
import WeeklyProsodyChart from '../components/WeeklyProsodyChart';
import TerrainShiftWave from '../components/TerrainShiftWave';
import BreathingExercise from '../components/BreathingExercise';
import DayDetailModal from '../components/DayDetailModal';
import { getBiome } from '../lib/biomes';
import { getStoredSessions } from '../lib/sessions';
import '../components/ViewToggle.css';
import './TimelineScreen.css';

const VIEW_OPTIONS = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'list', label: 'Days' },
  { value: 'month', label: 'Calendar' },
];

export default function TimelineScreen({
  onNavChange = () => { },
  onOpenSession = () => { },
  customSessions = [],
}) {
  const [view, setView] = useState('dashboard');
  const [selectedDetailSession, setSelectedDetailSession] = useState(null);

  const storedSessions = getStoredSessions();

  // Combine custom newly saved sessions with stored sessions (deduplicating by id)
  const combinedMap = new Map();
  customSessions.forEach((s) => combinedMap.set(s.id, s));
  storedSessions.forEach((s) => {
    if (!combinedMap.has(s.id)) combinedMap.set(s.id, s);
  });
  const allSessions = Array.from(combinedMap.values());

  const handleSelectDay = (session) => {
    if (session) {
      setSelectedDetailSession(session);
      onOpenSession(session.id);
    }
  };

  const handleCalendarSelectDay = (dateStr, session) => {
    if (session) {
      setSelectedDetailSession(session);
      onOpenSession(session.id);
    }
  };

  const handleSelectDay = (dateStr, session) => {
    if (session) {
      onOpenSession(session.id);
    }
  };

  return (
    <div className="timeline-screen">
      {/* Screen Header matching screenshot */}
      <header className="timeline-header">
        <div>
          <span className="timeline-eyebrow">VOCAL PROSODY ARCHIVE</span>
          <h1 className="timeline-main-title">Reflections</h1>
        </div>
        <div className="timeline-header-actions">
          <span className="timeline-count">{allSessions.length} logged</span>
        </div>
      </header>

      {/* View Toggle */}
      <div className="timeline-toggle-wrap">
        <ViewToggle value={view} onChange={setView} options={VIEW_OPTIONS} />
      </div>

      {/* Main Content Areas */}
      {view === 'dashboard' && (
        <div className="reflections-dashboard">
          {/* 1. Weekly Prosody Trend Graph Card (Light mode) */}
          <WeeklyProsodyChart
            sessions={allSessions}
            onSelectDay={handleSelectDay}
            onOpenCalendar={() => setView('month')}
          />

          {/* 2. Minimal Visualisation of Terrain Shifting */}
          <TerrainShiftWave
            sessions={allSessions}
            onSelectSession={handleSelectDay}
          />

          {/* 3. Executable Breathing Exercises & Relaxing Techniques */}
          <BreathingExercise />

          {/* 4. Detailed Day-by-Day Reflections with Vertical Scrolling */}
          <section className="dashboard-recent-section">
            <div className="section-title-row">
              <h3 className="section-title">Past Reflections &amp; Self-Notes</h3>
              <button
                type="button"
                className="section-see-all-btn"
                onClick={() => setView('list')}
              >
                All days &gt;
              </button>
            </div>

            <div className="detailed-day-scroll-list">
              {allSessions.slice(0, 3).map((session) => {
                const biome = getBiome(session.palette);
                return (
                  <article
                    key={session.id}
                    className="dashboard-day-card"
                    onClick={() => handleSelectDay(session)}
                  >
                    <div className="day-card-top">
                      <div className="day-card-left">
                        <TerrainSwatch palette={session.palette} />
                        <div>
                          <div className="day-card-title-row">
                            <span className="day-card-weekday">
                              {session.dayOfWeek || 'Reflection'}
                            </span>
                            <span className="day-card-time">
                              {session.timeAgo} {session.timeFormatted ? `· ${session.timeFormatted}` : ''}
                            </span>
                          </div>
                          <span
                            className="day-card-badge"
                            style={{ background: biome.badgeBg, color: biome.badgeText }}
                          >
                            {session.biomeName || biome.label}
                          </span>
                        </div>
                      </div>

                      <div className="day-card-intensity-box">
                        <span className="day-intensity-val">
                          {session.intensity?.toFixed(1) || '5.0'}
                        </span>
                        <span className="day-intensity-sub">/10</span>
                      </div>
                    </div>

                    {/* Spoken Quote */}
                    <p className="day-card-quote">&ldquo;{session.quote}&rdquo;</p>

                    {/* Trigger & 2-3 Line Self-Analysis Note */}
                    <div className="day-card-analysis">
                      <span className="analysis-pill-label">WHY YOU FELT THIS WAY</span>
                      <p className="analysis-p-text">
                        {session.trigger || (session.analysisLines && session.analysisLines[0])}
                      </p>
                    </div>

                    {/* Prosody Micro-metrics */}
                    <div className="day-card-prosody-row">
                      <span className="prosody-stat">Pitch: {session.pitchHz || 190} Hz</span>
                      <span className="prosody-stat">Energy: {session.energyPct || 45}%</span>
                      <span className="prosody-stat">Duration: {session.duration || '28s'}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {view === 'list' && (
        <div className="timeline-list">
          <div className="list-heading-meta">
            <span>Detailed Day-by-Day Historical Log</span>
          </div>

          {allSessions.map((session) => {
            const biome = getBiome(session.palette);
            return (
              <button
                key={session.id}
                type="button"
                className="timeline-row"
                onClick={() => handleSelectDay(session)}
              >
                <TerrainSwatch palette={session.palette} />

                <div className="timeline-row__body">
                  <div className="timeline-row__meta">
                    <span
                      className="timeline-badge"
                      style={{ background: biome.badgeBg, color: biome.badgeText }}
                    >
                      {session.biomeName || biome.label}
                    </span>
                    <span className="timeline-row__time">
                      {session.dayOfWeek ? `${session.dayOfWeek}, ` : ''}{session.timeAgo} · {session.duration}
                    </span>
                  </div>
                  <p className="timeline-row__quote">&ldquo;{session.quote}&rdquo;</p>
                  <p className="timeline-row__trigger">
                    <strong>Trigger:</strong> {session.trigger}
                  </p>
                </div>

                <ChevronRightIcon className="timeline-row__chevron" />
              </button>
            );
          })}
        </div>
      )}

      {view === 'month' && (
        <div className="timeline-month">
          <MonthCalendar sessions={allSessions} onSelectDay={handleCalendarSelectDay} />
        </div>
      )}

      {/* Day Detail Inspection Modal */}
      {selectedDetailSession && (
        <DayDetailModal
          session={selectedDetailSession}
          onClose={() => setSelectedDetailSession(null)}
        />
      )}

      <BottomNav active="reflections" onChange={onNavChange} />
    </div>
  );
}
