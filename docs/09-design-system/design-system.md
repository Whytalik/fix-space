# FIX Space Design System

## Aesthetic Direction: Void Terminal

FIX Space is a **professional trading workspace** — a precision instrument, not a consumer app. The aesthetic is **Void Terminal**: deep-space darks, surgical typography, a single decisive accent. Think the inside of a Bloomberg terminal rewritten by Linear. Every detail earns its place. Nothing decorates.

**The one thing users remember:** depth without darkness, clarity without starkness — a UI that feels like it was built by someone who takes trading seriously.

---

## Color System

### Elevation Model

The UI uses a three-level elevation stack. Never skip levels; never invent new ones.

```
Canvas   #0f0f11  — page background, the void
Surface  #18181d  — cards, sidebars, panels
Elevated #222228  — dropdowns, modals, tooltips, hover states
```

Use `bg-canvas` for the outermost shell. Use `bg-surface` for any contained region (card, sidebar row, table header). Use `bg-elevated` for anything that floats above surface level.

`bg-hover` (`#1a1a21`) is used only on interactive elements — it sits between canvas and surface, creating a barely-perceptible lift on hover.

### Accent

```
Accent       #2563eb  — primary actions, focus rings, active states
Accent Hover #1d4ed8  — pressed/hover state of accent
Accent Muted rgba(37,99,235,0.15)   — subtle backgrounds behind accent elements
```

**One accent, used sparingly.** The accent should appear on:

- Primary CTA buttons
- Active navigation items
- Focus outlines on inputs
- Key status indicators (primary dot, active badge)

Never use the accent for text body, labels, or decorative borders. The moment it appears, it commands attention — so use it only where action lives.

### Ink (Text)

```
Ink           #e8e8f0  — primary content: headings, values, important labels
Ink Secondary #9494a8  — supporting text: property names, metadata, placeholders
Ink Muted     #808098  — decorative icons, divider labels, tertiary hints
```

**Never use pure white.** `#e8e8f0` reads as white in context but avoids harsh contrast against deep backgrounds.

Text hierarchy is enforced through **color, not size alone**. A property name and its value can be the same size — distinguish them through `text-ink-secondary` vs `text-ink`.

**Contrast rule for `text-ink-muted`:**

- On canvas (5.0:1) and surface (4.6:1): acceptable for text ✓
- On elevated (4.1:1): acceptable for UI components, borderline for text — prefer `text-ink-secondary` for text inside modals and dropdowns

### Stroke (Borders)

```
Stroke        #2a2a35  — standard dividers, card edges, input borders
Stroke Subtle #1e1e28  — barely-visible separators, row dividers inside surfaces
```

Strokes should almost disappear. If you can see a border clearly, it's probably too strong. Use `border-stroke` for element boundaries, `divide-stroke-subtle` for internal row separators.

### Semantic Colors

Semantic colors differ between dark and light themes — each mode has its own set tuned for contrast.

**Dark theme** (default):

```
Success  #57f287  / bg rgba(87,242,135,0.12)   — profitable trades, positive states
Warning  #fee75c  / bg rgba(254,231,92,0.12)    — drawdown alerts, caution states
Error    #ed4245  / bg rgba(237,66,69,0.12)     — losses, validation failures, danger actions
```

**Light theme** (adjusted for 4.5:1 contrast — completely different hues):

```
Success  #15803d  / bg rgba(21,128,61,0.12)    — dark green (bright green fails on white)
Warning  #92400e  / bg rgba(146,64,14,0.10)    — dark amber (yellow fails on white)
Error    #b91c1c  / bg rgba(185,28,28,0.12)    — dark red
```

Always pair the color with its background variant for badges and alert boxes — never a solid fill. The `0.12` opacity backgrounds are intentional: enough to signal meaning, not enough to disrupt the palette.

**WCAG 1.4.1 — color alone cannot convey meaning.** Every error/success/warning state must include at least one of: icon, text label, border change, or underline — in addition to the color.

---

## Typography

### Fonts

**Display & UI:** `Geist Sans` — clean, technical, slightly condensed. Perfect for a professional tool. Used for all UI text, labels, headings, navigation.

