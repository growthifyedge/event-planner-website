export const site = {
  name: 'Lumière',
  legalName: 'Lumière Events & Experiences',
  tagline: 'Bespoke Luxury Event Planning',
  description:
    'Lumière is a luxury event planning atelier crafting unforgettable weddings, corporate galas, milestone birthdays and private celebrations — designed with impeccable detail and refined elegance.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  email: 'hello@lumiere-events.com',
  phone: '+1 (212) 555-0192',
  phoneHref: 'tel:+12125550192',
  emailHref: 'mailto:hello@lumiere-events.com',
  whatsapp: '+1 (212) 555-0192',
  whatsappHref:
    'https://wa.me/12125550192?text=Hello%20Lum%C3%A8re!%20I%27d%20love%20to%20discuss%20planning%20an%20event.',
  address: {
    line1: '121 Madison Avenue, Suite 1200',
    line2: 'New York, NY 10016',
  },
  hours: 'Monday – Friday · 9am – 6pm EST',
  founded: 2009,
  socials: [
    { name: 'Instagram', href: 'https://instagram.com', icon: 'Instagram' },
    { name: 'Pinterest', href: 'https://pinterest.com', icon: 'Sparkles' },
    { name: 'Facebook', href: 'https://facebook.com', icon: 'Facebook' },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: 'Linkedin' },
  ],
};

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Packages', href: '/packages' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Contact', href: '/contact' },
];

export const cta = {
  label: 'Plan Your Event',
  href: '/booking',
};

// Conversion + trust messaging used across the site.
export const conversion = {
  consultation: 'Complimentary consultation',
  response: 'Response within 24 hours',
  reassurance: 'Award-winning · Fully insured · Absolute discretion',
};

export const trustBadges = [
  'Complimentary consultation',
  'Responds within 24 hours',
  'Award-winning & fully insured',
];

// Press / "as featured in" wordmarks (replace with real placements for a client).
export const press = [
  'VOGUE',
  'TATLER',
  "HARPER'S BAZAAR",
  'THE KNOT',
  'BRIDES',
  'CONDÉ NAST',
];
