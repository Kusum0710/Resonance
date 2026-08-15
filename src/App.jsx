import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import TimelineScreen from './screens/TimelineScreen';
import './App.css';

function App() {
  const [screen, setScreen] = useState('home');

  const handleStartTalking = () => {
    // Hook point for the recording flow (mic permission + capture).
    console.log('Start talking pressed');
  };

  const handleOpenSession = (sessionId) => {
    // Hook point for the day-detail deep dive screen, once it exists.
    console.log('Open session', sessionId);
  };

  if (screen === 'reflections') {
    return <TimelineScreen onNavChange={setScreen} onOpenSession={handleOpenSession} />;
  }

  // 'settings' and any other tab fall back to Home until those screens exist.
  return <HomeScreen onStartTalking={handleStartTalking} onNavChange={setScreen} />;
}

export default App;