# Lumière — Project Handover

A modern, premium full-stack **Event Planner** website: Next.js (App Router) + Tailwind CSS +
Framer Motion + MongoDB, with an inquiry/booking system, email notifications, and a protected
admin dashboard.

- **Live (local):** http://localhost:3000
- **Admin:** http://localhost:3000/admin

---

## 1. Tech stack
| Area | Choice |
|---|---|
| Framework | Next.js 15 (App Router, JavaScript, ESM) |
| Styling | Tailwind CSS v3 |
| Animation | Framer Motion + CSS |
| Database | MongoDB + Mongoose (local JSON fallback for dev) |
| Validation | Zod + React Hook Form |
| Email | Nodemailer (SMTP) |
| Auth | HMAC-signed session cookie via Web Crypto (Edge-safe) |
| Icons | lucide-react (+ inline brand glyphs) |

---

## 2. Project structure
```
src/
├── app/
│   ├── (marketing)/       Public site (Navbar + Footer + WhatsApp button)
│   │   ├── layout.js · page.js (home)
│   │   ├── about/ services/ portfolio/ packages/ testimonials/ contact/ booking/
│   ├── admin/             login/ + dashboard (own layout, noindex)
│   ├── api/
│   │   ├── inquiries/route.js          POST (public) + GET (admin)
│   │   ├── inquiries/[id]/route.js      PATCH status + DELETE (admin)
│   │   ├── admin/login/route.js · admin/logout/route.js
│   ├── layout.js          Root: fonts + base SEO metadata
│   ├── globals.css · sitemap.js · robots.js · icon.svg · not-found.js
├── components/
│   ├── layout/   Navbar.js · Footer.js · WhatsAppButton.js
│   ├── ui/       Photo.js · Section.js · SectionHeading.js · Reveal.js · Container.js · Logo.js · Icon.js · Stars.js · PageHero.js
│   ├── sections/ ServicesGrid · TestimonialsGrid · PortfolioGallery · EventTypesGrid · ProcessSteps · PackagesGrid · TrustBar · CTASection · FAQ · StatStrip
│   ├── home/     Hero.js
│   ├── forms/    BookingForm.js · ContactForm.js
│   └── admin/    LoginForm.js · InquiryDashboard.js
├── data/         site · eventTypes · services · packages · testimonials · portfolio · faqs · about · stats
├── lib/          db.js · inquiries-store.js · auth.js · email.js · validation.js · utils.js
├── models/Inquiry.js
└── middleware.js          Protects /admin routes (Edge)
public/images/   12 optimized JPEGs (~2.3 MB total) + README (filename guide)
scripts/         seed.mjs · optimize-images.mjs
```

---

## 3. Key files & what each controls
| File | Controls |
|---|---|
| `components/home/Hero.js` | Hero image, cinematic overlays, crop, headline, trust pill, CTAs, consultation/response line |
| `components/layout/Navbar.js` | Sticky nav, scroll hide/reveal, hover underlines, mobile menu |
| `components/layout/Footer.js` | Footer columns, contact, socials |
| `components/layout/WhatsAppButton.js` | Floating WhatsApp quick-inquiry button (public pages) |
| `components/ui/Photo.js` | Resilient image renderer — shows real photo, falls back to gradient placeholder, handles the load-before-hydration case |
| `components/forms/BookingForm.js` | Full inquiry form (Name, Email, Phone, Event Type, Date, Guests, Budget, Message) + Zod validation + honeypot |
| `components/forms/ContactForm.js` | Lightweight contact form → same `/api/inquiries` endpoint |
| `components/sections/ServicesGrid.js` | Service cards (hover lift + gold accent + icon pop) |
| `components/sections/TestimonialsGrid.js` | Testimonial cards (quote, stars, avatar, hover depth) |
| `components/sections/PortfolioGallery.js` | Filterable gallery + lightbox |
| `components/sections/TrustBar.js` / `CTASection.js` | Press strip / conversion CTA band |
| `components/admin/InquiryDashboard.js` | Stats, status filters, inline status change, detail modal, delete |
| `lib/inquiries-store.js` | Data layer: MongoDB primary, local-JSON dev fallback |
| `lib/auth.js` + `middleware.js` | Session token (Web Crypto) + `/admin` protection; fails closed in prod without `JWT_SECRET` |
| `lib/email.js` | Admin notification + client confirmation (Nodemailer) |
| `globals.css` + `tailwind.config.js` | Palette (ink/gold/cream), button shine, animations |
| `data/*` | All editable content & image paths |

