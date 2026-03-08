import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category');
    const isFree = searchParams.get('isFree');
    const search = searchParams.get('search');

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (isFree !== null && isFree !== undefined) {
      where.isFree = isFree === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const communities = await prisma.community.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        members: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          take: 5,
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
      orderBy: { memberCount: 'desc' },
    });

    const communitiesWithDetails = communities.map((community) => ({
      ...community,
      price: Number(community.price),
      memberCount: community._count.members,
    }));

    return NextResponse.json({ communities: communitiesWithDetails });
  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data komunitas' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, price, isFree, category, thumbnail, banner, ownerId } = body;

    const community = await prisma.community.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price) || 0,
        isFree: isFree || false,
        category,
        thumbnail,
        banner,
        ownerId,
      },
    });

    // Add owner as member with OWNER role
    await prisma.communityMember.create({
      data: {
        userId: ownerId,
        communityId: community.id,
        role: 'OWNER',
      },
    });

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error('Error creating community:', error);
    return NextResponse.json(
      { error: 'Gagal membuat komunitas' },
      { status: 500 }
    );
  }
}
