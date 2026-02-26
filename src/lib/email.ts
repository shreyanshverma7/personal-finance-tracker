import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: 'Reset your myRupaiya password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FB8500;">Reset Your Password</h2>
          <p>You requested to reset your password for your myRupaiya account.</p>
          <p>Click the button below to reset your password. This link will expire in 15 minutes.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #FB8500; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link: ${resetUrl}</p>
        </div>
      `,
      text: `Reset your myRupaiya password\n\nClick this link to reset your password (expires in 15 minutes):\n${resetUrl}\n\nIf you didn't request this, please ignore this email.`,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send email');
  }
}
