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

    const community = await prisma.community.findUnique({
      where: { slug: params.slug },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { joinedAt: 'desc' },
          take: 20,
        },
        posts: {
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
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Komunitas tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if current user is a member
    let isMember = false;
    let memberRole: string | null = null;

    if (session?.user?.id) {
      const membership = await prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId: session.user.id,
            communityId: community.id,
          },
        },
      });

      isMember = !!membership;
      memberRole = membership?.role || null;
    }

    const { members, posts, _count, ...communityData } = community;

    return NextResponse.json({
      ...communityData,
      price: Number(community.price),
      memberCount: _count.members,
      postsCount: _count.posts,
      recentMembers: members.slice(0, 10).map((m) => m.user),
      recentPosts: posts.map((post) => ({
        ...post,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
      })),
      isMember,
      memberRole,
    });
  } catch (error) {
    console.error('Error fetching community:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil detail komunitas' },
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

    const community = await prisma.community.findUnique({
      where: { slug: params.slug },
    });

    if (!community) {
      return NextResponse.json(
        { error: 'Komunitas tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if user is owner or admin
    if (community.ownerId !== session.user.id) {
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
    const { name, description, price, isFree, category, thumbnail, banner } = body;

    const updated = await prisma.community.update({
      where: { slug: params.slug },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(isFree !== undefined && { isFree }),
        ...(category && { category }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(banner !== undefined && { banner }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating community:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate komunitas' },
      { status: 500 }
    );
  }
}
