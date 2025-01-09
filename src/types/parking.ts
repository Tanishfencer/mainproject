export type VehicleType = 'car' | 'bike' | 'ev' | 'bus';

export interface ParkingSpot {
  id: string;
  type: VehicleType;
  location: {
    lat: number;
    lng: number;
  };
  isAvailable: boolean;
  price: number;
}

export interface VehicleDetails {
  type: VehicleType;
  registrationNumber: string;
}

export interface Booking {
  id: string;
  spotId: string;
  userId: string;
  vehicleDetails: VehicleDetails;
  startTime: Date;
  duration: number; // in hours
  totalCost: number;
}