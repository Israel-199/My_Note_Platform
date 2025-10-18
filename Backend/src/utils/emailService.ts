import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
  async sendOTP(email: string, otp: string, purpose: 'signup' | 'signin'): Promise<void> {
    const subject =
      purpose === 'signup'
        ? 'Welcome to My Notes - Verify Your Email'
        : 'My Notes - Sign In Verification';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #4F46E5; font-size: 24px; font-weight: bold; }
            .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 8px; letter-spacing: 4px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">My Notes</div>
            </div>
            <h2>${purpose === 'signup' ? 'Welcome to My Notes!' : 'Sign In to My Notes'}</h2>
            <p>Your verification code is:</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in 10 minutes. If you didn't request this code, please ignore this email.</p>
            <div class="footer">
              <p>Best regards,<br>Israel's Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: "My Notes <onboarding@resend.dev>",
      to: email,
      subject,
      html,
    });
  }
}

export default new EmailService();
