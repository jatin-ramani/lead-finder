# Lead Finder — Design System

The visual contract for every screen in this application.

This document **describes what exists**. It was written by reading
`app/globals.css` and `lib/theme.ts`, not by designing something new. Where the
current code is inconsistent, that is recorded honestly as a *tolerance* rather
than silently tidied — changing pixels is a design decision, and this document
is not the place to make one.

**How to use it.** Before adding a component, find the closest thing here and
match it. If nothing matches, you are either about to introduce an
inconsistency or to discover a genuine gap — decide which, out loud, before
writing CSS.

**Two sources of truth, one system.** Layout and bespoke components read the
`--lf-*` custom properties in `globals.css`. Ant Design components read the
token config in `lib/theme.ts`. The two are aligned by hand; changing a colour
in one without the other is the most common way this system drifts.

---

## 1. Colour

Every colour is a token. **No component may contain a hex literal** — the app
has two themes, and a literal only works in one of them.

### Surfaces

| Token | Dark | Light | Use |
|---|---|---|---|
| `--lf-page` | `#0A0A0B` | `#F7F7F5` | Application background |
| `--lf-card` | `#141416` | `#FFFFFF` | Panels, table container |
| `--lf-elevated` | `#1C1C21` | `#FFFFFF` | Modals, dropdowns, popovers |
| `--lf-raised` | `#1A1A1E` | `#FAFAF8` | Nested blocks inside a card; row hover |
| `--lf-track` | `#232329` | `#ECEBE6` | Progress rails, inline `code` |

The **sidebar is `#0E0E10` in both themes** and does not follow the toggle.
That is deliberate: it anchors the layout, and a light sidebar changes the
product's identity. Do not "fix" it.

### Text

| Token | Dark | Light | Use |
|---|---|---|---|
| `--lf-text` | `#F4F4F5` | `#0B0B0B` | Headings, primary values |
| `--lf-text-secondary` | `#A1A1AA` | `#52514E` | Body copy, labels |
| `--lf-text-muted` | `#71717A` | `#898781` | Placeholders, "—", table headers |

Three levels, no more. A fourth invented for one screen is how hierarchy dies.

### Borders

| Token | Dark | Light | Use |
|---|---|---|---|
| `--lf-border` | `#26262C` | `#E3E3DE` | Card edges, inputs, dividers |
| `--lf-border-subtle` | `#1E1E23` | `#EDEDE8` | Table row rules, list separators |

### Accent

| Token | Dark | Light |
|---|---|---|
| `--lf-accent` | `#E5B93C` | `#A97F14` |
| `--lf-accent-hover` | `#F0C95E` | `#8F6B0F` |
| `--lf-accent-soft` | 12% alpha | 10% alpha |
| `--lf-accent-ring` | 22% alpha | 20% alpha |

The accent **darkens in light mode** rather than staying identical — `#E5B93C`
on white fails contrast. Gold is the brand and the focus ring; it is not a
"success" colour.

### Semantic

| Token | Dark | Light | Meaning |
|---|---|---|---|
| `--lf-up` | `#4ADE80` | `#067647` | Healthy, connected, succeeded |
| `--lf-down` | `#F87171` | `#B42318` | Failed, disconnected, destructive |

Ant Design's own semantics live in `lib/theme.ts`: success `#22C55E`,
error `#EF4444`, warning `#F59E0B`.

### Charts — do not touch without re-validating

`CHART_COLORS` in `lib/theme.ts` was validated against the dark card surface
for lightness band, chroma floor, all-pairs colour-vision-deficiency separation
(ΔE 27.3 deutan), normal-vision floor (27.7) and 3:1 contrast.

| | | |
|---|---|---|
| `series1` | `#B48C23` | The emphasis hue — leads worth contacting |
| `series2` | `#9078E8` | Secondary series |
| `neutral` | `#6B6B76` | De-emphasis — context, not a lead |

**Chart marks do not use `--lf-accent`.** Brightening `series1` to match the UI
gold pushes it out of the validated band. If a new series is needed, run the
palette validator; do not eyeball it.

### Status conveyance

Colour is never the only signal. Every status carries an icon or a label
alongside it — `lf-status-pill` pairs a dot with text, table tags pair a colour
with an icon and a word.

---

## 2. Spacing

A **2px base**, used in practice as a small set of steps. Measured frequency in
the existing CSS, most common first:

| Step | Frequency | Typical use |
|---|---|---|
| `2px` | 9 | Hairline gaps in dense lists |
| `4px` | 3 | Icon-to-label |
| `6px` | 6 | Inside pills and chips |
| `8px` | 9 | Related controls in a row |
| `10px` | **16** | The default gap — button groups, action rows |
| `12px` | 9 | Filter-bar controls, card head gaps |
| `14px` | 6 | Inline error padding |
| `16px` | 4 | Mobile page gutter |
| `18px` | 7 | **Panel padding, grid gap** |
| `20px` | 1 | Card body horizontal padding |
| `24px` | 2 | Block error padding, mobile page bottom |
| `28px` | — | Desktop page gutter |
| `32px` | — | Desktop page bottom |

