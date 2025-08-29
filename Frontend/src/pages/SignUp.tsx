import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Calendar, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NoteBook from '../assets/book.png';

interface FormData {
  fullName: string;
  email: string;
  dateOfBirth: string;
  otp: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  dateOfBirth?: string;
  otp?: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    dateOfBirth: '',
    otp: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 13 || age > 120) {
        newErrors.dateOfBirth = 'Age must be between 13 and 120 years';
      }
    }

    if (step === 2 && !formData.otp.trim()) {
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
      await authAPI.sendSignupOTP({
        email: formData.email,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
      });

      setStep(2);
      toast.success('OTP sent successfully! Check your email.');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        (error.code === 'ERR_NETWORK' ? 'Cannot connect to server' : 'Failed to send OTP');
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
      await authAPI.verifySignupOTP(formData);

      // Fetch user profile after cookie-based login
      const profileResponse = await authAPI.getProfile();
      login(profileResponse.data.user, ''); // token is in HTTP-only cookie

      toast.success('Account created successfully!');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        (error.code === 'ERR_NETWORK' ? 'Cannot connect to server' : 'Invalid OTP');
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
      await authAPI.sendSignupOTP({
        email: formData.email,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
      });
      toast.success('OTP resent successfully!');
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="absolute top-6 left-1/2 -translate-x-1/2 lg:left-4 lg:translate-x-0 z-50 flex items-center">
        <img src={NoteBook} alt="NoteBook" className="inline-block w-8 h-8 mr-1" />
        <strong>My Notes</strong>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md mx-auto mt-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign up</h1>
          <p className="text-gray-600">Sign up to enjoy the features of My Notes</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <Input
              label="Full Name"
              placeholder="Israel Assefa"
              type="text"
              value={formData.fullName}
              onChange={e => handleInputChange('fullName', e.target.value)}
              error={errors.fullName}
              icon={<User className="w-5 h-5" />}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={e => handleInputChange('dateOfBirth', e.target.value)}
              error={errors.dateOfBirth}
              icon={<Calendar className="w-5 h-5" />}
            />
            <Input
              label="Email"
              placeholder="israel@gmail.com"
              type="email"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              error={errors.email}
              icon={<Mail className="w-5 h-5" />}
            />
            <Button type="submit" isLoading={isLoading} className="w-full">
              Get OTP
            </Button>
            <div className="text-center">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">We've sent a verification code to</p>
              <p className="font-medium text-gray-900">{formData.email}</p>
            </div>

            <Input
              label="OTP"
              placeholder="Enter 6-digit OTP"
              type="text"
              value={formData.otp}
              onChange={e => handleInputChange('otp', e.target.value)}
              error={errors.otp}
              maxLength={6}
            />

            <Button type="submit" isLoading={isLoading} className="w-full">
              Sign up
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Resend OTP
              </button>
              <div>
                <span className="text-gray-600">Already have an account? </span>
                <Link to="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default SignUp;
