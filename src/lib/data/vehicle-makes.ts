"use server"

import { sdk } from "@/lib/config"

// Define types for vehicle makes
export type VehicleMake = {
  id: string
  name: string
  // Add any other properties your API returns
}

// Define types for API responses - with multiple possible structures
type VehicleMakesResponse = {
  data?: {
    vehicleMakes?: VehicleMake[]
    count?: number
    limit?: number
    offset?: number
  }
  vehicleMakes?: VehicleMake[]
  count?: number
  limit?: number
  offset?: number
}

/**
 * Fetches a list of vehicle makes with optional pagination
 */
export const listVehicleMakes = async ({
  pageParam = 1,
  limit = 100,
}: {
  pageParam?: number
  limit?: number
} = {}): Promise<{
  vehicleMakes: VehicleMake[]
  count: number
  nextPage: number | null
}> => {
  const offset = (pageParam - 1) * limit

  try {
    const response = await sdk.client.fetch<VehicleMakesResponse>(
      "/store/vehicles/makes",
      {
        method: "GET",
        query: {
          limit,
          offset,
        },
        // Add proper caching options
        next: {
          revalidate: 3600, // Cache for 1 hour
        },
        cache: "force-cache",
      }
    )
    
    // Handle different possible response structures
    let vehicleMakes: VehicleMake[] = []
    let count = 0
    
    if (response.data?.vehicleMakes) {
      // Structure: { data: { vehicleMakes: [...] } }
      vehicleMakes = response.data.vehicleMakes
      count = response.data.count || vehicleMakes.length
    } else if (response.vehicleMakes) {
      // Structure: { vehicleMakes: [...] }
      vehicleMakes = response.vehicleMakes
      count = response.count || vehicleMakes.length
    } else if (response.data) {
      // Structure: { data: [...] }
      vehicleMakes = Array.isArray(response.data) ? response.data : []
      count = vehicleMakes.length
    } else {
      // Try to handle any reasonable structure
      const possibleArray = Array.isArray(response) ? response : []
      vehicleMakes = possibleArray
      count = possibleArray.length
    }
    
    const nextPage = count > offset + limit ? pageParam + 1 : null

    return {
      vehicleMakes,
      count,
      nextPage,
    }
  } catch (error) {
    console.error("Failed to fetch vehicle makes:", error)
    return {
      vehicleMakes: [],
      count: 0,
      nextPage: null,
    }
  }
}

// Export the function itself, not the result of calling it
export default listVehicleMakes