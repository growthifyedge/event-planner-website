# Lumière — Luxury Event Planner Website

A modern, premium full-stack event planning website built with **Next.js (App Router)**,
**Tailwind CSS**, **Framer Motion**, and **MongoDB**. It includes a complete marketing
site, an event booking/inquiry system with email notifications, and a protected admin
dashboard for managing inquiries.

---

## ✨ Features

- **Luxury, fully responsive UI/UX** — refined typography (Playfair Display + Inter),
  gold-on-ink palette, generous whitespace, mobile-first layouts.
- **Smooth animations** — scroll reveals, hover transitions, an animated portfolio
  lightbox, and reduced-motion support, all via Framer Motion + CSS.
- **Pages** — Home, About, Services, Portfolio/Gallery, Packages, Testimonials, Contact,
  and a dedicated Booking page.
- **Event types** — Weddings, Corporate Events, Birthdays, Private Parties.
- **Booking inquiry form** — Name, Email, Phone, Event Type, Event Date, Guest Count,
  Budget, Message — with client + server validation (Zod) and spam honeypot.
- **MongoDB** — inquiries persisted via Mongoose (with a graceful local JSON fallback for
  development when no database is configured).
- **Email notifications** — the studio is notified and the client receives a branded
  confirmation on every submission (Nodemailer / SMTP).
- **Admin dashboard** — secure login, inquiry list with stats, status filters, inline
  status updates, detail view, and delete. Protected by middleware + signed session cookie.
- **SEO** — per-page metadata, Open Graph/Twitter tags, JSON-LD structured data,
  `sitemap.xml`, and `robots.txt`.

---

## 🧱 Tech stack

| Area        | Choice                                  |
| ----------- | --------------------------------------- |
| Framework   | Next.js 15 (App Router, JavaScript)     |
| Styling     | Tailwind CSS v3                         |
| Animation   | Framer Motion                           |
| Database    | MongoDB + Mongoose                      |
| Validation  | Zod + React Hook Form                   |
| Email       | Nodemailer (SMTP)                       |
| Auth        | HMAC-signed session cookie (Web Crypto) |
| Icons       | lucide-react                            |

---

## 🚀 Getting started

### 1. Prerequisites
- **Node.js 18.18+** (built with Node 24)
- **MongoDB** (optional for local dev — see below)

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Copy the example env file and adjust values:
```bash
cp .env.example .env.local
```
A working `.env.local` is already included for local development. Key variables:

| Variable                 | Purpose                                                   |
| ------------------------ | --------------------------------------------------------- |
| `MONGODB_URI`            | MongoDB connection string                                 |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin dashboard credentials                       |
| `JWT_SECRET`             | Secret used to sign the admin session                     |
| `SMTP_*` / `EMAIL_FROM`  | SMTP settings for email notifications (optional)          |
| `NEXT_PUBLIC_SITE_URL`   | Public origin for SEO/canonical/sitemap                   |

### 4. (Optional) Seed sample inquiries
Populate the dashboard with realistic demo data:
```bash
npm run seed
```

### 5. Run the dev server
```bash
npm run dev
```
Open **http://localhost:3000**.

- Public site: `/`
- Admin dashboard: **`/admin`** → redirects to **`/admin/login`**
  - Default login: `admin@lumiere-events.com` / `admin123` (change in `.env.local`)

---

## 🗄️ MongoDB

Set `MONGODB_URI` to a local instance (`mongodb://127.0.0.1:27017/event-planner`) or a
MongoDB Atlas cluster. **If MongoDB is unreachable, the app automatically falls back to a
local JSON store** at `.data/inquiries.json` so the booking + admin flow keeps working
during development. Once a real database is connected, all inquiries persist there.

## 📧 Email notifications

When `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are set, every inquiry triggers:
1. an internal notification to `NOTIFICATION_EMAIL` (or `ADMIN_EMAIL`), and
2. a branded confirmation email to the client.

If SMTP is not configured, submissions are still saved and the email step is skipped with
a console notice (ideal for local development). For Gmail, use an
[App Password](https://myaccount.google.com/apppasswords).

## 🖼️ Images

The site ships with tasteful gradient placeholders. To add real photography, drop files
into `public/images/` using the filenames documented in
[`public/images/README.md`](public/images/README.md) — they appear automatically.

---

## 📁 Project structure

```
src/
├── app/
│   ├── (marketing)/        # Public site (Navbar + Footer) — home, about, services, …
│   ├── admin/              # Admin login + dashboard (no marketing chrome)
│   ├── api/                # Route handlers: inquiries + admin auth
│   ├── layout.js           # Root layout (fonts, base SEO metadata)
│   ├── sitemap.js · robots.js · icon.svg · not-found.js
│   └── globals.css
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── ui/                 # Primitives (Section, Reveal, Photo, Button styles, …)
│   ├── sections/           # Reusable page sections (grids, CTA, FAQ, gallery)
│   ├── home/               # Home hero
│   ├── forms/              # BookingForm, ContactForm
│   └── admin/              # LoginForm, InquiryDashboard
├── data/                   # Content (site config, services, packages, testimonials…)
├── lib/                    # db, email, auth, validation, utils, inquiries-store
├── models/                 # Mongoose Inquiry model
└── middleware.js           # Protects /admin routes
```

## 📜 Scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `npm run dev`    | Start the development server         |
| `npm run build`  | Production build                     |
| `npm run start`  | Start the production server          |
| `npm run seed`   | Seed sample inquiries (dev fallback) |
| `npm run lint`   | Run ESLint                           |

---

Built with care. Replace the brand name, copy, contact details, and images in
`src/data/*` to make it your own.
