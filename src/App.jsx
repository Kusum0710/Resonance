import HomeScreen from './screens/HomeScreen';
import './App.css';

function App() {
  const handleStartTalking = () => {
    // Hook point for the recording flow (mic permission + capture).
    console.log('Start talking pressed');
  };

  const handleNavChange = (tabId) => {
    // Placeholder until Reflections/Settings screens exist.
    console.log('Navigate to', tabId);
  };

  return <HomeScreen onStartTalking={handleStartTalking} onNavChange={handleNavChange} />;
}

export default App;