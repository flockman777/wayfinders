'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Lock, Unlock, Calendar, MessageSquare } from 'lucide-react';

interface CommunityContentProps {
  community: any;
  isMember: boolean;
}

export function CommunityContent({ community, isMember }: CommunityContentProps) {
  return (
    <div>
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-navy to-navy-light">
        {community.banner ? (
          <img src={community.banner} alt={community.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="w-24 h-24 text-white/10" />
          </div>
        )}
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="font-heading text-2xl font-bold">{community.name}</h1>
                      <Badge variant={community.isFree ? 'free' : 'pro'}>
                        {community.isFree ? (
                          <>
                            <Unlock className="w-3 h-3 mr-1" /> Gratis
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 mr-1" /> Berbayar
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{community.category}</p>
                  </div>
                  {!isMember ? (
                    <Button variant="amber" size="lg" onClick={() => alert('Fitur bergabung akan segera hadir!')}>
                      Bergabung Sekarang
                    </Button>
                  ) : (
                    <Button variant="outline" size="lg" onClick={() => alert('Fitur buat postingan akan segera hadir!')}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Buat Postingan
                    </Button>
                  )}
                </div>

                <p className="text-muted-foreground mb-4">{community.description}</p>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber" />
                    <span>{community.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber" />
                    <span>{community.posts.length} posts</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-heading text-xl font-bold mb-4">Postingan</h2>
                {community.posts.length > 0 ? (
                  <div className="space-y-4">
                    {community.posts.map((post: any) => (
                      <div key={post.id} className="p-4 rounded-lg border">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.author.avatar || ''} />
                            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{post.author.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(post.createdAt).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{post.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada postingan</p>
                    <p className="text-sm">Jadilah yang pertama membuat postingan!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading text-lg font-bold mb-4">Owner</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={community.owner.avatar || ''} />
                    <AvatarFallback>{community.owner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{community.owner.name}</p>
                    <p className="text-xs text-muted-foreground">Founder</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading text-lg font-bold mb-4">
                  Members ({community.memberCount})
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {community.members.slice(0, 8).map((member: any) => (
                    <Avatar key={member.id} className="w-10 h-10 border-2">
                      <AvatarImage src={member.user.avatar || ''} />
                      <AvatarFallback className="text-xs">
                        {member.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {community.members.length > 8 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    +{community.members.length - 8} lainnya
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Events */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading text-lg font-bold mb-4">
                  Event Mendatang
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      title: 'Weekly Meetup',
                      date: '15 Mar 2025',
                      time: '19:00 WIB',
                    },
                    {
                      title: 'Q&A Session',
                      date: '22 Mar 2025',
                      time: '20:00 WIB',
                    },
                  ].map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg bg-amber/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-amber" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.date} • {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