---

## 4. Prerequisites
- **Node.js 18.18+** (LTS 20 or 22 recommended — see `.nvmrc`).
- **MongoDB** — optional locally (JSON fallback), **required in production** (use Atlas).

---

## 5. Local setup
```bash
npm install
cp .env.example .env.local      # a working .env.local is already included
npm run seed                    # optional: sample inquiries for the dashboard
npm run dev                     # → http://localhost:3000
```
Admin (local): `admin@lumiere-events.com` / `admin123` (dev only — override in production).

### Scripts
| Command | Description |
|---|---|
| `npm run dev` | Dev server (Turbopack — fast) |
| `npm run build` | Production build (webpack/Next default) |
| `npm run start` | Serve the production build |
| `npm run seed` | Seed sample inquiries (JSON fallback store) |
| `npm run optimize:images` | Re-compress images in `public/images` (sharp) |
| `npm run lint` | ESLint |

---

## 6. Environment variables
Set these in `.env.local` (local) and in your host's dashboard (production).

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | Public origin (SEO canonical, sitemap, OG) — set to the real domain in prod |
| `MONGODB_URI` | prod | MongoDB connection string (Atlas in prod) |
| `ADMIN_EMAIL` | yes | Admin login email |
| `ADMIN_PASSWORD` | yes | Admin login password (strong & unique in prod) |
| `JWT_SECRET` | **prod (enforced)** | Signs the admin session; app **fails closed** in production if unset |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | email | SMTP server (e.g. `smtp.gmail.com` / `587` / `false`) |
| `SMTP_USER` / `SMTP_PASS` | email | SMTP username + password / app-password |
| `NOTIFICATION_EMAIL` | optional | Where new-inquiry alerts go (defaults to `ADMIN_EMAIL`) |
| `EMAIL_FROM` | optional | "From" address on outgoing mail |

**Generate a strong `JWT_SECRET`:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
No third-party API keys are required by the app.

---

## 7. Email setup (production)

Email is sent via SMTP (Nodemailer). When SMTP is unset, inquiries are still saved and the
email step is skipped with a console notice. Two routes:

### A) Easiest — Gmail App Password
1. Enable 2-Step Verification on the Google account.
2. Go to https://myaccount.google.com/apppasswords → create an app password ("Mail").
3. Set env vars:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-address@gmail.com
   SMTP_PASS=<16-char app password>
   EMAIL_FROM="Lumière Events <your-address@gmail.com>"
   NOTIFICATION_EMAIL=where-you-want-alerts@example.com
   ```
> Good for low volume. Gmail has daily send limits and may rewrite the From address.

### B) Recommended for production — a transactional provider (Brevo / Resend / SendGrid)
More reliable deliverability and higher limits. Example (Brevo free tier):
```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<brevo-smtp-login>
SMTP_PASS=<brevo-smtp-key>
EMAIL_FROM="Lumière Events <hello@yourdomain.com>"
```
(Resend: `smtp.resend.com` / `465` / `secure=true`, user `resend`, pass = API key.)
For best deliverability, verify your sending domain (SPF/DKIM) with the provider.

---

## 8. MongoDB setup (production)
1. Create a free cluster at https://www.mongodb.com/atlas.
2. Add a database user and allow network access (Vercel: allow `0.0.0.0/0` or Atlas's Vercel integration).
3. Copy the connection string and set:
   ```
   MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/event-planner
   ```
> The local `.data/inquiries.json` fallback is **dev-only** — serverless filesystems are
> ephemeral, so production must use MongoDB.

---

## 9. Build & production readiness
- `npm run build` runs the standard Next build and **succeeds on Node 18.18+/20/22/24**.
  (An earlier failure was an ESM/CommonJS module-format issue, now fixed via `"type": "module"`
  — it was **not** a Node-version bug. No Turbopack-build workaround is needed.)
- `.nvmrc` pins Node 22 for consistent environments; `engines.node` declares the minimum.
- Admin session: cookie is `httpOnly` + `sameSite=lax`, and `secure` automatically in production.
  `JWT_SECRET` is **required in production** (app throws if missing → never runs with a default secret).
- `robots.txt` disallows `/admin` and `/api`; `/admin` pages are `noindex`.

---

## 10. Deploy to Vercel
1. Push the repo to GitHub/GitLab and **Import** it in Vercel (framework auto-detected as Next.js).
2. **Environment Variables** (Project → Settings → Environment Variables) — add all from §6:
   `NEXT_PUBLIC_SITE_URL` (your domain), `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
   `JWT_SECRET`, and the `SMTP_*` / email vars.
