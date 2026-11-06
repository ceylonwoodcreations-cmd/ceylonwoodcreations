import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signAdminToken, COOKIE_NAME } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (5 attempts per minute)
    const ip = req.headers.get('x-forwarded-for') || 'local-ip';
    const rate = checkRateLimit(`login-${ip}`, 5, 60000);
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 1 minute.' },
        { status: 429 }
      );
    }

    // 2. Validate Request Body
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid username or password format' },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    // 3. Find Admin in DB
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 4. Verify Password Hash
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 5. Generate Signed JWT
    const token = await signAdminToken({ id: admin.id, username: admin.username });

    // 6. Set Secure HTTP-Only Cookie
    const response = NextResponse.json({
      success: true,
      user: { id: admin.id, username: admin.username },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
