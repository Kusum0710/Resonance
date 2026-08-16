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
  updateStoredSession,
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

  const handleSaveResult = (customPayload) => {
    const payloadToSave = customPayload || sessionResult;
    if (payloadToSave) {
      const updated = saveSessionToStorage(payloadToSave);
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

  const handleUpdateSession = (sessionId, updates) => {
    const updated = updateStoredSession(sessionId, updates);
    setSavedSessions(updated);
    if (activeDetailSession && activeDetailSession.id === sessionId) {
      setActiveDetailSession((prev) => (prev ? { ...prev, ...updates } : prev));
    }
  };

  const lastSavedSession = savedSessions[0] || null;

  return (
    <div className="app-container">
      {screen === "reflections" ? (
        <TimelineScreen
          onNavChange={setScreen}
          onOpenSession={handleOpenSession}
          onUpdateSession={handleUpdateSession}
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
          key={sessionResult.id}
          sessionResult={sessionResult}
          onSave={handleSaveResult}
          onClose={handleCloseResult}
        />
      )}

      {/* Dedicated Day Detail Modal */}
      {activeDetailSession && (
        <DayDetailModal
          key={activeDetailSession.id}
          session={activeDetailSession}
          onClose={() => setActiveDetailSession(null)}
          onUpdateSession={handleUpdateSession}
        />
      )}
    </div>
  );
}

export default App;
