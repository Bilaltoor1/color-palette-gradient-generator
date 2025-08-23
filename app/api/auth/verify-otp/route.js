import { NextResponse } from 'next/server';
import { getCurrentAdmin, verifyAdminPhone, updateSessionPhoneVerification } from '@/lib/auth';
import { AdminOtp } from '@/models/Admin';
import { formatPhoneNumber } from '@/lib/twilio';
import { dbConnect } from '@/lib/mongoose';

export async function POST(request) {
  try {
    // Check if admin is authenticated
    const currentAdmin = await getCurrentAdmin();
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { phoneNumber, otp } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, message: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Verify OTP
    const verificationResult = await AdminOtp.verifyOtp(formattedPhone, otp);

    if (!verificationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: verificationResult.message 
        },
        { status: 400 }
      );
    }

    // Update admin phone verification
    try {
      await verifyAdminPhone(currentAdmin.id, formattedPhone);
      
      // Update session to mark phone as verified
      if (currentAdmin.sessionId) {
        await updateSessionPhoneVerification(currentAdmin.sessionId, true);
      }

      return NextResponse.json({
        success: true,
        message: 'Phone number verified successfully',
        phoneNumber: formattedPhone
      });

    } catch (verifyError) {
      return NextResponse.json(
        { 
          success: false, 
          message: verifyError.message 
        },
        { status: 403 }
      );
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
