import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { TimeSelector } from '@/components/time/TimeSelector';
import { useState, useEffect } from 'react';
import { VehicleAnimation } from '../animations/VehicleAnimation';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const bookingSchema = z.object({
  registrationNumber: z.string().min(1, 'Vehicle registration number is required'),
  email: z.string().email('Valid email is required'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  selectedSpot: {
    id: string;
    label: string;
  };
  onSubmit: (data: any) => void;
  userId: string;
  isLoading?: boolean;
}

export function BookingForm({ selectedSpot, onSubmit, userId, isLoading = false }: BookingFormProps) {
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(startTime.getTime() + 3600000));
  const [showVehicle, setShowVehicle] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOTP] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  useEffect(() => {
    const checkActiveBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/active/${userId}`);
        const data = await response.json();
        if (data.hasActiveBooking) {
          toast({
            title: "Active Booking Found",
            description: "You already have an active booking. Please wait for it to expire or cancel it before making a new booking.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error checking active booking:', error);
      }
    };
    checkActiveBooking();
  }, [userId]);

  const handleFormSubmit = async (data: BookingFormData) => {
    try {
      setSendingOTP(true);
      
      // Check for active bookings
      try {
        const activeBookingCheck = await fetch(`http://localhost:8000/api/bookings/active/${userId}`);
        if (!activeBookingCheck.ok) {
          throw new Error('Failed to check active bookings');
        }
        const activeBookingData = await activeBookingCheck.json();
        
        if (activeBookingData.hasActiveBooking) {
          toast({
            title: "Booking Failed",
            description: "You already have an active booking. Please wait for it to expire or cancel it.",
            variant: "destructive"
          });
          return;
        }
      } catch (error) {
        console.error('Error checking active bookings:', error);
        // Continue with booking even if active booking check fails
      }

      const bookingDetails = {
        ...data,
        startTime: startTime.toLocaleTimeString('en-US', { hour12: false }),
        endTime: endTime.toLocaleTimeString('en-US', { hour12: false }),
        spotId: selectedSpot.id,
        userId,
      };

      console.log('Sending OTP request with:', {
        email: data.email,
        bookingDetails
      });

      // Send OTP
      const response = await fetch('http://localhost:8000/api/bookings/send-otp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          bookingDetails,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error('Non-JSON response:', await response.text());
        throw new Error('Server returned non-JSON response');
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to send OTP');
      }

      const responseData = await response.json();
      console.log('Server response:', responseData);

      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code",
      });

      setShowOTPDialog(true);
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setVerifyingOTP(true);
      setOtpError('');

      console.log('Verifying OTP:', {
        email: getValues('email'),
        otp
      });

      const response = await fetch('http://localhost:8000/api/bookings/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: getValues('email'),
          otp
        })
      });

      const text = await response.text();
      console.log('Raw response:', text);

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error(`Server returned invalid response format. Raw response: ${text.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(result.message || 'Failed to verify OTP');
      }

      toast({
        title: "Success!",
        description: "Booking confirmed successfully",
      });

      setShowOTPDialog(false);
      setShowVehicle(true);

      // Call the parent's onSubmit with the booking data
      onSubmit(result.booking);
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError(error instanceof Error ? error.message : 'Failed to verify OTP');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify OTP",
        variant: "destructive"
      });
    } finally {
      setVerifyingOTP(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Registration Number
            </label>
            <Input
              {...register('registrationNumber')}
              placeholder="Enter vehicle number"
              className={errors.registrationNumber ? 'border-red-500' : ''}
            />
            {errors.registrationNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.registrationNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              {...register('email')}
              type="email"
              placeholder="Enter your email"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <TimeSelector
              value={startTime}
              onChange={(time) => {
                setStartTime(time);
                setEndTime(new Date(time.getTime() + 3600000));
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <TimeSelector
              value={endTime}
              onChange={setEndTime}
              minTime={new Date(startTime.getTime() + 1800000)}
            />
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleSubmit(handleFormSubmit)}
          disabled={isLoading || sendingOTP}
        >
          {sendingOTP ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending OTP...
            </>
          ) : (
            'Book Now'
          )}
        </Button>

        <AnimatePresence>
          {showVehicle && <VehicleAnimation />}
        </AnimatePresence>
      </motion.div>

      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Your Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Please enter the verification code sent to your email.
            </p>
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
            />
            {otpError && (
              <p className="text-sm text-red-500">{otpError}</p>
            )}
            <Button
              className="w-full"
              onClick={handleVerifyOTP}
              disabled={verifyingOTP || otp.length !== 6}
            >
              {verifyingOTP ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}