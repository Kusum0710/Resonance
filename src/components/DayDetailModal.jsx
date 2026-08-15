
export default function DayDetailModal({ session, onClose }) {
    if (!session) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: 20, borderRadius: 12, minWidth: 300 }}>
                <h2>Session Details</h2>
                <p><strong>Biome:</strong> {session.palette}</p>
                <p><strong>Duration:</strong> {session.duration}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}
