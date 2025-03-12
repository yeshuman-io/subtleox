"use client";

import { useState, useEffect } from "react";
import { VehicleMake } from "@/lib/data/vehicle-makes";
import { VehicleModel, listVehicleModels } from "@/lib/data/vehicle-models";
import { VehicleSeries, listVehicleSeries } from "@/lib/data/vehicle-series";
import { VehicleMakeSelect } from "./vehicle-make-select";
import { VehicleModelSelect } from "./vehicle-model-select";
import { VehicleSeriesSelect } from "./vehicle-series-select";

interface VehicleSelectorProps {
  initialVehicleMakes: VehicleMake[];
  makeCount: number;
}

export function VehicleSelector({ initialVehicleMakes, makeCount }: VehicleSelectorProps) {
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [modelCount, setModelCount] = useState<number>(0);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  
  const [vehicleSeries, setVehicleSeries] = useState<VehicleSeries[]>([]);
  const [seriesCount, setSeriesCount] = useState<number>(0);
  const [isLoadingSeries, setIsLoadingSeries] = useState<boolean>(false);
  
  // Fetch models when a make is selected
  useEffect(() => {
    // Reset model and series selection when make changes
    setSelectedModel(null);
    setVehicleModels([]);
    setSelectedSeries(null);
    setVehicleSeries([]);
    
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
  
  // Fetch series when a model is selected
  useEffect(() => {
    // Reset series selection when model changes
    setSelectedSeries(null);
    setVehicleSeries([]);
    
    // Don't fetch series if no model is selected
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
    
    fetchSeries();
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
  
  // Format year range for display
  const formatYearRange = (series: VehicleSeries): string => {
    const currentYear = new Date().getFullYear();
    
    if (series.end_year >= currentYear) {
      return `${series.start_year}-Present`;
    }
    
    return `${series.start_year}-${series.end_year}`;
  };
  
  // Find selected make, model and series names/years for display
  const selectedMakeName = selectedMake 
    ? initialVehicleMakes.find(make => make.id === selectedMake)?.name 
    : null;
    
  const selectedModelName = selectedModel 
    ? vehicleModels.find(model => model.id === selectedModel)?.name 
    : null;
    
  const selectedSeriesYears = selectedSeries
    ? vehicleSeries.find(series => series.id === selectedSeries)
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
      
      {/* Vehicle Series Selector - only show when a model is selected */}
      {selectedModel && (
        <div>
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
      
      {/* Selection Summary */}
      {(selectedMake || selectedModel || selectedSeries) && (
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
        </div>
      )}
    </div>
  );
} 