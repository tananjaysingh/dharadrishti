/**
 * layerConfig.ts
 * Shared layer configuration constants — safe for both server and client.
 * Keeping these separate from MapViewer.tsx avoids SSR "window is not defined" errors.
 */

export interface LayerVisibility {
  // Ownership-based parcel layers
  privateLand: boolean;
  governmentLand: boolean;
  panchayatLand: boolean;
  forestLand: boolean;
  // Overlay / zone layers
  miningZone: boolean;
  protectedArea: boolean;
  courtDispute: boolean;
  floodRisk: boolean;
  // Infrastructure layers
  highways: boolean;
  railways: boolean;
  // Label layer
  villageLabels: boolean;
}

export interface LayerOpacity {
  privateLand: number;
  governmentLand: number;
  panchayatLand: number;
  forestLand: number;
  miningZone: number;
  protectedArea: number;
  courtDispute: number;
  floodRisk: number;
  highways: number;
  railways: number;
  villageLabels: number;
}

export const DEFAULT_LAYER_VISIBILITY: LayerVisibility = {
  privateLand: true,
  governmentLand: true,
  panchayatLand: true,
  forestLand: true,
  miningZone: true,
  protectedArea: true,
  courtDispute: true,
  floodRisk: false,
  highways: false,
  railways: false,
  villageLabels: true,
};

export const DEFAULT_LAYER_OPACITY: LayerOpacity = {
  privateLand: 0.40,
  governmentLand: 0.40,
  panchayatLand: 0.40,
  forestLand: 0.45,
  miningZone: 0.45,
  protectedArea: 0.40,
  courtDispute: 0.55,
  floodRisk: 0.30,
  highways: 0.60,
  railways: 0.60,
  villageLabels: 1.0,
};
