// Single source of truth for biome visuals. Add a new biome here and it
// becomes available everywhere: home screen preview art, timeline swatches,
// and badge colors.

export const BIOMES = {
  'mountain-range': {
    label: 'Mountain Range',
    sky: ['#fbdcd2', '#f7c3b6'],
    sun: 'rgba(255, 246, 235, 0.9)',
    layers: ['#e8a091', '#dd7f72', '#c85f55', '#a8443d'],
    swatch: ['#eec5ae', '#c96b56'],
    badgeBg: '#faecd3',
    badgeText: '#8a6a1f',
  },
  meadow: {
    label: 'Meadow',
    sky: ['#dfeee0', '#c9e4cd'],
    sun: 'rgba(255, 255, 245, 0.9)',
    layers: ['#a9d0ab', '#87bd8f', '#5fa470', '#3f8557'],
    swatch: ['#bfe0c4', '#5c9d6c'],
    badgeBg: '#e1f2e4',
    badgeText: '#2f7a45',
  },
  'gray-plateau': {
    label: 'Gray Plateau',
    sky: ['#e4e3e1', '#d3d2cf'],
    sun: 'rgba(255, 255, 255, 0.6)',
    layers: ['#b9b7b2', '#a3a19b', '#8b8983', '#6f6d68'],
    swatch: ['#c9c7c1', '#84827b'],
    badgeBg: '#eceae5',
    badgeText: '#6b6960',
  },
  thunderstorm: {
    label: 'Thunderstorm',
    sky: ['#dfe1f2', '#c7cbea'],
    sun: 'rgba(230, 230, 255, 0.6)',
    layers: ['#a8adde', '#8489cf', '#5f63b8', '#454999'],
    swatch: ['#b7bbe6', '#585dab'],
    badgeBg: '#e7e8f8',
    badgeText: '#4b4faf',
  },
  volcanic: {
    label: 'Volcanic',
    sky: ['#f3d9d6', '#eab7b2'],
    sun: 'rgba(255, 230, 220, 0.6)',
    layers: ['#e08b81', '#d15f52', '#b23d33', '#862822'],
    swatch: ['#efb2ab', '#c23f36'],
    badgeBg: '#fbe6e5',
    badgeText: '#a3352c',
  },
};

export function getBiome(key) {
  return BIOMES[key] || BIOMES['mountain-range'];
}