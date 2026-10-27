# 🪵 Ceylon Wood Creations (සිලෝන් ලී කැටයම් කලාව)

A production-grade, secure fullstack web application for **Ceylon Wood Creations**, built using modern web standards.

---

## 🚀 Built With
- **Framework:** [Next.js 15 (App Router)](https://nextjs.org) with TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com) with custom warm wood palettes & Google Fonts (Playfair Display + Noto Sans Sinhala)
- **Database:** [SQLite](https://sqlite.org) via [Prisma ORM](https://www.prisma.io)
- **Authentication:** Server-side bcryptjs password hashing (12 rounds) & signed JWT in HttpOnly secure cookies
- **Security & Validation:** [Zod](https://zod.dev) schema validation, rate-limiting, CSP & security headers, XSS prevention
- **Icons:** [Lucide React](https://lucide.dev)

---

## 🛡️ Security & Safety Enhancements Implemented
1. **Server-Side Authentication**: Replaced the client-side toggle with an authenticated Admin portal.
2. **HttpOnly Cookies & JWT**: Passwords are never stored in plain text (hashed with 12 salt rounds via bcrypt). Sessions are stored in signed `httpOnly`, `sameSite: lax` cookies preventing token theft via XSS.
3. **Route Protection Middleware**: The `/admin/dashboard` route and API mutation routes are guarded by Next.js Middleware.
4. **Input Validation**: All API endpoints (`/api/auth/login`, `/api/products`, `/api/inquiries`) strictly validate incoming request payloads via Zod schemas.
5. **Rate Limiting**: In-memory rate limiting applied to the login endpoint (5 attempts/min) and custom inquiries endpoint (5 submissions/5 min) to prevent brute-force attacks and spam.
6. **XSS Protection**: Zero `innerHTML` injections. React automatically escapes all dynamic content.
7. **Security Headers**: HSTS, X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, Referrer-Policy, and Permissions-Policy configured in `next.config.mjs`.
8. **Persistent SQLite Database**: Products and customer custom orders are permanently stored in a relational database (`dev.db`).

---

## 🏃 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher - currently running v24.18.0)
- npm

### 2. Environment Variables
Check `.env` file (copied from `.env.example`):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-32-character-secret-key"
ADMIN_DEFAULT_USER="admin"
ADMIN_DEFAULT_PASSWORD="WoodArtAdmin2026!#"
NEXT_PUBLIC_WHATSAPP_NUMBER="94700000000"
```

### 3. Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Admin Access
- Navigate to: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Default Username:** `admin`
- **Default Password:** `WoodArtAdmin2026!#`
*(Make sure to change the password in `.env` and update it for production)*

---

## 📁 Project Structure
```
src/
├── app/
│   ├── layout.tsx                # Root layout with fonts, metadata, language provider
│   ├── globals.css               # Tailwind CSS & custom wood palette styles
│   ├── page.tsx                  # Customer-facing main landing page (SSR / ISR)
│   ├── admin/
│   │   ├── login/page.tsx        # Secure Admin Login page
│   │   ├── dashboard/page.tsx    # Admin Dashboard (Products & Inquiries)
│   │   └── page.tsx              # Admin redirect logic
│   └── api/
│       ├── auth/                 # Login, Logout, Session check endpoints
│       ├── products/             # Public GET & Admin POST / DELETE
│       └── inquiries/            # Customer inquiry submission & Admin view
├── components/
│   ├── Navbar.tsx                # Sticky navigation, language switcher, mobile drawer
│   ├── Hero.tsx                  # Hero section with CTA buttons
│   ├── ProductCatalog.tsx        # Search, category filtering, responsive product grid
│   ├── ProductCard.tsx           # Product card with price, wood badge, WhatsApp order
│   ├── LightboxModal.tsx         # Zoom view for inspection of wood carving craftsmanship
│   ├── CustomOrderSection.tsx    # Customer custom design inquiry form
│   └── Footer.tsx                # Sri Lankan craftsmanship heritage footer
├── context/
│   └── LanguageContext.tsx       # Sinhala / English bilingual context
├── lib/
│   ├── prisma.ts                 # Prisma Client singleton
│   ├── auth.ts                   # JWT token generation & verification (jose)
│   ├── validations.ts            # Zod validation schemas
│   ├── rate-limit.ts             # Brute-force protection rate limiter
│   └── translations.ts           # Sinhala & English translations dictionary
└── middleware.ts                 # Next.js security middleware protecting admin routes
```
