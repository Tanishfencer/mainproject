import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { VehicleSelection } from '@/components/vehicle/vehicle-selection';
import { ParkingLayout } from '@/components/parking/ParkingLayout';
import { BookingForm } from '@/components/booking/booking-form';
import { BookingReceipt } from '@/components/booking/BookingReceipt';
import { BookingHistory } from '@/components/bookings/BookingHistory';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VehicleType, ParkingSpot } from '@/types/parking';
import { updateSpotAvailability } from '@/data/parking-spots';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { toast } from '@/components/ui/use-toast';

export function Dashboard() {
  const { user } = useAuth();
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSpotSelect = (spot: ParkingSpot) => {
    setSelectedSpot(spot);
  };

  const handleBookingSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const bookingId = Math.random().toString(36).substr(2, 9);

      const booking = {
        id: bookingId,
        spotId: selectedSpot!.id,
        spotLabel: selectedSpot!.label,
        vehicleNumber: data.registrationNumber,
        startTime: data.startTime,
        endTime: data.endTime,
        totalCost: Math.round(selectedSpot!.price * ((new Date(`2024-01-01T${data.endTime}`).getTime() - new Date(`2024-01-01T${data.startTime}`).getTime()) / (1000 * 60 * 60))),
        vehicleType: selectedVehicleType,
        status: 'active',
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateSpotAvailability(selectedSpot!.id, false);
      setCurrentBooking(booking);
      setSelectedSpot(null);
      
      toast({
        title: "Booking Created!",
        description: "Your parking spot has been reserved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiptClose = () => {
    setCurrentBooking(null);
    setSelectedVehicleType(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundGradient />
      <Header />
      
      <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Parking System</h1>
          <p className="text-lg text-gray-600">Find and book your perfect parking spot</p>
        </motion.div>

        <Tabs defaultValue="book" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="book" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Book Parking
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              My Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl p-6 border border-gray-200/50"
            >
              <h2 className="text-2xl font-semibold mb-6 text-center">Select Your Vehicle Type</h2>
              <VehicleSelection onSelect={setSelectedVehicleType} />
            </motion.div>

            {selectedVehicleType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="md:col-span-2">
                  <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl p-6 border border-gray-200/50">
                    <h3 className="text-xl font-semibold mb-4">Available Parking Spots</h3>
                    <ParkingLayout
                      selectedVehicleType={selectedVehicleType}
                      onSpotSelect={handleSpotSelect}
                    />
                  </div>
                </div>
                {selectedSpot && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl p-6 border border-gray-200/50"
                  >
                    <h3 className="text-xl font-semibold mb-4">Book Parking Spot</h3>
                    <BookingForm
                      selectedSpot={selectedSpot}
                      onSubmit={handleBookingSubmit}
                      userId={user?.id || ''}
                      isLoading={isLoading}
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl p-6 border border-gray-200/50"
            >
              <BookingHistory userId={user?.id || ''} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {currentBooking && (
        <BookingReceipt
          booking={currentBooking}
          onClose={handleReceiptClose}
        />
      )}
    </div>
  );
}