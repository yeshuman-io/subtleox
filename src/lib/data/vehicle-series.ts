"use server"

import { sdk } from "@/lib/config"

// Define types for vehicle series
export type VehicleSeries = {
  id: string
  start_year: number
  end_year: number
  modelId: string
  // Add any other properties your API returns
}

// Define types for API responses - handling multiple possible structures
type VehicleSeriesResponse = {
  data?: {
    vehicleSeries?: VehicleSeries[]
    count?: number
    limit?: number
    offset?: number
  }
  vehicleSeries?: VehicleSeries[]
  count?: number
  limit?: number
  offset?: number
}

/**
 * Fetches a list of vehicle series for a specific model with optional pagination
 */
export const listVehicleSeries = async ({
  modelId,
  pageParam = 1,
  limit = 100,
}: {
  modelId: string
  pageParam?: number
  limit?: number
}): Promise<{
  vehicleSeries: VehicleSeries[]
  count: number
  nextPage: number | null
}> => {
  const offset = (pageParam - 1) * limit

  try {
    const response = await sdk.client.fetch<VehicleSeriesResponse>(
      `/store/vehicles/series`,
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
    let vehicleSeries: VehicleSeries[] = []
    let count = 0
    
    if (response.data?.vehicleSeries) {
      // Structure: { data: { vehicleSeries: [...] } }
      vehicleSeries = response.data.vehicleSeries
      count = response.data.count || vehicleSeries.length
    } else if (response.vehicleSeries) {
      // Structure: { vehicleSeries: [...] }
      vehicleSeries = response.vehicleSeries
      count = response.count || vehicleSeries.length
    } else if (response.data) {
      // Structure: { data: [...] }
      vehicleSeries = Array.isArray(response.data) ? response.data : []
      count = vehicleSeries.length
    } else {
      // Try to handle any reasonable structure
      const possibleArray = Array.isArray(response) ? response : []
      vehicleSeries = possibleArray
      count = possibleArray.length
    }
    
    const nextPage = count > offset + limit ? pageParam + 1 : null

    return {
      vehicleSeries,
      count,
      nextPage,
    }
  } catch (error) {
    console.error("Failed to fetch vehicle series:", error)
    return {
      vehicleSeries: [],
      count: 0,
      nextPage: null,
    }
  }
}

// Export the function itself, not the result of calling it
export default listVehicleSeries 