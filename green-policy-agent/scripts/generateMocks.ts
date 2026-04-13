import * as fs from 'fs';
import * as path from 'path';

// Reusable faker utility functions
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomBoolean = (probability = 0.5) => Math.random() < probability;
const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// Core data domains
const JAIPUR_VILLAGES = ['Chomu', 'Kotputli', 'Shahpura', 'Viratnagar', 'Sambhar', 'Phulera', 'Jamwa Ramgarh', 'Bassi', 'Amer', 'Jobner'];
const INDIAN_NAMES = ['Ramesh Sharma', 'Suresh Meena', 'Kamla Devi', 'Mohan Gurjar', 'Sunita Yadav', 'Mahendra Singh', 'Pooja Verma', 'Amit Kumar', 'Rajesh Patel', 'Anjali Gupta'];
const LAND_TYPES = ['Forest', 'Private', 'Panchayat', 'Government', 'Mining'];
const OWNERSHIP_TYPES = ['Government', 'Farmer', 'NGO', 'Corporate'];

const generateJaipurPolygon = (baseLat = 26.9124, baseLng = 75.7873, offset = 0.05) => {
  const lat = baseLat + (Math.random() * offset * 2 - offset);
  const lng = baseLng + (Math.random() * offset * 2 - offset);
  const size = 0.005 + Math.random() * 0.01;
  return [
    [lng, lat],
    [lng + size, lat],
    [lng + size, lat + size],
    [lng, lat + size],
    [lng, lat]
  ];
};

const getAISummary = (landType: string, protectedZone: boolean, courtDispute: boolean) => {
  if (protectedZone) return "This parcel overlaps with a protected forest boundary and may require environmental clearance before acquisition.";
  if (courtDispute) return "There is currently an active legal dispute on this parcel. Proceed with caution.";
  if (landType === "Private") return "This land is privately owned and has no active disputes or protected status.";
  if (landType === "Mining") return "Nearby mining activity increases the environmental risk score for this parcel.";
  return "Standard administrative land. Check local panchayat records for zoning changes.";
};

// Generate Collections
const parcels: any[] = [];
const projects: any[] = [];
const courtCases: any[] = [];
const notifications: any[] = [];
const environmentalClearances: any[] = [];

console.log("Generating 10 Forest, 10 Private, 5 Panchayat, 5 Government, 5 Protected Zones, 5 Mining...");

// Ensure minimums by explicitly generating specific types
const generationTargets = [
  ...Array(10).fill('Forest'),
  ...Array(10).fill('Private'),
  ...Array(5).fill('Panchayat'),
  ...Array(5).fill('Government'),
  ...Array(20).fill('Random')
];

