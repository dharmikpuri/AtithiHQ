# AtithiHQ — web app

The public home page, the owner app and the guest form for **AtithiHQ**, a guest book that fills itself.
Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS v4.

> **UI phase.** There is no backend yet. All data comes from a mock (`src/lib/mock`) that behaves like a
> real API. It is saved in this browser's localStorage: every tab shares it and a refresh keeps it. Other
> browsers and devices can't see it until there is a real backend. Use **Log out → reset the demo** or
> **delete this test account** to start fresh.

## Run it

```bash
npm install
npx next dev -p 3100        # http://localhost:3100
```

Open http://localhost:3100 for the public home page. Sign in with **93521 69357** to see a
property with sample bookings, or with any other number to start from an empty account.
Any 6-digit code works; `000000` shows the wrong-code state. To test again from scratch, use
**Log out → Log out and reset the demo** (demo number) or **Log out and delete this test account** (any other
number), so you don't need to clear cookies.

Set `NEXT_PUBLIC_SITE_URL` (default `https://atithihq.com`) to the deployed address. It is
used for canonical URLs, the sitemap, structured data and the guest links sent on WhatsApp.

| Script                | What it does                                 |
| --------------------- | -------------------------------------------- |
| `npm run dev`         | Dev server (Turbopack)                       |
| `npm run build`       | Production build                             |
| `npm run typecheck`   | TypeScript, no emit                          |
| `npm run lint`        | ESLint                                       |
| `npm run format`      | Prettier (also sorts Tailwind classes)       |
| `npm run screenshots` | Visual QA at phone / tablet / desktop sizes  |
| `npm run a11y`        | WCAG 2.1 AA audit (axe) of the main screens  |
| `npm run brand`       | Regenerate the favicon and home-screen icons |

## How the code is organised

```
src/
  app/                 Routes only. Each page is a thin wrapper around a feature screen.
    page.tsx           / — the public home page
    (auth)/            /login, /setup
    (owner)/           Signed-in owner screens, wrapped in the app shell
    (guest)/g/[token]  The public guest form (no login, the link is the credential)
    robots.ts  sitemap.ts  manifest.ts  llms.txt/  opengraph-image.tsx   search and sharing
  features/            One folder per product area: screens, feature components, data hooks
    home/ auth/ onboarding/ bookings/ guests/ payments/ settings/ guest-form/ guest-details/
  components/
    ui/                Design-system primitives (Button, Card/surfaceStyles, Field, Sheet, Badge…)
    layout/            App shell, navigation, page headers, sticky footer
    brand/             Logo (`mark.ts` is the single source of its shape), homestay scene, WhatsApp glyph
    seo/               JSON-LD script tag
  config/              site.ts (name, URL, locale) · routes.ts (every URL) · theme.ts (brand colours outside CSS)
  domain/              Types and pure business rules. No React, no I/O.
  lib/
    api/               The API contract (`contract.ts`), query keys, the `api` instance
    mock/              Mock backend: localStorage-backed store, seed data, mock API
    seo/               Page metadata helpers and structured data (schema.org)
    dates.ts money.ts phone.ts validation.ts …
  content/en/          Every user-facing string
```

### Layers, from the bottom up

1. **`domain/`** holds the entities (`types.ts`), what screens read (`read-models.ts`)
   and business rules such as balance, guest-details status, stay phase and list grouping.
   These are pure functions, so a backend can reuse them.
2. **`lib/api/contract.ts`** is the boundary between UI and backend. Screens never talk to the
   mock directly. They call `api.*` through TanStack Query hooks in `features/*/queries.ts`.
3. **`features/*`** renders screens with components from `components/ui`.
   Text comes from `useCopy()`, never hard-coded.

### Connecting the real backend

1. Implement `AtithiApi` (from `src/lib/api/contract.ts`) with HTTP calls.
2. Export it from `src/lib/api/index.ts` in place of `mockApi`, and set `demo.enabled = false`.
3. Replace the mock session cookie with the backend's httpOnly session cookie.
   `src/proxy.ts` already guards owner routes by that cookie name.

No screen or hook should need to change.

## Conventions

- **Copy:** all text lives in `src/content/en/<area>.ts` and is read with `useCopy()`
  (or `getCopy()` outside React). Interpolated strings are functions. To add Hindi,
  add `src/content/hi/` with the same shape.
- **Design tokens:** colours, text styles, shadows and motion are defined in `src/app/globals.css`
  (`brand-*` navy, `accent-*` terracotta, `ink-*` text, `line`, `canvas`, `surface`,
  plus semantic `success`/`warning`/`danger`). Neutrals are cool and clean. Terracotta marks
  money due and warmth, and is never used for large backgrounds. Colours needed outside CSS
  (manifest, icons, social image) live in `src/config/theme.ts`.
- **Typography:** use the named type scale: `text-caption`, `text-footnote`, `text-subhead`,
  `text-callout`, `text-body`, `text-lead`, `text-headline`, `text-title-3/2/1`,
  `text-large-title` and `text-display*`. Each style carries its line height; titles also carry
  weight and letter-spacing. Tailwind's default sizes are switched off, and ESLint rejects
  pixel font sizes and raw hex colours in class names.
