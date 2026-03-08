import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPaymentSuccessEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    // Verify webhook token
    const callbackToken = req.headers.get('x-callback-token');
    const expectedToken = process.env.XENDIT_CALLBACK_TOKEN;

    if (!callbackToken || callbackToken !== expectedToken) {
      console.warn('Invalid webhook token');
      return NextResponse.json(
        { error: 'Invalid webhook token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { external_id, status, payment_method, paid_amount } = body;

    console.log('Webhook received:', { external_id, status, payment_method });

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: external_id },
      include: {
        user: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Handle different statuses
    if (status === 'PAID') {
      // Update transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'PAID',
          paymentMethod: payment_method,
          paidAt: new Date(),
        },
      });

      // Grant access based on type
      if (transaction.type === 'COURSE') {
        // Create enrollment
        await prisma.enrollment.create({
          data: {
            userId: transaction.userId,
            courseId: transaction.referenceId,
            status: 'ACTIVE',
          },
        });

        console.log(`Enrollment created for user ${transaction.userId} in course ${transaction.referenceId}`);
      } else if (transaction.type === 'COMMUNITY') {
        // Create community membership
        await prisma.communityMember.create({
          data: {
            userId: transaction.userId,
            communityId: transaction.referenceId,
            role: 'MEMBER',
          },
        });

        // Update community member count
        await prisma.community.update({
          where: { id: transaction.referenceId },
          data: {
            memberCount: { increment: 1 },
          },
        });

        console.log(`Membership created for user ${transaction.userId} in community ${transaction.referenceId}`);
      }

      // Send success email
      try {
        const item = transaction.type === 'COURSE'
          ? await prisma.course.findUnique({ where: { id: transaction.referenceId } })
          : await prisma.community.findUnique({ where: { id: transaction.referenceId } });

        if (item) {
          await sendPaymentSuccessEmail({
            to: transaction.user.email,
            name: transaction.user.name,
            itemName: item.name || (item as any).title,
            itemType: transaction.type,
            amount: Number(transaction.amount),
          });
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    } else if (status === 'EXPIRED') {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'EXPIRED' },
      });
    } else if (status === 'FAILED') {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
