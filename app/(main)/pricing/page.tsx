import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Untuk pemula yang ingin mencoba',
    features: [
      { text: 'Akses kursus gratis', included: true },
      { text: 'Bergabung 2 komunitas gratis', included: true },
      { text: 'Akses forum diskusi', included: true },
      { text: 'Sertifikat penyelesaian', included: false },
      { text: 'Mentorship personal', included: false },
    ],
    cta: 'Mulai Gratis',
    popular: false,
  },
  {
    name: 'Pro',
    price: 149000,
    description: 'Untuk pembelajar serius',
    features: [
      { text: 'Akses semua kursus', included: true },
      { text: 'Bergabung semua komunitas', included: true },
      { text: 'Sertifikat penyelesaian', included: true },
      { text: 'Akses grup mentorship', included: true },
      { text: 'Session 1-on-1 dengan mentor', included: false },
    ],
    cta: 'Langganan Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 499000,
    description: 'Untuk profesional & tim',
    features: [
      { text: 'Semua fitur Pro', included: true },
      { text: 'Session 1-on-1 bulanan', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom learning path', included: true },
      { text: 'Akses early bird course', included: true },
    ],
    cta: 'Hubungi Sales',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-navy py-20">
          <div className="container text-center text-white">
            <Badge variant="pro" className="mb-4">Pricing</Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Investasi untuk Masa Depanmu
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Pilih paket yang sesuai dengan kebutuhan belajarmu
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative bg-card rounded-2xl border-2 p-8 ${
                    plan.popular
                      ? 'border-amber shadow-xl scale-105'
                      : 'border-border'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber to-orange-400">
                      Most Popular
                    </Badge>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="font-heading text-xl font-semibold mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">
                        Rp {plan.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-muted-foreground">/bulan</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {plan.description}
                    </p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${
                            !feature.included ? 'text-muted-foreground line-through' : ''
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? 'amber' : 'outline'}
                    className="w-full"
                    size="lg"
                    asChild
                  >
                    <Link href="/register">{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-background">
          <div className="container max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold mb-4">
                Pertanyaan yang Sering Diajukan
              </h2>
            </div>

            <div className="space-y-6">
              {[
                {
                  q: 'Apakah saya bisa upgrade paket nanti?',
                  a: 'Tentu! Anda bisa upgrade dari Free ke Pro atau Enterprise kapan saja. Pembayaran akan disesuaikan secara prorata.',
                },
                {
                  q: 'Bagaimana jika saya tidak puas?',
                  a: 'Kami menawarkan garansi 30 hari. Jika tidak puas, kami akan mengembalikan pembayaran Anda.',
                },
                {
                  q: 'Apakah sertifikat resmi?',
                  a: 'Ya, semua sertifikat yang diterbitkan Wayfinders dapat diverifikasi dan dapat ditambahkan ke LinkedIn.',
                },
                {
                  q: 'Metode pembayaran apa yang tersedia?',
                  a: 'Kami menerima transfer bank (BCA, Mandiri, BNI, BRI), QRIS, GoPay, OVO, DANA, LinkAja, dan kartu kredit.',
                },
              ].map((faq, i) => (
                <div key={i} className="border rounded-xl p-6">
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-navy">
          <div className="container text-center text-white">
            <h2 className="font-heading text-3xl font-bold mb-4">
              Siap Memulai Perjalanan Belajarmu?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Bergabung dengan ribuan pembelajar lainnya dan akses ratusan kursus premium
            </p>
            <Button variant="amber" size="lg" asChild>
              <Link href="/register">
                Daftar Gratis Sekarang
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
