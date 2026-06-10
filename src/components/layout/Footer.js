import Link from 'next/link';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Icon from '@/components/ui/Icon';
import { site, navLinks, cta } from '@/data/site';
import { eventTypes } from '@/data/eventTypes';

const ColTitle = ({ children }) => (
  <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-luxe text-gold-400">
    {children}
  </h4>
);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink-950 text-cream-200/70">
      <div className="hairline h-px w-full" />
      <div className="container-luxe py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo light />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream-200/55">
              {site.description}
            </p>
            <div className="mt-7 flex gap-3">
              {site.socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-50/15 text-cream-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400 hover:text-gold-300"
                >
                  <Icon name={s.icon} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <ColTitle>Explore</ColTitle>
            <ul className="space-y-3 text-sm">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-gold-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <ColTitle>Celebrations</ColTitle>
            <ul className="space-y-3 text-sm">
              {eventTypes.map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/services#${e.slug}`}
                    className="transition-colors hover:text-gold-300"
                  >
                    {e.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <ColTitle>Get in touch</ColTitle>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <span>
                  {site.address.line1}
                  <br />
                  {site.address.line2}
                </span>
              </li>
              <li>
                <a href={site.phoneHref} className="flex items-center gap-3 hover:text-gold-300">
                  <Phone className="h-4 w-4 shrink-0 text-gold-500" />
                  {site.phone}
                </a>
              </li>
              <li>
                <a href={site.emailHref} className="flex items-center gap-3 hover:text-gold-300">
                  <Mail className="h-4 w-4 shrink-0 text-gold-500" />
                  {site.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 shrink-0 text-gold-500" />
                {site.hours}
              </li>
            </ul>
            <Link href={cta.href} className="btn-gold mt-7">
              {cta.label}
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-cream-50/10 pt-8 text-xs text-cream-200/45 sm:flex-row sm:items-center">
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p className="tracking-wide">Crafted with intention in New York City.</p>
        </div>
      </div>
    </footer>
  );
}
