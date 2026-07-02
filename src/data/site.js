// ═══════════════════════════════════════════════════════════════════════════
//  SITE CONTENT — edit your business details here. See CONTENT.md for the full guide.
//  NOTE: for phone / email / WhatsApp, update BOTH the display value AND its href.
// ═══════════════════════════════════════════════════════════════════════════

export const site = {
  // ── Brand identity ──
  name: 'Festigo',
  legalName: 'Festigo Events & Experiences',
  tagline: 'Bespoke Luxury Event Planning',
  description:
    'Festigo is a luxury event planning studio crafting unforgettable weddings, corporate galas, milestone birthdays and private celebrations — designed with impeccable detail and refined elegance.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  // ── Contact (update display value AND href together) ──
  email: 'growthifyedge@gmail.com',
  emailHref: 'mailto:growthifyedge@gmail.com',
  phone: '+92 (330) 259-1796',
  phoneHref: 'tel:+923302591796',
  // WhatsApp: the digits in wa.me must be the number in international format, no "+" or spaces.
  whatsapp: '+92 (330) 259-1796',
  whatsappHref:
    'https://wa.me/923302591796?text=Hello%20Festigo!%20I%27d%20love%20to%20discuss%20planning%20an%20event.',

  // ── Office address ──
  address: {
    line1: 'Shop No 2 Street No 2, Plot No 6C DHA Phase V Badar Commercial',
    line2: 'Karachi, 74900',
  },
  hours: 'Monday – Friday · 9am – 6pm PST',
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

// Generic trust indicators shown in the ribbon beneath the hero (rendered by TrustBar.js).
// Short, factual assurances — NOT media/press brands. Set to [] to hide the ribbon.
export const trustIndicators = [
  'AWARD-WINNING',
  'FULLY INSURED',
  '5-STAR RATED',
  'VETTED VENDORS',
  'NATIONWIDE SERVICE',
  '100% CONFIDENTIAL',
];

// Social proof strings shown in the hero pill and above the home testimonials.
// (The four-number stats band lives in src/data/stats.js.)
export const socialProof = {
  ratingLabel: 'Rated 5.0 by 500+ clients', // hero badge
  ratingValue: '5.0', // testimonials heading number
  ratingCaption: '500+ celebrations curated', // testimonials heading caption
};
