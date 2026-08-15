import { useState } from 'react';
import { ChevronRightIcon } from '../components/icons';
import TerrainSwatch from '../components/TerrainSwatch';
import MonthCalendar from '../components/MonthCalendar';
import ViewToggle from '../components/ViewToggle';
import BottomNav from '../components/BottomNav';
import { getBiome } from '../lib/biomes';
import { sessions as initialSessions } from '../lib/sessions';
import '../components/ViewToggle.css';
import './TimelineScreen.css';

const VIEW_OPTIONS = [
  { value: 'list', label: 'List' },
  { value: 'month', label: 'Month' },
];

export default function TimelineScreen({
  onNavChange = () => {},
  onOpenSession = () => {},
  customSessions = [],
}) {
  const [view, setView] = useState('list');

  // Convert custom saved sessions to match timeline list format
  const mappedCustomSessions = customSessions.map((s, idx) => ({
    id: `custom-${idx}`,
    palette: s.palette || 'meadow',
    timeAgo: s.dateFormatted || 'Just now',
    duration: s.durationFormatted || '15s',
    quote: s.insightMessage || 'Voice reflection recorded.',
    trigger: s.tag || 'Voice dynamics analysis completed.',
    biomeName: s.biomeName,
  }));

  const allSessions = [...mappedCustomSessions, ...initialSessions];

  const handleSelectDay = (dateStr, session) => {
    if (session) {
      onOpenSession(session.id);
    }
  };

  return (
    <div className="timeline-screen">
      <header className="timeline-header">
        <h1>Vocal History Timeline</h1>
        <p className="timeline-count">{allSessions.length} sessions logged</p>
      </header>

      <ViewToggle value={view} onChange={setView} options={VIEW_OPTIONS} />

      {view === 'list' ? (
        <div className="timeline-list">
          {allSessions.map((session) => {
            const biome = getBiome(session.palette);
            return (
              <button
                key={session.id}
                type="button"
                className="timeline-row"
                onClick={() => onOpenSession(session.id)}
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
                      {session.timeAgo} · {session.duration}
                    </span>
                  </div>
                  <p className="timeline-row__quote">&ldquo;{session.quote}&rdquo;</p>
                  <p className="timeline-row__trigger">Trigger: {session.trigger}</p>
                </div>

                <ChevronRightIcon className="timeline-row__chevron" />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="timeline-month">
          <MonthCalendar sessions={allSessions} onSelectDay={handleSelectDay} />
        </div>
      )}

      <BottomNav active="reflections" onChange={onNavChange} />
    </div>
  );
}