3. **Node version**: Settings → Node.js Version → 20 or 22 (matches `.nvmrc`).
4. Deploy. Build command `next build` and output are auto-detected — no extra config.
5. After first deploy: set your custom domain, then update `NEXT_PUBLIC_SITE_URL` to it and redeploy.
6. Verify: submit a test inquiry → check it appears in `/admin` and that the notification email arrives.

---

## 11. Replacing images
The site ships with optimized **placeholder** photography. To use real photos, drop files into
`public/images/` using the same filenames (see `public/images/README.md`) — they appear
automatically (no code change). Keep them web-sized (≤ ~1600px, < 400 KB); run
`npm run optimize:images` to re-compress.

---

## 12. Remaining placeholders / content to replace before launch
All of the following are **content/config**, not code work:

- **Admin credentials & secret** — set strong `ADMIN_PASSWORD` and a fresh `JWT_SECRET` in production (do not reuse `.env.local` values).
- **Contact details** (`data/site.js`) — phone `+1 (212) 555-0192`, email `hello@lumiere-events.com`, address `121 Madison Avenue…` are placeholders.
- **WhatsApp number** (`data/site.js` → `whatsappHref`, `wa.me/12125550192`) — placeholder.
- **Press / "As featured in"** (`data/site.js` → `press`: Vogue, Tatler, …) — illustrative trust signals; replace with real placements or remove to avoid misleading claims.
- **Stats** (`data/stats.js`: 15+ years, 500+ events, 98%) and the hero "Rated 5.0 by 500+ clients" — marketing placeholders.
- **Testimonials** (`data/testimonials.js`) and **team** (`data/about.js`) — fictional sample content.
- **Images** — AI-generated placeholders; replace with the client's real photography.
- **Brand name/copy** ("Lumière") — update throughout `data/*` if rebranding.
- **No Open Graph share image** — only a favicon exists; add one for richer social link previews (optional).

---

## 13. Production-readiness verdict
**Codebase: production-ready.** Build passes, all routes render, the inquiry → email → admin
pipeline works, auth fails closed without a secret, SEO/responsive/animations complete.

**Before going live, complete configuration + content (no development needed):**
1. ☐ Set production env vars on Vercel (strong `ADMIN_PASSWORD`, fresh `JWT_SECRET`, `MONGODB_URI`, SMTP, real `NEXT_PUBLIC_SITE_URL`).
2. ☐ Connect MongoDB Atlas and a transactional email provider.
3. ☐ Replace placeholder contact details, WhatsApp number, press names, stats, testimonials, and imagery.
4. ☐ Pin Node 20/22 on Vercel and deploy; run an end-to-end test inquiry.

Once these are done, the site is ready to launch.
