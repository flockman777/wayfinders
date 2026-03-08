import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CourseCard } from '@/components/course-card';
import { CommunityCard } from '@/components/community-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, Users, BookOpen, Award, PlayCircle, ArrowRight, CheckCircle } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDuration, getCategoryColor, getCategoryDisplayName } from '@/lib/utils';
import Link from 'next/link';

// Fetch featured courses
async function getFeaturedCourses() {
  try {
    const courses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        chapters: {
          select: {
            duration: true,
          },
        },
        enrollments: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    return courses.map((course) => ({
      ...course,
      duration: course.chapters.reduce((sum, ch) => sum + ch.duration, 0),
      students: course.enrollments.length,
      price: Number(course.price),
    }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

// Fetch featured communities
async function getFeaturedCommunities() {
  try {
    const communities = await prisma.community.findMany({
      include: {
        members: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          take: 5,
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: { memberCount: 'desc' },
      take: 4,
    });

    return communities.map((comm) => ({
      ...comm,
      price: Number(comm.price),
      memberCount: comm._count.members,
      recentMembers: comm.members.map((m) => m.user),
    }));
  } catch (error) {
    console.error('Error fetching communities:', error);
    return [];
  }
}

export default async function HomePage() {
  const [courses, communities] = await Promise.all([
    getFeaturedCourses(),
    getFeaturedCommunities(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-navy overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F5A623' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="container relative py-20 md:py-32">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-white space-y-6">
                <Badge variant="pro" className="mb-4">
                  <Compass className="w-3 h-3 mr-1" />
                  Platform Belajar #1 di Indonesia
                </Badge>
                
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Temukan Jalanmu,{' '}
                  <span className="gradient-text">Bersama Komunitas</span>
                </h1>
                
                <p className="text-lg text-gray-300 max-w-lg">
                  Bergabung dengan komunitas inspiratif dan akses kursus premium dari mentor terbaik. 
                  Mulai perjalanan belajarmu hari ini!
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button variant="amber" size="lg" asChild>
                    <Link href="/register">
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Mulai Gratis
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10" asChild>
                    <Link href="/explore">
                      Lihat Kursus
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
                
                {/* Stats */}
                <div className="flex gap-8 pt-8 border-t border-white/10">
                  <div>
                    <div className="text-3xl font-bold text-amber">50K+</div>
                    <div className="text-sm text-gray-400">Member Aktif</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber">200+</div>
                    <div className="text-sm text-gray-400">Kursus Premium</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber">100+</div>
                    <div className="text-sm text-gray-400">Mentor Ahli</div>
                  </div>
                </div>
              </div>
              
              {/* Hero Visual */}
              <div className="hidden md:block relative">
                <div className="relative z-10 glass rounded-2xl p-6 border border-white/20">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                    alt="Learning Community"
                    className="rounded-xl w-full"
                  />
                </div>
                
                {/* Floating Cards */}
                <div className="absolute -top-4 -right-4 glass rounded-xl p-4 shadow-xl animate-fade-in">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center mb-2">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold">12 Kursus</div>
                  <div className="text-xs text-gray-400">Selesai</div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 glass rounded-xl p-4 shadow-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="w-10 h-10 rounded-lg bg-amber/20 text-amber flex items-center justify-center mb-2">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold">8 Sertifikat</div>
                  <div className="text-xs text-gray-400">Diraih</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="pro" className="mb-4">Kenapa Wayfinders?</Badge>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Platform Belajar Terlengkap
              </h2>
              <p className="text-muted-foreground">
                Semua yang kamu butuhkan untuk berkembang dalam satu platform
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Users,
                  title: 'Komunitas Aktif',
                  description: 'Bergabung dengan ribuan pembelajar lain dan bangun network yang berharga',
                },
                {
                  icon: BookOpen,
                  title: 'Kursus Terstruktur',
                  description: 'Kurikulum yang dirancang sistematis untuk memaksimalkan pembelajaranmu',
                },
                {
                  icon: Award,
                  title: 'Mentor Berpengalaman',
                  description: 'Belajar langsung dari praktisi industri dengan pengalaman bertahun-tahun',
                },
                {
                  icon: Compass,
                  title: 'Sertifikat Resmi',
                  description: 'Dapatkan sertifikat yang dapat kamu tambahkan ke LinkedIn dan portofolio',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber to-orange-400 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="pro" className="mb-4">Kursus Unggulan</Badge>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Pilih Jalan Belajarmu
              </h2>
              <p className="text-muted-foreground">
                Kursus terbaik yang paling diminati oleh member Wayfinders
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Button variant="amber" size="lg" asChild>
                <Link href="/explore">
                  Lihat Semua Kursus
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Communities */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="pro" className="mb-4">Komunitas</Badge>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Temukan Suku-mu
              </h2>
              <p className="text-muted-foreground">
                Bergabung dengan komunitas yang sesuai dengan passion dan tujuanmu
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {communities.map((community) => (
                <CommunityCard key={community.id} {...community} />
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Button variant="secondary" size="lg" asChild>
                <Link href="/community">
                  Lihat Semua Komunitas
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-navy">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Siap Memulai Perjalanan Belajarmu?
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Bergabung dengan ribuan pembelajar lainnya dan akses ratusan kursus premium 
                dari mentor terbaik di industri.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="amber" size="lg" asChild>
                  <Link href="/register">
                    Daftar Gratis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10" asChild>
                  <Link href="/pricing">
                    Lihat Harga
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
