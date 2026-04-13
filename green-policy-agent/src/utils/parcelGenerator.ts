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
  hasConflict?: boolean;
}

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

// -------------------------------------------------------------
// GEOMETRY & COLLISION UTILITIES
// -------------------------------------------------------------

type Point = [number, number];

// Standard CCW check for line segment intersection
function ccw(A: Point, B: Point, C: Point) {
    return (C[1]-A[1]) * (B[0]-A[0]) > (B[1]-A[1]) * (C[0]-A[0]);
}

// Check if line segment AB intersects segment CD
function lineIntersect(A: Point, B: Point, C: Point, D: Point) {
    return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
}

// Ray-casting point in polygon
function isPointInPolygon(point: Point, vs: Point[]) {
    let x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i][0], yi = vs[i][1];
        let xj = vs[j][0], yj = vs[j][1];
        let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// AABB Box intersection as pre-check
function getBoundingBox(poly: Point[]) {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of poly) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }
    return { minX, minY, maxX, maxY };
}

function boxesIntersect(b1: ReturnType<typeof getBoundingBox>, b2: ReturnType<typeof getBoundingBox>) {
    return !(b2.minX > b1.maxX || b2.maxX < b1.minX || b2.minY > b1.maxY || b2.maxY < b1.minY);
}

export function checkPolygonIntersection(poly1: Point[], poly2: Point[]): boolean {
    const box1 = getBoundingBox(poly1);
    const box2 = getBoundingBox(poly2);
    
    // Fast fail if bounding boxes strongly separated
    if (!boxesIntersect(box1, box2)) return false;

    // Check edge intersections
    for (let i = 0; i < poly1.length - 1; i++) {
        for (let j = 0; j < poly2.length - 1; j++) {
            if (lineIntersect(poly1[i], poly1[i+1], poly2[j], poly2[j+1])) {
                return true;
            }
        }
    }

    // Check if one polygon is strictly contained inside the other
    if (isPointInPolygon(poly1[0], poly2)) return true;
    if (isPointInPolygon(poly2[0], poly1)) return true;

    return false;
}

// Shift polygon aggressively trying spiraling offsets until a clean patch is found
export function shiftPolygonIfOverlap(
    originalPoly: Point[], 
    existingBoxes: Point[][], 
    gapBuffer: number = 0.0001
): Point[] | null {
    let currentPoly = [...originalPoly];
    let maxRetries = 100;
    
    // Add gap expansion to polygon before checking intersection to ensure gap
    const expandBox = (poly: Point[]) => {
        const centerLng = poly.reduce((a, b) => a + b[0], 0) / poly.length;
        const centerLat = poly.reduce((a, b) => a + b[1], 0) / poly.length;
        return poly.map(([x, y]) => [
            x + (x > centerLng ? gapBuffer : -gapBuffer) as number,
            y + (y > centerLat ? gapBuffer : -gapBuffer) as number
        ] as Point);
    };

    let attempt = 0;
    while (attempt < maxRetries) {
        // Expand the polygon for collision checks so there's an explicit "gap"
        const paddedPoly = expandBox(currentPoly);
        let valid = true;
        
        for (const existing of existingBoxes) {
            const paddedExisting = expandBox(existing);
            if (checkPolygonIntersection(paddedPoly, paddedExisting)) {
                valid = false;
                break;
            }
        }

        if (valid) return currentPoly;

        // Otherwise shift outward radially
        attempt++;
        const angle = Math.random() * Math.PI * 2;
        const shiftDist = 0.0008 * Math.sqrt(attempt); // Grow step distance gently
        const dLng = Math.cos(angle) * shiftDist;
        const dLat = Math.sin(angle) * shiftDist;

        currentPoly = originalPoly.map(([x, y]) => [x + dLng, y + dLat]);
    }

    console.warn("Could not find a non-overlapping position!");
    return null; // Force discard if nowhere to place
}


// -------------------------------------------------------------
// ORGANIC GENERATION
// -------------------------------------------------------------

