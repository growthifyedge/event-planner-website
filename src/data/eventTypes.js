export const eventTypes = [
  {
    slug: 'weddings',
    // Matches the media-library category so homepage/services art can be
    // resolved from uploaded portfolio media (falls back to `image` below).
    category: 'Weddings',
    title: 'Weddings',
    image: '/images/wedding.jpg',
    tagline: 'Timeless celebrations of love',
    description:
      'From intimate vows to grand multi-day affairs, we choreograph weddings that feel effortless, deeply personal and impossibly beautiful.',
    highlights: [
      'Full-service & destination weddings',
      'Bespoke design & floral artistry',
      'Vendor curation & guest experience',
    ],
  },
  {
    slug: 'corporate',
    category: 'Corporate',
    title: 'Corporate Events',
    image: '/images/corporate.jpg',
    tagline: 'Brand moments that resonate',
    description:
      'Galas, product launches, conferences and incentive retreats — produced with precision and a polish that elevates your brand.',
    highlights: [
      'Galas, summits & product launches',
      'Stage, AV & production management',
      'Brand-aligned design & hospitality',
    ],
  },
  {
    slug: 'birthdays',
    category: 'Birthdays',
    title: 'Birthdays',
    image: '/images/birthday.jpg',
    tagline: 'Milestones worth remembering',
    description:
      'Landmark birthdays deserve a celebration as singular as the guest of honour. We design every detail to delight.',
    highlights: [
      'Milestone & themed celebrations',
      'Custom décor & dessert design',
      'Entertainment & surprise moments',
    ],
  },
  {
    slug: 'private-parties',
    category: 'Private Parties',
    title: 'Private Parties',
    image: '/images/private-party.jpg',
    tagline: 'Evenings with a signature',
    description:
      'Cocktail receptions, anniversaries and intimate dinners — exquisitely hosted experiences for you and your guests.',
    highlights: [
      'Cocktail receptions & dinners',
      'Rooftop & estate experiences',
      'Mixology, catering & ambience',
    ],
  },
];
