export const categories = [
  'All',
  'Weddings',
  'Corporate',
  'Birthdays',
  'Private Parties',
];

export const portfolio = [
  {
    title: 'Candlelit Garden Wedding',
    category: 'Weddings',
    location: 'Karachi',
    year: '2025',
    image: '/images/portfolio-reception.jpg',
    span: 'tall',
  },
  {
    title: 'Karachi Tech Summit',
    category: 'Corporate',
    location: 'Karachi',
    year: '2025',
    image: '/images/portfolio-corporate.jpg',
    span: 'wide',
  },
  {
    title: 'Garden Florals in Bloom',
    category: 'Weddings',
    location: 'Karachi',
    year: '2024',
    image: '/images/portfolio-floral.jpg',
    span: 'normal',
  },
  {
    title: 'Golden Hour Reception',
    category: 'Weddings',
    location: 'Karachi',
    year: '2024',
    image: '/images/hero.jpg',
    span: 'normal',
  },
  {
    title: 'A Karachi 40th',
    category: 'Birthdays',
    location: 'Karachi',
    year: '2025',
    image: '/images/birthday.jpg',
    span: 'tall',
  },
  {
    title: 'Bespoke Table Stories',
    category: 'Weddings',
    location: 'Karachi',
    year: '2024',
    image: '/images/portfolio-place-setting.jpg',
    span: 'normal',
  },
  {
    title: 'The Grand Ballroom Gala',
    category: 'Corporate',
    location: 'Karachi',
    year: '2024',
    image: '/images/portfolio-venue.jpg',
    span: 'wide',
  },
  {
    title: 'Rooftop Cocktail Reception',
    category: 'Private Parties',
    location: 'Karachi',
    year: '2025',
    image: '/images/private-party.jpg',
    span: 'normal',
  },
  {
    title: 'Ceremony Under the Arch',
    category: 'Weddings',
    location: 'Karachi',
    year: '2025',
    image: '/images/wedding.jpg',
    span: 'normal',
  },
];

// Curated static set, normalized to the gallery's item shape. Used as the
// fallback on /portfolio (only when no uploaded media exists) and the home preview.
export const staticPortfolioItems = portfolio.map((p, i) => ({
  id: `static-${i}`,
  title: p.title,
  category: p.category,
  type: 'image',
  src: p.image,
  location: p.location,
  year: p.year,
  span: p.span,
}));
