"use server"

import { sdk } from "@/lib/config"

// Define types for vehicles
export type Vehicle = {
  id: string
  make_id: string
  model_id: string
  series_id: string
  body_id?: string
  title: string
  price: number
  images?: string[]
  // Add any other properties your API returns
}

type VehiclesResponse = {
  vehicles?: Vehicle[]
  data?: {
    vehicles?: Vehicle[]
    count?: number
  }
  count?: number
}

/**
 * Finds a vehicle by make, model, series, and optionally body IDs
 */
export const findVehicle = async ({
  makeId,
  modelId,
  seriesId,
  bodyId,
}: {
  makeId: string
  modelId: string
  seriesId: string
  bodyId?: string | null
}): Promise<Vehicle | null> => {
  try {
    // Construct the query parameters
    const queryParams: Record<string, string> = {
      make_id: makeId,
      model_id: modelId,
      series_id: seriesId,
    }
    
    // Only add body_id if it's provided
    if (bodyId) {
      queryParams.body_id = bodyId
    }

    const response = await sdk.client.fetch<VehiclesResponse>(
      `/store/vehicles`,
      {
        method: "GET",
        query: queryParams,
        next: {
          revalidate: 60, // Cache for 1 minute
        },
      }
    )
    
    // Handle different possible response structures
    let vehicles: Vehicle[] = []
    
    if (response.data?.vehicles) {
      // Structure: { data: { vehicles: [...] } }
      vehicles = response.data.vehicles
    } else if (response.vehicles) {
      // Structure: { vehicles: [...] }
      vehicles = response.vehicles
    } else if (response.data) {
      // Structure: { data: [...] }
      vehicles = Array.isArray(response.data) ? response.data : []
    } else {
      // Try to handle any reasonable structure
      vehicles = Array.isArray(response) ? response : []
    }
    
    // Find the first matching vehicle
    return vehicles.length > 0 ? vehicles[0] : null
    
  } catch (error) {
    console.error("Failed to find vehicle:", error)
    return null
  }
} 