- **Surfaces:** anything card-like uses `surfaceStyles()` from `components/ui/card.tsx` (or `<Card>`),
  so every card changes together.
- **Buttons:** `<Button variant size>` from `components/ui/button.tsx`. Variants: primary, accent,
  secondary, soft, ghost, danger, danger-soft, link, and inverse (for navy surfaces).
- **Links:** build URLs with `routes` from `src/config/routes.ts`, never by hand. To change one
  query parameter and keep the rest (tab, search, sort, filters), use `withParams` from `lib/url.ts`.
- **Guests list:** one row per booking (`features/guests/guest-groups.ts`). The row is named after
  the primary guest, the first person on the guest-details form. Everyone else whose details have
  arrived sits under "View all members (X)". X counts only those members, never the primary guest.
  The "Guests" column is the booking's party size, and repeat stays show "Returning · 2nd visit".
  Searching for a member opens their row and highlights them.
- **Guest details status:** the person who booked fills in everyone on one form, and every guest's
  name is required (phone and ID are optional). So the status follows the form:
  `Link not sent → Waiting for form → All details in` (`detailsState` in `domain/booking-rules.ts`).
  "N guests missing" appears only in the rare case where the form came back and the booking then
  gained guests.
- **Filters:** describe a screen's filters once as `FilterField[]` (see `features/*/…-filters.ts`).
  `useUrlFilters` keeps them in the URL, and `FilterButton` / `FilterChips` from
  `components/ui/filters.tsx` give the bottom sheet (phones), popover (tablet and up) and
  removable chips.
- **Export:** `ExportButton` opens a confirmation box. The owner chooses what to include (what's on
  screen, this month, last month or custom check-in dates) and the file type (Excel .xlsx by
  default, or CSV), sees how many rows will be exported, then downloads. Each screen's builder
  (`features/*/export.ts`) turns those rows into tables via `defineTable`. Import `@/lib/export` and the builder lazily, inside
  the click handler, so the spreadsheet library never lands in the initial bundle. Phone numbers
  are exported in full. **Identity-document data (numbers, last digits, type, photos, status) is
  never exported.**
- **Phone numbers** are masked in lists (`+91 98••• •••10`). Use `PhoneReveal` to let the owner
  reveal, call and copy a number; it hides itself again after 30 seconds. Never build a reveal
  for identity documents.
- **Registration:** "Get started" → `/register` (the sign-in screen in `register` mode: same mobile and code
  steps) → `/setup` (registration form: owner profile, property basics, consent) → dashboard. The rules and the
  `registrationStatus(session)` used by every guard live in `domain/registration.ts`; the form schema only adds
  messages. The OTP is mocked in `lib/mock/mock-api.ts` (any 6 digits, `000000` fails) and the UI says so while
  `demo.enabled`. Terms and Privacy pages are draft placeholders (`content/en/legal.ts`); replace them and bump
  `TERMS_VERSION` before launch.
- **Owner vs property profile:** two separate concepts (`domain/profiles.ts`). The owner profile holds who runs
  the place and how to reach them (name, verified sign-in number, alternate number, email). The property profile holds
  the place itself: kind, name, locality, city/state/PIN, check-in/out. Never put owner contact details on the property
  or the property address on the owner. Screens read `ownerProfileOf` / `propertyProfileOf`.
- **Property types:** `domain/property-types.ts` (homestay, villa, guest house / B&B, cottage / farm stay, hostel).
  Each has an illustration in `components/brand/property-illustration.tsx`, shown on the sidebar card, in Settings, in
  registration and on the guest link. Pick with `PropertyTypePicker` (`features/property/`). To add a type, append its id;
  TypeScript then asks for its copy and illustration.
- **Booking mode and room inventory:** `domain/inventory.ts`. A property is rented as `entire`, `rooms` or
  `both`; room-based modes store `roomCount`, a **quantity** (`entire` stores `null`). Rooms are never named,
  numbered or assigned to guests: don't add room lists, IDs or room-name chips anywhere. Configure with
  `BookingModeFields` + `InventorySummary` (`features/property/`), in registration and Settings → Booking mode.
- **GST details:** `domain/gst.ts`. Optional: a property is not GST registered (`gst: null`, the default) or has
  `{ gstin, rate }`. The GSTIN is only a format check (exactly 15 letters and digits, after trimming, removing spaces
  and upper-casing; no state-code or checksum check), and the rate must be 5, 12 or 18 with no default. Configure with
  `GstFields` (`features/property/`), in registration and Settings → GST. It feeds the upcoming tax invoices, which
  print the GSTIN.
