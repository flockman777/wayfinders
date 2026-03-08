import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CommunityCard } from '@/components/community-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import prisma from '@/lib/prisma';

export default async function CommunityPage() {
  const communities = await prisma.community.findMany({
    include: {
      members: {
        select: {
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
        },
      },
    },
    orderBy: { memberCount: 'desc' },
  });

  const communitiesWithDetails = communities.map((comm) => ({
    ...comm,
    price: Number(comm.price),
    memberCount: comm._count.members,
    recentMembers: comm.members.map((m) => m.user),
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-navy py-12">
          <div className="container text-center text-white">
            <Badge variant="pro" className="mb-4">Komunitas</Badge>
            <h1 className="font-heading text-4xl font-bold mb-4">
              Komunitas Wayfinders
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Bergabung dengan komunitas yang sesuai dengan passionmu
            </p>
          </div>
        </section>

        {/* Communities Grid */}
        <section className="py-12 bg-muted/50">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-6">
              {communitiesWithDetails.map((community) => (
                <CommunityCard key={community.id} {...community} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-navy">
          <div className="container text-center text-white">
            <h2 className="font-heading text-2xl font-bold mb-4">
              Belum Menemukan Komunitas yang Cocok?
            </h2>
            <p className="text-gray-300 mb-6">
              Buat komunitasmu sendiri dan undang member lainnya
            </p>
            <Button variant="amber" size="lg">
              Buat Komunitas Baru
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
