import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '../components/ui/use-toast';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
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
        // First, test if the API is reachable
        console.log('Testing API connectivity...');
        const testResponse = await fetch('http://localhost:8000/api/auth/verify/test');
        const testText = await testResponse.text();
        console.log('Test endpoint response:', testText);

        // Now try the actual verification
        console.log('Attempting to verify token:', token);
        const response = await fetch(`http://localhost:8000/api/auth/verify/${token}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const text = await response.text();
        console.log('Raw response text:', text);

        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse response:', e);
          throw new Error(`Server returned invalid response format. Raw response: ${text.substring(0, 100)}...`);
        }

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        console.log('Verification successful:', data);

        toast({
          title: "Success!",
          description: data.message || "Your email has been verified successfully. You can now log in.",
          variant: "default",
        });
        setTimeout(() => navigate('/'), 2000);
      } catch (error: any) {
        console.error('Verification error:', error);
        toast({
          title: "Verification Failed",
          description: error.message || "Something went wrong during verification.",
          variant: "destructive",
        });
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {verifying ? (
              "Please wait while we verify your email..."
            ) : (
              "Redirecting you to the login page..."
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