export function generateParcelCluster(
  centerLat: number,
  centerLng: number,
  villageName: string,
  surveyPrefix: string,
  conflictCount: number = 0
): GeneratedParcel[] {
  const parcels: GeneratedParcel[] = [];
  
  // Randomize between 4 and 8 parcels
  const count = Math.floor(Math.random() * 5) + 4;
  
  let currentIdIndex = 1;
  const now = new Date().toISOString();
  const placedPolygons: Point[][] = [];

  // Randomize conflicts placement based on total instances
  const targetConflictIndices: number[] = [];
  while (targetConflictIndices.length < conflictCount) {
    const r = Math.floor(Math.random() * count);
    if (!targetConflictIndices.includes(r)) targetConflictIndices.push(r);
  }

  for (let i = 0; i < count; i++) {
    const baseW = 0.0010 + Math.random() * 0.0010; // Varied Widths
    const baseH = 0.0010 + Math.random() * 0.0015; // Varied Heights

    // Small initial random offset near center to start
    const startLng = centerLng + (Math.random() - 0.5) * 0.002;
    const startLat = centerLat + (Math.random() - 0.5) * 0.002;

    const perturbLat = () => (Math.random() - 0.5) * baseH * 0.2;
    const perturbLng = () => (Math.random() - 0.5) * baseW * 0.2;

    const rawPoly: Point[] = [
      [startLng + perturbLng(), startLat + perturbLat()],
      [startLng + baseW + perturbLng(), startLat + perturbLat()],
      [startLng + baseW + perturbLng(), startLat + baseH + perturbLat()],
      [startLng + perturbLng(), startLat + baseH + perturbLat()]
    ];
    rawPoly.push([...rawPoly[0]]); // close loop

    // ** COLLISION RESOLUTION HERE **
    const resolvedPoly = shiftPolygonIfOverlap(rawPoly, placedPolygons, 0.0003); // ~30m gap buffer
    
    // If it literally couldn't place without overlapping (rare), skip it to preserve cleanliness.
    if (!resolvedPoly) continue;
    placedPolygons.push(resolvedPoly);

    // Contextual Type placement based on how far it shifted or arbitrarily for smaller sets
    const distToCenter = Math.sqrt(Math.pow(resolvedPoly[0][0]-centerLng, 2) + Math.pow(resolvedPoly[0][1]-centerLat, 2));
    
    let landType: LandType = 'Private';
    let ownershipType: OwnershipType = 'Farmer';
    let forestApplicable = false;

    // Outer edge plots tend to be Forest or Mining, inner are Panhcayat/Gov/Private
    if (distToCenter > 0.003 && Math.random() > 0.5) {
      landType = 'Forest';
      ownershipType = 'Government';
      forestApplicable = true;
    } else if (distToCenter < 0.0015 && Math.random() > 0.7) {
      landType = 'Panchayat';
      ownershipType = 'Panchayat';
    } else if (Math.random() > 0.8) {
      landType = 'Mining';
      ownershipType = 'Corporation';
    } else if (Math.random() > 0.9) {
      landType = 'Government';
      ownershipType = 'Government';
    }

    const isConflict = targetConflictIndices.includes(i);
    let aiSummary = "This land is privately owned and has no active disputes or protected status.";
    if (landType === 'Forest') aiSummary = "This parcel is a protected forest zone.";
    else if (landType === 'Mining') aiSummary = "Active mining lease zone.";
    else if (landType === 'Panchayat') aiSummary = "Panchayat community land.";
    
    if (isConflict) aiSummary = "WARNING: There is an active court dispute or boundary conflict regarding this parcel.";

    const areaInAcres = parseFloat(((baseW * baseH * 10000000) * 0.4).toFixed(2));

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
      polygonCoordinates: resolvedPoly as [number, number][],
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

    // If an intentional conflict, we generate a duplicate geometry that overlaps
    if (isConflict) {
      // Overlap deliberately:
      const conflictPoly = resolvedPoly.map(([x,y]) => [x + baseW*0.15, y + baseH*0.15] as Point);
      
      // Do NOT push into placedPolygons so it overlaps!
      const overlapParcel: GeneratedParcel = {
        ...parcel,
        id: generateRandomId(),
        surveyNumber: `RAJ-JP-${surveyPrefix}-DISP-${currentIdIndex}`,
        ownerName: 'Claimant Under Dispute',
        ownershipType: 'Farmer',
        landType: 'Private',
        aiSummary: "Multiple active claims recorded over this territory segment.",
        polygonCoordinates: conflictPoly as [number, number][],
        hasConflict: true,
        acquisitionRiskScore: 99
      };
      parcels.push(overlapParcel);
    }
  }

  return parcels;
}