- **Receipts and tax invoices:** `domain/invoice.ts` (pure rules; the header comment has them all) and
  `features/invoices/`. Not GST registered: a receipt. GST registered: a tax invoice (GSTIN, one "GST 12%" line,
  included or added on top, worked in integer paise) or a payment receipt without GST. Numbers are per property and
  Indian financial year (`SV/2026-27/0001`; tax invoices `SV/TI/2026-27/0001`) and are assigned by the API on issue.
  An issued document is a snapshot: if the booking changes, the owner issues an updated version (same number, "Revised
  · v2"). Cancelled bookings can't get new documents. The booking page's Receipt card creates and previews them
  (`DocumentModal`). **Sharing:** "Send on WhatsApp" (card and preview) makes a fresh public link each time
  (`invoices.share`), opens the lead guest's chat with a prefilled message, and the link expires after 48 hours
  (`RECEIPT_LINK_HOURS`, `isReceiptLinkExpired`); older links keep their own expiry. "Shared" only means WhatsApp was
  opened. The link opens `/r/[token]` (`(guest)` group, public, `noindex`, no AtithiHQ branding): the document, a
  notice if a newer version exists, or a friendly "expired" / "not valid" page (`receipts.view`). **PDF:** "Download
  PDF" (public page and issued preview) is generated in the browser by `features/invoices/pdf.ts`; `html-to-image`
  and `jspdf` load on demand. It captures an off-screen copy rendered at 794px (A4), so it looks the same on every
  device; `InvoiceDocument` therefore uses container queries (`@xl:`), not viewport ones. Demo tokens (the seeded
  tax invoice): `/r/rcpdemo7k2m` works (created 2 hours ago), `/r/rcpold9x3q` has expired; anything else is not valid.
- **Availability:** `domain/availability.ts` (pure, backend-ready). A booking stores `roomsBooked` (a quantity, or
  `null` for the whole property). `availabilityFor` returns total / booked (busiest night) / remaining rooms and whether
  a whole-property booking fits; `checkRoomRequest` says why a request doesn't. Check-out day is free for a new
  check-in; cancelled bookings release their rooms. The booking form, the mock API (create, edit, restore) and the
  Settings guard (`inventoryInUse`) all use it. Whole-property-only properties keep the old behaviour (overlap warning,
  no block). Guests see only the quantity ("Rooms booked: 3"), never which rooms.
- **Icons:** lucide line icons. Frame an icon with `IconTile` (`components/ui/icon-tile.tsx`, tones brand /
  accent / success / solid / glass) and spread `duotone` onto an icon for the soft filled look (active nav
  items, home page). Don't hand-roll icon chips.
- **Platform logos:** `public/logos/*.svg`, shown in the home page's sources marquee (`bands.tsx`).
  MakeMyTrip, Agoda and Goibibo are from Wikimedia Commons; the rest are generated from the `simple-icons`
  package in brand colour. They are third-party trademarks, used only to say where bookings come from.
- **Loading:** `BrandLoader` (`components/brand/brand-loader.tsx`) is the full-screen loader, used by
  `Splash` and `app/loading.tsx`: the roof draws, a guest drops in, four dots light up as the group's details
  arrive. Buttons keep the small `Spinner`.
- **Illustration stories:** wrap a home page illustration in `<StoryLoop>` and its moving parts in `<Replay>`
  (`features/home/components/story-loop.tsx`). Stagger with `animation-delay`; the story restarts each time it
  scrolls into view and stays still with reduced motion.
- **Logo motion:** `<LogoMark motion="drop" />` loops the guest dropping in (loading); `motion="hop"` hops it
  when a parent with `group/logo` is hovered.
- **Brand:** the logo mark is defined once in `components/brand/mark.ts`. After changing it, run
  `npm run brand` to regenerate the favicon and home-screen icons. The social image
  (`app/opengraph-image.tsx`) is built from the same mark and the home page copy.
  Design rationale: `../design/logo-concepts-v4.html` (option 2, "Gable").
- **SEO:** public pages use `publicPageMetadata()` from `lib/seo/metadata.ts`; owner areas and
  guest links are `noindex`. The home page publishes Organization, WebSite, WebApplication,
  HowTo and FAQPage structured data built from `content/en/home.ts`, and `/llms.txt` summarises
  the product for AI assistants. Edit the copy and all of these follow.
- **Motion:** home page only, and subtle: one-time entrance animations and CSS scroll reveals
  (`reveal`). Everything is switched off for people who prefer reduced motion.
- **Status colours mean one thing everywhere.** Use `features/bookings/status.ts` for
  how a booking's guest-details and payment states look.
- **Overlays:** use `Sheet` for any focused task. It renders as a bottom sheet on phones and a
  centred dialog from tablet up. Use `ConfirmDialog` before anything destructive and
  `ActionMenu` for overflow actions.
- **Forms:** react-hook-form + zod. Use shared validators from `lib/validation.ts` and
  wrap every control in `Field`, which wires up the label, hint, error and ARIA.
- **Responsive:** mobile first.
  - Phones (< 768px): bottom tab bar.
  - Tablets (768–1023px): navigation rail.
  - Desktop (≥ 1024px): sidebar.
  - Lists become grouped rows from `md`, and detail pages split into two columns at `lg`.
- **Touch targets** are at least 44px and body text is 16px. Never rely on colour alone:
  badges carry text and icons.
- **Money** is whole rupees, formatted with `formatINR` (Indian grouping).
  **Phones** are stored as E.164 strings (`+919352169357`).
  **Dates** are `YYYY-MM-DD` strings.
