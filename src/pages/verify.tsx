import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '../components/ui/use-toast';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('No verification token provided');
        toast({
          title: "Verification Failed",
          description: "No verification token provided",
          variant: "destructive",
        });
        setVerifying(false);
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      try {
        console.log('Starting verification process for token:', token);
        
        const apiUrl = `${import.meta.env.VITE_API_URL}api/auth/verify/${token}`;
        console.log('Making request to:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        
        let data;
        const text = await response.text();
        console.log('Raw response:', text);

        try {
          data = JSON.parse(text);
          console.log('Parsed response:', data);
        } catch (e) {
          console.error('Failed to parse response:', e);
          throw new Error('Server returned invalid response format');
        }

        if (response.ok && data.success) {
          setSuccess(true);
          setVerifying(false);
          toast({
            title: "Success!",
            description: "Your email has been verified. You can now log in.",
          });
          setTimeout(() => navigate('/'), 2000);
        } else if (response.status === 400 && data.message === 'Email is already verified') {
          setSuccess(true);
          setVerifying(false);
          toast({
            title: "Already Verified",
            description: "Your email is already verified. You can log in.",
          });
          setTimeout(() => navigate('/'), 2000);
        } else {
          throw new Error(data.message || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to verify email';
        setError(errorMessage);
        setVerifying(false);
        toast({
          title: "Verification Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setTimeout(() => navigate('/'), 3000);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Email Verification
        </h1>
        
        {verifying ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600 dark:text-gray-300">Verifying your email...</p>
          </div>
        ) : success ? (
          <div className="text-center">
            <p className="text-green-500 mb-4">Email verified successfully!</p>
            <p className="text-gray-600 dark:text-gray-300">
              Redirecting to login page...
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-gray-600 dark:text-gray-300">
              Redirecting to login page...
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VerifyEmail;
