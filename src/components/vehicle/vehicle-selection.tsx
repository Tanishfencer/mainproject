import { useState } from 'react';
import { Car, Bike, Zap, Bus } from 'lucide-react';
import { VehicleType } from '@/types/parking';
import { Button } from '@/components/ui/button';

const vehicleOptions: { type: VehicleType; icon: React.ReactNode; label: string }[] = [
  { type: 'car', icon: <Car className="h-8 w-8" />, label: 'Car' },
  { type: 'bike', icon: <Bike className="h-8 w-8" />, label: 'Bike' },
  { type: 'ev', icon: <Zap className="h-8 w-8" />, label: 'EV' },
  { type: 'bus', icon: <Bus className="h-8 w-8" />, label: 'Bus' },
];

interface VehicleSelectionProps {
  onSelect: (type: VehicleType) => void;
}

export function VehicleSelection({ onSelect }: VehicleSelectionProps) {
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null);

  const handleSelect = (type: VehicleType) => {
    setSelectedType(type);
    onSelect(type);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {vehicleOptions.map(({ type, icon, label }) => (
        <Button
          key={type}
          variant={selectedType === type ? 'default' : 'outline'}
          className="h-32 flex flex-col items-center justify-center gap-2"
          onClick={() => handleSelect(type)}
        >
          {icon}
          <span>{label}</span>
        </Button>
      ))}
    </div>
  );
}