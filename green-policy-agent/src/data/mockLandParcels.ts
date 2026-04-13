import { generateParcelCluster, GeneratedParcel } from '../utils/parcelGenerator';

export const villagesCoordinates = [
  { name: 'Amer', lat: 26.9855, lng: 75.8513, code: 'AM' },
  { name: 'Chomu', lat: 27.1676, lng: 75.7156, code: 'CH' },
  { name: 'Sambhar', lat: 26.9088, lng: 75.1917, code: 'SM' },
  { name: 'Bassi', lat: 26.8398, lng: 76.0482, code: 'BS' },
  { name: 'Shahpura', lat: 27.3820, lng: 75.9587, code: 'SH' },
  { name: 'Phulera', lat: 26.8741, lng: 75.2418, code: 'PH' },
  { name: 'Kotputli', lat: 27.7027, lng: 76.2023, code: 'KO' },
  { name: 'Jobner', lat: 26.9660, lng: 75.3263, code: 'JO' },
  { name: 'Viratnagar', lat: 27.4475, lng: 76.1855, code: 'VI' },
  { name: 'Jamwa Ramgarh', lat: 27.0200, lng: 76.0229, code: 'JR' },
];

let allParcels: GeneratedParcel[] = [];

// Generate organic 4 to 8 parcels for each village, with global control on intentional conflicts
let totalConflictsGenerated = 0;
for (const village of villagesCoordinates) {
  // We only want 2 to 4 conflicts ACROSS the entire map realistically!
  const hasConflict = totalConflictsGenerated < 3 && Math.random() > 0.5 ? 1 : 0;
  if (hasConflict) totalConflictsGenerated++;
  
  const cluster = generateParcelCluster(village.lat, village.lng, village.name, village.code, hasConflict);
  allParcels = [...allParcels, ...cluster];
}

export const mockLandParcels = allParcels;