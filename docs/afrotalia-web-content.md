# Afrotalia — corporate site content

Content source of truth for `apps/web` (afrotalia.com). Everything marked `TODO:` must be supplied by Afrotalia before launch — do not invent, estimate, or generate substitutes.

Voice: warm, credible, plain, East African. Short sentences. No marketing inflation, no invented numbers, no emoji.

---

## Implementation status

Transcribed into `packages/db/src/schema/web.ts` (`cms_page`, `service`, `project`, `team_member`) and seeded by `packages/db/src/seed.ts`. Every `TODO:` below is seeded as `null` / not seeded at all, and renders as the "Supplied by Afrotalia" empty state in `apps/web`. To change this content: edit the seed data (or, once it exists, the admin CMS) — never hard-code copy into a route.

Two known deviations, both intentional:

- **/shop categories**: this file's "Seeded set: Electronics, Craft, Furniture, Machinery" was never applied to Shop's actual `category` table — Shop already had real categories and products seeded in an earlier pass (`Electronics`, `Appliances`, `Furniture`, `Tools & Equipment`), and renaming them risked destabilizing already-verified Shop functionality for a cosmetic taxonomy change. `/shop`'s Categories section does a genuine live pull (count + link), it just reflects Shop's real taxonomy rather than this file's example names.
- **`settings`**: there's no separate `settings` table — the fee/window values described under /mnada's "How it works" are read from the pre-existing `mnada_setting` table (`packages/db/src/schema/mnada.ts`), which already served this exact purpose for the Mnada app itself.

---

## Prompt for Claude Code

Implement `apps/web` from this file.

Parse it into the `cmsPages`, `services`, `projects` and `settings` tables with the seed script — do not hard-code copy into components. Every `TODO:` value seeds as `null` and must render as a visible, clearly-marked empty state ("Supplied by Afrotalia") rather than placeholder prose, a zero, or a lorem string. A missing value never breaks the layout.

Route map, in order: `/`, `/about`, `/services`, `/projects`, `/mnada`, `/shop`, `/contact`, `/privacy`, `/terms`.

Treat the headings below as the section order per route. `##` is a route, `###` is a section. Where a section lists fields, those are the record's columns. Legal routes get structure and outline only — generate no legal wording.

---

## / — Home

### Hero

Eyebrow: Dar es Salaam · Tanzania
Headline: Your reliable partner in Tanzania.
Subhead: Your gateway to East Africa — import, distribution and trade, backed by people on the ground.
Primary action: Discover Afrotalia → `/about`
Secondary action: Talk to us → `/contact`
Image: full-bleed 21:9, operations / port / warehouse. `TODO: photograph`

### About, in brief

Label: About
Lead: A Tanzanian trading company connecting regional buyers with international supply — and international partners with a market they can actually reach.
Body: We operate across import, wholesale, distribution, retail and B2B services. The same company that sources and clears a shipment also runs the storefront it sells through, so accountability never changes hands.
Link: Read the company profile → `/about`

### What we do

Five services, pulled from the `services` table. Preview copy only; full copy lives on `/services`.
Link: All services → `/services`

### Featured projects

First three records from `projects` where `featured = true`.
Link: All projects → `/projects`

### Mnada band

