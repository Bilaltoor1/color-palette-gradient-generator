# Admin Phone Verification System

This document describes the implementation of phone number OTP verification as an additional security layer for admin authentication.

## Overview

The system adds a second factor authentication (2FA) using SMS OTP verification after successful email/password login. Only authorized phone numbers are allowed for admin access.

## Features

- **Two-Factor Authentication**: Email/password + SMS OTP
- **Authorized Phone Numbers Only**: Only specific phone numbers in the allow-list can receive OTPs
- **Session Management**: Secure session tracking with automatic cleanup
- **Rate Limiting**: Built-in protection against OTP abuse
- **Account Locking**: Protection against brute force attacks
- **Twilio Integration**: Professional SMS delivery service

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Database
MONGODB_URI=mongodb://localhost:27017/color-palette-generator

# JWT Secret (use a strong secret in production)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
```

### 2. Twilio Setup

1. Sign up for a [Twilio account](https://www.twilio.com/)
2. Get your Account SID and Auth Token from the Twilio Console
3. Purchase a phone number for sending SMS
4. Update the environment variables with your Twilio credentials

### 3. Configure Allowed Phone Numbers

Edit the `Admin.js` model to update the allowed phone numbers:

```javascript
allowedPhoneNumbers: { 
  type: [String], 
  default: [
    "+1234567890", // Replace with your first phone number
    "+0987654321"  // Replace with your second phone number
  ]
}
```

## Authentication Flow

1. **Email/Password Login**: User enters email and password
2. **Phone Verification Required**: If phone verification is required and not completed
3. **Enter Phone Number**: User enters their phone number
4. **Validation**: System checks if phone number is in the authorized list
5. **Send OTP**: 6-digit OTP is sent via SMS
6. **Verify OTP**: User enters the OTP
7. **Complete Authentication**: Access granted to admin panel

## Security Features

### Account Locking
- Maximum 5 failed login attempts
- Account locked for 15 minutes after max attempts
- Automatic unlock after cooldown period

### OTP Security
- 6-digit random OTP
- 10-minute expiration time
- Maximum 3 verification attempts per OTP
- OTP invalidated after successful verification

### Session Management
- Unique session IDs for each login
- Session tracking with IP address and user agent
- Automatic session cleanup for expired sessions
- Maximum concurrent sessions limit

### Phone Number Restrictions
- Only pre-approved phone numbers can receive OTPs
- Phone number validation and formatting
- Masked phone number display for privacy

## API Endpoints

### Send OTP
- **POST** `/api/auth/send-otp`
- **Body**: `{ "phoneNumber": "+1234567890" }`
- **Response**: `{ "success": true, "message": "OTP sent successfully" }`

### Verify OTP
- **POST** `/api/auth/verify-otp`
- **Body**: `{ "phoneNumber": "+1234567890", "otp": "123456" }`
- **Response**: `{ "success": true, "message": "Phone number verified successfully" }`

## Database Schema

### Admin Model
```javascript
{
  email: String,
  password: String,
  phoneNumber: String,
  isPhoneVerified: Boolean,
  allowedPhoneNumbers: [String],
  securitySettings: {
    requirePhoneVerification: Boolean,
    sessionTimeout: Number,
    maxConcurrentSessions: Number
  },
  loginAttempts: {
    count: Number,
    lastAttempt: Date,
    lockedUntil: Date
  }
}
```

### AdminSession Model
```javascript
{
  sessionId: String,
  adminId: String,
  email: String,
  isPhoneVerified: Boolean,
  lastActivity: Date,
  expiresAt: Date,
  ipAddress: String,
  userAgent: String
}
```

### AdminOtp Model
```javascript
{
  phoneNumber: String,
  otp: String,
  attempts: Number,
  maxAttempts: Number,
  createdAt: Date,
  expiresAt: Date,
  isUsed: Boolean
}
```

## Error Handling

### Common Error Responses

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Phone number not authorized
- `423 Locked`: Account temporarily locked
- `429 Too Many Requests`: Rate limit exceeded
- `503 Service Unavailable`: Twilio not configured

### Error Messages

- "Phone number is not authorized for admin access"
- "Invalid or expired OTP"
- "Too many attempts. Please request a new OTP"
- "Account is temporarily locked due to too many failed attempts"
- "SMS service is not configured"

## Development vs Production

### Development
- Use Twilio trial account (limited to verified numbers)
- Test with placeholder phone numbers
- Enable detailed logging

### Production
- Use Twilio production account
- Update allowed phone numbers with real numbers
- Enable secure cookies and HTTPS
- Set strong JWT secret
- Configure proper database security

## Troubleshooting

### OTP Not Received
1. Check if phone number is in allowed list
2. Verify Twilio configuration
3. Check Twilio console for delivery status
4. Ensure phone number format is correct (+1234567890)

### Login Issues
1. Check if account is locked
2. Verify database connection
3. Check JWT secret configuration
4. Review server logs for errors

### Session Problems
1. Check session expiration
2. Verify database connection
3. Clear browser cookies
4. Check for concurrent session limits

## Security Recommendations

1. **Use Strong Secrets**: Generate cryptographically strong JWT secrets
2. **Enable HTTPS**: Always use HTTPS in production
3. **Rotate Credentials**: Regularly rotate Twilio and JWT credentials
4. **Monitor Access**: Log and monitor admin access attempts
5. **Regular Updates**: Keep dependencies updated
6. **Backup Strategy**: Implement proper database backup procedures

## Cost Considerations

- Twilio SMS costs vary by destination
- Typical cost: $0.0075 per SMS in the US
- Consider usage patterns and budget accordingly
- Monitor Twilio usage dashboard

## Support

For issues with this implementation:
1. Check the troubleshooting section
2. Review server logs
3. Verify environment variables
4. Test Twilio configuration separately
5. Contact system administrator if needed
