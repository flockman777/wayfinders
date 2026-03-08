import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlayCircle, Clock, Users, Award, CheckCircle, Lock } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { formatCurrency, formatDuration, getCategoryDisplayName } from '@/lib/utils';
import { notFound } from 'next/navigation';

interface CourseDetailPageProps {
  params: { slug: string };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const session = await getServerSession(authOptions);

  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      chapters: {
        orderBy: { order: 'asc' },
      },
      enrollments: {
        select: { id: true },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const totalDuration = course.chapters.reduce((sum, ch) => sum + ch.duration, 0);
  const isEnrolled = session?.user
    ? await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: (session.user as any).id || '',
            courseId: course.id,
          },
        },
      })
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-navy py-12">
          <div className="container">
            <div className="max-w-4xl">
              <Badge variant={course.isFree ? 'free' : 'pro'} className="mb-4">
                {course.isFree ? 'GRATIS' : 'BERBAYAR'}
              </Badge>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-gray-300 mb-6">{course.description}</p>
              
              <div className="flex flex-wrap gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{formatDuration(totalDuration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  <span>{course.chapters.length} Chapters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{course.enrollments.length} Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>{getCategoryDisplayName(course.category)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 bg-muted/50">
          <div className="container">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* What You'll Learn */}
                <div className="bg-card rounded-xl border p-6">
                  <h2 className="font-heading text-xl font-bold mb-4">
                    Yang Akan Kamu Pelajari
                  </h2>
                  <ul className="space-y-3">
                    {[
                      'Fundamental konsep dan prinsip dasar',
                      'Best practices dari industri',
                      'Studi kasus real-world dan implementasi',
                      'Project-based learning untuk portofolio',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Curriculum */}
                <div className="bg-card rounded-xl border p-6">
                  <h2 className="font-heading text-xl font-bold mb-4">
                    Kurikulum
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {course.chapters.map((chapter, i) => (
                      <AccordionItem key={chapter.id} value={`chapter-${i}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            {chapter.isFree ? (
                              <PlayCircle className="w-5 h-5 text-amber" />
                            ) : (
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            )}
                            <span>{chapter.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-8 space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {chapter.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDuration(chapter.duration)}
                              </span>
                              <Badge variant={chapter.isFree ? 'free' : 'pro'}>
                                {chapter.isFree ? 'Preview Gratis' : 'Premium'}
                              </Badge>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                {/* Instructor */}
                <div className="bg-card rounded-xl border p-6">
                  <h2 className="font-heading text-xl font-bold mb-4">
                    Instruktur
                  </h2>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={course.instructor.avatar || ''} />
                      <AvatarFallback className="text-lg">
                        {course.instructor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{course.instructor.name}</h3>
                      <p className="text-muted-foreground">Professional Instructor</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl border p-6 sticky top-24">
                  <div className="mb-6">
                    <span className="text-3xl font-bold">
                      {course.isFree ? 'Gratis' : formatCurrency(course.price)}
                    </span>
                    {!course.isFree && (
                      <span className="text-muted-foreground line-through ml-2">
                        {formatCurrency(Number(course.price) * 1.5)}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="amber"
                    size="lg"
                    className="w-full mb-4"
                    asChild
                  >
                    {isEnrolled ? (
                      <a href={`/learn/${course.slug}/${course.chapters[0]?.id}`}>
                        Lanjutkan Belajar
                      </a>
                    ) : course.isFree ? (
                      <a href={`/api/enrollment?courseId=${course.id}`}>
                        Daftar Sekarang
                      </a>
                    ) : (
                      <a href={`/checkout/COURSE/${course.id}`}>
                        Beli Sekarang
                      </a>
                    )}
                  </Button>

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-3">
                      <PlayCircle className="w-5 h-5 text-amber" />
                      <span>{course.chapters.length} Chapters</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber" />
                      <span>{formatDuration(totalDuration)} Total Duration</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-amber" />
                      <span>Certificate of Completion</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-amber" />
                      <span>Lifetime Access</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
