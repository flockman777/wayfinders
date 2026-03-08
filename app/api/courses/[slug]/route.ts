import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const course = await prisma.course.findUnique({
      where: { slug: params.slug },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        chapters: {
          orderBy: { order: 'asc' },
        },
        enrollments: {
          select: {
            id: true,
            userId: true,
          },
        },
        certificates: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Kursus tidak ditemukan' },
        { status: 404 }
      );
    }

    // Calculate total duration
    const totalDuration = course.chapters.reduce(
      (sum, chapter) => sum + chapter.duration,
      0
    );

    // Check if current user is enrolled
    let isEnrolled = false;
    let userProgress: { chapterId: string; isCompleted: boolean }[] = [];

    if (session?.user?.id) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: course.id,
          },
        },
      });

      isEnrolled = !!enrollment;

      if (enrollment) {
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
        userProgress = progress;
      }
    }

    // Prepare chapters - hide videoUrl for non-enrolled users on paid chapters
    const chapters = course.chapters.map((chapter) => {
      const progress = userProgress.find((p) => p.chapterId === chapter.id);
      return {
        ...chapter,
        videoUrl: isEnrolled || chapter.isFree ? chapter.videoUrl : null,
        isCompleted: progress?.isCompleted || false,
      };
    });

    const { enrollments, certificates, ...courseData } = course;

    return NextResponse.json({
      ...courseData,
      price: Number(course.price),
      duration: totalDuration,
      students: enrollments.length,
      chapters,
      isEnrolled,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil detail kursus' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { slug: params.slug },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Kursus tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if user is the instructor or admin
    if (course.instructorId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      if (user?.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { title, description, price, isFree, category, level, thumbnail, status } = body;

    const updated = await prisma.course.update({
      where: { slug: params.slug },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(isFree !== undefined && { isFree }),
        ...(category && { category }),
        ...(level && { level }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate kursus' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.course.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json({ message: 'Kursus berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus kursus' },
      { status: 500 }
    );
  }
}