**Monospace:** `Geist Mono` — numbers, IDs, code, timestamps. Any value that benefits from fixed-width alignment.

Both are already loaded in `RootLayout` via the `geist` package. Reference them with `font-sans` (Geist Sans) and `font-mono` (Geist Mono).

### Type Scale

Use semantic class names — never raw Tailwind size utilities for text roles.

```css
.type-page-title    text-2xl font-bold text-ink          /* Page headings, record titles */
.type-panel-title   text-lg font-bold text-ink           /* Section headings, modal headers */
.type-modal-title   text-base font-bold text-ink         /* In-modal headings */
.type-field-label   text-xs font-semibold uppercase tracking-wide text-ink-secondary  /* Property labels */
.type-form-label    text-sm font-semibold text-ink-secondary  /* Form field labels */
.type-hint          text-xs text-ink-muted               /* Helper text, sublabels */
.type-nav-label     text-[11px] font-semibold uppercase tracking-wider text-ink-muted /* Nav section headers */
```

**Record/entry titles** (the big heading on a record page) use `text-4xl font-bold text-ink` — this is intentionally above `.type-page-title`. Reserve this size for the primary subject of a page.

**Body text** defaults to `text-sm text-ink` inside components. `text-base` is used sparingly — only for flowing prose content, never for labels or metadata.

**Numbers and amounts** should always use `font-mono` with `tabular-nums`. A P&L figure rendered in a proportional font is a mistake.

### Rules

- No font-weight below `font-medium` for interactive elements
- Labels are `uppercase tracking-wide` at small sizes to compensate for reduced readability
- Long prose: `leading-relaxed` (1.625). Short UI text: default leading
- Never italicize UI labels — italic is reserved for genuine emphasis in content

### Numeric & Financial Data

Trading values must be immediately scannable — never render them in a proportional font.

- All P&L, prices, percentages, quantities: `font-mono tabular-nums`
- Positive value: `text-success` with explicit `+` prefix — `+2 340.00`
- Negative value: `text-error` with `−` prefix — `−1 120.50`
- Zero / neutral: `text-ink-secondary`
- Thousands separator: space (` `) — more readable than comma in dense tables
- Never animate a changing number — let the value update speak for itself

---

## Spacing

FIX Space uses Tailwind's default spacing scale. Key conventions:

| Context                   | Spacing                                                             |
| ------------------------- | ------------------------------------------------------------------- |
| Page padding (horizontal) | `px-6` (narrow) / `px-8` (comfortable) / `px-12` (full-width pages) |
| Page padding (top)        | `pt-8` to `pt-12`                                                   |
| Card internal padding     | `p-4` to `p-6`                                                      |
| Modal padding             | `px-6 py-4` (header/footer) · `px-6 py-5` (body)                    |
| Form field gaps           | `gap-4` between fields                                              |
| Icon-to-label gaps        | `gap-1.5` to `gap-2`                                                |
| Property row height       | `py-3` (row padding)                                                |

**Density principle:** FIX Space is information-dense. Prefer tighter spacing (`py-2`, `gap-3`) over generous spacing inside data-rich components like tables and property lists. Reserve generous breathing room for landing zones: page tops, empty states, auth pages.

---

## Component Patterns

### Buttons

Four variants — use each for its intended role only.

| Variant     | Use                           | Style                                                |
| ----------- | ----------------------------- | ---------------------------------------------------- |
| `primary`   | Main CTA, submit, create      | `bg-accent text-white`                               |
| `secondary` | Cancel, secondary action      | `bg-surface border border-stroke text-ink-secondary` |
| `ghost`     | Toolbar icons, inline actions | Transparent, `hover:bg-surface`                      |
| `danger`    | Destructive actions           | `bg-error text-white`                                |

Two sizes:

- `md` — standard buttons, all primary actions
- `sm` — compact buttons inside tables, toolbars, inline contexts
- `icon` — square icon-only buttons (`p-1.5`)

**Never invent ad-hoc button styles** by overriding with arbitrary classes. If none of the four variants fit, reconsider the interaction design.

### Inputs

All text inputs use `.field-input`:

