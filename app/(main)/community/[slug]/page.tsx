import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { CommunityContent } from './community-content';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';

interface CommunityDetailPageProps {
  params: { slug: string };
}

export default async function CommunityDetailPage({ params }: CommunityDetailPageProps) {
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
        take: 12,
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
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!community) {
    notFound();
  }

  // Check if current user is a member
  let isMember = false;
  if (session?.user) {
    const membership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: (session.user as any).id || '',
          communityId: community.id,
        },
      },
    });
    isMember = !!membership;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/50">
        <CommunityContent 
          community={community}
          isMember={isMember}
        />
      </main>
      <Footer />
    </div>
  );
}
