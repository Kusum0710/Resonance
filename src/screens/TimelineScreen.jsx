import { ChevronRightIcon } from '../components/icons';
import TerrainSwatch from '../components/TerrainSwatch';
import BottomNav from '../components/BottomNav';
import { getBiome } from '../lib/biomes';
import { sessions as initialSessions } from '../lib/sessions';
import './TimelineScreen.css';

export default function TimelineScreen({
  onNavChange = () => { },
  onOpenSession = () => { },
  customSessions = [],
}) {
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

  return (
    <div className="timeline-screen">
      <header className="timeline-header">
        <h1>Vocal History Timeline</h1>
        <p className="timeline-count">{allSessions.length} sessions logged</p>
      </header>

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

      <BottomNav active="reflections" onChange={onNavChange} />
    </div>
  );
}