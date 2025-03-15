"use client";

import { VehicleModel } from "@/lib/data/vehicle-models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleModelSelectProps {
  vehicleModels: VehicleModel[];
  disabled?: boolean;
  onSelect?: (modelId: string) => void;
}

export function VehicleModelSelect({ 
  vehicleModels, 
  disabled = false,
  onSelect
}: VehicleModelSelectProps) {
  return (
    <Select 
      disabled={disabled} 
      onValueChange={onSelect}
    >
      <SelectTrigger id="vehicle-model" className="w-full">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {vehicleModels.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 