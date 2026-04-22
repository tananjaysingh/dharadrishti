/**
 * jaipurParcels.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Hand-crafted, non-overlapping GeoJSON parcel data for the DharaDrishti
 * normal-mode map. Polygons are realistically spread across Jaipur district
 * (Amer, Chomu, Sambhar, Bassi, Shahpura, Phulera, Kotputli areas).
 *
 * Design rules:
 *   - Each parcel is 200–900m across (realistic agricultural / zone sizes)
 *   - No polygon coordinates overlap — each sits in a distinct geographic area
 *   - 12–15 parcels total, covering diverse land categories
 *   - 2–3 intentional dispute parcels for demo purposes
 *
 * NOTE: Demo data only — not official government records.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type ParcelLandType =
  | 'Private'
  | 'Government'
  | 'Panchayat'
  | 'Forest'
  | 'Mining';

export type MutationStatus = 'Mutated' | 'Pending' | 'Disputed';
export type DisputeStatus = 'Clear' | 'Disputed' | 'Under Review';

export interface JaipurStaticParcel {
  id: string;
  khasraNo: string;
  ownerName: string;
  landType: ParcelLandType;
  village: string;
  district: string;
  areaAcres: number;
  riskScore: number; // 0–100
  mutationStatus: MutationStatus;
  disputeStatus: DisputeStatus;
  floodRisk: boolean;
  protectedArea: boolean;
  aiSummary: string;
  /** GeoJSON polygon ring: [lng, lat][] — closed (first = last) */
  coordinates: [number, number][];
}

// ─── Parcel Dataset ──────────────────────────────────────────────────────────
// Each "block" of coordinates is positioned in a different geographic sub-area
// of Jaipur district, so polygons never overlap on the map.