Dark ground (#09090B), amber accent. Mnada lockup.
Headline: Live auctions. Real-time bidding.
Body: Register, activate your account, fund your wallet and bid against the room. Every lot is condition-graded before it opens.
Primary action: Enter Mnada → `https://mnada.afrotalia.com`
Secondary action: How it works → `/mnada`

### Shop band

Light ground, green accent. Shop lockup.
Headline: Discover products from Afrotalia.
Body: Condition-graded goods, escrow release on delivery, regional dispatch. Buy outright — no auction required.
Primary action: Visit Shop → `https://shop.afrotalia.com`
Secondary action: What's in store → `/shop`
Image: 4:3. `TODO: photograph`

### Why Afrotalia

Four reasons, flush left, rule above each.

1. **One accountable party** — The company that sources a shipment also runs the storefront it sells through. Nobody hands you to someone else.
2. **Condition stated first** — Every item is graded NEW, USED, WORKING or NOT WORKING before it is listed, on either platform.
3. **Local presence** — People in Dar es Salaam who can walk into a warehouse, not a call centre in another timezone.
4. **Escrow and records** — Funds release on delivery confirmation, and every transaction leaves a document trail.

### Closing CTA

Green field (#0E7A5F), white type.
Headline: Let's move something across a border.
Body: Sourcing, clearing, warehousing or distribution — tell us what you need landed and we'll tell you what it takes.
Action: Contact the team → `/contact`

---

## /about — About

### Header

Eyebrow: About
Headline: Afrotalia International Ltd
Lead: A Tanzanian trading company working across import, wholesale, distribution, retail and B2B services — and the operator of two consumer platforms, Shop and Mnada.
Image: 21:9, team or premises. `TODO: photograph`

### Mission

To be a reliable partner in Tanzania and a dependable gateway to East Africa for businesses and buyers on both sides of the trade.

### Vision

A regional trade network where provenance, condition and price are transparent before money moves.

### Values

Accountability end to end · honest condition grading · fair dealing with sellers and buyers alike.

### Company story

`TODO: 2–3 paragraphs — founding, what changed, where the company is now.`

### Registration & compliance

- Registered name: `TODO:`
- Company registration number: `TODO:`
- TIN: `TODO:`
- VAT registration: `TODO:`
- Licences held: `TODO:`

### Leadership

Repeating record: name, role, short bio, portrait.
`TODO: all entries. Render nothing until supplied — no silhouettes, no invented titles.`

---

## /services — What We Do

Headline: Trade, handled end to end.

Each service is a `services` record: `num`, `name`, `preview`, `body`.

### 01 · Import

Preview: Sourcing and inbound freight into Tanzania.
Body: Supplier identification, purchase coordination, inbound freight and customs clearance into Tanzanian ports. One point of contact from order to gate.

### 02 · Wholesale

Preview: Volume supply to regional traders.
Body: Bulk supply to traders and retailers across the region, with condition grading agreed before dispatch and documentation that survives an audit.

### 03 · Distribution

Preview: Onward movement across East Africa.
Body: Warehousing and onward movement to buyers in Tanzania and neighbouring markets, including consolidated loads for smaller orders.

### 04 · Retail

Preview: Direct sale through Shop and Mnada.
Body: Direct-to-buyer sale through two platforms we operate ourselves: fixed-price commerce on Shop, and scheduled live auctions on Mnada.

### 05 · B2B services

Preview: Procurement and turn-key projects.
Body: Procurement on behalf of business clients, logistics coordination, training and turn-key project delivery where a job needs owning rather than quoting.

---

## /projects — Projects

Headline: Work we've landed.
Lead: Case studies are managed from the admin CMS. Each entry carries a client, a scope and an outcome — written by the team, not generated.

Each project is a `projects` record: `kind`, `name`, `summary`, `client`, `scope`, `outcome`, `image`, `featured`.

The four below are scaffolding — correct in kind and shape, deliberately free of figures. Client names and outcomes are `TODO:` in every case.

### Regional consolidation run

Kind: Distribution
Summary: Consolidated inbound loads for a group of Dar es Salaam traders, cutting per-unit freight on small orders.
Client: `TODO:` · Outcome: `TODO:` · Image: `TODO:`

### Equipment fit-out

Kind: Turn-key
Summary: Specification, sourcing, clearance and installation delivered as a single scope of work.
Client: `TODO:` · Outcome: `TODO:` · Image: `TODO:`

### Mnada launch

Kind: Retail platform
Summary: Building and operating a live auction platform with wallet, escrow and condition grading in-house.
Client: Afrotalia International Ltd (internal) · Outcome: `TODO:` · Image: `TODO:`

### B2B supply programme

Kind: Procurement
Summary: Recurring procurement for a business client against an agreed catalogue and lead time.
Client: `TODO:` · Outcome: `TODO:` · Image: `TODO:`

---

## /mnada — Mnada (marketing page)

Lockup: Afrotalia Mnada, amber on light.
Headline: Discover. Bid. Win.
Lead: Participate in live auctions with Afrotalia. Lots open on a schedule, close on server time, and go to the highest valid bid.
Primary action: View live auctions → `https://mnada.afrotalia.com`
Secondary action: Explore Shop → `/shop`

### How it works

1. **Register** — Phone and OTP, or a Google account.
2. **Activate** — A one-time registration fee unlocks bidding.
3. **Fund** — Top up the wallet that backs your bids.
4. **Bid** — Live, against the room, on server time.
5. **Win** — Pay within the stated window and arrange delivery.

Fee amount and payment window read from `settings` at render time. Never printed as a literal in this file or in code.

### Featured lots

Live pull of up to three `auctions` records flagged featured, each linking to the platform. Falls back to the how-it-works block if none are flagged.
Footnote: Featured lots are selected in the admin CMS and link through to the live platform.

---

## /shop — Shop (marketing page)

Lockup: Afrotalia Shop, green.
Headline: Browse and purchase from Afrotalia.
Lead: Fixed prices, graded condition, escrow release on delivery. No bidding, no waiting.
Action: Visit Shop → `https://shop.afrotalia.com`

### Categories

Live pull from `categories` with a count and a representative image. Seeded set: Electronics, Craft, Furniture, Machinery. Each links to the Shop app's filtered catalogue.

---

## /contact — Contact

Eyebrow: Contact
Headline: Talk to the desk.

### Details

- Head office: Dar es Salaam, Tanzania
- Street address: `TODO:`
- Phone / WhatsApp: `TODO:`
- Email: `TODO:`
- Hours: `TODO:`
- Map: `TODO: coordinates or embed`

### Enquiry form

Fields: name (required), email (required, validated), phone (optional), message (required, 20–2000 chars).
Submit label: Send enquiry · Success: Sent — we'll be in touch
Zod-validated, rate-limited, persisted to `enquiries`, notification to the ops address.
Footnote: Rate-limited and validated server-side. We reply within one business day.

---

## /privacy — Privacy Policy

Structure only. `TODO: full text, supplied by Afrotalia.`

01 What we collect · 02 How it is used · 03 Sharing and processors · 04 Retention and your rights · 05 Contact for data requests

---

## /terms — Terms & Conditions

Structure only. `TODO: full text, supplied by Afrotalia.`

01 Scope and acceptance · 02 Accounts and eligibility · 03 Platform-specific terms (Shop, Mnada) · 04 Payments, fees and refunds · 05 Liability and dispute resolution

---

## Global

### Footer

Wordmark + INTERNATIONAL LTD + "Your reliable partner in Tanzania & your gateway to East Africa."
Company: Home, About, What We Do, Projects, Contact
Platforms: shop.afrotalia.com, mnada.afrotalia.com
Legal: Privacy Policy, Terms & Conditions
Copyright: © Afrotalia International Ltd. Dar es Salaam, Tanzania.

### Metadata

- Site name: Afrotalia International Ltd
- Default title: Afrotalia International Ltd — Your gateway to East Africa
- Default description: A Tanzanian trading company working across import, wholesale, distribution, retail and B2B services.
- OG image: `TODO:`
- Locale: en-TZ · Currency display: TZS

### Content rules

1. No invented facts. Numbers, dates, names, addresses and client references come from Afrotalia or stay empty.
2. No superlatives ("leading", "premier", "world-class") and no unverifiable claims.
3. Condition vocabulary is fixed: NEW, USED, WORKING, NOT WORKING.
4. Money is always TZS with thousands separators and no decimals.
5. British spelling. "Dar es Salaam" in full on first use per page.
