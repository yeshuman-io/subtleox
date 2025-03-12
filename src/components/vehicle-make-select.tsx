"use client";

import { VehicleMake } from "@/lib/data/vehicle-makes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleMakeSelectProps {
  vehicleMakes: VehicleMake[];
  disabled?: boolean;
  onSelect?: (makeId: string) => void;
}

export function VehicleMakeSelect({ 
  vehicleMakes, 
  disabled = false,
  onSelect
}: VehicleMakeSelectProps) {
  return (
    <Select 
      disabled={disabled} 
      onValueChange={onSelect}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a make" />
      </SelectTrigger>
      <SelectContent>
        {vehicleMakes.map((make) => (
          <SelectItem key={make.id} value={make.id}>
            {make.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 