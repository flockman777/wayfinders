import Link from 'next/link';
import { Compass, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber to-orange-400 flex items-center justify-center text-white">
                <Compass size={20} />
              </div>
              <span>Wayfinders</span>
            </Link>
            <p className="mt-4 text-sm text-gray-400 max-w-sm">
              Platform komunitas dan e-learning terdepan di Indonesia. Temukan jalan belajarmu 
              bersama ribuan pembelajar lainnya.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/explore" className="hover:text-amber transition-colors">Kursus</Link></li>
              <li><Link href="/community" className="hover:text-amber transition-colors">Komunitas</Link></li>
              <li><Link href="/pricing" className="hover:text-amber transition-colors">Harga</Link></li>
              <li><Link href="#" className="hover:text-amber transition-colors">Untuk Bisnis</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-amber transition-colors">Tentang Kami</Link></li>
              <li><Link href="#" className="hover:text-amber transition-colors">Karir</Link></li>
              <li><Link href="#" className="hover:text-amber transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-amber transition-colors">Kontak</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-amber transition-colors">Pusat Bantuan</Link></li>
              <li><Link href="#" className="hover:text-amber transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-amber transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="#" className="hover:text-amber transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            &copy; 2025 Wayfinders. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Pembayaran diproses oleh:</span>
            <img 
              src="https://storage.googleapis.com/xendit-assets/website-v2/logos/xendit-logo-white.svg" 
              alt="Xendit" 
              className="h-5 opacity-80"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
