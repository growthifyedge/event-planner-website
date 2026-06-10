import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Stars({ count = 5, className }) {
  return (
    <div className={cn('flex items-center gap-1 text-gold-500', className)} aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-current" />
      ))}
    </div>
  );
}