**Rule:** prefer `10px` inside a component, `18px` between components, `28px`
at the page edge. Reach for anything else only with a reason.

### Known tolerance

`7px`, `9px`, `11px` and `13px` each appear a handful of times, mostly in
optical adjustments where a control's own border makes the even value look
wrong. These are not new steps. Do not add more.

### Layout

| | |
|---|---|
| Page content | `padding: 4px 28px 32px`; `4px 16px 24px` under 640px |
| Panel grid | `.lf-grid-2` — `minmax(0, 1.35fr) minmax(0, 1fr)`, gap `18px`, collapses to one column at 1100px |
| Header height | `76px` |
| Sidebar | `236px`, collapsed `72px` |
| Card padding | head `18px 20px 0`, body `18px 20px 20px` |

---

## 3. Typography

`--font-sans` is **Inter**; `--font-mono` is **JetBrains Mono**. Both are loaded
via `next/font` with `display: swap`.

### Scale

Ant Design's base is `14px`. The interface is deliberately denser than that —
this is an operator's console, not a marketing page.

| Size | Weight | Use |
|---|---|---|
| `46px` | 700 | The 404 numeral only |
| `20–21px` | 650 | Page and boundary titles |
| `17px` | 650 | Section headings |
| `15–16px` | 600–650 | Card titles, drawer titles |
| `14px` | 550–650 | Primary values, buttons, table cells |
| `13.5px` | 450–550 | Body copy, descriptions |
| **`13px`** | 450–650 | **The workhorse** — table cells, detail values |
| **`12.5px`** | 450–550 | **Labels, secondary rows, captions** |
| `12px` | 450–600 | Pills, chips, meta text |
| `11.5px` | 500–600 | Table headers (uppercase, tracked) |
| `10–11px` | 600 | Badges, superscript counts |

`13px` and `12.5px` together account for a quarter of all declarations. When in
doubt, one of those two is the answer.

### Weight

`450` (muted) · `550` (default) · `600` (emphasis) · `650` (headings).
`500`, `560`, `620`, `640` and `660` exist in small numbers and are legacy —
round to the four above in new work.

### Line height

`1.5` for controls · `1.6–1.65` for body copy · `1.7` for lists.
Headings inherit the browser default with `letter-spacing: -0.01em`.

### Numerals

Anything a user compares down a column — counts, progress, durations — uses
`font-variant-numeric: tabular-nums` so digits do not jitter.

---

## 4. Radius

| Value | Use |
|---|---|
| `5–6px` | Inline `code`, tiny chips |
| `8px` | AntD small controls (`borderRadiusSM`) |
| `9–10px` | **Buttons, inputs, selects** (AntD `borderRadius: 10`) |
| `11–12px` | Nested blocks, inner panels |
| **`14px`** | **Cards, panels, modals** (AntD `borderRadiusLG: 14`) |
| `999px` | Pills, badges, status dots, avatars |

The rule is concentric: outer container `14px`, inner control `10px`, inner-most
detail `6px`. A `14px` control inside a `14px` card looks wrong because the
curves are parallel rather than nested.

---

## 5. Shadows

Two, and they are tokens.

| Token | Dark | Light |
|---|---|---|
| `--lf-shadow` | `0 1px 2px rgba(0,0,0,.5)` | `0 1px 2px rgba(16,24,40,.05), 0 1px 3px rgba(16,24,40,.06)` |
| `--lf-shadow-lg` | `0 12px 32px rgba(0,0,0,.5)` | `0 12px 28px rgba(16,24,40,.1)` |

`--lf-shadow` for anything resting on the page. `--lf-shadow-lg` for anything
floating above it — modal, drawer, dropdown.

**Dark mode leans on borders, not shadows**, because a shadow on a near-black
surface is nearly invisible. Elevation there comes from `--lf-card` →
`--lf-raised` → `--lf-elevated`. Do not compensate with a heavier shadow.

---

## 6. Buttons

Ant Design `Button`, height `38px` (`controlHeight`), radius `10px`.

### Hierarchy — one primary per view

| Level | Prop | Use |
|---|---|---|
| **Primary** | `type="primary"` | The single most likely action. Gold. |
| **Default** | *(none)* | Everything else. Bordered, neutral. |
| **Text** | `type="text"` | Icon buttons in headers, table rows, cards |
| **Link** | `type="link"` | Inline in prose |
| **Danger** | `danger` | Destructive — always with a confirmation |

Two primaries in one region means neither is primary. The Reset/Start Scan pair
in the filter bar is the pattern: default beside primary.

### Sizes

