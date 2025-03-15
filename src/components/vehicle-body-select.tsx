"use client";

import { VehicleBody } from "@/lib/data/vehicle-bodies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleBodySelectProps {
  vehicleBodies: VehicleBody[];
  disabled?: boolean;
  onSelect?: (bodyId: string) => void;
}

export function VehicleBodySelect({ 
  vehicleBodies, 
  disabled = false,
  onSelect
}: VehicleBodySelectProps) {
  return (
    <Select 
      disabled={disabled} 
      onValueChange={onSelect}
    >
      <SelectTrigger id="vehicle-body" className="w-full">
        <SelectValue placeholder="Select body style" />
      </SelectTrigger>
      <SelectContent>
        {vehicleBodies.map((body) => (
          <SelectItem key={body.id} value={body.id}>
            {body.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 