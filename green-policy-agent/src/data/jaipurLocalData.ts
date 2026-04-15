/**
 * jaipurLocalData.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Realistic (fake) land parcel data for Achrol village, Jaipur district,
 * Rajasthan. Used for the "Jaipur Local View" mode in DharaDrishti.
 *
 * NOTE: Demo only — uses sample data for hackathon purposes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type OwnerType = 'Private' | 'Forest' | 'Panchayat' | 'Government';
export type LandType = 'Agricultural' | 'Forest' | 'Wasteland' | 'Residential' | 'Commercial';
export type DisputeStatus = 'Clear' | 'Disputed' | 'Under Review';
export type EnvRisk = 'Low' | 'Medium' | 'High';

export interface JaipurParcel {
  id: string;
  khasraNo: string;
  ownerName: string;
  ownerType: OwnerType;
  landType: LandType;
  areaHectares: number;
  disputeStatus: DisputeStatus;
  envRisk: EnvRisk;
  lastUpdated?: number; // Date.now() timestamp, set at runtime
  /** [lng, lat][] polygon ring – small realistic parcels around Achrol */
  polygonCoordinates: [number, number][];
}

// Achrol village center: approx 27.283°N, 75.869°E (real GPS)
// Each polygon is a small rectangle / quadrilateral ~ 30–80m across

export const ACHROL_CENTER: [number, number] = [27.283, 75.869];

