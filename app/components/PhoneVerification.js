"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PhoneVerification({ admin, onVerificationComplete }) {
  const [step, setStep] = useState('enterPhone'); // 'enterPhone' or 'enterOtp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('OTP sent successfully!');
        setStep('enterOtp');
        setOtpSent(true);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Phone number verified successfully!');
        onVerificationComplete?.(data.phoneNumber);
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    await handleSendOtp();
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as +1 (XXX) XXX-XXXX for US numbers
    if (cleaned.length <= 10) {
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        return `+1 ${match[1] ? `(${match[1]}` : ''}${match[1] && match[1].length === 3 ? ') ' : ''}${match[2]}${match[2] && match[3] ? '-' : ''}${match[3]}`;
      }
    }
    
    return value;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Phone Verification Required
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Additional security verification for admin access
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {step === 'enterPhone' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Only authorized phone numbers are accepted for admin access
                </p>
              </div>

              <Button
                onClick={handleSendOtp}
                disabled={loading || !phoneNumber.trim()}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </div>
          )}

          {step === 'enterOtp' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="mt-1 text-center text-lg tracking-widest"
                  maxLength={6}
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the 6-digit code sent to {phoneNumber}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                  >
                    Resend code
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('enterPhone');
                      setOtp('');
                      setOtpSent(false);
                    }}
                    disabled={loading}
                    className="text-sm text-gray-600 hover:text-gray-500 disabled:text-gray-400"
                  >
                    Change phone number
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
