import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NoteBook from '../assets/book.png';

interface FormData {
  email: string;
  otp: string;
}

interface FormErrors {
  email?: string;
  otp?: string;
}

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState<FormData>({ email: '', otp: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (otpSent && !formData.otp.trim()) {
      newErrors.otp = 'OTP is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authAPI.sendSigninOTP({ email: formData.email });
      setOtpSent(true);
      toast.success('OTP sent successfully! Check your email.');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || 'Failed to send OTP. Check backend.';
      toast.error(errorMessage);
      setErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Verify OTP → sets HTTP-only cookie
      await authAPI.verifySigninOTP(formData);

      // Fetch user profile using cookie
      const profile = await authAPI.getProfile();
      login(profile.data.user, profile.data.token); // token is in HTTP-only cookie

      toast.success('Signed in successfully!');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || 'Invalid OTP. Try again.';
      toast.error(errorMessage);
      setErrors({ otp: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await authAPI.sendSigninOTP({ email: formData.email });
      toast.success('OTP resent successfully!');
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="absolute top-6 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 z-50">
        <img src={NoteBook} alt="NoteBook" className="inline-block w-8 h-8 mr-1" />
        <strong>My Notes</strong>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h1>
          <p className="text-gray-600">Please login to continue to your account.</p>
        </div>

        <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="israel@gmail.com"
            value={formData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            error={errors.email}
            icon={<Mail className="w-5 h-5" />}
            disabled={otpSent}
          />

          {otpSent && (
            <>
              <div className="text-center text-sm text-gray-600 mb-4">
                We've sent a verification code to <strong>{formData.email}</strong>
              </div>
              <Input
                label="OTP"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={e => handleInputChange('otp', e.target.value)}
                error={errors.otp}
                maxLength={6}
              />
            </>
          )}

          <Button type="submit" isLoading={isLoading} className="w-full">
            {otpSent ? 'Sign in' : 'Send OTP'}
          </Button>

          {otpSent && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Resend OTP
              </button>
            </div>
          )}

          <div className="text-center">
            <span className="text-gray-600">Need an account? </span>
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Create one
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default SignIn;
