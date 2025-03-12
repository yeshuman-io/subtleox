"use server"

import { sdk } from "@/lib/config"

// Define types for vehicle bodies
export type VehicleBody = {
  id: string
  name: string
  // Add any other properties your API returns
}

// Define types for API responses - handling multiple possible structures
type VehicleBodiesResponse = {
  data?: {
    vehicleBodies?: VehicleBody[]
    count?: number
    limit?: number
    offset?: number
  }
  vehicleBodies?: VehicleBody[]
  count?: number
  limit?: number
  offset?: number
}

/**
 * Fetches a list of vehicle bodies for a specific model with optional pagination
 */
export const listVehicleBodies = async ({
  modelId,
  pageParam = 1,
  limit = 100,
}: {
  modelId: string
  pageParam?: number
  limit?: number
}): Promise<{
  vehicleBodies: VehicleBody[]
  count: number
  nextPage: number | null
}> => {
  const offset = (pageParam - 1) * limit

  try {
    const response = await sdk.client.fetch<VehicleBodiesResponse>(
      `/store/vehicles/bodies`,
      {
        method: "GET",
        query: {
          model_id: modelId,
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
    let vehicleBodies: VehicleBody[] = []
    let count = 0
    
    if (response.data?.vehicleBodies) {
      // Structure: { data: { vehicleBodies: [...] } }
      vehicleBodies = response.data.vehicleBodies
      count = response.data.count || vehicleBodies.length
    } else if (response.vehicleBodies) {
      // Structure: { vehicleBodies: [...] }
      vehicleBodies = response.vehicleBodies
      count = response.count || vehicleBodies.length
    } else if (response.data) {
      // Structure: { data: [...] }
      vehicleBodies = Array.isArray(response.data) ? response.data : []
      count = vehicleBodies.length
    } else {
      // Try to handle any reasonable structure
      const possibleArray = Array.isArray(response) ? response : []
      vehicleBodies = possibleArray
      count = possibleArray.length
    }
    
    const nextPage = count > offset + limit ? pageParam + 1 : null

    return {
      vehicleBodies,
      count,
      nextPage,
    }
  } catch (error) {
    console.error("Failed to fetch vehicle bodies:", error)
    return {
      vehicleBodies: [],
      count: 0,
      nextPage: null,
    }
  }
}

// Export the function itself, not the result of calling it
export default listVehicleBodies 