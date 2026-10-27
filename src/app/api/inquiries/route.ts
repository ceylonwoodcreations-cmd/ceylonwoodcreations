import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { inquirySchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

// POST submit custom inquiry (Public, Rate Limited)
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local-ip';
    const rate = checkRateLimit(`inquiry-${ip}`, 5, 300000); // 5 in 5 minutes
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes before submitting another inquiry.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid inquiry data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const inquiry = await prisma.customInquiry.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit inquiry:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}

// GET all inquiries (Admin Protected)
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const inquiries = await prisma.customInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Failed to fetch inquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}
