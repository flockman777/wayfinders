import Link from 'next/link';
import { Star, Clock, Users, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency, formatDuration, getCategoryColor, getCategoryDisplayName } from '@/lib/utils';

interface CourseCardProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  isFree: boolean;
  category: string;
  level?: string;
  duration?: number;
  students?: number;
  rating?: number;
  instructor: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export function CourseCard({
  id,
  title,
  slug,
  description,
  thumbnail,
  price,
  isFree,
  category,
  level,
  duration,
  students,
  rating,
  instructor,
}: CourseCardProps) {
  return (
    <Link href={`/course/${slug}`} className="group">
      <div className="bg-card rounded-xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-navy">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-navy to-navy-light flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-white/50" />
            </div>
          )}
          
          {/* Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={isFree ? 'free' : 'pro'}>
              {isFree ? 'GRATIS' : 'PRO'}
            </Badge>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-navy/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <PlayCircle className="w-6 h-6 text-navy" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2 h-2 rounded-full ${getCategoryColor(category)}`} />
            <span className="text-xs font-medium text-muted-foreground uppercase">
              {getCategoryDisplayName(category)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-2 group-hover:text-amber transition-colors">
            {title}
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="w-6 h-6">
              <AvatarImage src={instructor.avatar || ''} />
              <AvatarFallback className="text-xs">
                {instructor.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{instructor.name}</span>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {duration && (
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{formatDuration(duration)}</span>
                </div>
              )}
              {students !== undefined && (
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{students.toLocaleString()}</span>
                </div>
              )}
            </div>
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber text-amber" />
                <span className="text-sm font-medium">{rating}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mt-3 pt-3 border-t">
            <span className={`font-heading font-bold text-lg ${isFree ? 'text-green-600' : 'text-foreground'}`}>
              {isFree ? 'Gratis' : formatCurrency(price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
