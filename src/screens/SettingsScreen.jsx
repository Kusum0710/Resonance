import BottomNav from "../components/BottomNav";
import "./SettingsScreen.css";

export default function SettingsScreen({
  onNavChange = () => {},
  onClearHistory = () => {},
  temporaryRecordings = true,
  onTemporaryRecordingsChange = () => {},
}) {
  return (
    <div className="settings-screen">
      <header className="settings-header">
        <p className="settings-eyebrow">VOICE TERRAIN</p>
        <h1>Settings</h1>
        <p className="settings-subtitle">Make the app feel right for you.</p>
      </header>

      <main className="settings-content">
        {/* PROFILE */}
        <section className="settings-section">
          <p className="settings-section-title">PROFILE</p>

          <button
            type="button"
            className="settings-card settings-card--profile"
          >
            <div className="profile-avatar">R</div>

            <div className="settings-card-content">
              <strong>My profile</strong>
              <span>Personalise your Voice Terrain</span>
            </div>

            <span className="settings-chevron">›</span>
          </button>
        </section>

        {/* PRIVACY */}
        <section className="settings-section">
          <p className="settings-section-title">PRIVACY</p>

          <div className="settings-card settings-card--stacked">
            <div className="settings-row">
              <div className="settings-icon">◉</div>

              <div className="settings-card-content">
                <strong>On-device analysis</strong>
                <span>Your voice analysis stays on your device.</span>
              </div>

              <span className="settings-status">ON</span>
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div className="settings-icon">⌁</div>

              <div className="settings-card-content">
                <strong>Temporary recordings</strong>
                <span>Audio is only kept for the current session.</span>
              </div>

              <button
                type="button"
                className={`settings-status-toggle ${
                  temporaryRecordings ? "settings-status-toggle--on" : ""
                }`}
                onClick={() =>
                  onTemporaryRecordingsChange(!temporaryRecordings)
                }
                aria-pressed={temporaryRecordings}
              >
                {temporaryRecordings ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </section>

        {/* YOUR DATA */}
        <section className="settings-section">
          <p className="settings-section-title">YOUR DATA</p>

          <div className="settings-card settings-card--stacked">
            <button type="button" className="settings-row settings-row--button">
              <div className="settings-icon">↓</div>

              <div className="settings-card-content">
                <strong>Download my report</strong>
                <span>Save your reflection history.</span>
              </div>

              <span className="settings-chevron">›</span>
            </button>

            <div className="settings-divider" />

            <button
              type="button"
              className="settings-row settings-row--button settings-row--danger"
              onClick={() => {
                const confirmed = window.confirm(
                  "Clear all your saved reflections? This cannot be undone.",
                );

                if (confirmed) {
                  onClearHistory();
                }
              }}
            >
              <div className="settings-icon">×</div>

              <div className="settings-card-content">
                <strong>Clear history</strong>
                <span>Remove your saved reflections.</span>
              </div>

              <span className="settings-chevron">›</span>
            </button>
          </div>
        </section>

        {/* ABOUT */}
        <section className="settings-section">
          <p className="settings-section-title">ABOUT</p>

          <button type="button" className="settings-card">
            <div className="settings-icon">i</div>

            <div className="settings-card-content">
              <strong>About Voice Terrain</strong>
              <span>Version 1.0 · Built with care</span>
            </div>

            <span className="settings-chevron">›</span>
          </button>
        </section>

        <p className="settings-footer">
          Your voice is personal. Your reflections belong to you.
        </p>
      </main>

      <BottomNav active="settings" onChange={onNavChange} />
    </div>
  );
}
