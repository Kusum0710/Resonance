import ResultCardModal from './ResultCardModal';
import { normalizeSessionDetails } from '../utils/audioAnalyzer';

export default function DayDetailModal({ session, onClose }) {
  if (!session) return null;

  const normalizedPayload = normalizeSessionDetails(session);

  return (
    <ResultCardModal
      sessionResult={normalizedPayload}
      onClose={onClose}
      onSave={onClose}
    />
  );
}
