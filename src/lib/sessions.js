// Placeholder data standing in for real recorded sessions. Once the
// recorder + classifier are wired up, this should come from storage instead.
// `date` is an ISO date (YYYY-MM-DD) so the month calendar can group by day;
// `timeAgo` stays for the list view's relative-time label.

export const sessions = [
  {
    id: 's6',
    palette: 'mountain-range',
    date: '2026-08-14',
    timeAgo: 'Yesterday',
    duration: '29s',
    quote: 'Caught up with an old friend over coffee, it was such a nice surprise.',
    trigger: 'An unplanned, pleasant catch-up kept your delivery animated and expressive.',
  },
  {
    id: 's5',
    palette: 'volcanic',
    date: '2026-08-13',
    timeAgo: '2 days ago',
    duration: '26s',
    quote: "Someone completely ignored the boundary I set last week and I'm furious about it.",
    trigger: 'A boundary violation provoked short, high-intensity bursts between long pauses.',
  },
  {
    id: 's4',
    palette: 'mountain-range',
    date: '2026-08-12',
    timeAgo: '3 days ago',
    duration: '31s',
    quote: 'We finally shipped the feature and the feedback has been incredible so far.',
    trigger: 'Shared achievement and creative validation lifted your pitch variance.',
  },
  {
    id: 's3',
    palette: 'meadow',
    date: '2026-08-11',
    timeAgo: '4 days ago',
    duration: '22s',
    quote: 'Was reminiscing about my college friends today, felt really warm thinking about it.',
    trigger: 'Nostalgic reflection and gentle longing softened your tone into a steady, even register.',
  },
  {
    id: 's2',
    palette: 'thunderstorm',
    date: '2026-08-10',
    timeAgo: '5 days ago',
    duration: '35s',
    quote: "I have so many unread messages and the deck is due tomorrow and I don't know where to start.",
    trigger: 'High task volume and an impending deadline spiked your pace and pitch jitter.',
  },
  {
    id: 's1',
    palette: 'gray-plateau',
    date: '2026-08-09',
    timeAgo: '6 days ago',
    duration: '28s',
    quote: 'Just finished back to back sprint reviews. Feeling pretty flat and numb, honestly.',
    trigger: 'Cognitive overload from long meetings flattened your usual pitch range.',
  },
];

export function getSessionByDate(dateStr) {
  return sessions.find((s) => s.date === dateStr);
}