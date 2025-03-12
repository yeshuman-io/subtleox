"use client";

import { useState, useEffect } from "react";
import { VehicleMake } from "@/lib/data/vehicle-makes";
import { VehicleModel, listVehicleModels } from "@/lib/data/vehicle-models";
import { VehicleSeries, listVehicleSeries } from "@/lib/data/vehicle-series";
import { VehicleBody, listVehicleBodies } from "@/lib/data/vehicle-bodies";
import { VehicleMakeSelect } from "./vehicle-make-select";
import { VehicleModelSelect } from "./vehicle-model-select";
import { VehicleSeriesSelect } from "./vehicle-series-select";
import { VehicleBodySelect } from "./vehicle-body-select";

interface VehicleSelectorProps {
  initialVehicleMakes: VehicleMake[];
  makeCount: number;
}

export function VehicleSelector({ initialVehicleMakes, makeCount }: VehicleSelectorProps) {
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
  
  // Fetch models when a make is selected
  useEffect(() => {
    // Reset model, series, and body selection when make changes
    setSelectedModel(null);
    setVehicleModels([]);
    setSelectedSeries(null);
    setVehicleSeries([]);
    setSelectedBody(null);
    setVehicleBodies([]);
    
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
  
  return (
    <div className="w-full max-w-md space-y-4">
      {/* Vehicle Make Selector */}
      <div className="w-full">
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
        <div className="w-full">
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
      
      {/* Vehicle Series Selector - only show when a model is selected */}
      {selectedModel && (
        <div className="w-full">
          <label htmlFor="vehicle-series" className="block text-sm font-medium mb-2">
            Select {selectedModelName} Year Range
            {!isLoadingSeries && ` (${seriesCount} available)`}
          </label>
          
          {isLoadingSeries && (
            <div className="bg-blue-50 text-blue-700 p-2 rounded mb-2 text-sm">
              Loading year ranges...
            </div>
          )}
          
          {!isLoadingSeries && vehicleSeries.length === 0 && (
            <div className="bg-amber-100 text-amber-800 p-2 rounded mb-2 text-sm">
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
        <div className="w-full">
          <label htmlFor="vehicle-body" className="block text-sm font-medium mb-2">
            Select {selectedModelName} Body Style
            {!isLoadingBodies && ` (${bodyCount} available)`}
          </label>
          
          {isLoadingBodies && (
            <div className="bg-blue-50 text-blue-700 p-2 rounded mb-2 text-sm">
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
    </div>
  );
} 