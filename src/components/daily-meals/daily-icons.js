// Isolated icon map for the Festigo Daily page — keeps the existing shared
// Icon.js untouched while only bundling the glyphs this feature uses.
import {
  UtensilsCrossed,
  Salad,
  Building2,
  HandPlatter,
  ClipboardCheck,
  MessageCircle,
  CalendarDays,
  Truck,
  BadgeCheck,
  MapPin,
  Clock,
  ChefHat,
  Soup,
  Leaf,
  Sparkles,
} from 'lucide-react';

const DAILY_ICONS = {
  UtensilsCrossed,
  Salad,
  Building2,
  HandPlatter,
  ClipboardCheck,
  MessageCircle,
  CalendarDays,
  Truck,
  BadgeCheck,
  MapPin,
  Clock,
  ChefHat,
  Soup,
  Leaf,
  Sparkles,
};

export default function DailyIcon({ name, ...props }) {
  const Cmp = DAILY_ICONS[name] || Sparkles;
  return <Cmp {...props} />;
}
