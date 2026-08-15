import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import TimelineScreen from './screens/TimelineScreen';
import VoiceRecorder from "./components/icons";
import './App.css';

function App() {
  const [screen, setScreen] = useState('home');
  const [showRecorder, setShowRecorder] = useState(false);

  const handleStartTalking = () => {
    setShowRecorder(true);
  };

  const handleRecorderClose = () => {
    setShowRecorder(false);
  };

  const handleRecorderSave = (audioURL) => {
    // TODO: persist the recording (localStorage, IndexedDB, etc.)
    console.log('Recording saved:', audioURL);
  };

  const handleOpenSession = (sessionId) => {
    // Hook point for the day-detail deep dive screen, once it exists.
    console.log('Open session', sessionId);
  };

  if (screen === 'reflections') {
    return <TimelineScreen onNavChange={setScreen} onOpenSession={handleOpenSession} />;
  }

  // 'settings' and any other tab fall back to Home until those screens exist.
  return (
    <>
      <HomeScreen onStartTalking={handleStartTalking} onNavChange={setScreen} />
      {showRecorder && (
        <VoiceRecorder onClose={handleRecorderClose} onSave={handleRecorderSave} />
      )}
    </>
  );
}

export default App;