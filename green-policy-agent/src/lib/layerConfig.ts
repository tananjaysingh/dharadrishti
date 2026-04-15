/**
 * layerConfig.ts
 * Shared layer configuration constants — safe for both server and client.
 * Keeping these separate from MapViewer.tsx avoids SSR "window is not defined" errors.
 */

export interface LayerVisibility {
  parcels: boolean;
  riskZones: boolean;
  forestCover: boolean;
  highways: boolean;
  villageLabels: boolean;
}

export interface LayerOpacity {
  parcels: number;
  riskZones: number;
  forestCover: number;
  highways: number;
  villageLabels: number;
}

export const DEFAULT_LAYER_VISIBILITY: LayerVisibility = {
  parcels: true,
  riskZones: true,
  forestCover: true,
  highways: false,
  villageLabels: true,
};

export const DEFAULT_LAYER_OPACITY: LayerOpacity = {
  parcels: 0.75,
  riskZones: 0.75,
  forestCover: 0.75,
  highways: 0.75,
  villageLabels: 1.0,
};
