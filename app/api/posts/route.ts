import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Get posts for a community
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const communityId = searchParams.get('communityId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!communityId) {
      return NextResponse.json(
        { error: 'Community ID harus diisi' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { communityId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          where: { userId: searchParams.get('userId') || '' },
          select: { userId: true },
          take: 1,
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.post.count({ where: { communityId } });

    const postsWithDetails = posts.map((post) => ({
      ...post,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLiked: post.likes.length > 0,
    }));

    return NextResponse.json({
      posts: postsWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil posts' },
      { status: 500 }
    );
  }
}

// Create a new post
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
    const { content, imageUrl, communityId } = body;

    if (!content || !communityId) {
      return NextResponse.json(
        { error: 'Content dan community ID harus diisi' },
        { status: 400 }
      );
    }

    // Check if user is a member of the community
    const membership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Anda harus bergabung dengan komunitas untuk membuat post' },
        { status: 403 }
      );
    }

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        authorId: session.user.id,
        communityId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update community posts count
    await prisma.community.update({
      where: { id: communityId },
      data: {
        posts: {
          connect: { id: post.id },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Gagal membuat post' },
      { status: 500 }
    );
  }
}
