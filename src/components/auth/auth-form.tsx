import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/components/ui/use-toast';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

type AuthFormData = z.infer<typeof authSchema>;

const API_URL = 'http://localhost:8000/api/auth';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      setIsLoading(true);
      const endpoint = isLogin ? `${API_URL}/login` : `${API_URL}/register`;
      
      console.log('Sending request to:', endpoint);
      console.log('Request data:', { email: data.email });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log('Raw response:', text);

      let result;
      try {
        result = JSON.parse(text);
        console.log('Parsed response:', result);
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error(`Server returned invalid response format. Raw response: ${text.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(result?.message || 'Request failed');
      }

      if (isLogin) {
        login({
          id: result.userId || '1',
          email: data.email,
          token: result.token,
        });
        toast({
          title: "Success!",
          description: "Successfully logged in.",
          variant: "default",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Registration Successful!",
          description: result.message || "Please check your email to verify your account.",
          variant: "default",
        });
        reset();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{isLogin ? 'Login' : 'Register'}</h2>
        <p className="text-gray-600 mt-2">
          {isLogin
            ? 'Welcome back! Please login to your account.'
            : 'Create a new account to get started.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Input
            type="email"
            placeholder="Email"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Input
            type="password"
            placeholder="Password"
            {...register('password')}
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : isLogin ? (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Register
            </>
          )}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            reset();
          }}
          className="text-blue-500 hover:text-blue-600 text-sm"
        >
          {isLogin
            ? "Don't have an account? Register"
            : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}