```css
w-full rounded-lg border border-stroke bg-canvas px-3 py-2 text-sm text-ink
outline-none focus:border-accent transition-colors duration-150
placeholder:text-ink-muted
```

Focus state: `border-accent` only — no box-shadow, no glow. Clean and precise.

**Select elements** also use `.field-input` with `cursor-pointer`.

### Cards

`bg-surface border border-stroke rounded-2xl` is the standard card shell. Elevated floating elements (dropdowns, modals) use `bg-elevated` instead.

Inner section dividers use `border-t border-stroke` — never a separate div spacer.

### Badges / Tags

Use the `<Badge>` component with semantic colors:

- Status values: colored badge with `{ color }` prop (extracts from STATUS config)
- Neutral tags: `variant="neutral"` → `bg-elevated text-ink-secondary`
- Accent highlight: `variant="accent"` → `bg-accent/10 text-accent`

Badge text is always `text-xs font-medium`. Padding: `px-2 py-0.5`.

### Modals

Structure:

```
┌─ fixed inset-0 backdrop-blur-[3px] bg-canvas/50 z-50 ──────────────┐
│  ┌─ w-120 max-h-[80vh] rounded-2xl border-stroke bg-elevated ─────┐ │
│  │  Header: px-6 py-4 border-b                                    │ │
│  │  Body:   px-6 py-5 overflow-y-auto scrollbar                   │ │
│  │  Footer: px-6 py-4 border-t                                    │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

Modal width: `w-120` (480px) for standard forms. Wide modals (settings, complex configs): `max-w-2xl`.

Always render via `createPortal(document.body)` and close on Escape via `useEscape()`.

### Tables

Table shells: `rounded-lg border border-stroke overflow-hidden`.

Header row: `bg-surface border-b border-stroke`.

Data rows: `border-b border-stroke last:border-b-0`. Alternate rows use `bg-surface/30` for every odd row — subtle enough to guide the eye without creating a striped candy effect.

Cell padding: `px-3 py-2.5`.

Column headers: `.type-field-label` (uppercase, secondary color).

---

## Iconography

Use **Lucide React** exclusively. Size conventions:

| Context                         | Size    |
| ------------------------------- | ------- |
| Property type icons in tables   | `13`    |
| Navigation / sidebar icons      | `16`    |
| Button icons (alongside text)   | `14–16` |
| Icon-only buttons               | `16–18` |
| Large empty state illustrations | `32–48` |

Icon color follows text color: `text-ink-muted` for decorative, `text-ink-secondary` for structural, `text-ink` only when the icon is the primary element.

**Never use colored icons** — this is a precision tool, not an infographic. Colors are reserved for semantic states (success/warning/error) and the accent.

---

## Motion & Animation

FIX Space moves with purpose, not decoration.

### Available animations

**`animate-fade-up`** — the only general-purpose entrance animation.

```css
opacity: 0 → 1  +  translateY(10px → 0)  |  duration: 0.45s  |  ease: ease
```

Use on: page content sections, modal content, newly-inserted list items.

**`animate-spin`** — loading spinners only.
Use: `w-5 h-5 rounded-full border-2 border-stroke border-t-accent animate-spin`

**`transition-colors duration-150`** — all interactive state changes (hover, focus).

**`transition-all duration-150`** — button state changes (only).

### Rules

- **No transform animations** on layout-critical elements (sidebars, headers)
- **No bounce, spring, or elastic easing** — this is a trading tool, not a toy
- Page load: one `animate-fade-up` on the main content block, not per-element
- Staggered reveals: use `animation-delay` in increments of `50ms–75ms` for lists
- Duration ceiling: `300ms` for transitions, `500ms` for full entrance animations
- Never animate color changes on data (P&L, values) — let the number change speak

---

## Elevation & Layering

```
z-index hierarchy:
  z-[100]  — confirm dialogs, critical interruptions
  z-50     — modals, sheet overlays
  z-40     — dropdown menus, tooltips, popovers
  z-30     — sticky table headers
  z-10     — sticky sidebar
  z-0      — base content
