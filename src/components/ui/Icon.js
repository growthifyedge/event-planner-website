import {
  CalendarHeart,
  PencilRuler,
  Flower2,
  MapPin,
  UtensilsCrossed,
  Music,
  Plane,
  Clock,
  Gem,
  Eye,
  ShieldCheck,
  Lock,
  Sparkles,
} from 'lucide-react';

// lucide-react v1 removed brand logos, so we provide simple inline brand glyphs
// (matching lucide's stroke style) for the social icons.
function Instagram(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function Facebook(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function Linkedin(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// Explicit map so only the icons we actually use are bundled (tree-shaking).
const ICONS = {
  CalendarHeart,
  PencilRuler,
  Flower2,
  MapPin,
  UtensilsCrossed,
  Music,
  Plane,
  Clock,
  Gem,
  Eye,
  ShieldCheck,
  Lock,
  Instagram,
  Sparkles,
  Facebook,
  Linkedin,
};

export default function Icon({ name, ...props }) {
  const Cmp = ICONS[name] || Sparkles;
  return <Cmp {...props} />;
}
