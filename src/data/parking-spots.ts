import { ParkingSpot, VehicleType } from '@/types/parking';

// NCET College parking layout
export const parkingSpots: ParkingSpot[] = [
  // Car spots
  { id: 'C1', type: 'car', label: 'Block A - C1', isAvailable: true, price: 50 },
  { id: 'C2', type: 'car', label: 'Block A - C2', isAvailable: true, price: 50 },
  { id: 'C3', type: 'car', label: 'Block B - C3', isAvailable: true, price: 50 },
  { id: 'C4', type: 'car', label: 'Block B - C4', isAvailable: true, price: 50 },
  
  // Bike spots
  { id: 'B1', type: 'bike', label: 'Block A - B1', isAvailable: true, price: 20 },
  { id: 'B2', type: 'bike', label: 'Block A - B2', isAvailable: true, price: 20 },
  { id: 'B3', type: 'bike', label: 'Block B - B3', isAvailable: true, price: 20 },
  { id: 'B4', type: 'bike', label: 'Block B - B4', isAvailable: true, price: 20 },
  
  // EV spots
  { id: 'E1', type: 'ev', label: 'Block A - E1', isAvailable: true, price: 60 },
  { id: 'E2', type: 'ev', label: 'Block B - E2', isAvailable: true, price: 60 },
  
  // Bus spots
  { id: 'BU1', type: 'bus', label: 'Main Gate - BU1', isAvailable: true, price: 100 },
  { id: 'BU2', type: 'bus', label: 'Main Gate - BU2', isAvailable: true, price: 100 },
];

export const getAvailableSpots = (type: VehicleType) => {
  return parkingSpots.filter(spot => spot.type === type && spot.isAvailable);
};

export const updateSpotAvailability = (spotId: string, isAvailable: boolean) => {
  const spotIndex = parkingSpots.findIndex(spot => spot.id === spotId);
  if (spotIndex !== -1) {
    parkingSpots[spotIndex].isAvailable = isAvailable;
  }
};