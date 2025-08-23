import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { Admin, AdminOtp } from '@/models/Admin';
import { TwilioService, formatPhoneNumber } from '@/lib/twilio';
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

    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get admin details
    const admin = await Admin.findById(currentAdmin.id);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      );
    }

    // Format and validate phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Check if phone number is in the allowed list
    if (!admin.isPhoneNumberAllowed(formattedPhone)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'This phone number is not authorized for admin access. Please contact the system administrator.' 
        },
        { status: 403 }
      );
    }

    // Check Twilio configuration
    if (!TwilioService.isConfigured()) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'SMS service is not configured. Please contact the administrator.' 
        },
        { status: 503 }
      );
    }

    // Create OTP
    const otpDoc = await AdminOtp.createOtp(formattedPhone);

    // Send OTP via Twilio
    try {
      const smsResult = await TwilioService.sendOtp(formattedPhone, otpDoc.otp);
      
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        phoneNumber: formattedPhone,
        messageId: smsResult.messageId
      });

    } catch (twilioError) {
      // Delete the OTP if SMS failed
      await AdminOtp.deleteOne({ _id: otpDoc._id });
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Failed to send OTP: ${twilioError.message}` 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
