import { cn } from '@/lib/utils';
import Container from './Container';

export default function Section({
  id,
  className,
  containerClassName,
  dark = false,
  bare = false,
  children,
}) {
  return (
    <section
      id={id}
      className={cn(
        'relative py-16 sm:py-20 lg:py-24',
        dark && 'bg-ink-900 text-cream-50',
        className
      )}
    >
      {bare ? children : <Container className={containerClassName}>{children}</Container>}
    </section>
  );
}
