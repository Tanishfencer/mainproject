import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Car, Bike, Zap, Bus, Calendar, Clock, Ban } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  spotId: string;
  spotLabel: string;
  vehicleNumber: string;
  startTime: string;
  endTime: string;
  totalCost: number;
  status: 'active' | 'completed' | 'cancelled';
  vehicleType: 'car' | 'bike' | 'ev' | 'bus';
}

const vehicleIcons = {
  car: Car,
  bike: Bike,
  ev: Zap,
  bus: Bus,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 0.95 }
};

interface BookingHistoryProps {
  userId: string;
}

export function BookingHistory({ userId }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`/api/bookings/history/${userId}`);
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST'
      });
      
      // Refresh bookings
      const response = await fetch(`/api/bookings/history/${userId}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold mb-6">Your Bookings</h2>
      
      <AnimatePresence>
        {bookings.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="text-center p-8 bg-gray-50 rounded-lg"
          >
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No bookings found</p>
          </motion.div>
        ) : (
          bookings.map((booking) => {
            const VehicleIcon = vehicleIcons[booking.vehicleType];
            const isActive = booking.status === 'active';
            
            return (
              <motion.div
                key={booking.id}
                variants={itemVariants}
                className={`p-6 rounded-lg shadow-sm border ${
                  isActive ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      isActive ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <VehicleIcon className={`w-6 h-6 ${
                        isActive ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{booking.spotLabel}</h3>
                      <p className="text-sm text-gray-500">{booking.vehicleNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{booking.totalCost}</p>
                    <span className={`text-sm ${
                      booking.status === 'active' ? 'text-blue-600' :
                      booking.status === 'completed' ? 'text-green-600' :
                      'text-red-600'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(booking.startTime), 'PPp')}</span>
                  </div>
                  
                  {isActive && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id)}
                      className="flex items-center space-x-1"
                    >
                      <Ban className="w-4 h-4" />
                      <span>Cancel</span>
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </motion.div>
  );
}