'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function PaymentFailedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center bg-muted/50">
        <div className="container max-w-md">
          <Card>
            <CardHeader className="text-center">
              <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <CardTitle className="text-2xl">Pembayaran Gagal</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Maaf, pembayaran Anda gagal diproses. Hal ini bisa terjadi karena:
              </p>
              <ul className="text-sm text-muted-foreground text-left space-y-2 bg-muted p-4 rounded-lg">
                <li>• Waktu pembayaran telah habis</li>
                <li>• Saldo tidak mencukupi</li>
                <li>• Terjadi kesalahan teknis</li>
              </ul>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => router.push('/explore')}>
                  Browse Kursus
                </Button>
                <Button variant="amber" className="flex-1" onClick={() => router.back()}>
                  Coba Lagi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
