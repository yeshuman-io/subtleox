"use client";

import { VehicleSeries } from "@/lib/data/vehicle-series";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleSeriesSelectProps {
  vehicleSeries: VehicleSeries[];
  disabled?: boolean;
  onSelect?: (seriesId: string) => void;
}

export function VehicleSeriesSelect({ 
  vehicleSeries, 
  disabled = false,
  onSelect
}: VehicleSeriesSelectProps) {
  // Helper function to format the year range display
  const formatYearRange = (series: VehicleSeries): string => {
    const currentYear = new Date().getFullYear();
    
    // If end_year is the current year or beyond, display as "2018-Present"
    if (series.end_year >= currentYear) {
      return `${series.start_year}-Present`;
    }
    
    return `${series.start_year}-${series.end_year}`;
  };
  
  return (
    <Select 
      disabled={disabled} 
      onValueChange={onSelect}
    >
      <SelectTrigger id="vehicle-series" className="w-full">
        <SelectValue placeholder="Select series years" />
      </SelectTrigger>
      <SelectContent>
        {vehicleSeries.map((series) => (
          <SelectItem key={series.id} value={series.id}>
            {formatYearRange(series)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 