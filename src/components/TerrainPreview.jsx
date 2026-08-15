// Decorative terrain illustration used for larger previews (home screen's
// "last terrain" card, and later the gallery/day-detail view).

import { getBiome } from '../lib/biomes';

function jaggedPath(seed, baseline, amplitude, width, height) {
  // Deterministic pseudo-random jagged ridge so the same biome always
  // renders the same silhouette.
  let points = [`0,${height}`];
  const steps = 10;
  let rand = seed;
  for (let i = 0; i <= steps; i++) {
    rand = (rand * 9301 + 49297) % 233280;
    const noise = rand / 233280;
    const x = (width / steps) * i;
    const y = baseline - noise * amplitude - Math.sin(i * 1.3 + seed) * (amplitude * 0.3);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  points.push(`${width},${height}`);
  return `M${points.join(' L')} Z`;
}

export default function TerrainPreview({ palette = 'mountain-range', className = '' }) {
  const p = getBiome(palette);
  const width = 400;
  const height = 220;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${p.label} terrain preview`}
    >
      <defs>
        <linearGradient id={`sky-${palette}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="100%" stopColor={p.sky[1]} />
        </linearGradient>
        <radialGradient id={`sun-${palette}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={p.sun} />
          <stop offset="100%" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={width} height={height} fill={`url(#sky-${palette})`} />
      <circle cx={width * 0.78} cy={height * 0.28} r="70" fill={`url(#sun-${palette})`} />
      <circle cx={width * 0.78} cy={height * 0.28} r="16" fill={p.sun} opacity="0.85" />

      {p.layers.map((color, i) => {
        const baseline = height * (0.55 + i * 0.13);
        const amplitude = 55 - i * 8;
        return (
          <path
            key={color}
            d={jaggedPath(i * 7 + 3, baseline, amplitude, width, height)}
            fill={color}
          />
        );
      })}
    </svg>
  );
}