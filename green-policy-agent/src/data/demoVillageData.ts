/**
 * demoVillageData.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Procedurally generated 150 non-overlapping land parcels around Achrol village,
 * Jaipur district. Uses a jittered grid tessellation so polygons share edges
 * with no gaps or overlaps.
 *
 * Grid: 15 cols × 10 rows = 150 quadrilateral parcels
 * Each cell ≈ 200m × 245m (~4.9 hectares)
 * Center: 27.283°N, 75.869°E (Achrol village, real GPS)
 *
 * Zone layout:
 *   NW (r≥7, c≤3): Forest Reserve
 *   NE (r≥8, c≥12): Mining Zone
 *   S center (r≤1, c 5-10): Flood-prone area
 *   Center (r 4-6, c 6-8): Village core (Panchayat/Government)
 *   r=5 corridor: Highway (Government land)
 *   Everything else: Private agricultural
 *
 * NOTE: Demo data only — not official government records.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ═══ TYPES ═══════════════════════════════════════════════════════════════════

export type ParcelLandType = 'Private' | 'Government' | 'Panchayat' | 'Forest' | 'Mining' | 'Protected';
export type MutationStatus = 'Mutated' | 'Pending' | 'Disputed';
export type RiskLevel = 'Safe' | 'Caution' | 'High Risk';
export type Recommendation = 'Safe to Buy' | 'Caution Required' | 'Verification Needed' | 'Not Recommended';

export interface MutationRecord {
  date: string;
  from: string;
  to: string;
  type: string;
}

export interface NearbyFeature {
  feature: string;
  distance: string;
  direction: string;
}

export interface DemoParcel {
  id: string;
  khasraNo: string;
  ownerName: string;
  previousOwner: string;
  landType: ParcelLandType;
  areaHectares: number;
  areaAcres: number;
  mutationStatus: MutationStatus;
  riskLevel: RiskLevel;
  disputed: boolean;
  ulpin: string;
  floodRisk: boolean;
  protectedArea: boolean;
  nearbyRisks: string[];
  recommendation: Recommendation;
  lastSurveyDate: string;
  lastUpdateDate: string;
  mutationHistory: MutationRecord[];
  nearbyFeatures: NearbyFeature[];
  coordinates: [number, number][]; // [lng, lat][] closed ring
  row: number;
  col: number;
}

export interface DemoStep {
  parcelId: string;
  title: string;
  message: string;
  icon: string;
}

// ═══ SEEDED PRNG ═════════════════════════════════════════════════════════════

function sr(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// ═══ GRID CONFIGURATION ═════════════════════════════════════════════════════

const ROWS = 10;
const COLS = 15;
const BASE_LAT = 27.272;
const BASE_LNG = 75.854;
const CELL_LAT = 0.0022;  // ~245m
const CELL_LNG = 0.002;   // ~200m
const JITTER = 0.00032;   // ~35m max offset

export const VILLAGE_CENTER: [number, number] = [27.283, 75.869];

// ═══ NAME POOLS ══════════════════════════════════════════════════════════════

const FIRST_NAMES = [
  'Ramesh','Suresh','Mahesh','Dinesh','Rajesh','Mukesh','Mohan','Kishan',
  'Ratan','Laxman','Hanuman','Bhagwan','Jagdish','Shiv','Vikram','Govind',
  'Gopal','Omprakash','Radheshyam','Brijmohan','Prem','Deepak','Anil',
  'Sanjay','Vinod','Ashok','Sunil','Manoj','Rakesh','Prakash','Kailash',
  'Sita','Kamla','Durga','Geeta','Radha','Savitri','Lakshmi','Saroj',
  'Pushpa','Meera','Sunita','Rukma','Santosh','Shanti','Maya','Pooja',
  'Anjali','Kiran','Mamta','Renu','Parvati','Devki','Hemlata','Bimla',
];

const SURNAMES = [
  'Sharma','Gupta','Yadav','Meena','Gurjar','Rajput','Saini','Jat',
  'Verma','Singh','Kumawat','Prajapati','Choudhary','Kanwar','Tak',
  'Soni','Pareek','Kasera','Agarwal','Bairwa','Nagar','Vaishnav',
];

const GOV_OWNERS = [
  'Govt. of Rajasthan','Revenue Department','PWD Rajasthan',
  'Irrigation Department','State Forest Dept.','Education Department',
];

const MUTATION_TYPES = ['Sale','Inheritance','Gift','Court Order','Partition','Exchange'];
const SURVEY_YEARS = ['2019','2020','2021','2022','2023','2024','2025'];

// ═══ DISPUTED CELL POSITIONS ═════════════════════════════════════════════════

const DISPUTED_CELLS: [number,number][] = [
  [0,8],[2,5],[3,12],[5,9],[6,4],[7,11],[8,6],[9,8],
];

// ═══ ZONE CLASSIFICATION ═════════════════════════════════════════════════════

function getLandType(r: number, c: number): ParcelLandType {
  if ((r >= 7 && c <= 3) || (r === 6 && c <= 2)) return 'Forest';
  if (r >= 8 && c >= 12) return 'Mining';
  if (r >= 7 && r <= 9 && c === 4) return 'Protected';
  // Village center
  if (r >= 4 && r <= 6 && c >= 6 && c <= 8) {
    if (r === 5) return 'Government';
    const seed = r * 17 + c * 31;
    return sr(seed) > 0.55 ? 'Panchayat' : 'Government';
  }
  // Highway corridor
  if (r === 5 && (c === 0 || c === 2 || c === 4 || c === 10 || c === 12 || c === 14)) return 'Government';
  // Scattered government
  if ((r === 3 && c === 10) || (r === 7 && c === 10) || (r === 2 && c === 1)) return 'Government';
  // Scattered panchayat
  if ((r === 3 && c === 3) || (r === 1 && c === 7) || (r === 7 && c === 7) || (r === 2 && c === 13)) return 'Panchayat';
  return 'Private';
}

function hasFloodRisk(r: number, c: number): boolean {
  return r <= 1 && c >= 5 && c <= 10;
}

function isDisputed(r: number, c: number): boolean {
  return DISPUTED_CELLS.some(([dr,dc]) => dr === r && dc === c);
}

// ═══ NAME GENERATION ═════════════════════════════════════════════════════════

function getName(seed: number): string {
  const fi = Math.floor(sr(seed) * FIRST_NAMES.length);
  const si = Math.floor(sr(seed + 7) * SURNAMES.length);
  return `${FIRST_NAMES[fi]} ${SURNAMES[si]}`;
}

function getGovOwner(seed: number): string {
  return GOV_OWNERS[Math.floor(sr(seed) * GOV_OWNERS.length)];
}

// ═══ DISTANCE HELPERS ════════════════════════════════════════════════════════

function dist(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * 111000;
  const dLng = (lng2 - lng1) * 99000;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function formatDist(m: number): string {
  if (m < 100) return `${Math.round(m)}m`;
  if (m < 1000) return `${Math.round(m / 10) * 10}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

// Reference points for distance calculations
const REF_HIGHWAY_LAT = 27.2832;
const REF_RAILWAY = { lat1: 27.274, lng1: 75.849, lat2: 27.293, lng2: 75.893 };
const REF_STREAM_LAT = 27.274;
const REF_VILLAGE = { lat: 27.283, lng: 75.869 };
const REF_FOREST = { lat: 27.290, lng: 75.858 };
const REF_MINING = { lat: 27.291, lng: 75.881 };

function pointToLineDist(plat: number, plng: number, l1lat: number, l1lng: number, l2lat: number, l2lng: number): number {
  const A = (plat - l1lat) * 111000;
  const B = (plng - l1lng) * 99000;
  const C = (l2lat - l1lat) * 111000;
  const D = (l2lng - l1lng) * 99000;
  const lenSq = C * C + D * D;
  let t = Math.max(0, Math.min(1, (A * C + B * D) / lenSq));
  const projLat = l1lat + t * (l2lat - l1lat);
  const projLng = l1lng + t * (l2lng - l1lng);
  return dist(plat, plng, projLat, projLng);
}

function getNearbyFeatures(lat: number, lng: number): NearbyFeature[] {
  const features: NearbyFeature[] = [];
  const hwyDist = Math.abs(lat - REF_HIGHWAY_LAT) * 111000;
  features.push({ feature: 'NH-48 Highway', distance: formatDist(hwyDist), direction: lat > REF_HIGHWAY_LAT ? 'S' : 'N' });

  const railDist = pointToLineDist(lat, lng, REF_RAILWAY.lat1, REF_RAILWAY.lng1, REF_RAILWAY.lat2, REF_RAILWAY.lng2);
  features.push({ feature: 'Delhi-Jaipur Railway', distance: formatDist(railDist), direction: 'W' });

  const streamDist = Math.abs(lat - REF_STREAM_LAT) * 111000;
  if (streamDist < 1500) features.push({ feature: 'Banas Tributary', distance: formatDist(streamDist), direction: 'S' });

  const vilDist = dist(lat, lng, REF_VILLAGE.lat, REF_VILLAGE.lng);
  features.push({ feature: 'Achrol Village Center', distance: formatDist(vilDist), direction: lng < REF_VILLAGE.lng ? 'E' : 'W' });

  const forDist = dist(lat, lng, REF_FOREST.lat, REF_FOREST.lng);
  if (forDist < 2000) features.push({ feature: 'Forest Reserve', distance: formatDist(forDist), direction: 'NW' });

  const minDist = dist(lat, lng, REF_MINING.lat, REF_MINING.lng);
  if (minDist < 2000) features.push({ feature: 'Mining Zone', distance: formatDist(minDist), direction: 'NE' });

  return features.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)).slice(0, 5);
}

function getNearbyRisks(r: number, c: number, lat: number, lng: number, landType: ParcelLandType, flood: boolean, disp: boolean): string[] {
  const risks: string[] = [];
  if (disp) risks.push('Court Dispute Active');
  if (flood) risks.push('Flood Risk Zone');
  if (landType === 'Mining') risks.push('Mining Activity');
  if (landType === 'Forest' || landType === 'Protected') risks.push('Forest Restriction');
  const hwyDist = Math.abs(lat - REF_HIGHWAY_LAT) * 111000;
  if (hwyDist < 400) risks.push('Near Highway');
  const railDist = pointToLineDist(lat, lng, REF_RAILWAY.lat1, REF_RAILWAY.lng1, REF_RAILWAY.lat2, REF_RAILWAY.lng2);
  if (railDist < 500) risks.push('Near Railway');
  const forDist = dist(lat, lng, REF_FOREST.lat, REF_FOREST.lng);
  if (forDist < 800 && landType !== 'Forest') risks.push('Forest Proximity');
  return risks;
}

function getRecommendation(p: { landType: ParcelLandType; mutationStatus: MutationStatus; disputed: boolean; floodRisk: boolean; nearbyRisks: string[] }): Recommendation {
  if (p.disputed || p.landType === 'Mining') return 'Not Recommended';
  if (p.landType === 'Forest' || p.landType === 'Protected' || p.landType === 'Government') return 'Verification Needed';
  if (p.mutationStatus === 'Pending' || p.floodRisk || p.nearbyRisks.length > 2) return 'Caution Required';
  if (p.mutationStatus === 'Disputed') return 'Not Recommended';
  return 'Safe to Buy';
}

function getRiskLevel(p: { landType: ParcelLandType; mutationStatus: MutationStatus; disputed: boolean; floodRisk: boolean; nearbyRisks: string[] }): RiskLevel {
  if (p.disputed || p.landType === 'Mining' || p.mutationStatus === 'Disputed') return 'High Risk';
  if (p.floodRisk || p.mutationStatus === 'Pending' || p.landType === 'Forest' || p.nearbyRisks.length > 2) return 'Caution';
  return 'Safe';
}

// ═══ MUTATION HISTORY GENERATION ═════════════════════════════════════════════

function genMutationHistory(seed: number, currentOwner: string): MutationRecord[] {
  const count = 1 + Math.floor(sr(seed + 100) * 3);
  const records: MutationRecord[] = [];
  let prevOwner = currentOwner;
  for (let i = 0; i < count; i++) {
    const yr = 2024 - i * Math.floor(sr(seed + i * 11) * 5 + 2);
    const mo = 1 + Math.floor(sr(seed + i * 13) * 12);
    const day = 1 + Math.floor(sr(seed + i * 17) * 28);
    const fromName = getName(seed + i * 37 + 200);
    records.push({
      date: `${yr}-${String(mo).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
      from: fromName,
      to: prevOwner,
      type: MUTATION_TYPES[Math.floor(sr(seed + i * 19) * MUTATION_TYPES.length)],
    });
    prevOwner = fromName;
  }
  return records;
}

// ═══ PARCEL GENERATOR ════════════════════════════════════════════════════════

function generate(): DemoParcel[] {
  // 1. Build jittered vertex grid: (ROWS+1) × (COLS+1)
  const vx: [number, number][][] = [];
  for (let r = 0; r <= ROWS; r++) {
    vx[r] = [];
    for (let c = 0; c <= COLS; c++) {
      const baseLat = BASE_LAT + r * CELL_LAT;
      const baseLng = BASE_LNG + c * CELL_LNG;
      const isEdge = r === 0 || r === ROWS || c === 0 || c === COLS;
      const jLat = isEdge ? 0 : (sr(r * 101 + c * 7 + 1) - 0.5) * JITTER * 2;
      const jLng = isEdge ? 0 : (sr(r * 101 + c * 7 + 2) - 0.5) * JITTER * 2;
      vx[r][c] = [baseLng + jLng, baseLat + jLat];
    }
  }

  // 2. Generate parcels from grid cells
  const parcels: DemoParcel[] = [];
  let idx = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      idx++;
      const seed = r * 1000 + c * 73 + 42;
      const bl = vx[r][c];
      const br = vx[r][c + 1];
      const tr = vx[r + 1][c + 1];
      const tl = vx[r + 1][c];
      const coords: [number, number][] = [bl, br, tr, tl, bl];

      // Center of parcel
      const cLat = (bl[1] + br[1] + tr[1] + tl[1]) / 4;
      const cLng = (bl[0] + br[0] + tr[0] + tl[0]) / 4;

      const landType = getLandType(r, c);
      const flood = hasFloodRisk(r, c);
      const disp = isDisputed(r, c);

      // Khasra
      const block = Math.floor(r / 3) + 1;
      const khasraNo = `ACH/${block}/${idx}`;

      // Owner
      const ownerName = landType === 'Government' || landType === 'Forest' || landType === 'Protected'
        ? getGovOwner(seed)
        : landType === 'Panchayat'
        ? 'Gram Panchayat Achrol'
        : landType === 'Mining'
        ? (sr(seed + 5) > 0.5 ? 'Ramgarh Stone Quarry Pvt. Ltd.' : 'Rajasthan Minerals Corp.')
        : getName(seed);

      const previousOwner = landType === 'Private' ? getName(seed + 99) : ownerName;

      // Mutation
      let mutationStatus: MutationStatus = 'Mutated';
      if (disp) mutationStatus = 'Disputed';
      else if (sr(seed + 50) < 0.2) mutationStatus = 'Pending';

      // Area (vary slightly with jitter)
      const baseArea = 4.2 + (sr(seed + 22) - 0.5) * 2.0;
      const areaHectares = parseFloat(baseArea.toFixed(2));

      // Nearby risks array
      const nearbyRisks = getNearbyRisks(r, c, cLat, cLng, landType, flood, disp);
      const recommendation = getRecommendation({ landType, mutationStatus, disputed: disp, floodRisk: flood, nearbyRisks });
      const riskLevel = getRiskLevel({ landType, mutationStatus, disputed: disp, floodRisk: flood, nearbyRisks });

      // ULPIN
      const ulpin = `RJ-JP-ACH-${String(idx).padStart(6, '0')}`;

      // Survey dates
      const surveyYr = SURVEY_YEARS[Math.floor(sr(seed + 33) * SURVEY_YEARS.length)];
      const surveyMo = 1 + Math.floor(sr(seed + 34) * 12);
      const surveyDay = 1 + Math.floor(sr(seed + 35) * 28);

      // Nearby features
      const nearbyFeatures = getNearbyFeatures(cLat, cLng);

      parcels.push({
        id: `ACH-${String(idx).padStart(3, '0')}`,
        khasraNo,
        ownerName,
        previousOwner,
        landType,
        areaHectares,
        areaAcres: parseFloat((areaHectares * 2.471).toFixed(2)),
        mutationStatus,
        riskLevel,
        disputed: disp,
        ulpin,
        floodRisk: flood,
        protectedArea: landType === 'Protected' || landType === 'Forest',
        nearbyRisks,
        recommendation,
        lastSurveyDate: `${surveyYr}-${String(surveyMo).padStart(2,'0')}-${String(surveyDay).padStart(2,'0')}`,
        lastUpdateDate: `2025-${String(1 + Math.floor(sr(seed+60) * 12)).padStart(2,'0')}-${String(1 + Math.floor(sr(seed+61) * 28)).padStart(2,'0')}`,
        mutationHistory: landType === 'Private' ? genMutationHistory(seed, ownerName) : [],
        nearbyFeatures,
        coordinates: coords,
        row: r,
        col: c,
      });
    }
  }

  return parcels;
}

export const demoParcels = generate();

// ═══ PARCEL COLORS ═══════════════════════════════════════════════════════════

export const LAND_TYPE_COLORS: Record<ParcelLandType, { fill: string; border: string }> = {
  Private:    { fill: '#86efac', border: '#22c55e' },
  Government: { fill: '#93c5fd', border: '#3b82f6' },
  Panchayat:  { fill: '#fde68a', border: '#eab308' },
  Forest:     { fill: '#4ade80', border: '#16a34a' },
  Mining:     { fill: '#fb923c', border: '#ea580c' },
  Protected:  { fill: '#c4b5fd', border: '#7c3aed' },
};

export const RISK_TAG_COLORS: Record<RiskLevel, { bg: string; text: string }> = {
  'Safe':      { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  'Caution':   { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  'High Risk': { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
};

export const RECOMMENDATION_COLORS: Record<Recommendation, { bg: string; text: string }> = {
  'Safe to Buy':        { bg: 'rgba(34,197,94,0.12)', text: '#22c55e' },
  'Caution Required':   { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
  'Verification Needed':{ bg: 'rgba(59,130,246,0.12)', text: '#3b82f6' },
  'Not Recommended':    { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' },
};

// ═══ INFRASTRUCTURE GeoJSON ══════════════════════════════════════════════════

export const INFRASTRUCTURE = {
  highway: {
    name: 'NH-48 Jaipur-Delhi Highway',
    coordinates: [[75.848,27.2832],[75.856,27.2835],[75.864,27.2830],[75.872,27.2833],[75.880,27.2831],[75.888,27.2834]] as [number,number][],
  },
  villageRoad: {
    name: 'Achrol-Ramgarh Road',
    coordinates: [[75.8680,27.270],[75.8683,27.276],[75.8678,27.281],[75.8682,27.286],[75.8679,27.291],[75.8681,27.296]] as [number,number][],
  },
  secondaryRoad: {
    name: 'Achrol-Bassi Link Road',
    coordinates: [[75.856,27.278],[75.862,27.280],[75.868,27.283],[75.875,27.284],[75.882,27.282]] as [number,number][],
  },
  railway: {
    name: 'Delhi-Jaipur Railway Line',
    coordinates: [[75.849,27.274],[75.858,27.277],[75.867,27.280],[75.876,27.284],[75.885,27.289],[75.893,27.293]] as [number,number][],
  },
  stream: {
    name: 'Banas River Tributary',
    coordinates: [[75.855,27.2755],[75.860,27.2740],[75.865,27.2745],[75.870,27.2730],[75.875,27.2735],[75.880,27.2725]] as [number,number][],
  },
};

// ═══ ZONE BOUNDARIES ═════════════════════════════════════════════════════════

export const ZONE_BOUNDARIES = {
  forest: {
    name: 'Achrol Forest Reserve',
    coordinates: [[75.853,27.285],[75.863,27.285],[75.863,27.295],[75.853,27.295],[75.853,27.285]] as [number,number][],
  },
  mining: {
    name: 'Ramgarh Stone Quarry Zone',
    coordinates: [[75.877,27.289],[75.885,27.289],[75.885,27.295],[75.877,27.295],[75.877,27.289]] as [number,number][],
  },
  flood: {
    name: 'Banas Flood Plain',
    coordinates: [[75.863,27.271],[75.877,27.271],[75.877,27.277],[75.863,27.277],[75.863,27.271]] as [number,number][],
  },
};

// ═══ LANDMARKS ═══════════════════════════════════════════════════════════════

export interface Landmark {
  name: string;
  lat: number;
  lng: number;
  icon: string; // emoji
}

export const LANDMARKS: Landmark[] = [
  { name: 'Achrol Village', lat: 27.283, lng: 75.869, icon: '🏘️' },
  { name: 'Gram Panchayat', lat: 27.2845, lng: 75.870, icon: '🏛️' },
  { name: 'Primary School', lat: 27.282, lng: 75.871, icon: '🏫' },
  { name: 'Shiv Temple', lat: 27.2855, lng: 75.868, icon: '🛕' },
  { name: 'Water Tank', lat: 27.280, lng: 75.866, icon: '💧' },
  { name: 'PHC Health Center', lat: 27.281, lng: 75.873, icon: '🏥' },
  { name: 'Agri Market', lat: 27.284, lng: 75.865, icon: '🌾' },
  { name: 'Ramgarh Fort', lat: 27.291, lng: 75.880, icon: '🏰' },
  { name: 'Pond', lat: 27.279, lng: 75.862, icon: '🌊' },
];

// ═══ GUIDED DEMO STEPS ═══════════════════════════════════════════════════════

export const DEMO_STEPS: DemoStep[] = [
  { parcelId: 'ACH-083', title: 'Safe Agricultural Plot', message: 'This private farmland has clear title, completed mutations, and no nearby risks. Safe to buy.', icon: '✅' },
  { parcelId: 'ACH-008', title: 'Flood-Prone Area', message: 'Located in the Banas flood plain. Seasonal flooding risk requires special insurance.', icon: '🌊' },
  { parcelId: 'ACH-113', title: 'Forest Reserve', message: 'Protected under Forest Conservation Act 1980. Development is restricted — MoEF clearance needed.', icon: '🌲' },
  { parcelId: 'ACH-038', title: 'Pending Mutation', message: 'Ownership transfer in progress at the tehsil. Title verification recommended before purchase.', icon: '⏳' },
  { parcelId: 'ACH-139', title: 'Mining Zone', message: 'Active stone quarry operation. Environmental clearance is pending renewal — high risk.', icon: '⛏️' },
  { parcelId: 'ACH-009', title: 'Court Dispute', message: 'Active boundary dispute with adjoining plot. Court case RJ-2024-2847 is pending.', icon: '⚖️' },
];

// ═══ STATS HELPERS ═══════════════════════════════════════════════════════════

export function getParcelStats(parcels: DemoParcel[]) {
  return {
    total: parcels.length,
    private: parcels.filter(p => p.landType === 'Private').length,
    government: parcels.filter(p => p.landType === 'Government').length,
    panchayat: parcels.filter(p => p.landType === 'Panchayat').length,
    forest: parcels.filter(p => p.landType === 'Forest' || p.landType === 'Protected').length,
    mining: parcels.filter(p => p.landType === 'Mining').length,
    disputed: parcels.filter(p => p.disputed).length,
    safe: parcels.filter(p => p.riskLevel === 'Safe').length,
    pendingMutation: parcels.filter(p => p.mutationStatus === 'Pending').length,
    floodRisk: parcels.filter(p => p.floodRisk).length,
  };
}
