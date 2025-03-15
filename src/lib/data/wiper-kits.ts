"use server"

import { sdk } from "@/lib/config"

// Define types for wiper kits
export type WiperKit = {
  id: string
  title: string
  description?: string
  price: number
  images?: string[]
  vehicle_ids?: string[]
  compatibility?: {
    frontSet?: boolean // Left and right front wipers
    rear?: boolean     // Rear wiper
  }
  // Add any other properties your API returns
}

type WiperKitsResponse = {
  wiperKits?: WiperKit[]
  data?: {
    wiperKits?: WiperKit[]
    count?: number
  }
  count?: number
}

/**
 * Fetches compatible wiper kits for a specific vehicle
 */
export const findWiperKitsForVehicle = async (
  vehicleId: string
): Promise<{
  wiperKits: WiperKit[]
  count: number
}> => {
  try {
    // In development with mock data enabled, return mock data
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
      console.log("Using mock wiper kits data for development");
      return {
        wiperKits: MOCK_WIPER_KITS,
        count: MOCK_WIPER_KITS.length
      };
    }

    const response = await sdk.client.fetch<WiperKitsResponse>(
      `/store/wipers/kits`,
      {
        method: "GET",
        query: {
          vehicle_id: vehicleId,
        },
        next: {
          revalidate: 60, // Cache for 1 minute
        },
      }
    )
    
    console.log("Wiper kits API response:", JSON.stringify(response, null, 2));
    
    // Handle different possible response structures
    let wiperKits: WiperKit[] = []
    let count = 0
    
    if (response.data?.wiperKits) {
      // Structure: { data: { wiperKits: [...] } }
      wiperKits = response.data.wiperKits
      count = response.data.count || wiperKits.length
    } else if (response.wiperKits) {
      // Structure: { wiperKits: [...] }
      wiperKits = response.wiperKits
      count = response.count || wiperKits.length
    } else if (response.data) {
      // Structure: { data: [...] }
      wiperKits = Array.isArray(response.data) ? response.data : []
      count = wiperKits.length
    } else {
      // Try to handle any reasonable structure
      wiperKits = Array.isArray(response) ? response : []
      count = wiperKits.length
    }

    // If no wiper kits found and we're in development, fall back to mock data
    if (wiperKits.length === 0 && process.env.NODE_ENV === "development") {
      console.log("No wiper kits found, falling back to mock data");
      return {
        wiperKits: MOCK_WIPER_KITS,
        count: MOCK_WIPER_KITS.length
      };
    }
    
    return {
      wiperKits,
      count,
    }
  } catch (error) {
    console.error("Failed to fetch wiper kits:", error)
    
    // Fall back to mock data in development
    if (process.env.NODE_ENV === "development") {
      console.log("Error fetching wiper kits, falling back to mock data");
      return {
        wiperKits: MOCK_WIPER_KITS,
        count: MOCK_WIPER_KITS.length
      };
    }
    
    return {
      wiperKits: [],
      count: 0,
    }
  }
}

// Mock data for development
const MOCK_WIPER_KITS: WiperKit[] = [
  {
    id: "wiper_kit_01",
    title: "Wipertech Front Wiper Blade Set",
    description: "Premium front wiper blades (left & right) custom-designed for your vehicle",
    price: 39.99,
    images: ["https://placehold.co/800x600/333/white?text=Wipertech+Front+Set"],
    compatibility: {
      frontSet: true,
      rear: false
    }
  },
  {
    id: "wiper_kit_02",
    title: "Wipertech Rear Wiper Blade",
    description: "Specialized rear wiper blade designed specifically for your vehicle's rear window",
    price: 19.99,
    images: ["https://placehold.co/800x600/333/white?text=Wipertech+Rear+Blade"],
    compatibility: {
      frontSet: false,
      rear: true
    }
  },
  {
    id: "wiper_kit_03",
    title: "Wipertech Complete Wiper Set",
    description: "Full set of front (left & right) and rear wiper blades for complete visibility",
    price: 49.99,
    images: ["https://placehold.co/800x600/333/white?text=Wipertech+Complete+Set"],
    compatibility: {
      frontSet: true,
      rear: true
    }
  }
] 