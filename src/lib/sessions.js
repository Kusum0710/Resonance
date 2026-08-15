// Placeholder data standing in for real recorded sessions. Once the
// recorder + classifier are wired up, this should come from storage instead.

export const initialSessions = [
  {
    id: 's6',
    palette: 'mountain-range',
    timeAgo: 'Yesterday',
    duration: '29s',
    quote: 'Caught up with an old friend over coffee, it was such a nice surprise.',
    trigger: 'An unplanned, pleasant catch-up kept your delivery animated and expressive.',
  },
  {
    id: 's5',
    palette: 'volcanic',
    timeAgo: '2 days ago',
    duration: '26s',
    quote: "Someone completely ignored the boundary I set last week and I'm furious about it.",
    trigger: 'A boundary violation provoked short, high-intensity bursts between long pauses.',
  },
  {
    id: 's4',
    palette: 'mountain-range',
    timeAgo: '3 days ago',
    duration: '31s',
    quote: 'We finally shipped the feature and the feedback has been incredible so far.',
    trigger: 'Shared achievement and creative validation lifted your pitch variance.',
  },
  {
    id: 's3',
    palette: 'meadow',
    timeAgo: '4 days ago',
    duration: '22s',
    quote: 'Was reminiscing about my college friends today, felt really warm thinking about it.',
    trigger: 'Nostalgic reflection and gentle longing softened your tone into a steady, even register.',
  },
  {
    id: 's2',
    palette: 'thunderstorm',
    timeAgo: '5 days ago',
    duration: '35s',
    quote: "I have so many unread messages and the deck is due tomorrow and I don't know where to start.",
    trigger: 'High task volume and an impending deadline spiked your pace and pitch jitter.',
  },
  {
    id: 's1',
    palette: 'gray-plateau',
    timeAgo: '6 days ago',
    duration: '28s',
    quote: 'Just finished back to back sprint reviews. Feeling pretty flat and numb, honestly.',
    trigger: 'Cognitive overload from long meetings flattened your usual pitch range.',
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
    return Array.isArray(parsed) && parsed.length ? parsed : initialSessions;
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
