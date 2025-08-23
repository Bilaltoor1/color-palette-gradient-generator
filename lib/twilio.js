import twilio from 'twilio';

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export class TwilioService {
  static isConfigured() {
    return !!(accountSid && authToken && phoneNumber);
  }

  static async sendOtp(to, otp) {
    if (!this.isConfigured()) {
      throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER');
    }

    try {
      const message = await client.messages.create({
        body: `Your admin verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`,
        from: phoneNumber,
        to: to,
      });

      return {
        success: true,
        messageId: message.sid,
        status: message.status
      };
    } catch (error) {
      console.error('Twilio SMS Error:', error);
      
      // Handle specific Twilio errors
      if (error.code === 21211) {
        throw new Error('Invalid phone number format');
      } else if (error.code === 21608) {
        throw new Error('Phone number is not verified with Twilio (trial account)');
      } else if (error.code === 21614) {
        throw new Error('Phone number is not a valid mobile number');
      }
      
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  static async validatePhoneNumber(phoneNumber) {
    if (!this.isConfigured()) {
      return { valid: false, error: 'Twilio not configured' };
    }

    try {
      const lookup = await client.lookups.v1.phoneNumbers(phoneNumber).fetch();
      return {
        valid: true,
        formattedNumber: lookup.phoneNumber,
        countryCode: lookup.countryCode,
        nationalFormat: lookup.nationalFormat
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

// Utility function for phone number formatting
export function formatPhoneNumber(phoneNumber) {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add + prefix if not present and number doesn't start with +
  if (!phoneNumber.startsWith('+')) {
    // Assume US number if 10 digits, otherwise add + prefix
    if (cleaned.length === 10) {
      return '+1' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return '+' + cleaned;
    } else {
      return '+' + cleaned;
    }
  }
  
  return phoneNumber;
}

// Utility function to mask phone number for display
export function maskPhoneNumber(phoneNumber) {
  if (!phoneNumber) return '';
  
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length >= 4) {
    const lastFour = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4) + lastFour;
    return `+${masked}`;
  }
  
  return phoneNumber;
}
