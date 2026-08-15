// Small abstract stand-in for a terrain, used in list rows where a full
// illustration would be too busy. Two flat bands in the biome's tones.

import { getBiome } from '../lib/biomes';
import './TerrainSwatch.css';

export default function TerrainSwatch({ palette = 'mountain-range', className = '' }) {
  const p = getBiome(palette);

  return (
    <div
      className={`terrain-swatch ${className}`}
      role="img"
      aria-label={`${p.label} terrain swatch`}
    >
      <span className="terrain-swatch__band" style={{ background: p.swatch[0] }} />
      <span className="terrain-swatch__band terrain-swatch__band--lower" style={{ background: p.swatch[1] }} />
    </div>
  );
}