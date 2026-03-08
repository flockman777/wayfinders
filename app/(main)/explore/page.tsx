import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import prisma from '@/lib/prisma';
import { formatDuration, getCategoryDisplayName } from '@/lib/utils';
import { Search } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface ExplorePageProps {
  searchParams: {
    category?: string;
    isFree?: string;
    search?: string;
    page?: string;
  };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const session = await getServerSession(authOptions);
  
  const category = searchParams.category;
  const isFree = searchParams.isFree;
  const search = searchParams.search;
  const page = parseInt(searchParams.page || '1');
  const limit = 12;

  const where: any = { status: 'PUBLISHED' };

  if (category && category !== 'all') {
    where.category = category;
  }

  if (isFree === 'true') {
    where.isFree = true;
  } else if (isFree === 'false') {
    where.isFree = false;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
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
    }),
    prisma.course.count({ where }),
  ]);

  const coursesWithDetails = courses.map((course) => ({
    ...course,
    duration: course.chapters.reduce((sum, ch) => sum + ch.duration, 0),
    students: course.enrollments.length,
    price: Number(course.price),
  }));

  const categories = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'BISNIS', label: 'Bisnis' },
    { value: 'TECH', label: 'Teknologi' },
    { value: 'DESAIN', label: 'Desain' },
    { value: 'SELF_DEV', label: 'Pengembangan Diri' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-navy py-12">
          <div className="container text-center text-white">
            <h1 className="font-heading text-4xl font-bold mb-4">Explore Kursus</h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Temukan kursus yang sesuai dengan minat dan tujuan belajarmu
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b bg-background sticky top-16 z-40">
          <div className="container py-4">
            <form action="/explore" method="GET">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari kursus..."
                    className="pl-10"
                    name="search"
                    defaultValue={search}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    name="isFree"
                    value=""
                    variant={!isFree ? 'default' : 'outline'}
                    size="sm"
                  >
                    Semua
                  </Button>
                  <Button
                    type="submit"
                    name="isFree"
                    value="true"
                    variant={isFree === 'true' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Gratis
                  </Button>
                  <Button
                    type="submit"
                    name="isFree"
                    value="false"
                    variant={isFree === 'false' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Berbayar
                  </Button>
                </div>

                <select
                  name="category"
                  defaultValue={category || 'all'}
                  className="h-10 px-3 rounded-md border bg-background text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-12 bg-muted/50 flex-1">
          <div className="container">
            {coursesWithDetails.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coursesWithDetails.map((course) => (
                    <CourseCard key={course.id} {...course} />
                  ))}
                </div>

                {/* Pagination */}
                {total > limit && (
                  <div className="flex justify-center gap-2 mt-10">
                    {page > 1 && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`?page=${page - 1}${category ? `&category=${category}` : ''}${isFree !== undefined ? `&isFree=${isFree}` : ''}${search ? `&search=${search}` : ''}`}>
                          Previous
                        </a>
                      </Button>
                    )}
                    
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                      Page {page} of {Math.ceil(total / limit)}
                    </span>
                    
                    {page < Math.ceil(total / limit) && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`?page=${page + 1}${category ? `&category=${category}` : ''}${isFree !== undefined ? `&isFree=${isFree}` : ''}${search ? `&search=${search}` : ''}`}>
                          Next
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">Tidak ada kursus ditemukan</h3>
                <p className="text-muted-foreground mb-4">
                  Coba ubah filter pencarian Anda
                </p>
                <Button variant="amber" asChild>
                  <a href="/explore">Reset Filter</a>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
