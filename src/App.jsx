import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import LiveRecordingModal from './components/LiveRecordingModal';
import ResultCardModal from './components/ResultCardModal';
import { analyzeAudioSession } from './utils/audioAnalyzer';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);
  const [lastSavedSession, setLastSavedSession] = useState(null);

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
      setLastSavedSession(sessionResult);
    }
    setIsResultOpen(false);
  };

  const handleCloseResult = () => {
    setIsResultOpen(false);
  };

  const handleNavChange = (tabId) => {
    console.log('Navigate to', tabId);
  };

  return (
    <>
      <HomeScreen
        onStartTalking={handleStartTalking}
        onNavChange={handleNavChange}
        lastSession={lastSavedSession}
      />

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
    </>
  );
}

export default App;