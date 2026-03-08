import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using SMTP
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not configured. Email not sent.');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Wayfinders" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send payment success email
 */
export async function sendPaymentSuccessEmail({
  to,
  name,
  itemName,
  itemType,
  amount,
}: {
  to: string;
  name: string;
  itemName: string;
  itemType: 'COURSE' | 'COMMUNITY';
  amount: number;
}) {
  const subject = `Pembayaran Berhasil - ${itemName}`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0F1B2D 0%, #1A2D45 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
          .button { display: inline-block; background: linear-gradient(135deg, #F5A623 0%, #FF8C42 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Pembayaran Berhasil!</h1>
          </div>
          <div class="content">
            <p>Halo ${name},</p>
            <p>Terima kasih telah melakukan pembelian. Pembayaran Anda telah berhasil diproses.</p>
            
            <div class="info-box">
              <h3>Detail Pembelian:</h3>
              <p><strong>${itemType === 'COURSE' ? 'Kursus' : 'Komunitas'}:</strong> ${itemName}</p>
              <p><strong>Jumlah:</strong> Rp ${amount.toLocaleString('id-ID')}</p>
              <p><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <p>Anda sekarang dapat mengakses ${itemType === 'COURSE' ? 'kursus' : 'komunitas'} ini dari dashboard Anda.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="button">
                Buka Dashboard
              </a>
            </div>
            
            <p style="margin-top: 30px;">Jika ada pertanyaan, jangan ragu untuk menghubungi tim support kami.</p>
            
            <p>Salam,<br><strong>Tim Wayfinders</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Wayfinders. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ to, subject, html });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
  const subject = 'Selamat Datang di Wayfinders!';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F5A623 0%, #FF8C42 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
          .button { display: inline-block; background: linear-gradient(135deg, #0F1B2D 0%, #1A2D45 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👋 Selamat Datang!</h1>
          </div>
          <div class="content">
            <p>Halo ${name},</p>
            <p>Selamat datang di Wayfinders! Kami sangat senang Anda bergabung dengan komunitas pembelajar kami.</p>
            
            <p>Di Wayfinders, Anda dapat:</p>
            <ul>
              <li>Mengakses ratusan kursus berkualitas</li>
              <li>Bergabung dengan komunitas yang sesuai minat</li>
              <li>Belajar dari mentor berpengalaman</li>
              <li>Mendapatkan sertifikat penyelesaian</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/explore" class="button">
                Mulai Belajar
              </a>
            </div>
            
            <p style="margin-top: 30px;">Selamat belajar dan berkembang bersama Wayfinders!</p>
            
            <p>Salam,<br><strong>Tim Wayfinders</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Wayfinders. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ to, subject, html });
}

/**
 * Send certificate email
 */
export async function sendCertificateEmail({
  to,
  name,
  courseName,
  certificateUrl,
}: {
  to: string;
  name: string;
  courseName: string;
  certificateUrl: string;
}) {
  const subject = `Sertifikat Penyelesaian - ${courseName}`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F5A623 0%, #FF8C42 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
          .button { display: inline-block; background: linear-gradient(135deg, #0F1B2D 0%, #1A2D45 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
          .certificate-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #F5A623; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 Selamat!</h1>
          </div>
          <div class="content">
            <p>Halo ${name},</p>
            <p>Selamat! Anda telah menyelesaikan kursus <strong>${courseName}</strong>.</p>
            
            <div class="certificate-box">
              <h3>Sertifikat Anda Siap!</h3>
              <p>Sertifikat penyelesaian telah diterbitkan dan dapat Anda unduh.</p>
              <a href="${certificateUrl}" class="button" style="background: #F5A623;">
                📄 Unduh Sertifikat
              </a>
            </div>
            
            <p>Jangan lupa untuk menambahkan sertifikat ini ke LinkedIn dan portofolio Anda!</p>
            
            <p>Teruslah belajar dan berkembang bersama Wayfinders.</p>
            
            <p>Salam,<br><strong>Tim Wayfinders</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Wayfinders. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({ to, subject, html });
}