```

Header uses `z-50 sticky top-0` with `backdrop-blur-md bg-canvas/85` — it floats above content but reads as part of the shell, not floating.

---

## Layout Principles

### The Grid

No sidebar — FIX Space uses a **top-nav + full-width content** model. The header is the only fixed chrome; everything below is the workspace.

Content regions:

- **Constrained prose** (auth pages, settings): `max-w-sm` centered
- **Document pages** (record detail): `px-12` full-width, or `max-w-4xl` for reading comfort
- **Data tables**: always full-width, no max-width cap
- **Forms in cards**: `max-w-sm` to `max-w-md`

### Visual Hierarchy per Page

Each page should have exactly **one primary visual element** — the one thing the user's eye lands on first:

- Database page → the table
- Record page → the record title
- Auth page → the form card
- Settings → the active section content

Everything else recedes. Navigation, labels, secondary actions — all `text-ink-secondary` or `text-ink-muted`.

### Empty States

Empty states must feel intentional, not broken. Structure:

```
centered flex-col gap-3
  icon: 32px, text-ink-muted
  heading: text-sm font-medium text-ink-secondary
  optional action: Button variant="secondary" size="sm"
```

Never put empty state text in the primary `text-ink` color — it should feel like a quiet invitation, not an error.

---

## Anti-Patterns

These are explicitly banned in FIX Space:

- **`text-accent` for body/label text** — accent contrast is 3.7:1 (dark) / 4.6:1 (light), which passes only as a UI component (3:1 threshold). Never use it for body text, hints, or metadata — only for links, active nav items, and focus indicators
- **Gradient backgrounds** — no `bg-gradient-to-*` on structural elements
- **Colored icon fills** — icons are monochrome
- **Multiple accent colors** — `#2563eb` is the only brand color; create no others
- **Box shadows on dark surfaces** — shadows only work on light themes; use borders and elevation instead
- **Inline `style=` for spacing** — use Tailwind; only `style=` for dynamic user-chosen colors
- **`text-white`** — use `text-ink` or `text-white` only on colored (accent/error) backgrounds
- **Arbitrary border-radius** — use `rounded-lg` (8px) for inputs/rows, `rounded-2xl` (16px) for cards/modals, `rounded-full` for avatars/chips only
- **Hover states without transitions** — all `hover:` must be paired with `transition-colors duration-150`
- **Large bodies of uppercase text** — uppercase is only for `.type-field-label` and `.type-nav-label` (small sizes with tracking)

---

## Accessibility

Minimum requirements — not a full a11y spec, just the rules that matter for FIX Space.

### Focus visibility

All interactive elements must show a visible focus ring on keyboard navigation. Use:

```
focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-canvas
```

The `.field-input` pattern satisfies this via `focus:border-accent`. Buttons and icon-only elements need the explicit `focus-visible:` ring.

Never suppress `outline: none` globally without a replacement — this breaks keyboard navigation.

### Reduced motion

Wrap entrance animations in a media query. Add to `utilities.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-fade-up {
    animation: none;
  }
}
```

Short transitions (`duration-150`) are below the perceptual threshold and need no special handling.

### Contrast

| Text token           | Background  | Ratio  | WCAG            |
| -------------------- | ----------- | ------ | --------------- |
| `text-ink`           | `bg-canvas` | ~14:1  | AAA ✓           |
| `text-ink-secondary` | `bg-canvas` | ~4.6:1 | AA ✓            |
| `text-ink-muted`     | `bg-canvas` | ~2.8:1 | Decorative only |

`text-ink-muted` fails AA — use it only for icons, hints, and disabled states.

---

## Checklist for New Components

Before shipping any new component, verify:

- [ ] Uses only defined color tokens — no hardcoded hex values
- [ ] Text uses semantic type classes or established Tailwind sizes
- [ ] Interactive states: `hover:`, `focus:`, `disabled:` all handled
- [ ] Loading states render a spinner, not empty space or a frozen button
- [ ] Error states use `text-error` with a clear message — not a silent failure
- [ ] Empty states have a message (and optionally a CTA)
- [ ] All transitions use `duration-150` (not 200, not 300 for simple hovers)
- [ ] Numbers use `font-mono tabular-nums` if they represent amounts or counts
- [ ] Component works at narrow viewport (min 320px)
