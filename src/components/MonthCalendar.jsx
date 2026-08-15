import { useMemo, useState } from 'react';
import { getBiome } from '../lib/biomes';
import './MonthCalendar.css';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toISODate(year, month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function buildGrid(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, date: toISODate(year, month, day) });
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export default function MonthCalendar({ sessions = [], onSelectDay = () => { } }) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const sessionsByDate = useMemo(() => {
    const map = new Map();
    sessions.forEach((s) => map.set(s.date, s));
    return map;
  }, [sessions]);

  const cells = useMemo(() => buildGrid(cursor.year, cursor.month), [cursor]);
  const todayISO = toISODate(today.getFullYear(), today.getMonth(), today.getDate());

  const changeMonth = (delta) => {
    setCursor(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  return (
    <div className="month-calendar">
      <div className="month-calendar__header">
        <button
          type="button"
          className="month-calendar__nav"
          aria-label="Previous month"
          onClick={() => changeMonth(-1)}
        >
          ‹
        </button>
        <p className="month-calendar__label">
          {MONTH_LABELS[cursor.month]} {cursor.year}
        </p>
        <button
          type="button"
          className="month-calendar__nav"
          aria-label="Next month"
          onClick={() => changeMonth(1)}
        >
          ›
        </button>
      </div>

      <div className="month-calendar__weekdays">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={`${label}-${i}`}>{label}</span>
        ))}
      </div>

      <div className="month-calendar__grid">
        {cells.map((cell, i) => {
          if (!cell) {
            return <span key={`blank-${i}`} className="month-calendar__cell month-calendar__cell--blank" />;
          }
          const session = sessionsByDate.get(cell.date);
          const biome = session ? getBiome(session.palette) : null;
          const isToday = cell.date === todayISO;

          return (
            <button
              key={cell.date}
              type="button"
              className={`month-calendar__cell${isToday ? ' month-calendar__cell--today' : ''}${session ? ' month-calendar__cell--filled' : ''
                }`}
              onClick={() => onSelectDay(cell.date, session)}
              aria-label={
                session
                  ? `${cell.date}, ${biome.label} terrain, tap to view`
                  : `${cell.date}, no session recorded`
              }
            >
              <span className="month-calendar__day-number">{cell.day}</span>
              <span
                className="month-calendar__dot"
                style={session ? { background: biome.swatch[1] } : undefined}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}