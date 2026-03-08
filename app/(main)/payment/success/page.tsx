'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    // Simulate payment verification
    const timer = setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center bg-muted/50">
        <div className="container max-w-md">
          <Card>
            <CardHeader className="text-center">
              {isVerifying ? (
                <Loader2 className="w-16 h-16 mx-auto text-amber animate-spin mb-4" />
              ) : isSuccess ? (
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              ) : (
                <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              )}
              <CardTitle className="text-2xl">
                {isVerifying
                  ? 'Memverifikasi Pembayaran...'
                  : isSuccess
                  ? 'Pembayaran Berhasil! 🎉'
                  : 'Pembayaran Gagal'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {isVerifying ? (
                <p className="text-muted-foreground">
                  Kami sedang memverifikasi pembayaran Anda. Mohon tunggu...
                </p>
              ) : isSuccess ? (
                <>
                  <p className="text-muted-foreground">
                    Terima kasih! Pembayaran Anda telah berhasil diproses.
                    Akses kursus/komunitas telah dibuka.
                  </p>
                  {transactionId && (
                    <div className="p-4 rounded-lg bg-muted text-sm">
                      <p className="text-muted-foreground">Transaction ID</p>
                      <p className="font-mono font-bold">{transactionId}</p>
                    </div>
                  )}
                  <Button variant="amber" className="w-full" asChild>
                    <a href="/dashboard">Buka Dashboard</a>
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">
                    Maaf, pembayaran Anda gagal diproses. Silakan coba lagi.
                  </p>
                  <Button variant="amber" className="w-full" onClick={() => router.back()}>
                    Coba Lagi
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
