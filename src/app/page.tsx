import { ModeToggle } from "@/components/mode-toggle";
import { listVehicleMakes } from "@/lib/data/vehicle-makes";
import { VehicleSelector } from "@/components/vehicle-selector";

// Add revalidation to improve performance
export const revalidate = 3600; // Revalidate at most once per hour

export default async function Home() {
  // Fetch data once during server render
  const { vehicleMakes, count } = await listVehicleMakes();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="flex flex-col items-center gap-6">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <h1 className="text-3xl font-bold">Wipertech Evolved</h1>
        <p className="text-muted-foreground">next generation wiper technology</p>
        
        {/* Pass data to client component */}
        <VehicleSelector 
          initialVehicleMakes={vehicleMakes} 
          makeCount={count} 
        />
      </main>
    </div>
  );
}
