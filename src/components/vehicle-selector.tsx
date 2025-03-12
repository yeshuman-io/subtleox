"use client";

import { useState, useEffect } from "react";
import { VehicleMake } from "@/lib/data/vehicle-makes";
import { VehicleModel, listVehicleModels } from "@/lib/data/vehicle-models";
import { VehicleMakeSelect } from "./vehicle-make-select";
import { VehicleModelSelect } from "./vehicle-model-select";

interface VehicleSelectorProps {
  initialVehicleMakes: VehicleMake[];
  makeCount: number;
}

export function VehicleSelector({ initialVehicleMakes, makeCount }: VehicleSelectorProps) {
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [modelCount, setModelCount] = useState<number>(0);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  
  useEffect(() => {
    // Reset model selection when make changes
    setSelectedModel(null);
    setVehicleModels([]);
    
    // Don't fetch models if no make is selected
    if (!selectedMake) return;
    
    async function fetchModels() {
      setIsLoadingModels(true);
      try {
        const { vehicleModels, count } = await listVehicleModels({ makeId: selectedMake });
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
  
  const handleMakeSelect = (makeId: string) => {
    setSelectedMake(makeId);
  };
  
  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };
  
  // Find selected make and model names for display
  const selectedMakeName = selectedMake 
    ? initialVehicleMakes.find(make => make.id === selectedMake)?.name 
    : null;
    
  const selectedModelName = selectedModel 
    ? vehicleModels.find(model => model.id === selectedModel)?.name 
    : null;
  
  return (
    <div className="w-full max-w-md space-y-4">
      {/* Vehicle Make Selector */}
      <div>
        <label htmlFor="vehicle-make" className="block text-sm font-medium mb-2">
          Select Vehicle Make ({makeCount} available)
        </label>
        
        {initialVehicleMakes.length === 0 && (
          <div className="bg-amber-100 text-amber-800 p-2 rounded mb-2 text-sm">
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
        <div>
          <label htmlFor="vehicle-model" className="block text-sm font-medium mb-2">
            Select {selectedMakeName} Model
            {!isLoadingModels && ` (${modelCount} available)`}
          </label>
          
          {isLoadingModels && (
            <div className="bg-blue-50 text-blue-700 p-2 rounded mb-2 text-sm">
              Loading models...
            </div>
          )}
          
          {!isLoadingModels && vehicleModels.length === 0 && (
            <div className="bg-amber-100 text-amber-800 p-2 rounded mb-2 text-sm">
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
      
      {/* Selection Summary */}
      {(selectedMake || selectedModel) && (
        <div className="mt-6 p-3 border rounded bg-gray-50 text-sm">
          <h3 className="font-medium mb-2">Your Selection:</h3>
          {selectedMakeName && (
            <div><span className="font-medium">Make:</span> {selectedMakeName}</div>
          )}
          {selectedModelName && (
            <div><span className="font-medium">Model:</span> {selectedModelName}</div>
          )}
        </div>
      )}
    </div>
  );
} 