export const jaipurStaticParcels: JaipurStaticParcel[] = [
  // ── 1. AMER AREA — Private Agricultural ──────────────────────────────────
  {
    id: 'JAI-001',
    khasraNo: 'AM-421/1',
    ownerName: 'Ramesh Chand Sharma',
    landType: 'Private',
    village: 'Amer',
    district: 'Jaipur',
    areaAcres: 3.80,
    riskScore: 18,
    mutationStatus: 'Mutated',
    disputeStatus: 'Clear',
    floodRisk: false,
    protectedArea: false,
    aiSummary: 'Clear title, no encumbrances. Standard agricultural land suitable for acquisition.',
    coordinates: [
      [75.856, 26.996],
      [75.866, 26.996],
      [75.866, 26.989],
      [75.856, 26.989],
      [75.856, 26.996],
    ],
  },

  // ── 2. AMER AREA — Panchayat Land ────────────────────────────────────────
  {
    id: 'JAI-002',
    khasraNo: 'AM-422/B',
    ownerName: 'Gram Panchayat Amer',
    landType: 'Panchayat',
    village: 'Amer',
    district: 'Jaipur',
    areaAcres: 5.20,
    riskScore: 22,
    mutationStatus: 'Mutated',
    disputeStatus: 'Clear',
    floodRisk: false,
    protectedArea: false,
    aiSummary: 'Community-owned land, used for grazing and seasonal farming.',
    coordinates: [
      [75.869, 26.993],
      [75.882, 26.993],
      [75.882, 26.984],
      [75.869, 26.984],
      [75.869, 26.993],
    ],
  },

  // ── 3. AMER AREA — Forest Land ───────────────────────────────────────────
  {
    id: 'JAI-003',
    khasraNo: 'AM-056/F',
    ownerName: 'Rajasthan Forest Department',
    landType: 'Forest',
    village: 'Amer',
    district: 'Jaipur',
    areaAcres: 12.40,
    riskScore: 72,
    mutationStatus: 'Mutated',
    disputeStatus: 'Under Review',
    floodRisk: false,
    protectedArea: true,
    aiSummary: 'Protected forest zone. Any development requires MoEF clearance. High restriction.',
    coordinates: [
      [75.840, 27.003],
      [75.856, 27.003],
      [75.856, 26.993],
      [75.840, 26.993],
      [75.840, 27.003],
    ],
  },

  // ── 4. CHOMU AREA — Private Agricultural ─────────────────────────────────
  {
    id: 'JAI-004',
    khasraNo: 'CH-318/2',
    ownerName: 'Sunita Devi Yadav',
    landType: 'Private',
    village: 'Chomu',
    district: 'Jaipur',
    areaAcres: 2.60,
    riskScore: 14,
    mutationStatus: 'Mutated',
    disputeStatus: 'Clear',
    floodRisk: false,
    protectedArea: false,
    aiSummary: 'Low-risk private plot. Clean title with no pending mutations.',
    coordinates: [
      [75.710, 27.175],
      [75.723, 27.175],
      [75.723, 27.166],
      [75.710, 27.166],
      [75.710, 27.175],
    ],
  },

  // ── 5. CHOMU AREA — Government Land ──────────────────────────────────────
  {
    id: 'JAI-005',
    khasraNo: 'CH-010/G',
    ownerName: 'Govt. of Rajasthan',
    landType: 'Government',
    village: 'Chomu',
    district: 'Jaipur',
    areaAcres: 8.10,
    riskScore: 10,
    mutationStatus: 'Mutated',
    disputeStatus: 'Clear',
    floodRisk: false,
    protectedArea: false,
    aiSummary: 'State-owned land reserved for public infrastructure development.',
    coordinates: [
      [75.727, 27.180],
      [75.743, 27.180],
      [75.743, 27.170],
      [75.727, 27.170],
      [75.727, 27.180],
    ],
  },

  // ── 6. SAMBHAR AREA — Mining Zone ────────────────────────────────────────
  {
    id: 'JAI-006',
    khasraNo: 'SM-789/M',
    ownerName: 'Sambhar Minerals Pvt. Ltd.',
    landType: 'Mining',
    village: 'Sambhar',
    district: 'Jaipur',
    areaAcres: 16.80,
    riskScore: 88,
    mutationStatus: 'Pending',
    disputeStatus: 'Disputed',
    floodRisk: false,
    protectedArea: false,
    aiSummary: 'Active mining lease zone. High environmental risk — salt extraction operation. Court dispute pending.',
    coordinates: [
      [75.185, 26.916],
      [75.205, 26.916],
      [75.205, 26.903],
      [75.185, 26.903],
      [75.185, 26.916],
    ],
  },

  // ── 7. SAMBHAR AREA — Forest / Protected ─────────────────────────────────
  {
    id: 'JAI-007',
    khasraNo: 'SM-112/P',
    ownerName: 'Rajasthan Forest Department',
    landType: 'Forest',
    village: 'Sambhar',
    district: 'Jaipur',
    areaAcres: 9.30,
    riskScore: 65,
    mutationStatus: 'Mutated',
    disputeStatus: 'Clear',
    floodRisk: true,
    protectedArea: true,
    aiSummary: 'Wetland fringe zone near Sambhar Salt Lake. Seasonal flood risk. Wildlife buffer area.',
    coordinates: [
      [75.210, 26.922],
      [75.228, 26.922],
      [75.228, 26.910],
      [75.210, 26.910],
      [75.210, 26.922],
    ],
  },

  // ── 8. BASSI AREA — Private (Disputed) ───────────────────────────────────
  {
    id: 'JAI-008',
    khasraNo: 'BS-504/1A',
    ownerName: 'Mohan Singh Rajput',
    landType: 'Private',
    village: 'Bassi',
    district: 'Jaipur',
    areaAcres: 4.10,
    riskScore: 78,
    mutationStatus: 'Disputed',
    disputeStatus: 'Disputed',
    floodRisk: false,
    protectedArea: false,
    aiSummary: 'Active boundary dispute with adjacent plot BS-504/1B. High acquisition risk. Court case #RJ-2023-1847.',
    coordinates: [
      [76.041, 26.847],
      [76.054, 26.847],
      [76.054, 26.838],
      [76.041, 26.838],
      [76.041, 26.847],
    ],
  },

  // ── 9. BASSI AREA — Panchayat ────────────────────────────────────────────
  {
    id: 'JAI-009',
    khasraNo: 'BS-207/GP',
    ownerName: 'Gram Panchayat Bassi',
    landType: 'Panchayat',
    village: 'Bassi',
    district: 'Jaipur',
    areaAcres: 6.55,
    riskScore: 20,
    mutationStatus: 'Mutated',
    disputeStatus: 'Clear',
    floodRisk: false,
    protectedArea: false,
    aiSummary: 'Panchayat grazing land with regular usage rights. No disputes.',
    coordinates: [
      [76.057, 26.845],
      [76.072, 26.845],
      [76.072, 26.836],
      [76.057, 26.836],
      [76.057, 26.845],
    ],
  },

  // ── 10. SHAHPURA AREA — Private Agricultural ──────────────────────────────
  {
    id: 'JAI-010',
    khasraNo: 'SH-663/3',
    ownerName: 'Anjali Kumari Gupta',
    landType: 'Private',
    village: 'Shahpura',
    district: 'Jaipur',
    areaAcres: 3.20,
    riskScore: 12,
    mutationStatus: 'Mutated',
    disputeStatus: 'Clear',
    floodRisk: false,
    protectedArea: false,
    aiSummary: 'Clean title, recently mutated. No environmental concerns.',
    coordinates: [
      [75.952, 27.388],
      [75.965, 27.388],
      [75.965, 27.379],
      [75.952, 27.379],
      [75.952, 27.388],
    ],
  },

  // ── 11. SHAHPURA AREA — Government ────────────────────────────────────────
  {
    id: 'JAI-011',
    khasraNo: 'SH-001/G',
    ownerName: 'Govt. of Rajasthan (PWD)',
    landType: 'Government',
    village: 'Shahpura',
    district: 'Jaipur',
    areaAcres: 7.80,
    riskScore: 8,
    mutationStatus: 'Mutated',
    disputeStatus: 'Clear',
    floodRisk: false,
    protectedArea: false,
    aiSummary: 'PWD land earmarked for road widening project.',
    coordinates: [
      [75.967, 27.392],
      [75.982, 27.392],
      [75.982, 27.382],
      [75.967, 27.382],
      [75.967, 27.392],
    ],
  },

  // ── 12. PHULERA AREA — Private (Under Review) ─────────────────────────────
  {
    id: 'JAI-012',
    khasraNo: 'PH-145/2',
    ownerName: 'Vikram Singh Rathore',
    landType: 'Private',
    village: 'Phulera',
    district: 'Jaipur',
    areaAcres: 2.90,
    riskScore: 44,
    mutationStatus: 'Pending',
    disputeStatus: 'Under Review',
    floodRisk: false,
    protectedArea: false,
    aiSummary: 'Mutation pending at tehsil office. Ownership transfer in progress — medium risk.',
    coordinates: [
      [75.235, 26.881],
      [75.248, 26.881],
      [75.248, 26.872],
      [75.235, 26.872],
      [75.235, 26.881],
    ],
  },

  // ── 13. KOTPUTLI AREA — Forest ────────────────────────────────────────────
  {
    id: 'JAI-013',
    khasraNo: 'KO-032/F',
    ownerName: 'Rajasthan Forest Department',
    landType: 'Forest',
    village: 'Kotputli',
    district: 'Jaipur',
    areaAcres: 18.50,
    riskScore: 55,
    mutationStatus: 'Mutated',
    disputeStatus: 'Clear',
    floodRisk: false,
    protectedArea: true,
    aiSummary: 'Aravalli Range fringe forest. Protected under Forest Conservation Act 1980.',
    coordinates: [
      [76.190, 27.710],
      [76.215, 27.710],
      [76.215, 27.697],
      [76.190, 27.697],
      [76.190, 27.710],
    ],
  },

  // ── 14. JAMWA RAMGARH AREA — Mining Zone ─────────────────────────────────
  {
    id: 'JAI-014',
    khasraNo: 'JR-881/M',
    ownerName: 'Stone Quarry Corp Rajasthan',
    landType: 'Mining',
    village: 'Jamwa Ramgarh',
    district: 'Jaipur',
    areaAcres: 11.20,
    riskScore: 82,
    mutationStatus: 'Pending',
    disputeStatus: 'Disputed',
    floodRisk: false,
    protectedArea: false,
    aiSummary: 'Stone quarry operating zone. Environmental clearance renewal overdue. High risk.',
    coordinates: [
      [76.015, 27.026],
      [76.032, 27.026],
      [76.032, 27.015],
      [76.015, 27.015],
      [76.015, 27.026],
    ],
  },

  // ── 15. VIRATNAGAR AREA — Government + Flood Risk ─────────────────────────
  {
    id: 'JAI-015',
    khasraNo: 'VI-203/G',
    ownerName: 'Govt. of Rajasthan (Irrigation)',
    landType: 'Government',
    village: 'Viratnagar',
    district: 'Jaipur',
    areaAcres: 9.70,
    riskScore: 38,
    mutationStatus: 'Mutated',
    disputeStatus: 'Clear',
    floodRisk: true,
    protectedArea: false,
    aiSummary: 'Seasonal flood-prone land near Banas River catchment. Irrigation department mandate.',
    coordinates: [
      [76.178, 27.452],
      [76.196, 27.452],
      [76.196, 27.441],
      [76.178, 27.441],
      [76.178, 27.452],
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const PARCEL_FILL_COLOR: Record<ParcelLandType, string> = {
  Private: '#86efac',    // soft green
  Government: '#93c5fd', // soft blue
  Panchayat: '#fde68a',  // soft yellow
  Forest: '#4ade80',     // medium green
  Mining: '#fb923c',     // soft orange
};

export const PARCEL_BORDER_COLOR: Record<ParcelLandType, string> = {
  Private: '#22c55e',
  Government: '#3b82f6',
  Panchayat: '#eab308',
  Forest: '#16a34a',
  Mining: '#ea580c',
};

export const MUTATION_BADGE: Record<MutationStatus, { bg: string; text: string }> = {
  Mutated: { bg: '#dcfce7', text: '#15803d' },
  Pending: { bg: '#fef9c3', text: '#92400e' },
  Disputed: { bg: '#fee2e2', text: '#dc2626' },
};

export const DISPUTE_COLOR: Record<DisputeStatus, string> = {
  Clear: '#22c55e',
  Disputed: '#ef4444',
  'Under Review': '#f59e0b',
};
