import { useEffect, useState, useCallback } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const libraries: ["places"] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.75rem',
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: true,
  fullscreenControl: true,
};

const defaultCenter = {
  lat: 12.9716,  // Bangalore default coordinates
  lng: 77.5946,
};

export function NearbyParking() {
  const [currentLocation, setCurrentLocation] = useState(defaultCenter);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyDRGRki7eKvUC_qF7xBXsZ61Qx1PMADQDQ",
    libraries,
  });

  const getCurrentLocation = useCallback(() => {
    setLoadingLocation(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLoadingLocation(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log('Got location:', newLocation);
        setCurrentLocation(newLocation);
        setLoadingLocation(false);
        setLocationError(null);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError(
          error.code === 1 
            ? "Please enable location access in your browser settings."
            : "Failed to get your location. Please try again."
        );
        setLoadingLocation(false);
      },
      options
    );
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    const controlDiv = document.createElement('div');
    const controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to recenter the map';
    controlDiv.appendChild(controlUI);

    const controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Center Map';
    controlUI.appendChild(controlText);

    controlUI.addEventListener('click', () => {
      map.panTo(currentLocation);
    });

    map.controls[google.maps.ControlPosition.TOP_CENTER].push(controlDiv);
  }, [currentLocation]);

  if (loadError) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Error loading maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Nearby Parking Spots</h2>
        <Button
          onClick={getCurrentLocation}
          disabled={loadingLocation}
          variant="outline"
          className="flex items-center gap-2"
        >
          {loadingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              Refresh Location
            </>
          )}
        </Button>
      </div>

      {locationError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {locationError}
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden border border-gray-200/50">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={15}
          center={currentLocation}
          options={options}
          onLoad={onMapLoad}
        >
          <Marker
            position={currentLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4338ca",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
          />
        </GoogleMap>
      </div>
    </motion.div>
  );
}
