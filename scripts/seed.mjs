/**
 * Seed sample inquiries so the admin dashboard has data to display.
 *
 * This writes to the local JSON fallback store (.data/inquiries.json), which the
 * app uses automatically when MongoDB is not configured/reachable. If you are
 * running a real MongoDB, submit inquiries through the booking form instead.
 *
 *   npm run seed
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE = path.join(DATA_DIR, 'inquiries.json');

const DAY = 86400000;
const now = Date.now();
const iso = (ms) => new Date(ms).toISOString();

const sample = [
  {
    name: 'Isabella Hartwell',
    email: 'isabella.hartwell@email.com',
    phone: '+1 (212) 555-0181',
    eventType: 'Wedding',
    eventDate: iso(now + 180 * DAY),
    guestCount: 160,
    budget: '$50,000 – $100,000',
    message:
      'We are dreaming of a candlelit garden wedding in early autumn. Around 160 guests, a live band, and lots of white florals. Would love to discuss full-service planning and design.',
    status: 'new',
  },
  {
    name: 'Marcus Chen',
    email: 'm.chen@aureliagroup.com',
    phone: '+1 (415) 555-0143',
    eventType: 'Corporate Event',
    eventDate: iso(now + 75 * DAY),
    guestCount: 400,
    budget: '$100,000+',
    message:
      'Annual product launch and gala dinner for ~400 guests. We need full production, stage and AV management. Brand is modern and minimal.',
    status: 'contacted',
  },
  {
    name: 'Sophia Laurent',
    email: 'sophia.laurent@email.com',
    phone: '+1 (646) 555-0198',
    eventType: 'Birthday',
    eventDate: iso(now + 40 * DAY),
    guestCount: 80,
    budget: '$25,000 – $50,000',
    message: 'A glamorous 40th birthday soirée in Manhattan. Gold and ivory theme, dessert table, DJ.',
    status: 'booked',
  },
  {
    name: 'David & Rachel Goldberg',
    email: 'goldberg.family@email.com',
    phone: '+1 (917) 555-0120',
    eventType: 'Private Party',
    eventDate: iso(now + 25 * DAY),
    guestCount: 50,
    budget: '$10,000 – $25,000',
    message: 'Intimate 25th anniversary dinner at our estate. Elegant, romantic, plated dinner for 50.',
    status: 'new',
  },
  {
    name: 'Priya Mehta',
    email: 'priya.mehta@email.com',
    phone: '+44 20 7946 0958',
    eventType: 'Wedding',
    eventDate: iso(now + 300 * DAY),
    guestCount: 300,
    budget: '$100,000+',
    message: 'Three-day destination wedding at Lake Como next year. Need guest travel coordination too.',
    status: 'archived',
  },
];

const records = sample.map((s, i) => {
  const created = now - (sample.length - i) * 2 * DAY;
  return {
    _id: randomUUID(),
    ...s,
    source: 'seed',
    createdAt: iso(created),
    updatedAt: iso(created),
  };
});

await fs.mkdir(DATA_DIR, { recursive: true });
await fs.writeFile(FILE, JSON.stringify(records, null, 2), 'utf8');

console.log(`✓ Seeded ${records.length} sample inquiries → ${FILE}`);
console.log('  (local JSON fallback store — used when MongoDB is not configured)');