const baseData: Omit<JaipurParcel, 'lastUpdated'>[] = [
  {
    id: 'ACH-001',
    khasraNo: '112/1',
    ownerName: 'Ramswaroop Sharma',
    ownerType: 'Private',
    landType: 'Agricultural',
    areaHectares: 1.2,
    disputeStatus: 'Clear',
    envRisk: 'Low',
    polygonCoordinates: [
      [75.8671, 27.2848],
      [75.8676, 27.2848],
      [75.8676, 27.2844],
      [75.8671, 27.2844],
      [75.8671, 27.2848],
    ],
  },
  {
    id: 'ACH-002',
    khasraNo: '112/2',
    ownerName: 'Sita Devi Meena',
    ownerType: 'Private',
    landType: 'Agricultural',
    areaHectares: 0.85,
    disputeStatus: 'Disputed',
    envRisk: 'Medium',
    polygonCoordinates: [
      [75.8676, 27.2848],
      [75.8681, 27.2848],
      [75.8681, 27.2844],
      [75.8676, 27.2844],
      [75.8676, 27.2848],
    ],
  },
  {
    id: 'ACH-003',
    khasraNo: '115/A',
    ownerName: 'Gram Panchayat Achrol',
    ownerType: 'Panchayat',
    landType: 'Wasteland',
    areaHectares: 2.5,
    disputeStatus: 'Clear',
    envRisk: 'Low',
    polygonCoordinates: [
      [75.8681, 27.2851],
      [75.8688, 27.2851],
      [75.8688, 27.2845],
      [75.8681, 27.2845],
      [75.8681, 27.2851],
    ],
  },
  {
    id: 'ACH-004',
    khasraNo: '118/3',
    ownerName: 'Mohan Lal Gurjar',
    ownerType: 'Private',
    landType: 'Residential',
    areaHectares: 0.3,
    disputeStatus: 'Under Review',
    envRisk: 'Low',
    polygonCoordinates: [
      [75.8662, 27.2840],
      [75.8667, 27.2840],
      [75.8667, 27.2837],
      [75.8662, 27.2837],
      [75.8662, 27.2840],
    ],
  },
  {
    id: 'ACH-005',
    khasraNo: '123/4',
    ownerName: 'Rajasthan Forest Dept.',
    ownerType: 'Forest',
    landType: 'Forest',
    areaHectares: 4.1,
    disputeStatus: 'Disputed',
    envRisk: 'High',
    polygonCoordinates: [
      [75.8690, 27.2858],
      [75.8700, 27.2858],
      [75.8700, 27.2850],
      [75.8690, 27.2850],
      [75.8690, 27.2858],
    ],
  },
  {
    id: 'ACH-006',
    khasraNo: '125/B',
    ownerName: 'Sunita Kumari Jat',
    ownerType: 'Private',
    landType: 'Agricultural',
    areaHectares: 1.6,
    disputeStatus: 'Clear',
    envRisk: 'Low',
    polygonCoordinates: [
      [75.8671, 27.2837],
      [75.8678, 27.2837],
      [75.8678, 27.2832],
      [75.8671, 27.2832],
      [75.8671, 27.2837],
    ],
  },
  {
    id: 'ACH-007',
    khasraNo: '130/1',
    ownerName: 'Rajiv Nath Saini',
    ownerType: 'Private',
    landType: 'Commercial',
    areaHectares: 0.45,
    disputeStatus: 'Under Review',
    envRisk: 'Medium',
    polygonCoordinates: [
      [75.8660, 27.2850],
      [75.8665, 27.2850],
      [75.8665, 27.2846],
      [75.8660, 27.2846],
      [75.8660, 27.2850],
    ],
  },
  {
    id: 'ACH-008',
    khasraNo: '131/2',
    ownerName: 'Govt. of Rajasthan',
    ownerType: 'Government',
    landType: 'Wasteland',
    areaHectares: 3.2,
    disputeStatus: 'Clear',
    envRisk: 'Medium',
    polygonCoordinates: [
      [75.8678, 27.2837],
      [75.8688, 27.2837],
      [75.8688, 27.2830],
      [75.8678, 27.2830],
      [75.8678, 27.2837],
    ],
  },
  {
    id: 'ACH-009',
    khasraNo: '145/6',
    ownerName: 'Devkaran Singh Rajput',
    ownerType: 'Private',
    landType: 'Agricultural',
    areaHectares: 2.0,
    disputeStatus: 'Disputed',
    envRisk: 'High',
    polygonCoordinates: [
      [75.8688, 27.2845],
      [75.8695, 27.2845],
      [75.8695, 27.2838],
      [75.8688, 27.2838],
      [75.8688, 27.2845],
    ],
  },
  {
    id: 'ACH-010',
    khasraNo: '148/A',
    ownerName: 'Gram Panchayat Achrol',
    ownerType: 'Panchayat',
    landType: 'Agricultural',
    areaHectares: 1.8,
    disputeStatus: 'Clear',
    envRisk: 'Low',
    polygonCoordinates: [
      [75.8700, 27.2858],
      [75.8708, 27.2858],
      [75.8708, 27.2850],
      [75.8700, 27.2850],
      [75.8700, 27.2858],
    ],
  },
];

// Attach initial lastUpdated timestamps
export const jaipurLocalParcels: JaipurParcel[] = baseData.map((p) => ({
  ...p,
  lastUpdated: Date.now(),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

export const ENV_RISK_COLOR: Record<EnvRisk, string> = {
  Low: '#10b981',    // green
  Medium: '#f59e0b', // amber
  High: '#ef4444',   // red
};

export const OWNER_TYPE_COLOR: Record<OwnerType, string> = {
  Private: '#a8a29e',    // stone
  Forest: '#10b981',     // emerald
  Panchayat: '#eab308',  // yellow
  Government: '#3b82f6', // blue
};

export const DISPUTE_COLOR: Record<DisputeStatus, string> = {
  Clear: '#10b981',
  Disputed: '#ef4444',
  'Under Review': '#f59e0b',
};

/** Cycle envRisk up one level (Low → Medium → High → Low) */
export function bumpRisk(risk: EnvRisk): EnvRisk {
  if (risk === 'Low') return 'Medium';
  if (risk === 'Medium') return 'High';
  return 'Low';
}

/** Cycle disputeStatus */
export function cycleDispute(status: DisputeStatus): DisputeStatus {
  if (status === 'Clear') return 'Under Review';
  if (status === 'Under Review') return 'Disputed';
  return 'Clear';
}
