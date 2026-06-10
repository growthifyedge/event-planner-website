import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import Stars from '@/components/ui/Stars';
import { Quote } from 'lucide-react';
import TestimonialsGrid from '@/components/sections/TestimonialsGrid';
import CTASection from '@/components/sections/CTASection';
import { testimonials } from '@/data/testimonials';

export const metadata = {
  title: 'Testimonials',
  description:
    'Read what our clients say about working with Festigo — five-star luxury weddings, corporate galas and private celebrations.',
  alternates: { canonical: '/testimonials' },
};

const featured = testimonials[0];

export default function TestimonialsPage() {
  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title="Words from our clients"
        description="The trust of the families and brands we serve is the truest measure of our work."
        image="/images/portfolio-floral.jpg"
        imageLabel="Kind Words"
      />

      <Section dark>
        <Container className="text-center">
          <Reveal>
            <Quote className="mx-auto h-12 w-12 text-gold-400" />
          </Reveal>
          <Reveal delay={0.06}>
            <blockquote className="mx-auto mt-8 max-w-4xl font-display text-2xl leading-snug text-cream-50 text-balance sm:text-3xl lg:text-4xl">
              “{featured.quote}”
            </blockquote>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Stars count={featured.rating} />
              <div className="font-display text-lg text-gold-300">{featured.name}</div>
              <div className="text-[11px] uppercase tracking-widest text-cream-200/60">
                {featured.role}
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <TestimonialsGrid />
      </Section>

      <CTASection />
    </>
  );
}
