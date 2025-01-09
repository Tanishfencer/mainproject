import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { X, Car, Bike, Zap, Bus } from 'lucide-react';
import { useState } from 'react';

interface BookingReceiptProps {
  booking: {
    id: string;
    spotId: string;
    spotLabel: string;
    vehicleNumber: string;
    startTime: string;
    endTime: string;
    totalCost: number;
    vehicleType: 'car' | 'bike' | 'ev' | 'bus';
  };
  onClose: () => void;
}

const vehicleIcons = {
  car: Car,
  bike: Bike,
  ev: Zap,
  bus: Bus,
};

const receiptVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    x: '100%', 
    opacity: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200,
      when: "afterChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 }
};

export function BookingReceipt({ booking, onClose }: BookingReceiptProps) {
  const [isVisible, setIsVisible] = useState(true);
  const VehicleIcon = vehicleIcons[booking.vehicleType];

  const qrData = JSON.stringify({
    bookingId: booking.id,
    spotId: booking.spotId,
    vehicleNumber: booking.vehicleNumber,
  });

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            variants={receiptVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl p-8 max-w-md w-full mx-4 relative shadow-2xl"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <motion.div variants={itemVariants} className="flex items-center justify-center mb-6">
              <VehicleIcon className="h-12 w-12 text-primary" />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
                <p className="text-gray-500">Your parking spot is reserved</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Spot</span>
                  <span className="font-medium">{booking.spotLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle</span>
                  <span className="font-medium">{booking.vehicleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Time</span>
                  <span className="font-medium">{booking.startTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Time</span>
                  <span className="font-medium">{booking.endTime}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Cost</span>
                  <span>₹{booking.totalCost}</span>
                </div>
              </div>

              <motion.div 
                variants={itemVariants}
                className="flex justify-center"
              >
                <div className="bg-white p-4 rounded-lg shadow-inner">
                  <QRCodeSVG
                    value={qrData}
                    size={160}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <p className="text-center text-sm text-gray-500">
                  Show this QR code at the parking entrance
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}