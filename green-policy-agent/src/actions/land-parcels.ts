"use server";

import { prisma } from "@/lib/prisma";

export async function getLandParcels() {
  try {
    const parcels = await prisma.landParcel.findMany({
      include: {
        projects: true,
        courtCases: true,
      }
    });
    return { success: true, data: parcels };
  } catch (error) {
    console.error("Failed to fetch parcels:", error);
    return { success: false, error: "Failed to fetch land parcels" };
  }
}

export async function searchLandParcels(query: string) {
  try {
    const parcels = await prisma.landParcel.findMany({
      where: {
        OR: [
          { village: { contains: query, mode: "insensitive" } },
          { district: { contains: query, mode: "insensitive" } },
          { surveyNumber: { contains: query, mode: "insensitive" } },
        ]
      },
      include: {
        projects: true,
      }
    });
    return { success: true, data: parcels };
  } catch (error) {
    console.error("Search failed:", error);
    return { success: false, error: "Search execution failed" };
  }
}
