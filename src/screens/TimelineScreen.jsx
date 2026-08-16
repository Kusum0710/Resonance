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
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);

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

  return (
    <div className="timeline-screen">
      {/* Screen Header matching design system */}
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
          {/* 1. Weekly Prosody Trend Graph Card */}
          <WeeklyProsodyChart
            sessions={allSessions}
            onSelectDay={handleSelectDay}
            onOpenCalendar={() => setView('month')}
          />

          {/* 2. Visualisation of Terrain Shifting */}
          <TerrainShiftWave
            sessions={allSessions}
            onSelectSession={handleSelectDay}
          />

          {/* 3. Mindfulness & Breathing Card */}
          <section className="breathing-card-banner">
            <div className="breathing-banner-content">
              <span className="banner-icon">🫁</span>
              <div>
                <h3 className="banner-title">Guided Breathing &amp; Relaxation</h3>
                <p className="banner-desc">4-7-8 Deep Rest, Box Breathing &amp; Resonant Coherence</p>
              </div>
            </div>
            <button
              type="button"
              className="banner-start-btn"
              onClick={() => setIsBreathingModalOpen(true)}
            >
              Start Exercise
            </button>
          </section>

          {/* 4. Detailed Day-by-Day Reflections */}
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

            <div className="timeline-list">
              {allSessions.slice(0, 5).map((session) => {
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
                      <p className="timeline-row__quote">&ldquo;{session.quote || session.insightMessage}&rdquo;</p>
                      {session.trigger && (
                        <p className="timeline-row__trigger">
                          <strong>Trigger:</strong> {session.trigger}
                        </p>
                      )}
                    </div>

                    <ChevronRightIcon className="timeline-row__chevron" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {view === 'list' && (
        <div className="timeline-list">
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
                  <p className="timeline-row__quote">&ldquo;{session.quote || session.insightMessage}&rdquo;</p>
                  {session.trigger && (
                    <p className="timeline-row__trigger">
                      <strong>Trigger:</strong> {session.trigger}
                    </p>
                  )}
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

      {/* Breathing Exercise Modal Overlay */}
      {isBreathingModalOpen && (
        <BreathingExercise onClose={() => setIsBreathingModalOpen(false)} />
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
