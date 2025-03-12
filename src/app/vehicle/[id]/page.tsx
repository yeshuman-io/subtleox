import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Vehicle } from "@/lib/data/vehicles";
import { sdk } from "@/lib/config";
import { Button } from "@/components/ui/button";

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

// Function to fetch vehicle details by ID
async function getVehicleById(id: string): Promise<Vehicle | null> {
  try {
    const response = await sdk.client.fetch<VehicleResponse>(`/store/vehicles/${id}`, {
      method: "GET",
      next: {
        revalidate: 60, // Cache for 1 minute
      },
    });
    
    // Handle different possible response structures
    if (response && 'data' in response && response.data && 'vehicle' in response.data && response.data.vehicle) {
      return response.data.vehicle;
    } else if (response && 'vehicle' in response && response.vehicle) {
      return response.vehicle;
    } else if (response && 'data' in response && response.data && !('vehicle' in response.data)) {
      return response.data as Vehicle;
    }
    
    return null;
  } catch (error) {
    console.error("Failed to fetch vehicle details:", error);
    return null;
  }
}

// Define the page component
export default async function VehicleDetailPage({ params }: VehiclePageProps) {
  const { id } = params;
  const vehicle = await getVehicleById(id);
  
  if (!vehicle) {
    notFound();
  }
  
  // Format the price with currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(vehicle.price);
  
  return (
    <div className="max-w-screen-lg mx-auto p-6">
      <div className="mb-4">
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vehicle Image */}
        <div className="rounded-lg overflow-hidden bg-muted relative h-[300px] md:h-[400px]">
          {vehicle.images && vehicle.images.length > 0 ? (
            <Image
              src={vehicle.images[0]}
              alt={vehicle.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
              No image available
            </div>
          )}
        </div>
        
        {/* Vehicle Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{vehicle.title}</h1>
          <p className="text-2xl font-bold text-primary mb-6">{formattedPrice}</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 border rounded">
                <span className="block text-sm font-medium">Make ID</span>
                <span className="block">{vehicle.make_id}</span>
              </div>
              <div className="p-3 border rounded">
                <span className="block text-sm font-medium">Model ID</span>
                <span className="block">{vehicle.model_id}</span>
              </div>
              <div className="p-3 border rounded">
                <span className="block text-sm font-medium">Series ID</span>
                <span className="block">{vehicle.series_id}</span>
              </div>
              {vehicle.body_id && (
                <div className="p-3 border rounded">
                  <span className="block text-sm font-medium">Body ID</span>
                  <span className="block">{vehicle.body_id}</span>
                </div>
              )}
            </div>
            
            <div className="pt-6">
              <Button size="lg" className="w-full">
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
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Contact Dealership
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 