import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createXenditInvoice } from '@/lib/xendit';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, referenceId } = body;

    if (!type || !referenceId) {
      return NextResponse.json(
        { error: 'Type dan referenceId harus diisi' },
        { status: 400 }
      );
    }

    if (!['COURSE', 'COMMUNITY'].includes(type)) {
      return NextResponse.json(
        { error: 'Type harus COURSE atau COMMUNITY' },
        { status: 400 }
      );
    }

    // Get item details
    let item: any;
    if (type === 'COURSE') {
      item = await prisma.course.findUnique({
        where: { id: referenceId },
        include: { instructor: true },
      });
    } else {
      item = await prisma.community.findUnique({
        where: { id: referenceId },
        include: { owner: true },
      });
    }

    if (!item) {
      return NextResponse.json(
        { error: 'Item tidak ditemukan' },
        { status: 404 }
      );
    }

    if (item.isFree) {
      return NextResponse.json(
        { error: 'Item ini gratis, tidak perlu pembayaran' },
        { status: 400 }
      );
    }

    const amount = Number(item.price);

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: type as 'COURSE' | 'COMMUNITY',
        referenceId,
        amount,
        status: 'PENDING',
      },
    });

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // Create Xendit invoice
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const invoiceData = await createXenditInvoice({
      externalId: transaction.id,
      amount,
      payerEmail: user?.email || session.user.email || '',
      payerName: user?.name || session.user.name || '',
      payerPhone: '',
      description: `Pembelian ${type === 'COURSE' ? 'Kursus' : 'Komunitas'}: ${item.name || item.title}`,
      successRedirectUrl: `${baseUrl}/payment/success?transactionId=${transaction.id}`,
      failureRedirectUrl: `${baseUrl}/payment/failed?transactionId=${transaction.id}`,
      paymentMethods: [
        'BCA',
        'BNI',
        'BRI',
        'MANDIRI',
        'PERMATA',
        'QRIS',
        'OVO',
        'DANA',
        'LINKAJA',
        'SHOPEEPAY',
        'CREDIT_CARD',
      ],
    });

    // Update transaction with Xendit info
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        xenditInvoiceId: invoiceData.invoiceId,
        xenditPaymentUrl: invoiceData.paymentUrl,
      },
    });

    return NextResponse.json({
      paymentUrl: invoiceData.paymentUrl,
      transactionId: transaction.id,
      amount: invoiceData.amount,
    });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat invoice' },
      { status: 500 }
    );
  }
}
