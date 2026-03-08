import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateCertificateNumber } from '@/lib/utils';

// Get user's certificates
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil sertifikat' },
      { status: 500 }
    );
  }
}

// Generate certificate for a completed course
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

    // Check if user is enrolled and completed
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            chapters: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Anda belum terdaftar di kursus ini' },
        { status: 404 }
      );
    }

    if (enrollment.status !== 'COMPLETED') {
      // Check if all chapters are completed
      const progress = await prisma.progress.findMany({
        where: {
          userId: session.user.id,
          courseId,
          isCompleted: true,
        },
      });

      if (progress.length !== enrollment.course.chapters.length) {
        return NextResponse.json(
          { error: 'Selesaikan semua chapter untuk mendapatkan sertifikat' },
          { status: 400 }
        );
      }

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
    }

    // Check if certificate already exists
    const existingCert = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (existingCert) {
      return NextResponse.json(existingCert);
    }

    // Generate certificate
    const certificate = await prisma.certificate.create({
      data: {
        userId: session.user.id,
        courseId,
        certificateNumber: generateCertificateNumber(),
        issuedAt: new Date(),
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      { error: 'Gagal membuat sertifikat' },
      { status: 500 }
    );
  }
}
