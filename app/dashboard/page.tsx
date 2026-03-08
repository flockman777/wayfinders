import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Users, Award, Clock, Calendar, Play,
  DollarSign, TrendingUp, FileText, PlusCircle,
  Settings, Shield, CheckCircle, AlertCircle, Star
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { QuickActions } from './quick-actions';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              chapters: {
                select: { id: true, duration: true },
              },
            },
          },
        },
      },
      communityMemberships: {
        include: {
          community: true,
        },
      },
      certificates: {
        include: {
          course: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      },
      courses: {
        include: {
          chapters: true,
          enrollments: true,
        },
      },
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      ownedCommunities: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Calculate progress for each course (fetch separately)
  const coursesWithProgress = await Promise.all(
    user.enrollments.map(async (enrollment) => {
      const progress = await prisma.progress.findMany({
        where: {
          userId: user.id,
          courseId: enrollment.courseId,
        },
        select: { isCompleted: true },
      });

      const totalChapters = enrollment.course.chapters.length;
      const completedChapters = progress.filter((p) => p.isCompleted).length;
      const progressPercentage = totalChapters > 0
        ? Math.round((completedChapters / totalChapters) * 100)
        : 0;

      return {
        ...enrollment,
        progress: progressPercentage,
      };
    })
  );

  // Render different dashboard based on role
  if (user.role === 'ADMIN') {
    return <AdminDashboard user={user} />;
  }
  
  if (user.role === 'INSTRUCTOR') {
    return <InstructorDashboard user={user} coursesWithProgress={coursesWithProgress} />;
  }
  
  return <MemberDashboard user={user} coursesWithProgress={coursesWithProgress} />;
}

