import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { ParkingSpot, VehicleType } from '@/types/parking';

interface ParkingMapProps {
  selectedVehicleType: VehicleType | null;
  onSpotSelect: (spot: ParkingSpot) => void;
}

// Mock parking spots data
const mockParkingSpots: ParkingSpot[] = [
  {
    id: '1',
    type: 'car',
    location: { lat: 12.9716, lng: 77.5946 }, // Bangalore coordinates
    isAvailable: true,
    price: 50,
  },
  {
    id: '2',
    type: 'bike',
    location: { lat: 12.9717, lng: 77.5947 },
    isAvailable: true,
    price: 20,
  },
  {
    id: '3',
    type: 'ev',
    location: { lat: 12.9718, lng: 77.5948 },
    isAvailable: true,
    price: 60,
  },
];

export function ParkingMap({ selectedVehicleType, onSpotSelect }: ParkingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with your API key
      version: 'weekly',
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 12.9716, lng: 77.5946 },
          zoom: 15,
        });
        setMap(map);
      }
    });
  }, []);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    // Filter spots based on selected vehicle type
    const filteredSpots = selectedVehicleType
      ? mockParkingSpots.filter(spot => spot.type === selectedVehicleType)
      : mockParkingSpots;

    // Create new markers
    const newMarkers = filteredSpots.map(spot => {
      const marker = new google.maps.Marker({
        position: spot.location,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: spot.isAvailable ? '#22c55e' : '#ef4444',
          fillOpacity: 0.8,
          strokeWeight: 1,
          scale: 10,
        },
      });

      marker.addListener('click', () => {
        onSpotSelect(spot);
      });

      return marker;
    });

    setMarkers(newMarkers);
  }, [map, selectedVehicleType]);

  return (
    <div ref={mapRef} className="w-full h-[400px] rounded-lg shadow-md" />
  );
}