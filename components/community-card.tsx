import Link from 'next/link';
import { Users, Lock, Unlock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';

interface CommunityCardProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  isFree: boolean;
  price: number;
  memberCount: number;
  category: string;
  recentMembers?: Array<{
    id: string;
    name: string;
    avatar: string | null;
  }>;
}

export function CommunityCard({
  id,
  name,
  slug,
  description,
  thumbnail,
  isFree,
  price,
  memberCount,
  category,
  recentMembers,
}: CommunityCardProps) {
  return (
    <div className="bg-card rounded-xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-br from-navy to-navy-light overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="w-12 h-12 text-white/20" />
          </div>
        )}
        
        {/* Access Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={isFree ? 'free' : 'pro'} className="gap-1">
            {isFree ? (
              <>
                <Unlock size={12} /> Gratis
              </>
            ) : (
              <>
                <Lock size={12} /> Berbayar
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <span className="text-xs font-medium text-muted-foreground uppercase">
          {category}
        </span>

        {/* Name */}
        <Link href={`/community/${slug}`}>
          <h3 className="font-heading font-semibold text-xl mt-1 mb-2 hover:text-amber transition-colors">
            {name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>

        {/* Members */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {recentMembers?.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="w-7 h-7 border-2 border-card">
                <AvatarImage src={member.avatar || ''} />
                <AvatarFallback className="text-xs">
                  {member.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {memberCount.toLocaleString()} member
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {isFree ? (
              <span className="text-green-600 font-semibold">Gratis</span>
            ) : (
              <span className="font-heading font-bold text-lg">
                {formatCurrency(price)}
              </span>
            )}
          </div>
          <Button variant="amber" size="sm" asChild>
            <Link href={`/community/${slug}`}>
              Bergabung
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
