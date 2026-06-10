import { cn } from '@/lib/utils';

export default function Container({ as: Tag = 'div', className, children }) {
  return <Tag className={cn('container-luxe', className)}>{children}</Tag>;
}
