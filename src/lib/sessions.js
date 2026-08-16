// Single source of truth for session history, persistence, and weekly prosody trend data.
// Placeholder data standing in for real recorded sessions. Once the
// recorder + classifier are wired up, this should come from storage instead.
// `date` is an ISO date (YYYY-MM-DD) so the month calendar can group by day;
// `timeAgo` stays for the list view's relative-time label.

export const initialSessions = [
  {
    id: 's7',
    palette: 'mountain-range',
    biomeName: 'Mountain Range',
    date: '2026-08-15',
    dayOfWeek: 'Sat',
    timeAgo: 'Today',
    timeFormatted: '09:15 AM',
    duration: '28s',
    intensity: 7.4,
    pitchHz: 218,
    pitchVariance: 0.62,
    energyPct: 72,
    speechRate: '142 wpm',
    pauseDensity: '18%',
    quote: 'Morning walk in the breeze. Feeling energized and excited for the weekend project.',
    trigger: 'A serene start to the weekend and creative clarity lifted vocal vitality.',
    analysisLines: [
      'Fresh morning air and uninterrupted focus created an open, inspired mental baseline.',
      'High pitch dynamism (218 Hz) and moderate-high energy (72%) reflect authentic enthusiasm.',
      'Self-note: Morning momentum reliably unlocks your best creative energy.'
    ],
  },
  {
    id: 's6',
    palette: 'mountain-range',
    biomeName: 'Mountain Range',
    date: '2026-08-14',
    dayOfWeek: 'Fri',
    timeAgo: 'Yesterday',
    timeFormatted: '06:40 PM',
    duration: '29s',
    intensity: 7.8,
    pitchHz: 226,
    pitchVariance: 0.68,
    energyPct: 75,
    speechRate: '148 wpm',
    pauseDensity: '15%',
    quote: 'Caught up with an old friend over coffee, it was such a nice surprise.',
    trigger: 'An unplanned, pleasant catch-up kept your delivery animated and expressive.',
    analysisLines: [
      'Reconnecting with a close companion triggered immediate warmth and spontaneous laughter.',
      'Elevated pitch variance and vibrant acoustic cadence indicated rich positive prosody.',
      'Self-note: Social connection after work acts as a reliable emotional revitalizer.'
    ],
  },
  {
    id: 's5',
    palette: 'volcanic',
    biomeName: 'Volcanic',
    date: '2026-08-13',
    dayOfWeek: 'Thu',
    timeAgo: '2 days ago',
    timeFormatted: '04:15 PM',
    duration: '26s',
    intensity: 8.4,
    pitchHz: 245,
    pitchVariance: 0.74,
    energyPct: 88,
    speechRate: '162 wpm',
    pauseDensity: '22%',
    quote: "Someone completely ignored the boundary I set last week and I'm furious about it.",
    trigger: 'A boundary violation provoked short, high-intensity bursts between long pauses.',
    analysisLines: [
      'Unresolved interpersonal frustration caused sudden bursts of vocal force.',
      'Sharp volume spikes and pressed vocal folds pushed the acoustic intensity to 8.4/10.',
      'Self-note: Channel heat through physical movement before addressing the conflict.'
    ],
  },
  {
    id: 's4',
    palette: 'mountain-range',
    biomeName: 'Mountain Range',
    date: '2026-08-12',
    dayOfWeek: 'Wed',
    timeAgo: '3 days ago',
    timeFormatted: '05:30 PM',
    duration: '31s',
    intensity: 8.6,
    pitchHz: 232,
    pitchVariance: 0.65,
    energyPct: 78,
    speechRate: '150 wpm',
    pauseDensity: '16%',
    quote: 'We finally shipped the feature and the feedback has been incredible so far.',
    trigger: 'Shared achievement and creative validation lifted your pitch variance.',
    analysisLines: [
      'Project completion and positive peer feedback sparked deep satisfaction.',
      'Fluid prosody with strong resonant peaks signaled confidence and joy.',
      'Self-note: Celebrating milestones actively reinforces your resilience.'
    ],
  },
  {
    id: 's3',
    palette: 'meadow',
    biomeName: 'Meadow',
    date: '2026-08-11',
    dayOfWeek: 'Tue',
    timeAgo: '4 days ago',
    timeFormatted: '09:20 PM',
    duration: '22s',
    intensity: 3.5,
    pitchHz: 168,
    pitchVariance: 0.28,
    energyPct: 16,
    speechRate: '108 wpm',
    pauseDensity: '38%',
    quote: 'Was reminiscing about my college friends today, felt really warm thinking about it.',
    trigger: 'Nostalgic reflection and gentle longing softened your tone into a steady, even register.',
    analysisLines: [
      'Quiet evening nostalgia invited long relaxed sighs and unhurried reflections.',
      'Low energy (16%) and gentle pause intervals (38%) shaped a calm, restorative meadow.',
      'Self-note: Solitary evening wind-down provides healthy decompression.'
    ],
  },
  {
    id: 's2',
    palette: 'thunderstorm',
    biomeName: 'Thunderstorm',
    date: '2026-08-10',
    dayOfWeek: 'Mon',
    timeAgo: '5 days ago',
    timeFormatted: '02:45 PM',
    duration: '35s',
    intensity: 7.2,
    pitchHz: 240,
    pitchVariance: 0.58,
    energyPct: 70,
    speechRate: '175 wpm',
    pauseDensity: '12%',
    quote: "I have so many unread messages and the deck is due tomorrow and I don't know where to start.",
    trigger: 'High task volume and an impending deadline spiked your pace and pitch jitter.',
    analysisLines: [
      'Monday task overload triggered cognitive rush and shallow breathing.',
      'Rapid speaking rate (175 wpm) and pitch micro-jitter indicated sympathetic arousal.',
      'Self-note: Practice Box Breathing when task volume feels overwhelming.'
    ],
  },
  {
    id: 's1',
    palette: 'gray-plateau',
    biomeName: 'Gray Plateau',
    date: '2026-08-09',
    dayOfWeek: 'Sun',
    timeAgo: '6 days ago',
    timeFormatted: '07:10 PM',
    duration: '28s',
    intensity: 1.8,
    pitchHz: 145,
    pitchVariance: 0.14,
    energyPct: 24,
    speechRate: '115 wpm',
    pauseDensity: '30%',
    quote: 'Just finished back to back sprint reviews. Feeling pretty flat and numb, honestly.',
    trigger: 'Cognitive overload from long meetings flattened your usual pitch range.',
    analysisLines: [
      'Extended screen time and repetitive discussions depleted vocal expressiveness.',
      'Flat pitch variance (0.14) and muted dynamics formed a calm, low-intensity plateau.',
      'Self-note: Protect buffer intervals between lengthy collaborative sessions.'
    ],
  },
];

const STORAGE_KEY = 'resonance_sessions_history_v2';

export function getStoredSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSessions));
      return initialSessions;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : initialSessions;
  } catch (e) {
    console.warn('Storage read error:', e);
    return initialSessions;
  }
}

export function saveSessionToStorage(newSession) {
  try {
    const current = getStoredSessions();
    const updated = [newSession, ...current.filter((s) => s.id !== newSession.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Storage save error:', e);
    return [newSession, ...initialSessions];
  }
}
export function getPast7DaysSessions(allSessions = []) {
  // Return the most recent 7 distinct days or sessions
  if (!allSessions || !allSessions.length) return initialSessions.slice(0, 7);
  return allSessions.slice(0, 7);
}

export const sessions = initialSessions;

export function getSessionByDate(dateStr) {
  const all = getStoredSessions();
  return all.find((s) => s.date === dateStr);
}

export function clearStoredSessions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  } catch (e) {
    console.warn('Storage clear error:', e);
    return [];
  }
}
