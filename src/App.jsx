import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import TimelineScreen from './screens/TimelineScreen';
import LiveRecordingModal from './components/LiveRecordingModal';
import ResultCardModal from './components/ResultCardModal';
import { analyzeAudioSession } from './utils/audioAnalyzer';
import './App.css';

function App() {
  const [screen, setScreen] = useState('home');
  const [isRecording, setIsRecording] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);
  const [savedSessions, setSavedSessions] = useState([]);

  const handleStartTalking = () => {
    setIsRecording(true);
  };

  const handleStopRecording = (audioMetrics) => {
    setIsRecording(false);
    const resultPayload = analyzeAudioSession(audioMetrics);
    setSessionResult(resultPayload);
    setIsResultOpen(true);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
  };

  const handleSaveResult = () => {
    if (sessionResult) {
      setSavedSessions((prev) => [sessionResult, ...prev]);
    }
    setIsResultOpen(false);
  };

  const handleCloseResult = () => {
    setIsResultOpen(false);
  };

  const handleOpenSession = (sessionId) => {
    console.log('Open session details', sessionId);
  };

  const lastSavedSession = savedSessions[0] || null;

  return (
    <div className="app-container">
      {screen === 'reflections' ? (
        <TimelineScreen
          onNavChange={setScreen}
          onOpenSession={handleOpenSession}
          customSessions={savedSessions}
        />
      ) : (
        <HomeScreen
          onStartTalking={handleStartTalking}
          onNavChange={setScreen}
          lastSession={lastSavedSession}
        />
      )}

      {isRecording && (
        <LiveRecordingModal
          onStop={handleStopRecording}
          onCancel={handleCancelRecording}
        />
      )}

      {isResultOpen && sessionResult && (
        <ResultCardModal
          sessionResult={sessionResult}
          onSave={handleSaveResult}
          onClose={handleCloseResult}
        />
      )}
    </div>
  );
}

export default App;