`middle` (38px) is the default. `small` (24px) inside table rows and card
headers. `large` is unused — do not introduce it.

### Icon buttons

`type="text" shape="circle"` in the header; `type="text" size="small"` in table
rows. **Every icon-only button requires `aria-label`.** A tooltip is not an
accessible name.

### Loading

`loading` **and** `disabled` together while a request is in flight, so the
control cannot be double-fired. Label changes to the present participle —
"Scanning…", "Checking…" — never a bare spinner with no words.

---

## 7. Tables

Ant Design `Table`, wrapped in `.lf-table-card`.

| | |
|---|---|
| Row padding | `cellPaddingBlock: 15` |
| Header | transparent background, `#71717A`, `11.5px`, uppercase, tracked, no split lines |
| Row divider | `--lf-border-subtle` |
| Row hover | `--lf-raised` |
| Size | `middle` |
| Min width | `scroll={{ x: … }}` sized so no column collapses |
| Sticky header | `sticky={{ offsetHeader: 0 }}` |

### Rules

- **Server-driven.** Sorting, filtering and pagination are query parameters,
  not client-side array operations. A sorter that only reorders the current
  page is a lie.
- **First column is sticky and identifying** — avatar plus name plus a
  secondary line.
- **Actions are last, `fixed: "right"`, `align: "center"`** — one visible icon
  plus an overflow menu.
- **Empty cells render `—`** in `--lf-text-muted`, never an empty cell.
- **Row click opens detail.** Interactive children call
  `event.stopPropagation()`.
- **Rows must be keyboard-reachable.** A clickable row needs `tabIndex`, a key
  handler and a role — a bare `onClick` on `<tr>` is inaccessible.
- **Loading:** skeleton rows matching the real column widths on first load; a
  translucent overlay on refetch, so the table does not collapse and the page
  does not jump.
- **Empty:** `EmptyState`, and the copy must distinguish *nothing exists yet*
  ("Run a scan") from *nothing matches these filters* ("Clear filters").

---

## 8. Modals and drawers

### Modal

| | |
|---|---|
| Width | `440px` for a form; never wider than needed |
| Under 520px | Full width |
| Background | `--lf-elevated` |
| Radius | `14px` |
| Close | `destroyOnHidden` so form state never leaks between openings |
| While submitting | `okButtonProps={{ loading, disabled }}`, cancel disabled, backdrop dismissal blocked |

### Drawer

| | |
|---|---|
| Placement | `right`, width `460px` |
| Under 520px | `width: 100%`, `max-width: 100vw` |
| Background | `--lf-card` |
| Structure | header with title and one primary action, then `<section>`s with `lf-drawer-section-title` |

### Confirmation

**Every destructive action requires one.** `Popconfirm` for a single row,
`Modal.confirm` for a bulk action. The confirm button is `danger`, and its
label names the action and the count — "Delete 12 businesses", never "OK".

---

## 9. Notifications and messages

Configured once in `providers/ThemeProvider.tsx`:
`notification` bottom-right, 3s; `message` capped at 3 concurrent.

| Feedback | Channel | Duration |
|---|---|---|
| Quick confirmation ("Copied") | `message.success` | 3s |
| Write succeeded | `message.success` | 3s |
| Write failed | `notification.error` | **6s** |
| Background job finished | `notification.info/success` | 6s |
| Read failed | **Neither** — inline `ErrorState` | persistent |

### Rules

- **A failed read is never a toast.** It renders where the content would have
  been, with a retry. A toast for a failed read leaves an empty region with no
  explanation once it fades.
- **A failed write is always a toast**, because the user pressed a button and
  may have navigated away. This is handled globally in `QueryProvider`; do not
  re-implement it per mutation.
- **Errors carry the request id.** `message` then a blank line then
  `Reference: <requestId>`. Never hidden behind a "details" toggle.
- Errors get 6s, twice the default — long enough to read an id.
- Success messages are ≤ 5 words.

---

## 10. Loading

Four kinds, chosen by what is actually happening.

| Situation | Pattern |
|---|---|
| **First load, no data yet** | Skeleton shaped like the final content |
| **Refetch, data present** | Keep the content, overlay or subtle progress. **Never unmount** |
| **Route transition** | `app/loading.tsx` → `PageSkeleton` |
| **Mutation in flight** | `loading` + `disabled` on the control that triggered it |

**A centred spinner is never correct** for content that has a known shape. It
tells the user nothing about what is coming and guarantees a layout jump.

Loading regions carry `aria-busy="true"` and a visually hidden label.

---

## 11. Skeletons

Ant Design `Skeleton`, always `active` (the shimmer signals *loading* rather
than *empty*).

### Rules

- **Match the real geometry.** A skeleton that is the wrong height is a layout
  jump with extra steps. Table skeletons reuse the real column definitions with
  the renderer swapped.
