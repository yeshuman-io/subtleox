import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Vehicle } from "@/lib/data/vehicles";
import { WiperKit, findWiperKitsForVehicle } from "@/lib/data/wiper-kits";
import { sdk } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

// Define the props for the page component
interface VehiclePageProps {
  params: {
    id: string;
  };
}

// Define response type for vehicle details
interface VehicleResponseWithVehicle {
  vehicle: Vehicle;
  data?: {
    vehicle?: Vehicle;
  };
}

interface VehicleResponseWithDataVehicle {
  vehicle?: undefined;
  data: {
    vehicle: Vehicle;
  };
}

interface VehicleResponseWithData {
  vehicle?: undefined;
  data: Vehicle;
}

type VehicleResponse = VehicleResponseWithVehicle | VehicleResponseWithDataVehicle | VehicleResponseWithData;

// Add mock data for development
const MOCK_VEHICLE_DATA: Vehicle = {
  id: "01JJY908V3EQ3JSAA5W8TV1SNR",
  make_id: "make_01",
  model_id: "model_01",
  series_id: "series_01",
  body_id: "body_01",
  title: "2023 Example Vehicle",
  price: 29999,
  images: [
    "https://placehold.co/800x600/333/white?text=Vehicle+Image"
  ]
};

// Function to fetch vehicle details by ID
async function getVehicleById(id: string): Promise<Vehicle | null> {
  // Use mock data in development if the feature flag is enabled
  if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Using mock vehicle data for development");
    return MOCK_VEHICLE_DATA;
  }

  try {
    console.log(`Attempting to fetch vehicle with ID: ${id}`);
    const apiUrl = `/store/vehicles/${id}`;
    console.log(`API URL: ${apiUrl}`);
    
    const response = await sdk.client.fetch<VehicleResponse>(apiUrl, {
      method: "GET",
      next: {
        revalidate: 60, // Cache for 1 minute
      },
    });
    
    console.log("API response:", JSON.stringify(response, null, 2));
    
    // Handle different possible response structures
    if (response && 'data' in response && response.data && 'vehicle' in response.data && response.data.vehicle) {
      return response.data.vehicle;
    } else if (response && 'vehicle' in response && response.vehicle) {
      return response.vehicle;
    } else if (response && 'data' in response && response.data && !('vehicle' in response.data)) {
      return response.data as Vehicle;
    }
    
    console.log("No vehicle data found in response structure");
    
    // Return mock data as fallback in development mode
    if (process.env.NODE_ENV === "development") {
      console.log("Falling back to mock data since API request failed");
      return MOCK_VEHICLE_DATA;
    }
    
    return null;
  } catch (error) {
    console.error("Failed to fetch vehicle details:", error);
    
    // Return mock data as fallback in development mode
    if (process.env.NODE_ENV === "development") {
      console.log("Falling back to mock data after error");
      return MOCK_VEHICLE_DATA;
    }
    
    return null;
  }
}

// Format currency helper function
function formatCurrency(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

// Define the page component
export default async function VehicleDetailPage({ params }: VehiclePageProps) {
  const { id } = params;
  const vehicle = await getVehicleById(id);
  
  if (!vehicle) {
    notFound();
  }
  
  // Fetch compatible wiper kits for this vehicle
  const { wiperKits, count } = await findWiperKitsForVehicle(id);
  
  return (
    <div className="max-w-screen-lg mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <Link href="/" passHref>
          <Button variant="outline" size="sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to Search
          </Button>
        </Link>
        <ModeToggle />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Wipertech Wiper Blades For Your Vehicle</h1>
      <p className="text-muted-foreground mb-6">Custom-designed wiper blades for a perfect fit and optimal performance</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Vehicle Information Card */}
        <div className="md:col-span-1">
          <div className="border rounded-lg overflow-hidden bg-card">
            <div className="relative h-[200px]">
              {vehicle.images && vehicle.images.length > 0 ? (
                <Image
                  src={vehicle.images[0]}
                  alt={vehicle.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                  No image available
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{vehicle.title}</h2>
              
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-1">
                  <span className="font-medium">Make ID:</span>
                  <span>{vehicle.make_id}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <span className="font-medium">Model ID:</span>
                  <span>{vehicle.model_id}</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <span className="font-medium">Series ID:</span>
                  <span>{vehicle.series_id}</span>
                </div>
                {vehicle.body_id && (
                  <div className="grid grid-cols-2 gap-1">
                    <span className="font-medium">Body ID:</span>
                    <span>{vehicle.body_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <h3 className="font-medium mb-2">Why Wipertech?</h3>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>Custom-engineered for your specific vehicle</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>All-weather performance</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>Easy to install with included adapters</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>Exceptional durability and longevity</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Compatible Wiper Kits */}
        <div className="md:col-span-2">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-1">Available Wipertech Kits</h2>
            <p className="text-muted-foreground mb-4">Custom-designed wiper kits for your {vehicle.title}</p>
            
            {wiperKits.length === 0 ? (
              <div className="py-8 text-center bg-muted rounded-lg">
                <p className="text-muted-foreground mb-4">No compatible wiper kits found for this vehicle.</p>
                <Link href="/" passHref>
                  <Button>Try another vehicle</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {wiperKits.map((kit) => (
                  <div key={kit.id} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4">
                    {/* Kit Image */}
                    <div className="w-full md:w-1/4 rounded-md overflow-hidden relative h-[120px]">
                      {kit.images && kit.images.length > 0 ? (
                        <Image
                          src={kit.images[0]}
                          alt={kit.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    
                    {/* Kit Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{kit.title}</h3>
                      {kit.description && <p className="text-muted-foreground text-sm mt-1">{kit.description}</p>}
                      
                      {/* Compatibility Tags */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {kit.compatibility?.frontSet && (
                          <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                            Front Set (Left & Right)
                          </span>
                        )}
                        {kit.compatibility?.rear && (
                          <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                            Rear Wiper
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Price and Action */}
                    <div className="flex flex-col justify-between items-end">
                      <div className="text-lg font-bold">{formatCurrency(kit.price)}</div>
                      <Link href={`/store/wipers/kits/${kit.id}`} passHref>
                        <Button>
                          Add to Cart
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="8" cy="21" r="1" />
                            <circle cx="19" cy="21" r="1" />
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                          </svg>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 