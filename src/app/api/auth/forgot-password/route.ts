import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await db.user.findUnique({ where: { email } });

    // Always return success (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({ message: 'If that email exists, a reset link has been sent' });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save token to database
    await db.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    // Send email
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
