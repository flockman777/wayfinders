import Xendit from 'xendit-node';

if (!process.env.XENDIT_SECRET_KEY) {
  throw new Error('XENDIT_SECRET_KEY is not set in environment variables');
}

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
});

export const { Invoice, PaymentMethod, Disbursement, XenditErrors } = xendit;

export default xendit;

/**
 * Create a Xendit invoice for payment
 */
export async function createXenditInvoice(data: {
  externalId: string;
  amount: number;
  payerEmail: string;
  payerName?: string;
  payerPhone?: string;
  description: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
  paymentMethods?: string[];
  currency?: string;
  invoiceDuration?: number;
}) {
  const invoice = new Invoice(xendit);

  const params = {
    external_id: data.externalId,
    amount: data.amount,
    payer_email: data.payerEmail,
    payer_name: data.payerName,
    payer_phone: data.payerPhone,
    description: data.description,
    success_redirect_url: data.successRedirectUrl,
    failure_redirect_url: data.failureRedirectUrl,
    currency: data.currency || 'IDR',
    invoice_duration: data.invoiceDuration || 86400, // 24 hours
    payment_methods: data.paymentMethods || [
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
  };

  try {
    const response = await invoice.createInvoice(params);
    return {
      invoiceId: response.id,
      paymentUrl: response.invoice_url,
      externalId: response.external_id,
      amount: response.amount,
      status: response.status,
    };
  } catch (error) {
    console.error('Error creating Xendit invoice:', error);
    throw error;
  }
}

/**
 * Get invoice details from Xendit
 */
export async function getXenditInvoice(invoiceId: string) {
  const invoice = new Invoice(xendit);

  try {
    const response = await invoice.getInvoiceById(invoiceId);
    return response;
  } catch (error) {
    console.error('Error getting Xendit invoice:', error);
    throw error;
  }
}

/**
 * Verify Xendit webhook callback
 */
export function verifyXenditWebhook(token: string, callbackToken: string): boolean {
  return token === callbackToken;
}
