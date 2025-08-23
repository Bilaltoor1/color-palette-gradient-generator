"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../auth/AuthContext';
import PhoneVerification from '../../components/PhoneVerification';

export default function AdminAuthGuard({ children }) {
  const { admin, loading, requiresPhoneVerification, completePhoneVerification } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.replace('/auth/login');
    }
  }, [admin, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!admin) {
    return null;
  }

  // Show phone verification if required
  if (requiresPhoneVerification) {
    return (
      <PhoneVerification 
        admin={admin} 
        onVerificationComplete={completePhoneVerification}
      />
    );
  }

  return <>{children}</>;
}
