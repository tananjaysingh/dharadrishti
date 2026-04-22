/**
 * layerConfig.ts
 * Simplified layer visibility config — checkbox-only, no opacity sliders.
 * Grouped into Ownership, Risk, Infrastructure categories for the sidebar.
 */

export interface LayerVisibility {
  // Ownership
  privateLand: boolean;
  governmentLand: boolean;
  panchayatLand: boolean;
  forestLand: boolean;
  // Risk / Zones
  miningZone: boolean;
  protectedArea: boolean;
  courtDispute: boolean;
  floodRisk: boolean;
  // Infrastructure
  highway: boolean;
  roads: boolean;
  railway: boolean;
  stream: boolean;
  // Labels
  landmarks: boolean;
  zoneBoundaries: boolean;
}

export const DEFAULT_LAYER_VISIBILITY: LayerVisibility = {
  privateLand: true,
  governmentLand: true,
  panchayatLand: true,
  forestLand: true,
  miningZone: true,
  protectedArea: true,
  courtDispute: true,
  floodRisk: true,
  highway: true,
  roads: true,
  railway: true,
  stream: true,
  landmarks: true,
  zoneBoundaries: true,
};

export interface LayerGroup {
  title: string;
  emoji: string;
  keys: { key: keyof LayerVisibility; label: string; color: string }[];
}

export const LAYER_GROUPS: LayerGroup[] = [
  {
    title: 'Ownership Type',
    emoji: '🏠',
    keys: [
      { key: 'privateLand', label: 'Private Land', color: '#86efac' },
      { key: 'governmentLand', label: 'Government Land', color: '#93c5fd' },
      { key: 'panchayatLand', label: 'Panchayat Land', color: '#fde68a' },
      { key: 'forestLand', label: 'Forest Land', color: '#4ade80' },
    ],
  },
  {
    title: 'Risk Layers',
    emoji: '⚠️',
    keys: [
      { key: 'miningZone', label: 'Mining Zone', color: '#fb923c' },
      { key: 'protectedArea', label: 'Protected Area', color: '#c4b5fd' },
      { key: 'courtDispute', label: 'Court Dispute', color: '#fca5a5' },
      { key: 'floodRisk', label: 'Flood Risk', color: '#67e8f9' },
    ],
  },
  {
    title: 'Infrastructure',
    emoji: '🛤️',
    keys: [
      { key: 'highway', label: 'Highway', color: '#f97316' },
      { key: 'roads', label: 'Village Roads', color: '#a1a1aa' },
      { key: 'railway', label: 'Railway Line', color: '#e879f9' },
      { key: 'stream', label: 'Water Bodies', color: '#22d3ee' },
    ],
  },
];
