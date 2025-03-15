"use server"

import { sdk } from "@/lib/config"

// Define types for vehicle models
export type VehicleModel = {
  id: string
  name: string
  makeId: string
  // Add any other properties your API returns
}

// Define types for API responses - handling multiple possible structures
type VehicleModelsResponse = {
  data?: {
    vehicleModels?: VehicleModel[]
    count?: number
    limit?: number
    offset?: number
  }
  vehicleModels?: VehicleModel[]
  count?: number
  limit?: number
  offset?: number
}

/**
 * Fetches a list of vehicle models for a specific make with optional pagination
 */
export const listVehicleModels = async ({
  makeId,
  pageParam = 1,
  limit = 100,
}: {
  makeId: string
  pageParam?: number
  limit?: number
}): Promise<{
  vehicleModels: VehicleModel[]
  count: number
  nextPage: number | null
}> => {
  const offset = (pageParam - 1) * limit

  try {
    const response = await sdk.client.fetch<VehicleModelsResponse>(
      `/store/vehicles/models`,
      {
        method: "GET",
        query: {
          make_id: makeId,
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
    let vehicleModels: VehicleModel[] = []
    let count = 0
    
    if (response.data?.vehicleModels) {
      // Structure: { data: { vehicleModels: [...] } }
      vehicleModels = response.data.vehicleModels
      count = response.data.count || vehicleModels.length
    } else if (response.vehicleModels) {
      // Structure: { vehicleModels: [...] }
      vehicleModels = response.vehicleModels
      count = response.count || vehicleModels.length
    } else if (response.data) {
      // Structure: { data: [...] }
      vehicleModels = Array.isArray(response.data) ? response.data : []
      count = vehicleModels.length
    } else {
      // Try to handle any reasonable structure
      const possibleArray = Array.isArray(response) ? response : []
      vehicleModels = possibleArray
      count = possibleArray.length
    }
    
    const nextPage = count > offset + limit ? pageParam + 1 : null

    return {
      vehicleModels,
      count,
      nextPage,
    }
  } catch (error) {
    console.error("Failed to fetch vehicle models:", error)
    return {
      vehicleModels: [],
      count: 0,
      nextPage: null,
    }
  }
}

// Export the function itself, not the result of calling it
export default listVehicleModels 