import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const isFree = searchParams.get('isFree');
    const search = searchParams.get('search');
    const level = searchParams.get('level');

    const skip = (page - 1) * limit;

    const where: any = {
      status: 'PUBLISHED',
    };

    if (category) {
      where.category = category;
    }

    if (isFree !== null && isFree !== undefined) {
      where.isFree = isFree === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (level) {
      where.level = level;
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
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
              id: true,
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

    // Calculate duration and rating for each course
    const coursesWithDetails = courses.map((course) => {
      const totalDuration = course.chapters.reduce(
        (sum, chapter) => sum + chapter.duration,
        0
      );
      const studentCount = course.enrollments.length;

      const { chapters, enrollments, ...courseData } = course;

      return {
        ...courseData,
        duration: totalDuration,
        students: studentCount,
        price: Number(course.price),
      };
    });

    return NextResponse.json({
      courses: coursesWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kursus' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is instructor or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Hanya instructor yang bisa membuat kursus' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, slug, description, price, isFree, category, level, thumbnail } = body;

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        price: parseFloat(price),
        isFree,
        category,
        level: level || 'BEGINNER',
        thumbnail,
        instructorId: user.id,
        status: 'DRAFT',
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Gagal membuat kursus' },
      { status: 500 }
    );
  }
}