// ============================================
// MEMBER DASHBOARD
// ============================================
function MemberDashboard({ user, coursesWithProgress }: any) {
  const activeCourses = user.enrollments.filter((e: any) => e.status === 'ACTIVE').length;
  const completedCourses = user.enrollments.filter((e: any) => e.status === 'COMPLETED').length;
  const communitiesCount = user.communityMemberships.length;
  const certificatesCount = user.certificates.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/50">
        <div className="container py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-2">
                Dashboard Member
              </h1>
              <p className="text-muted-foreground">
                Selamat datang kembali, {user.name}! Teruslah belajar! 🚀
              </p>
            </div>
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar || ''} />
              <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-amber" />
                <span className="text-2xl font-bold">{activeCourses}</span>
              </div>
              <p className="text-sm text-muted-foreground">Kursus Aktif</p>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-amber" />
                <span className="text-2xl font-bold">{completedCourses}</span>
              </div>
              <p className="text-sm text-muted-foreground">Kursus Selesai</p>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-amber" />
                <span className="text-2xl font-bold">{communitiesCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Komunitas</p>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6 text-amber" />
                <span className="text-2xl font-bold">{certificatesCount}</span>
              </div>
              <p className="text-sm text-muted-foreground">Sertifikat</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Learning Progress */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading text-xl font-bold mb-4">
                  Lanjutkan Belajar
                </h2>
                {coursesWithProgress.length > 0 ? (
                  <div className="space-y-4">
                    {coursesWithProgress.slice(0, 5).map((enrollment: any) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="w-20 h-14 rounded-lg bg-navy flex items-center justify-center flex-shrink-0">
                          <Play className="w-6 h-6 text-white/50" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {enrollment.course.title}
                          </h3>
                          <Progress value={enrollment.progress} className="h-2 mt-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {enrollment.progress}% Selesai
                          </p>
                        </div>
                        <Button variant="amber" size="sm" asChild>
                          <a href={`/learn/${enrollment.course.slug}/${enrollment.course.chapters[0]?.id || enrollment.course.chapters[0]?.id}`}>
                            Lanjut
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Belum ada kursus yang diambil
                    </p>
                    <Button variant="amber" className="mt-4" asChild>
                      <a href="/explore">Explore Kursus</a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Communities */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading text-xl font-bold mb-4">
                  Komunitas Saya
                </h2>
                {user.communityMemberships.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {user.communityMemberships.map((membership: any) => (
                      <div
                        key={membership.id}
                        className="p-4 rounded-lg border bg-muted/50"
                      >
                        <h3 className="font-semibold">{membership.community.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {membership.community.category}
                        </p>
                        <Button variant="ghost" size="sm" className="mt-2" asChild>
                          <a href={`/community/${membership.community.slug}`}>
                            Buka Komunitas
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Belum bergabung dengan komunitas
                    </p>
                    <Button variant="amber" className="mt-4" asChild>
                      <a href="/community">Explore Komunitas</a>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Certificates */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading text-xl font-bold mb-4">
                  Sertifikat
                </h2>
                {user.certificates.length > 0 ? (
                  <div className="space-y-3">
                    {user.certificates.map((cert: any) => (
                      <div
                        key={cert.id}
                        className="p-3 rounded-lg bg-gradient-to-br from-navy to-navy-light text-white"
                      >
                        <Award className="w-8 h-8 text-amber mb-2" />
                        <p className="text-sm font-medium">{cert.course.title}</p>
                        <p className="text-xs text-white/60 mt-1">
                          {new Date(cert.issuedAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Award className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm">Belum ada sertifikat</p>
                  </div>
                )}
              </div>

              {/* Upcoming Events */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading text-xl font-bold mb-4">
                  Event Mendatang
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      title: 'Live Session: Building Startup',
                      date: '15 Mar',
                      time: '19:00 WIB',
                    },
                    {
                      title: 'Workshop: Advanced React',
                      date: '18 Mar',
                      time: '20:00 WIB',
                    },
                    {
                      title: 'Design Critique Session',
                      date: '22 Mar',
                      time: '16:00 WIB',
                    },
                  ].map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg bg-amber/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-amber" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {event.date} • {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ============================================
// INSTRUCTOR DASHBOARD
// ============================================
function InstructorDashboard({ user, coursesWithProgress }: any) {
  const totalCourses = user.courses.length;
  const totalStudents = user.courses.reduce((sum: number, course: any) => sum + course.enrollments.length, 0);
  const totalRevenue = user.courses.reduce((sum: number, course: any) => {
    return sum + (Number(course.price) * course.enrollments.length);
  }, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/50">
        <div className="container py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-3xl font-bold">
                  Dashboard Instructor
                </h1>
                <Badge variant="pro">Instructor</Badge>
              </div>
              <p className="text-muted-foreground">
                Kelola kursus dan pantau progress siswa Anda 👨‍🏫
              </p>
            </div>
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar || ''} />
              <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-amber" />
                <span className="text-2xl font-bold">{totalCourses}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Kursus</p>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-amber" />
                <span className="text-2xl font-bold">{totalStudents}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Siswa</p>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-6 h-6 text-amber" />
                <span className="text-2xl font-bold">{formatCurrency(totalRevenue).replace('Rp', '')}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Pendapatan</p>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-6 h-6 text-amber" />
                <span className="text-2xl font-bold">4.8</span>
              </div>
              <p className="text-sm text-muted-foreground">Rating Rata-rata</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Courses Management */}
            <div className="lg:col-span-2 space-y-6">
              {/* My Courses */}
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-bold">Kursus Saya</h2>
                  <Button variant="amber" size="sm">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Buat Kursus Baru
                  </Button>
                </div>
                {user.courses.length > 0 ? (
                  <div className="space-y-4">
                    {user.courses.map((course: any) => (
                      <div
                        key={course.id}
                        className="p-4 rounded-lg border bg-muted/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{course.title}</h3>
                              <Badge variant={course.status === 'PUBLISHED' ? 'free' : 'pro'}>
                                {course.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {course.enrollments.length} siswa
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {course.chapters.length} chapters
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {course.isFree ? 'Gratis' : formatCurrency(course.price)}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`/course/${course.slug}`}>Lihat</a>
                            </Button>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Belum ada kursus yang dibuat
                    </p>
                    <Button variant="amber" className="mt-4">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Buat Kursus Pertama
                    </Button>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading text-xl font-bold mb-4">
                  Aktivitas Siswa
                </h2>
                <div className="space-y-3">
                  {[
                    { action: 'Budi menyelesaikan chapter', course: 'Python untuk Pemula', time: '5 menit yang lalu' },
                    { action: 'Siti enroll ke kursus', course: 'UI/UX Design Masterclass', time: '1 jam yang lalu' },
                    { action: 'Ahmad memberikan rating', course: 'Digital Marketing 2025', time: '3 jam yang lalu', rating: 5 },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-amber" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.action}</span>
                          {' '}<span className="text-amber">{activity.course}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      {activity.rating && (
                        <div className="flex gap-1">
                          {[...Array(activity.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber text-amber" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading text-xl font-bold mb-4">
                  Quick Actions
                </h2>
                <QuickActions role="instructor" />
              </div>

              {/* Earnings Overview */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading text-xl font-bold mb-4">
                  Pendapatan Bulan Ini
                </h2>
                <div className="text-3xl font-bold text-amber mb-2">
                  {formatCurrency(totalRevenue / 3).replace('Rp', '')}
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
                  <TrendingUp className="w-4 h-4" />
                  <span>+15% dari bulan lalu</span>
                </div>
                <Progress value={65} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Target bulan ini: {formatCurrency(totalRevenue).replace('Rp', '')}
                </p>
              </div>

              {/* Owned Communities */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading text-xl font-bold mb-4">
                  Komunitas Saya
                </h2>
                {user.ownedCommunities.length > 0 ? (
                  <div className="space-y-3">
                    {user.ownedCommunities.map((comm: any) => (
                      <div key={comm.id} className="p-3 rounded-lg border">
                        <h4 className="font-medium">{comm.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {comm.members.length} members
                        </p>
                        <Button variant="ghost" size="sm" className="mt-2 w-full" asChild>
                          <a href={`/community/${comm.slug}`}>Kelola</a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm">Belum ada komunitas</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ============================================
// ADMIN DASHBOARD
// ============================================
function AdminDashboard({ user }: any) {
  const totalUsers = 156;
  const totalCourses = 24;
  const totalCommunities = 8;
  const totalRevenue = 45750000;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/50">
        <div className="container py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-3xl font-bold">
                  Dashboard Admin
                </h1>
                <Badge><Shield className="w-4 h-4 mr-1" /> Admin</Badge>
              </div>
              <p className="text-muted-foreground">
                Kelola platform Wayfinders 🔧
              </p>
            </div>
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar || ''} />
              <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-amber" />
                <span className="text-2xl font-bold">{totalUsers}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-amber" />
                <span className="text-2xl font-bold">{totalCourses}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Kursus</p>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-amber" />
                <span className="text-2xl font-bold">{totalCommunities}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Komunitas</p>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-6 h-6 text-amber" />
                <span className="text-2xl font-bold">{formatCurrency(totalRevenue).replace('Rp', '')}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Management */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Transactions */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading text-xl font-bold mb-4">
                  Transaksi Terbaru
                </h2>
                <div className="space-y-3">
                  {[
                    { user: 'Budi Santoso', item: 'Python untuk Pemula', amount: 299000, status: 'PAID' },
                    { user: 'Siti Nurhaliza', item: 'UI/UX Design Masterclass', amount: 499000, status: 'PAID' },
                    { user: 'Ahmad Rizki', item: 'Founders Circle', amount: 99000, status: 'PENDING' },
                    { user: 'Dewi Lestari', item: 'React JS Fullstack', amount: 599000, status: 'PAID' },
                    { user: 'Eko Prasetyo', item: 'Digital Marketing 2025', amount: 349000, status: 'FAILED' },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.status === 'PAID' ? 'bg-green-100' : tx.status === 'PENDING' ? 'bg-amber-100' : 'bg-red-100'
                        }`}>
                          {tx.status === 'PAID' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : tx.status === 'PENDING' ? (
                            <Clock className="w-5 h-5 text-amber-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tx.user}</p>
                          <p className="text-xs text-muted-foreground">{tx.item}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(tx.amount)}</p>
                        <Badge variant={tx.status === 'PAID' ? 'free' : tx.status === 'PENDING' ? 'pro' : 'destructive'}>
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Management */}
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-bold">Manajemen User</h2>
                  <Button variant="outline" size="sm">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Tambah User
                  </Button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Demo User', email: 'user@email.com', role: 'MEMBER', courses: 2 },
                    { name: 'Andi Pratama', email: 'andi.pratama@wayfinders.id', role: 'INSTRUCTOR', courses: 3 },
                    { name: 'Sarah Wijaya', email: 'sarah.wijaya@wayfinders.id', role: 'INSTRUCTOR', courses: 3 },
                  ].map((u, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={u.role === 'ADMIN' ? 'destructive' : u.role === 'INSTRUCTOR' ? 'pro' : 'free'}>
                          {u.role}
                        </Badge>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading text-xl font-bold mb-4">
                  Quick Actions
                </h2>
                <QuickActions role="admin" />
              </div>

              {/* System Status */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading text-xl font-bold mb-4">
                  System Status
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Database</span>
                      <Badge variant="free">Healthy</Badge>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Storage</span>
                      <span className="text-xs text-muted-foreground">45/100 GB</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">API Usage</span>
                      <span className="text-xs text-muted-foreground">12.5k/50k</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-heading text-xl font-bold mb-4">
                  Aktivitas Sistem
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Backup database berhasil</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>5 transaksi baru diproses</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                    <span>1 pembayaran gagal</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-blue-500 mt-0.5" />
                    <span>3 user baru mendaftar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
