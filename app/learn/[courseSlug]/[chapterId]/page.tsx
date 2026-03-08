import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { LearnContent } from './learn-content';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';

interface LearnPageProps {
  params: { 
    courseSlug: string;
    chapterId: string;
  };
}

export default async function LearnPage({ params }: LearnPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Get course with chapters
  const course = await prisma.course.findUnique({
    where: { slug: params.courseSlug },
    include: {
      chapters: {
        orderBy: { order: 'asc' },
      },
      instructor: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Check if user is enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: course.id,
      },
    },
  });

  if (!enrollment && !course.isFree) {
    redirect(`/course/${course.slug}`);
  }

  // Get current chapter
  let currentChapter = course.chapters.find(ch => ch.id === params.chapterId);
  
  // If chapter not found, redirect to first chapter
  if (!currentChapter && course.chapters.length > 0) {
    redirect(`/learn/${course.slug}/${course.chapters[0].id}`);
  }

  if (!currentChapter) {
    notFound();
  }

  // Get user progress
  const progress = await prisma.progress.findMany({
    where: {
      userId: session.user.id,
      courseId: course.id,
    },
    select: {
      chapterId: true,
      isCompleted: true,
    },
  });

  // Calculate overall progress
  const completedChapters = progress.filter(p => p.isCompleted).length;
  const progressPercentage = Math.round((completedChapters / course.chapters.length) * 100);

  // Find previous and next chapters
  const currentIndex = course.chapters.findIndex(ch => ch.id === currentChapter.id);
  const prevChapter = course.chapters[currentIndex - 1];
  const nextChapter = course.chapters[currentIndex + 1];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/50">
        <LearnContent
          course={course}
          currentChapter={currentChapter}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          progress={progress}
          progressPercentage={progressPercentage}
          enrollment={enrollment}
        />
      </main>
      <Footer />
    </div>
  );
}
