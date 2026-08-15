import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import TimelineScreen from "./screens/TimelineScreen";
import SettingsScreen from "./screens/SettingsScreen";
import LiveRecordingModal from "./components/LiveRecordingModal";
import ResultCardModal from "./components/ResultCardModal";
import DayDetailModal from "./components/DayDetailModal";
import { analyzeAudioSession } from "./utils/audioAnalyzer";
import {
  getStoredSessions,
  saveSessionToStorage,
  clearStoredSessions,
} from "./lib/sessions";
import "./App.css";

function App() {
  const [screen, setScreen] = useState("home");
  const [isRecording, setIsRecording] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);
  const [activeDetailSession, setActiveDetailSession] = useState(null);
  const [savedSessions, setSavedSessions] = useState(() => getStoredSessions());

  const [temporaryRecordings, setTemporaryRecordings] = useState(() => {
    return localStorage.getItem("resonance_temporary_recordings") !== "false";
  });

  const handleTemporaryRecordingsChange = (enabled) => {
    setTemporaryRecordings(enabled);
    localStorage.setItem("resonance_temporary_recordings", String(enabled));
  };

  const handleStartTalking = () => {
    setIsRecording(true);
  };

  const handleClearHistory = () => {
    const updated = clearStoredSessions();
    setSavedSessions(updated);
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
      const updated = saveSessionToStorage(sessionResult);
      setSavedSessions(updated);
    }
    setIsResultOpen(false);
    // Navigate smoothly to reflections dashboard so the user sees their new reflection on the graph
    setScreen("reflections");
  };

  const handleCloseResult = () => {
    setIsResultOpen(false);
  };

  const handleOpenSession = (sessionId) => {
    const found = savedSessions.find((s) => s.id === sessionId);
    if (found) {
      setActiveDetailSession(found);
    }
  };

  const lastSavedSession = savedSessions[0] || null;

  return (
    <div className="app-container">
      {screen === "reflections" ? (
        <TimelineScreen
          onNavChange={setScreen}
          onOpenSession={handleOpenSession}
          customSessions={savedSessions}
        />
      ) : screen === "settings" ? (
        <SettingsScreen
          onNavChange={setScreen}
          onClearHistory={handleClearHistory}
          temporaryRecordings={temporaryRecordings}
          onTemporaryRecordingsChange={handleTemporaryRecordingsChange}
        />
      ) : (
        <HomeScreen
          onStartTalking={handleStartTalking}
          onNavChange={setScreen}
          lastSession={lastSavedSession}
        />
      )}

      {/* Live Recording Fullscreen Modal */}
      {isRecording && (
        <LiveRecordingModal
          onStop={handleStopRecording}
          onCancel={handleCancelRecording}
        />
      )}

      {/* Immediate Session Result Modal */}
      {isResultOpen && sessionResult && (
        <ResultCardModal
          sessionResult={sessionResult}
          onSave={handleSaveResult}
          onClose={handleCloseResult}
        />
      )}

      {/* Dedicated Day Detail Modal */}
      {activeDetailSession && (
        <DayDetailModal
          session={activeDetailSession}
          onClose={() => setActiveDetailSession(null)}
        />
      )}
    </div>
  );
}

export default App;
