import { useState } from 'react';
import { MicIcon, ChevronRightIcon } from '../components/icons';
import TerrainPreview from '../components/TerrainPreview';
import BottomNav from '../components/BottomNav';
import './HomeScreen.css';

function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning.';
  if (hour < 18) return 'Good afternoon.';
  return 'Good evening.';
}

// Placeholder until the gallery/history feature is wired up to real sessions.
const lastTerrain = {
  palette: 'mountain-range',
  label: 'Mountain Range',
  timeAgo: 'Yesterday',
};

export default function HomeScreen({ onStartTalking = () => {}, onNavChange = () => {} }) {
  const [pressed, setPressed] = useState(false);

  return (
    <div className="home-screen">
      <header className="home-header">
        <p className="eyebrow">Voice Terrain</p>
        <h1 className="greeting">
          {getGreeting()}
          <br />
          How was your day?
        </h1>
        <p className="subtext">You don't have to find the right words. Any words are fine.</p>
      </header>

      <div className="record-section">
        <button
          type="button"
          className={`record-button${pressed ? ' record-button--pressed' : ''}`}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onClick={onStartTalking}
          aria-label="Start talking"
        >
          <span className="record-button__ring record-button__ring--outer" />
          <span className="record-button__ring record-button__ring--inner" />
          <span className="record-button__core">
            <MicIcon />
            <span className="record-button__label">Start talking</span>
          </span>
        </button>
        <p className="record-caption">Nothing leaves your device. Humming counts.</p>
      </div>

      <section className="last-terrain">
        <div className="section-heading">
          <h2>Last terrain</h2>
          <button type="button" className="see-all" onClick={() => onNavChange('reflections')}>
            See all
            <ChevronRightIcon />
          </button>
        </div>

        <button type="button" className="terrain-card" onClick={() => onNavChange('reflections')}>
          <TerrainPreview palette={lastTerrain.palette} className="terrain-card__art" />
          <span className="terrain-card__meta">
            <span className="terrain-card__label">{lastTerrain.label}</span>
            <span className="terrain-card__time">{lastTerrain.timeAgo}</span>
          </span>
        </button>
      </section>

      <BottomNav active="home" onChange={onNavChange} />
    </div>
  );
}