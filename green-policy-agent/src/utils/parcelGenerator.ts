export type LandType = 'Forest' | 'Private' | 'Government' | 'Panchayat' | 'Mining';
export type OwnershipType = 'Farmer' | 'Government' | 'Panchayat' | 'Corporation' | 'Business';

export interface GeneratedParcel {
  id: string;
  surveyNumber: string;
  village: string;
  tehsil: string;
  district: string;
  state: string;
  ownerName: string;
  landType: LandType;
  ownershipType: OwnershipType;
  areaInAcres: number;
  polygonCoordinates: [number, number][]; // [lng, lat] expected by Leaflet/GeoJSON
  environmentalRiskScore: number;
  acquisitionRiskScore: number;
  forestRightsApplicable: boolean;
  protectedZone: boolean;
  aiSummary: string;
  createdAt: string;
  updatedAt: string;
  hasConflict?: boolean; // For styling/identifying intentional overlapping
}

// 1 degree approx 111,111 meters.
// 0.001 deg is ~111m.
const BASE_WIDTH_DEG = 0.0015;
const BASE_HEIGHT_DEG = 0.0012;
const GAP_DEG = 0.0002; // Small gap between parcels

function generateRandomId(): string {
  return 'par_' + Math.random().toString(36).substr(2, 9);
}

function getRandomOwner(type: LandType): string {
  if (type === 'Private') {
    const names = ['Ramesh Sharma', 'Sunita Yadav', 'Pooja Verma', 'Mahendra Singh', 'Anjali Gupta', 'Vikram Rathore'];
    return names[Math.floor(Math.random() * names.length)];
  } else if (type === 'Government' || type === 'Forest') {
    return 'State Gov';
  } else if (type === 'Panchayat') {
    return 'Gram Panchayat';
  } else {
    return 'Mining Corp Ltd';
  }
}

export function generateParcelCluster(
  centerLat: number,
  centerLng: number,
  villageName: string,
  count: number,
  surveyPrefix: string,
  conflictCount: number = 0
): GeneratedParcel[] {
  const parcels: GeneratedParcel[] = [];
  
  // Arrange in approximately a square grid
  const cols = Math.ceil(Math.sqrt(count));
  
  let currentIdIndex = 1;
  const now = new Date().toISOString();

  // Keep track of some parcels to create conflicts later
  const targetConflictIndices: number[] = [];
  while (targetConflictIndices.length < conflictCount) {
    const r = Math.floor(Math.random() * count);
    if (!targetConflictIndices.includes(r)) targetConflictIndices.push(r);
  }

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    // Center offset so the village coordinates fall neatly in the middle of the cluster
    const rowOffset = row - (cols / 2);
    const colOffset = col - (cols / 2);

    const latBase = centerLat + rowOffset * (BASE_HEIGHT_DEG + GAP_DEG);
    const lngBase = centerLng + colOffset * (BASE_WIDTH_DEG + GAP_DEG);

    // Apply slightly irregular shape perturbations (max 10% of width)
    const perturbLat = () => (Math.random() - 0.5) * BASE_HEIGHT_DEG * 0.1;
    const perturbLng = () => (Math.random() - 0.5) * BASE_WIDTH_DEG * 0.1;

    // Corners: bottom-left, bottom-right, top-right, top-left, bottom-left (to close)
    // Remember Leaflet GeoJSON format is [lng, lat]
    const polygonCoordinates: [number, number][] = [
      [lngBase + perturbLng(), latBase + perturbLat()],
      [lngBase + BASE_WIDTH_DEG + perturbLng(), latBase + perturbLat()],
      [lngBase + BASE_WIDTH_DEG + perturbLng(), latBase + BASE_HEIGHT_DEG + perturbLat()],
      [lngBase + perturbLng(), latBase + BASE_HEIGHT_DEG + perturbLat()],
    ];
    // Close the polygon
    polygonCoordinates.push([...polygonCoordinates[0]]);

    // Determine type by location to simulate zoning
    // e.g., Top-left = Forest, Center = Panchayat/Gov, Outskirts = Private
    let landType: LandType = 'Private';
    let ownershipType: OwnershipType = 'Farmer';
    let forestApplicable = false;
    
    if (row < cols / 3 && col < cols / 3) {
      landType = 'Forest';
      ownershipType = 'Government';
      forestApplicable = true;
    } else if (row >= cols / 3 && row <= (cols * 2) / 3 && col >= cols / 3 && col <= (cols * 2) / 3) {
      // Center
      const isGov = Math.random() > 0.5;
      landType = isGov ? 'Government' : 'Panchayat';
      ownershipType = isGov ? 'Government' : 'Panchayat';
    } else if (col === cols - 1 && row === cols - 1) {
      // Bottom right corner for mining
      landType = 'Mining';
      ownershipType = 'Corporation';
    }

    // Force conflict
    const isConflict = targetConflictIndices.includes(i);
    let aiSummary = "This land is privately owned and has no active disputes or protected status.";
    if (landType === 'Forest') {
      aiSummary = "This parcel is a protected forest zone.";
    } else if (landType === 'Mining') {
      aiSummary = "Active mining lease zone.";
    }
    
    if (isConflict) {
      aiSummary = "WARNING: There is an active court dispute or boundary conflict regarding this parcel.";
    }

    // Rough area est (0.001 deg ^2 is approx 3 acres)
    const areaInAcres = parseFloat((Math.random() * 5 + 2).toFixed(2));

    const parcel: GeneratedParcel = {
      id: generateRandomId(),
      surveyNumber: `RAJ-JP-${surveyPrefix}-${currentIdIndex++}`,
      village: villageName,
      tehsil: 'Jaipur',
      district: 'Jaipur',
      state: 'Rajasthan',
      ownerName: getRandomOwner(landType),
      landType,
      ownershipType,
      areaInAcres,
      polygonCoordinates,
      environmentalRiskScore: Math.floor(Math.random() * 100),
      acquisitionRiskScore: isConflict ? 95 : Math.floor(Math.random() * 50),
      forestRightsApplicable: forestApplicable,
      protectedZone: landType === 'Forest',
      aiSummary,
      createdAt: now,
      updatedAt: now,
      hasConflict: isConflict
    };

    parcels.push(parcel);

    // If it's a conflict, generate an overlapping duplicate slightly shifted
    if (isConflict) {
      const overlapPolygon: [number, number][] = polygonCoordinates.map(([l, lt]) => [
        l + BASE_WIDTH_DEG * 0.3, // Overlap by shifting right 30%
        lt + BASE_HEIGHT_DEG * 0.3 // shift up 30%
      ]);

      const conflictParcel: GeneratedParcel = {
         ...parcel,
         id: generateRandomId(),
         surveyNumber: `RAJ-JP-${surveyPrefix}-DISP-${currentIdIndex}`,
         ownerName: 'Disputed Claimant',
         ownershipType: 'Farmer',
         landType: 'Private',
         aiSummary: "Disputed claim overlapping another parcel.",
         polygonCoordinates: overlapPolygon,
         acquisitionRiskScore: 99
      };
      parcels.push(conflictParcel);
    }
  }

  return parcels;
}