let parcelCount = 1;
for (const targetType of generationTargets) {
  const isForest = targetType === 'Forest';
  const isPrivate = targetType === 'Private';
  const lType = targetType === 'Random' ? randomItem(LAND_TYPES) : targetType;
  const isProtected = isForest ? true : randomBoolean(0.2);
  const isDisputed = randomBoolean(0.2);

  const parcel = {
    id: generateId('par'),
    surveyNumber: `RAJ-JP-${1000 + parcelCount}`,
    village: randomItem(JAIPUR_VILLAGES),
    tehsil: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    ownerName: isPrivate ? randomItem(INDIAN_NAMES) : 'State Gov',
    landType: lType,
    ownershipType: isPrivate ? 'Farmer' : randomItem(['Government', 'Panchayat']),
    areaInAcres: parseFloat((Math.random() * 50 + 1).toFixed(2)),
    polygonCoordinates: generateJaipurPolygon(),
    environmentalRiskScore: isProtected ? randomInt(70, 100) : randomInt(0, 40),
    acquisitionRiskScore: isProtected || isDisputed ? randomInt(80, 100) : randomInt(10, 50),
    forestRightsApplicable: isForest,
    protectedZone: isProtected,
    aiSummary: getAISummary(lType, isProtected, isDisputed),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  parcels.push(parcel);
  parcelCount++;
}

// Generate relationships
parcels.forEach((parcel, idx) => {
  // Add 5 mining projects and 5 dams realistically
  if (idx < 5) projects.push({ id: generateId('prj'), name: 'Stone Mining Zone A', type: 'Stone mining', description: 'Large scale stone extraction.', status: 'Active', landParcelId: parcel.id });
  else if (idx < 10) projects.push({ id: generateId('prj'), name: 'Bisalpur Dam Expansion', type: 'Dam expansion', description: 'Water reservoir scaling project.', status: 'Planned', landParcelId: parcel.id });
  else if (randomBoolean(0.1)) projects.push({ id: generateId('prj'), name: 'Solar Farm Alpha', type: 'Solar farm', description: 'Renewable energy array.', status: 'Completed', landParcelId: parcel.id });

  // Add 10 disputes
  if (idx > 10 && idx <= 20) courtCases.push({ id: generateId('cas'), caseNumber: `NGT/2026/${idx}`, status: 'Ongoing', description: 'Forest rights conflict', court: 'National Green Tribunal', landParcelId: parcel.id });
  
  // Add 10 clearances
  if (idx > 20 && idx <= 30) environmentalClearances.push({ id: generateId('clr'), certificateNumber: `EC/2026/${idx}`, status: 'Approved', issuedDate: new Date().toISOString(), landParcelId: parcel.id });

  // Add 10 notifications
  if (idx > 30 && idx <= 40) notifications.push({ id: generateId('not'), title: 'Zoning Change', message: 'Status updated by local authority.', type: 'Alert', landParcelId: parcel.id });
});

const generateFile = (filename: string, content: string) => {
  fs.writeFileSync(path.join(__dirname, '..', filename), content);
  console.log(`Generated ${filename}`);
};

const toJsonFile = (data: any) => JSON.stringify(data, null, 2);

// 1. Export TS Arrays
generateFile('src/data/mockLandParcels.ts', `export const mockLandParcels = ${toJsonFile(parcels)};`);
generateFile('src/data/mockVillages.ts', `export const mockVillages = ${toJsonFile(JAIPUR_VILLAGES)};`);
generateFile('src/data/mockProjects.ts', `export const mockProjects = ${toJsonFile(projects)};`);
generateFile('src/data/mockCourtCases.ts', `export const mockCourtCases = ${toJsonFile(courtCases)};`);
generateFile('src/data/mockNotifications.ts', `export const mockNotifications = ${toJsonFile(notifications)};`);

// 2. Export JSON
generateFile('src/data/mock-data.json', toJsonFile({ parcels, projects, courtCases, notifications, environmentalClearances }));

// 3. Export SQL Statements
let sql = '-- Mock SQL Inserts for Green Policy Agent\n';
parcels.forEach(p => {
  sql += `INSERT INTO "LandParcel" ("id", "surveyNumber", "village", "tehsil", "district", "state", "ownerName", "landType", "ownershipType", "areaInAcres", "polygonCoordinates", "environmentalRiskScore", "acquisitionRiskScore", "forestRightsApplicable", "protectedZone", "aiSummary", "createdAt", "updatedAt") VALUES ('${p.id}', '${p.surveyNumber}', '${p.village}', '${p.tehsil}', '${p.district}', '${p.state}', '${p.ownerName}', '${p.landType}', '${p.ownershipType}', ${p.areaInAcres}, '${JSON.stringify(p.polygonCoordinates)}', ${p.environmentalRiskScore}, ${p.acquisitionRiskScore}, ${p.forestRightsApplicable}, ${p.protectedZone}, '${p.aiSummary}', '${p.createdAt}', '${p.updatedAt}');\n`;
});
generateFile('src/data/mock-inserts.sql', sql);

// 4. Generate Prisma Seed Script
const seedContent = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mockParcels = ${toJsonFile(parcels)};
const mockProjects = ${toJsonFile(projects)};
const mockCases = ${toJsonFile(courtCases)};
const mockClearances = ${toJsonFile(environmentalClearances)};
const mockNotifications = ${toJsonFile(notifications)};

async function main() {
  console.log('Seeding database with Jaipur realistic datasets...');

  // Inject 50 Parcels
  for (const parcel of mockParcels) {
    await prisma.landParcel.upsert({
      where: { surveyNumber: parcel.surveyNumber },
      update: {},
      create: {
        id: parcel.id,
        surveyNumber: parcel.surveyNumber,
        village: parcel.village,
        tehsil: parcel.tehsil,
        district: parcel.district,
        state: parcel.state,
        ownerName: parcel.ownerName,
        landType: parcel.landType,
        ownershipType: parcel.ownershipType,
        areaInAcres: parcel.areaInAcres,
        polygonCoordinates: parcel.polygonCoordinates,
        environmentalRiskScore: parcel.environmentalRiskScore,
        acquisitionRiskScore: parcel.acquisitionRiskScore,
        forestRightsApplicable: parcel.forestRightsApplicable,
        protectedZone: parcel.protectedZone,
        aiSummary: parcel.aiSummary,
      }
    });
  }

  // Inject Relations
  for (const proj of mockProjects) {
    await prisma.project.create({ data: proj });
  }
  for (const c of mockCases) {
    await prisma.courtCase.create({ data: c });
  }
  for (const c of mockClearances) {
    await prisma.environmentalClearance.create({ data: c });
  }
  for (const n of mockNotifications) {
    await prisma.notification.create({ data: n });
  }

  // Generate 5 NGOs, 5 Lawyers, 5 Journalists
  const users = [...Array(5).fill('NGO'), ...Array(5).fill('Lawyer'), ...Array(5).fill('Journalist')];
  for (let i = 0; i < users.length; i++) {
    await prisma.user.create({
      data: {
        email: \`\${users[i].toLowerCase()}-\${i}@example.com\`,
        name: \`Demo \${users[i]} \${i}\`,
        role: users[i]
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

generateFile('prisma/seed.ts', seedContent);

console.log("Mock generation complete!");
