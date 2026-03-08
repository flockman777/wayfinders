import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Get user's progress for a course
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID harus diisi' },
        { status: 400 }
      );
    }

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Anda belum terdaftar di kursus ini' },
        { status: 403 }
      );
    }

    const progress = await prisma.progress.findMany({
      where: {
        userId: session.user.id,
        courseId,
      },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            duration: true,
            order: true,
          },
        },
      },
    });

    // Get all chapters for the course
    const chapters = await prisma.chapter.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        duration: true,
        order: true,
      },
      orderBy: { order: 'asc' },
    });

    const progressMap = new Map(progress.map((p) => [p.chapterId, p]));

    const chaptersWithProgress = chapters.map((chapter) => ({
      ...chapter,
      isCompleted: progressMap.get(chapter.id)?.isCompleted || false,
      watchedDuration: progressMap.get(chapter.id)?.watchedDuration || 0,
    }));

    const completedCount = chaptersWithProgress.filter((c) => c.isCompleted).length;
    const progressPercentage = chapters.length > 0
      ? Math.round((completedCount / chapters.length) * 100)
      : 0;

    return NextResponse.json({
      chapters: chaptersWithProgress,
      progress: {
        total: chapters.length,
        completed: completedCount,
        percentage: progressPercentage,
      },
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil progress' },
      { status: 500 }
    );
  }
}

// Update progress (mark chapter as completed)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { courseId, chapterId, isCompleted, watchedDuration } = body;

    if (!courseId || !chapterId) {
      return NextResponse.json(
        { error: 'Course ID dan Chapter ID harus diisi' },
        { status: 400 }
      );
    }

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Anda belum terdaftar di kursus ini' },
        { status: 403 }
      );
    }

    // Upsert progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId,
        },
      },
      update: {
        isCompleted: isCompleted ?? undefined,
        watchedDuration: watchedDuration ?? undefined,
        completedAt: isCompleted ? new Date() : undefined,
      },
      create: {
        userId: session.user.id,
        chapterId,
        courseId,
        isCompleted: isCompleted || false,
        watchedDuration: watchedDuration || 0,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Check if all chapters are completed - generate certificate
    if (isCompleted) {
      const chapters = await prisma.chapter.findMany({
        where: { courseId },
        select: { id: true },
      });

      const allProgress = await prisma.progress.findMany({
        where: {
          userId: session.user.id,
          courseId,
          isCompleted: true,
        },
        select: { chapterId: true },
      });

      if (chapters.length === allProgress.length) {
        // Update enrollment status
        await prisma.enrollment.update({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId,
            },
          },
          data: { status: 'COMPLETED' },
        });

        // Generate certificate if not exists
        const existingCert = await prisma.certificate.findUnique({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId,
            },
          },
        });

        if (!existingCert) {
          const certificateNumber = `WF-${Date.now().toString().slice(-8)}-${session.user.id.slice(0, 4).toUpperCase()}`;
          
          await prisma.certificate.create({
            data: {
              userId: session.user.id,
              courseId,
              certificateNumber,
              issuedAt: new Date(),
            },
          });

          console.log(`Certificate generated for user ${session.user.id} for course ${courseId}`);
        }
      }
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate progress' },
      { status: 500 }
    );
  }
}
