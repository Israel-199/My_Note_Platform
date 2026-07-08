import dotenv from 'dotenv';
dotenv.config();

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

    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'My Notes', email: senderEmail },
        to: [{ email }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Brevo API error:', response.status, errorData);
      throw new Error(`Email sending failed: ${response.status}`);
    }
  }
}

export default new EmailService();
