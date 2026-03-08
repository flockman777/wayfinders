'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CreateCoursePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'BISNIS',
    level: 'BEGINNER',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
          price: parseFloat(formData.price) || 0,
        }),
      });

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Kursus Berhasil Dibuat',
          description: 'Kursus akan segera ditinjau oleh admin',
        });
        router.push('/dashboard');
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Gagal membuat kursus',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/50">
        <div className="container py-8">
          <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Buat Kursus Baru</CardTitle>
                <CardDescription>
                  Isi informasi kursus yang ingin Anda buat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Judul Kursus
                    </label>
                    <Input
                      placeholder="Contoh: Python untuk Pemula"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Deskripsi
                    </label>
                    <textarea
                      className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background text-sm"
                      placeholder="Deskripsikan kursus Anda..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Kategori
                      </label>
                      <select
                        className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                      >
                        <option value="BISNIS">Bisnis</option>
                        <option value="TECH">Teknologi</option>
                        <option value="DESAIN">Desain</option>
                        <option value="SELF_DEV">Pengembangan Diri</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Level
                      </label>
                      <select
                        className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                        value={formData.level}
                        onChange={(e) =>
                          setFormData({ ...formData, level: e.target.value })
                        }
                      >
                        <option value="BEGINNER">Pemula</option>
                        <option value="INTERMEDIATE">Menengah</option>
                        <option value="ADVANCED">Lanjutan</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Harga (Rp)
                    </label>
                    <Input
                      type="number"
                      placeholder="0 untuk kursus gratis"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="amber"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isLoading ? 'Menyimpan...' : 'Buat Kursus'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
