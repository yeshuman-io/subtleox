"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { VehicleMake } from "@/lib/data/vehicle-makes";
import { VehicleModel, listVehicleModels } from "@/lib/data/vehicle-models";
import { VehicleSeries, listVehicleSeries } from "@/lib/data/vehicle-series";
import { VehicleBody, listVehicleBodies } from "@/lib/data/vehicle-bodies";
import { Vehicle, findVehicle } from "@/lib/data/vehicles";
import { VehicleMakeSelect } from "./vehicle-make-select";
import { VehicleModelSelect } from "./vehicle-model-select";
import { VehicleSeriesSelect } from "./vehicle-series-select";
import { VehicleBodySelect } from "./vehicle-body-select";

interface VehicleSelectorProps {
  initialVehicleMakes: VehicleMake[];
  makeCount: number;
}

export function VehicleSelector({ initialVehicleMakes, makeCount }: VehicleSelectorProps) {
  const router = useRouter();
  
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [modelCount, setModelCount] = useState<number>(0);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  
  const [vehicleSeries, setVehicleSeries] = useState<VehicleSeries[]>([]);
  const [seriesCount, setSeriesCount] = useState<number>(0);
  const [isLoadingSeries, setIsLoadingSeries] = useState<boolean>(false);
  
  const [vehicleBodies, setVehicleBodies] = useState<VehicleBody[]>([]);
  const [bodyCount, setBodyCount] = useState<number>(0);
  const [isLoadingBodies, setIsLoadingBodies] = useState<boolean>(false);
  
  // State for the matched vehicle
  const [matchedVehicle, setMatchedVehicle] = useState<Vehicle | null>(null);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState<boolean>(false);
  
  // Fetch models when a make is selected
  useEffect(() => {
    // Reset model, series, and body selection when make changes
    setSelectedModel(null);
    setVehicleModels([]);
    setSelectedSeries(null);
    setVehicleSeries([]);
    setSelectedBody(null);
    setVehicleBodies([]);
    setMatchedVehicle(null);
    
    // Don't fetch models if no make is selected
    if (!selectedMake) return;
    
    async function fetchModels() {
      setIsLoadingModels(true);
      try {
        // Since we check selectedMake above, TypeScript should know it's not null here
        // but we need to be explicit to satisfy the type system
        const { vehicleModels, count } = await listVehicleModels({ 
          makeId: selectedMake as string
        });
        setVehicleModels(vehicleModels);
        setModelCount(count);
      } catch (error) {
        console.error("Failed to fetch models:", error);
      } finally {
        setIsLoadingModels(false);
      }
    }
    
    fetchModels();
  }, [selectedMake]);
  
  // Fetch series and bodies when a model is selected
  useEffect(() => {
    // Reset series and body selection when model changes
    setSelectedSeries(null);
    setVehicleSeries([]);
    setSelectedBody(null);
    setVehicleBodies([]);
    setMatchedVehicle(null);
    
    // Don't fetch series or bodies if no model is selected
    if (!selectedModel) return;
    
    async function fetchSeries() {
      setIsLoadingSeries(true);
      try {
        // Since we check selectedModel above, TypeScript should know it's not null here
        // but we need to be explicit to satisfy the type system
        const { vehicleSeries, count } = await listVehicleSeries({ 
          modelId: selectedModel as string
        });
        setVehicleSeries(vehicleSeries);
        setSeriesCount(count);
      } catch (error) {
        console.error("Failed to fetch series:", error);
      } finally {
        setIsLoadingSeries(false);
      }
    }
    
    async function fetchBodies() {
      setIsLoadingBodies(true);
      try {
        // Since we check selectedModel above, TypeScript should know it's not null here
        // but we need to be explicit to satisfy the type system
        const { vehicleBodies, count } = await listVehicleBodies({ 
          modelId: selectedModel as string
        });
        setVehicleBodies(vehicleBodies);
        setBodyCount(count);
      } catch (error) {
        console.error("Failed to fetch bodies:", error);
      } finally {
        setIsLoadingBodies(false);
      }
    }
    
    // Fetch both series and bodies
    fetchSeries();
    fetchBodies();
  }, [selectedModel]);
  
  // Fetch the matching vehicle when all required selections are made
  useEffect(() => {
    // Reset the matched vehicle
    setMatchedVehicle(null);
    
    // Don't fetch if any required selection is missing
    if (!selectedMake || !selectedModel || !selectedSeries) return;
    
    async function fetchVehicle() {
      setIsLoadingVehicle(true);
      try {
        const vehicle = await findVehicle({
          makeId: selectedMake as string,
          modelId: selectedModel as string,
          seriesId: selectedSeries as string,
          bodyId: selectedBody
        });
        setMatchedVehicle(vehicle);
      } catch (error) {
        console.error("Failed to find matching vehicle:", error);
      } finally {
        setIsLoadingVehicle(false);
      }
    }
    
    fetchVehicle();
  }, [selectedMake, selectedModel, selectedSeries, selectedBody]);
  
  const handleMakeSelect = (makeId: string) => {
    setSelectedMake(makeId);
  };
  
  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };
  
  const handleSeriesSelect = (seriesId: string) => {
    setSelectedSeries(seriesId);
  };
  
  const handleBodySelect = (bodyId: string) => {
    setSelectedBody(bodyId);
  };
  
  // Format year range for display
  const formatYearRange = (series: VehicleSeries): string => {
    const currentYear = new Date().getFullYear();
    
    if (series.end_year >= currentYear) {
      return `${series.start_year}-Present`;
    }
    
    return `${series.start_year}-${series.end_year}`;
  };
  
  // Navigate to vehicle details page
  const handleViewVehicleDetails = () => {
    if (matchedVehicle) {
      router.push(`/vehicle/${matchedVehicle.id}`);
    }
  };
  
  // Find selected make, model, series, and body for display
  const selectedMakeName = selectedMake 
    ? initialVehicleMakes.find(make => make.id === selectedMake)?.name 
    : null;
    
  const selectedModelName = selectedModel 
    ? vehicleModels.find(model => model.id === selectedModel)?.name 
    : null;
    
  const selectedSeriesYears = selectedSeries
    ? vehicleSeries.find(series => series.id === selectedSeries)
    : null;
    
  const selectedBodyName = selectedBody
    ? vehicleBodies.find(body => body.id === selectedBody)?.name
    : null;
  
  // Check if all required fields are selected
  const allRequiredFieldsSelected = selectedMake && selectedModel && selectedSeries;
  
  // Check if a body is required (if any bodies exist for the model)
  const bodyIsRequired = vehicleBodies.length > 0;
  
  // Check if all selections are complete
  const selectionComplete = allRequiredFieldsSelected && (!bodyIsRequired || selectedBody);
  
  return (
    <div className="w-full max-w-md space-y-4">
      {/* Vehicle Make Selector */}
      <div className="space-y-2">
        <Label htmlFor="vehicle-make" className="text-sm font-medium">
          Select Vehicle Make ({makeCount} available)
        </Label>
        
        {initialVehicleMakes.length === 0 && (
          <div className="p-2 rounded text-sm">
            No vehicle makes found.
          </div>
        )}
        
        <VehicleMakeSelect 
          vehicleMakes={initialVehicleMakes} 
          disabled={initialVehicleMakes.length === 0}
          onSelect={handleMakeSelect}
        />
      </div>
      
      {/* Vehicle Model Selector - only show when a make is selected */}
      {selectedMake && (
        <div className="space-y-2">
          <Label htmlFor="vehicle-model" className="text-sm font-medium">
            Select {selectedMakeName} Model
            {!isLoadingModels && ` (${modelCount} available)`}
          </Label>
          
          {isLoadingModels && (
            <div className="p-2 rounded text-sm">
              Loading models...
            </div>
          )}
          
          {!isLoadingModels && vehicleModels.length === 0 && (
            <div className="p-2 rounded text-sm">
              No models found for {selectedMakeName}.
            </div>
          )}
          
          <VehicleModelSelect 
            vehicleModels={vehicleModels} 
            disabled={isLoadingModels || vehicleModels.length === 0}
            onSelect={handleModelSelect}
          />
        </div>
      )}
      
      {/* Vehicle Series Selector - only show when a model is selected */}
      {selectedModel && (
        <div className="space-y-2">
          <Label htmlFor="vehicle-series">
            Select {selectedModelName} Year Range
            {!isLoadingSeries && ` (${seriesCount} available)`}
          </Label>
          
          {isLoadingSeries && (
            <div className="p-2 rounded text-sm">
              Loading year ranges...
            </div>
          )}
          
          {!isLoadingSeries && vehicleSeries.length === 0 && (
            <div className="p-2 rounded text-sm">
              No year ranges found for {selectedModelName}.
            </div>
          )}
          
          <VehicleSeriesSelect 
            vehicleSeries={vehicleSeries} 
            disabled={isLoadingSeries || vehicleSeries.length === 0}
            onSelect={handleSeriesSelect}
          />
        </div>
      )}
      
      {/* Vehicle Body Selector - only show when a model is selected AND bodies are available */}
      {selectedModel && (!isLoadingBodies && vehicleBodies.length > 0) && (
        <div className="space-y-2">
          <Label htmlFor="vehicle-body">
            Select {selectedModelName} Body Style
            {!isLoadingBodies && ` (${bodyCount} available)`}
          </Label>
          
          {isLoadingBodies && (
            <div className="p-2 rounded text-sm">
              Loading body styles...
            </div>
          )}
          
          <VehicleBodySelect 
            vehicleBodies={vehicleBodies} 
            disabled={isLoadingBodies}
            onSelect={handleBodySelect}
          />
        </div>
      )}
      
      {/* Selection Summary */}
      {(selectedMake || selectedModel || selectedSeries || selectedBody) && (
        <div className="mt-6 p-3 border rounded bg-muted text-sm">
          <h3 className="font-medium mb-2">Your Selection:</h3>
          {selectedMakeName && (
            <div><span className="font-medium">Make:</span> {selectedMakeName}</div>
          )}
          {selectedModelName && (
            <div><span className="font-medium">Model:</span> {selectedModelName}</div>
          )}
          {selectedSeriesYears && (
            <div>
              <span className="font-medium">Year Range:</span> {formatYearRange(selectedSeriesYears)}
            </div>
          )}
          {selectedBodyName && (
            <div><span className="font-medium">Body Style:</span> {selectedBodyName}</div>
          )}
        </div>
      )}
      
      {/* Vehicle Details Button - only show when all fields are populated */}
      {selectionComplete && (
        <div className="mt-6">
          {isLoadingVehicle ? (
            <Button disabled className="w-full">
              Finding vehicles...
            </Button>
          ) : matchedVehicle ? (
            <Button 
              onClick={handleViewVehicleDetails}
              className="w-full"
            >
              View Vehicle Details
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
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Button>
          ) : (
            <Button disabled className="w-full">
              No matching vehicles found
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 