- **Vary the widths.** `["85%", "70%", "78%", "55%"]` reads as text; four equal
  bars read as a loading bar.
- **Cap the rows** at roughly one screen — 8 for a table, 3–5 for a panel.
- **No skeleton for a refetch.** Data already on screen must not be replaced by
  a placeholder.
- **Never a skeleton for an empty result.** That is `EmptyState`.

---

## 12. Motion

| Duration | Use |
|---|---|
| `140ms` | Hover, colour and border transitions (most common) |
| `150ms` | Focus ring, skip link |
| `160–180ms` | Card border and shadow, elevation |
| `200ms` | Sidebar collapse, drawer slide |
| `240ms` | Page fade-in (`lf-fade-in`) |
| `400–450ms` | Chart bar and donut draw-in — once, on data arrival |

Easing is `ease` throughout. Nothing exceeds `450ms`.

**Animate `opacity` and `transform` only.** Animating `width`, `height` or
`top` causes layout thrash.

`prefers-reduced-motion: reduce` collapses every animation and transition to
`0.001ms` globally — already implemented. New animations inherit this for free
**unless** they use inline styles, which bypass it. Do not use inline
transitions.

---

## 13. Accessibility

Non-negotiable. Each of these is enforced somewhere in the current code.

### Focus

`:focus-visible` gives a `2px` `--lf-accent` outline at `2px` offset, radius
`6px`, applied to native elements *and* Ant Design's controls. Ant Design's own
focus shadow is suppressed so there is exactly one ring.

**Never `outline: none`.** `:focus-visible` already prevents rings on mouse
clicks, which is the only legitimate reason anyone removes them.

### Keyboard

- Every interactive element is reachable and operable by keyboard.
- The skip link is the first tab stop; `#main-content` has `tabIndex={-1}` so
  focus genuinely moves rather than merely scrolling.
- Modals and drawers trap focus and restore it to the trigger on close (Ant
  Design does this — do not fight it with custom focus code).
- `Escape` closes any overlay.
- Custom interactive elements (a clickable row, a card acting as a button) need
  `role`, `tabIndex` **and** a key handler. Prefer a real `<button>`.

### Semantics

- **One `<h1>` per page**, rendered by the `Header` from the nav definition.
  Panels use `<h2>`, sections `<h3>`. Never skip a level for visual size.
- Landmarks: `<nav aria-label="Main">`, `<main id="main-content">`.
- Lists are `<ul>`/`<li>`. Key-value pairs are `<dl>`/`<dt>`/`<dd>`.
- Decorative icons and illustrations get `aria-hidden`.

### Announcements

| Change | Pattern |
|---|---|
| Status changing on its own (polling) | `aria-live="polite"` |
| An error replacing content | `role="alert"` + `aria-live="assertive"` |
| Loading region | `aria-busy="true"` + hidden label |
| Toggle state | `aria-pressed` / `aria-expanded` |

### Naming

Every icon-only control has `aria-label`, and it names the target, not the icon
— "View Asopalav", not "Eye". A `title` or a tooltip is not an accessible name.

### Contrast

Body text ≥ 4.5:1, large text and UI boundaries ≥ 3:1, in **both** themes.
The accent's light-mode variant exists solely for this. Chart colours were
validated to 3:1 against their surface plus CVD separation.

---

## 14. Responsive

| Breakpoint | What changes |
|---|---|
| `1500px` | Wide-screen grid relaxations |
| `1199–1100px` | Two-column panel grids collapse to one |
| `991px` | Sidebar becomes a drawer; content offset drops to 0 |
| `900px` | Filter controls begin stacking |
| `767px` | Table restyles for narrow screens |
| `640px` | Page gutter `28px` → `16px` |
| `560px` | Detail rows stack label above value |
| `520px` | Drawers and modals go full width |
| `480px` | Tightest layout |

Design for `991px` and `520px` first — the drawer transition and the full-width
overlay are where layouts actually break.

**No fixed pixel width may exceed the smallest breakpoint it lives in.** A
`460px` drawer needs its `100vw` override at `520px`, or it overflows.

---

## 15. Checklist

Before a feature is finished:

- [ ] Loading state, shaped like the content, `aria-busy`
- [ ] Empty state distinguishing *nothing yet* from *nothing matching*
- [ ] Error state inline for reads, toast for writes, request id shown
- [ ] Success feedback for every write
- [ ] Destructive actions confirmed, naming the action and count
- [ ] Keyboard reachable and operable end to end
- [ ] Visible focus on everything focusable
- [ ] One `<h1>`; headings in order
- [ ] `aria-label` on every icon-only control
- [ ] Verified at 1440px, 991px, 767px and 375px
- [ ] Verified in both themes
- [ ] No hex literals; no hardcoded spacing outside the scale
- [ ] No placeholder UI, dummy data or dead controls
