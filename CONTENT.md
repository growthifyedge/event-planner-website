# Content Editing Guide — exactly where to change everything

All business/marketing content lives in plain data files under **`src/data/`**. Edit a value,
save, and the running dev server hot-reloads instantly — no component code changes needed for
anything in the checklist below (except the hero headline, which is noted).

> ⚠️ For **phone, email, and WhatsApp** you must update **two values**: the visible text AND its
> link (`href`). They're side-by-side in the same file.

---

## ✅ Quick checklist
- [ ] Contact email → `src/data/site.js`
- [ ] Phone number → `src/data/site.js`
- [ ] WhatsApp number → `src/data/site.js`
- [ ] Office address → `src/data/site.js`
- [ ] Brand name / tagline / description → `src/data/site.js`
- [ ] Social media links → `src/data/site.js`
- [ ] Press names ("As featured in") → `src/data/site.js`
- [ ] Social proof (hero rating, "500+ celebrations") → `src/data/site.js`
- [ ] Stats band (15+ years, 500+ events, …) → `src/data/stats.js`
- [ ] Testimonials → `src/data/testimonials.js`
- [ ] Services → `src/data/services.js`
- [ ] Packages & pricing → `src/data/packages.js`
- [ ] Portfolio items → `src/data/portfolio.js`
- [ ] Event types → `src/data/eventTypes.js`
- [ ] About story / values / team → `src/data/about.js`
- [ ] FAQs → `src/data/faqs.js`
- [ ] Hero headline & subheading → `src/components/home/Hero.js`
- [ ] Images → `public/images/` (keep same filenames — see `public/images/README.md`)
- [ ] Admin credentials & secret → `.env.local` (local) / host env vars (production)

---

## 1. Contact email — `src/data/site.js`
```js
email: 'growthifyedge@gmail.com',
emailHref: 'mailto:growthifyedge@gmail.com',   // ← update this too
```

## 2. Phone number — `src/data/site.js`
```js
phone: '+92 (330) 259-1796',
phoneHref: 'tel:+923302591796',                  // ← digits only, no spaces/brackets
```

## 3. WhatsApp number — `src/data/site.js`
```js
whatsapp: '+923302591796',
whatsappHref: 'https://wa.me/923302591796?text=...',
// In wa.me/<number>, use full international format, digits only (no "+", spaces, or brackets).
// Example: +44 7700 900123  →  https://wa.me/447700900123
```

## 4. Office address — `src/data/site.js`
```js
address: { line1: 'Shop No 2 Street No 2, Plot No 6C DHA Phase V Badar Commercial', line2: 'Karachi, 74900' },
hours: 'Monday – Friday · 9am – 6pm PST',
```

## 5. Brand name / tagline / description — `src/data/site.js`
```js
name: 'Festigo',
legalName: 'Festigo Events & Experiences',
tagline: 'Bespoke Luxury Event Planning',
description: 'Festigo is a luxury event planning atelier …',   // used in SEO + footer
founded: 2009,
```
> The brand wordmark ("Festigo") also appears in `src/components/ui/Logo.js` and in the email
> template `src/lib/email.js` — change those if you rename the brand.

## 6. Social media links — `src/data/site.js`
```js
socials: [
  { name: 'Instagram', href: 'https://instagram.com', icon: 'Instagram' },
  { name: 'Pinterest', href: 'https://pinterest.com', icon: 'Sparkles' },
  ...
],
```
Replace each `href`. Available `icon` values: `Instagram`, `Facebook`, `Linkedin`, `Sparkles`.

## 7. Press names ("As featured in") — `src/data/site.js`
```js
export const press = ['VOGUE', 'TATLER', "HARPER'S BAZAAR", 'THE KNOT', 'BRIDES', 'CONDÉ NAST'];
```
Replace with real placements, or set to `[]` to hide the press bar entirely.
(Rendered by `src/components/sections/TrustBar.js` — no edit needed there.)

## 8. Social proof — hero rating & testimonials caption — `src/data/site.js`
```js
export const socialProof = {
  ratingLabel: 'Rated 5.0 by 500+ clients',   // hero badge
  ratingValue: '5.0',                          // testimonials heading number
  ratingCaption: '500+ celebrations curated',  // testimonials heading caption
};
```

## 9. Stats band (the four big numbers) — `src/data/stats.js`
```js
export const stats = [
  { value: '15+', label: 'Years of artistry' },
  { value: '500+', label: 'Events curated' },
  { value: '40+', label: 'Destinations' },
  { value: '98%', label: 'Referral rate' },
];
```

## 10. Testimonials — `src/data/testimonials.js`
Add/edit/remove objects: `{ quote, name, role, rating }` (rating 1–5).
The **first entry** is shown as the large featured quote on `/testimonials`.

## 11. Services — `src/data/services.js`
`services[]` → `{ icon, title, description }`. Valid `icon` names:
`CalendarHeart, PencilRuler, Flower2, MapPin, UtensilsCrossed, Music, Plane, Clock`.
(Also in this file: `process[]` — the 4-step "how we work" content.)

## 12. Packages & pricing — `src/data/packages.js`
`packages[]` → `{ name, tagline, priceFrom, description, features[], featured }`.
`featured: true` highlights the middle tier. Also edit `packagesNote` (the disclaimer line).

## 13. Portfolio items — `src/data/portfolio.js`
`portfolio[]` → `{ title, category, location, year, image, span }`.
`category` must match one in `categories` (the filter buttons). `span`: `tall | wide | normal`.

## 14. Event types — `src/data/eventTypes.js`
`eventTypes[]` → `{ slug, title, image, tagline, description, highlights[] }`.
`slug` powers the anchor links (e.g. `/services#weddings`).

## 15. About — `src/data/about.js`
`aboutStory` (eyebrow, title, paragraphs, signature), `values[]`, and `team[]` (`{ name, role, initials }`).

## 16. FAQs — `src/data/faqs.js`
`faqs[]` → `{ q, a }`. Shown on `/packages`.

## 17. Hero headline & subheading — `src/components/home/Hero.js`
The big headline ("Extraordinary events, exquisitely curated") contains styling/markup, so it
lives in the component. Edit the `<h1>` text and the `<p>` subheading directly there.
(The rating badge and consultation/response lines come from `site.js`.)

## 18. Images — `public/images/`
Drop real photos in using the **same filenames** (e.g. `hero.jpg`, `wedding.jpg`) — they appear
automatically. Full list + recommended sizes/ratios: `public/images/README.md`.
Re-compress with `npm run optimize:images`.

## 19. Admin credentials & secret — environment variables (NOT in code)
**Local:** `.env.local`
```
ADMIN_EMAIL=admin@lumiere-events.com
ADMIN_PASSWORD=admin123          # change me
JWT_SECRET=<long random string>  # generate below
```
**Production (Vercel):** set the same keys in Project → Settings → Environment Variables.
Generate a strong secret:
```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
> The app **fails closed in production** if `JWT_SECRET` is missing — admin sessions won't sign.
> See `HANDOVER.md` §6–§7 for the full env + email setup.

---

### Tip
After editing, the dev server (`npm run dev`) hot-reloads automatically. For production, redeploy
(or `npm run build && npm run start`).
