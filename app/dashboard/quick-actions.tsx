'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Users, DollarSign, BookOpen, Settings } from 'lucide-react';

interface QuickActionsProps {
  role: 'instructor' | 'admin';
}

export function QuickActions({ role }: QuickActionsProps) {
  const handleClick = (action: string) => {
    alert(`Fitur ${action} akan segera hadir!`);
  };

  if (role === 'instructor') {
    return (
      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start" asChild>
          <a href="/dashboard/create-course">
            <PlusCircle className="w-4 h-4 mr-2" />
            Buat Kursus Baru
          </a>
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => handleClick('tambah chapter')}>
          <FileText className="w-4 h-4 mr-2" />
          Tambah Chapter
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => handleClick('lihat siswa')}>
          <Users className="w-4 h-4 mr-2" />
          Lihat Semua Siswa
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => handleClick('laporan pendapatan')}>
          <DollarSign className="w-4 h-4 mr-2" />
          Laporan Pendapatan
        </Button>
      </div>
    );
  }

  if (role === 'admin') {
    return (
      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start" onClick={() => handleClick('kelola users')}>
          <Users className="w-4 h-4 mr-2" />
          Kelola Users
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => handleClick('kelola kursus')}>
          <BookOpen className="w-4 h-4 mr-2" />
          Kelola Kursus
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => handleClick('laporan keuangan')}>
          <DollarSign className="w-4 h-4 mr-2" />
          Laporan Keuangan
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={() => handleClick('pengaturan')}>
          <Settings className="w-4 h-4 mr-2" />
          Pengaturan
        </Button>
      </div>
    );
  }

  return null;
}
