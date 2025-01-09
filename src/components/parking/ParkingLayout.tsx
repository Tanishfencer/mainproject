import { motion } from 'framer-motion';
import { ParkingSpot, VehicleType } from '@/types/parking';
import { getAvailableSpots } from '@/data/parking-spots';

interface ParkingLayoutProps {
  selectedVehicleType: VehicleType;
  onSpotSelect: (spot: ParkingSpot) => void;
}

export function ParkingLayout({ selectedVehicleType, onSpotSelect }: ParkingLayoutProps) {
  const availableSpots = getAvailableSpots(selectedVehicleType);

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">NCET College Parking Layout</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {availableSpots.map((spot) => (
          <motion.button
            key={spot.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
            onClick={() => onSpotSelect(spot)}
          >
            <div className="text-center">
              <span className="block font-semibold">{spot.label}</span>
              <span className="block text-sm text-gray-600">₹{spot.price}/hr</span>
              <span className="block text-xs text-green-600">Available</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}