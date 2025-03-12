"use server"

import { sdk } from "@lib/config"

const response = await sdk.client.get("/store/vehicles/makes")
const { vehicleMakes } = response.data

export default vehicleMakes