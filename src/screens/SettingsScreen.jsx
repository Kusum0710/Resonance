
export default function SettingsScreen({ onNavChange }) {
    return (
        <div style={{ padding: 20 }}>
            <h2>Settings</h2>
            <button onClick={() => onNavChange('home')}>Back to Home</button>
        </div>
    );
}
