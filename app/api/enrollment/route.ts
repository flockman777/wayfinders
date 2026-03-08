import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Get user's enrollments
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
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
                id: true,
                duration: true,
              },
            },
          },
        },
        progress: {
          select: {
            id: true,
            isCompleted: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const enrollmentsWithProgress = enrollments.map((enrollment) => {
      const totalChapters = enrollment.course.chapters.length;
      const completedChapters = enrollment.progress.filter((p) => p.isCompleted).length;
      const progressPercentage = totalChapters > 0
        ? Math.round((completedChapters / totalChapters) * 100)
        : 0;

      const totalDuration = enrollment.course.chapters.reduce(
        (sum, chapter) => sum + chapter.duration,
        0
      );

      return {
        ...enrollment,
        course: {
          ...enrollment.course,
          price: Number(enrollment.course.price),
          duration: totalDuration,
        },
        progress: {
          total: totalChapters,
          completed: completedChapters,
          percentage: progressPercentage,
        },
      };
    });

    return NextResponse.json({ enrollments: enrollmentsWithProgress });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data enrollment' },
      { status: 500 }
    );
  }
}

// Create enrollment (for free courses)
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
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID harus diisi' },
        { status: 400 }
      );
    }

    // Check if course exists and is free
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Kursus tidak ditemukan' },
        { status: 404 }
      );
    }

    if (!course.isFree) {
      return NextResponse.json(
        { error: 'Kursus ini berbayar, silakan lakukan pembayaran' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Anda sudah terdaftar di kursus ini' },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { error: 'Gagal membuat enrollment' },
      { status: 500 }
    );
  }
}
