// Builds a CSV report from the user's saved reflection sessions and
// triggers a browser download. Kept dependency-free so it works the
// same in every environment (no server round-trip, no external libs).

const REPORT_COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'dayOfWeek', label: 'Day' },
  { key: 'timeFormatted', label: 'Time' },
  { key: 'biomeName', label: 'Biome' },
  { key: 'duration', label: 'Duration' },
  { key: 'intensity', label: 'Intensity' },
  { key: 'pitchHz', label: 'Pitch (Hz)' },
  { key: 'pitchVariance', label: 'Pitch Variance' },
  { key: 'energyPct', label: 'Energy (%)' },
  { key: 'speechRate', label: 'Speech Rate' },
  { key: 'pauseDensity', label: 'Pause Density' },
  { key: 'quote', label: 'Quote' },
  { key: 'trigger', label: 'Insight' },
];

function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildReportCSV(sessions = []) {
  const header = REPORT_COLUMNS.map((c) => escapeCsvValue(c.label)).join(',');
  const rows = sessions.map((session) =>
    REPORT_COLUMNS.map((c) => escapeCsvValue(session[c.key])).join(','),
  );
  return [header, ...rows].join('\n');
}

export function downloadSessionsReport(sessions = []) {
  const csv = buildReportCSV(sessions);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `voice-terrain-report-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}