# Lead Finder Design System

This is the visual contract for every product route. Light mode is primary. `app/globals.css` exposes the CSS variables and `lib/theme.ts` maps the same semantic values into Ant Design; equivalent values must never drift.

## Color

| Role | Light | Dark |
|---|---:|---:|
| Page | `#F6F7F9` | `#0D1117` |
| Surface / elevated | `#FFFFFF` | `#151B23` / `#1B2430` |
| Border | `#DDE2E8` | `#303A46` |
| Primary / secondary / muted text | `#17202B` / `#4B5968` / `#758293` | `#F3F6F9` / `#B7C0CB` / `#8491A1` |
| Brand / hover / active | `#2563EB` / `#1D4ED8` / `#1E40AF` | `#60A5FA` / `#7CB7FC` / `#3B82F6` |
| Success / warning / error / info | `#16803C` / `#B45309` / `#C9362B` / `#0369A1` | `#4ADE80` / `#FBBF24` / `#F87171` / `#38BDF8` |
| Focus | `#2563EB` | `#93C5FD` |

Color reinforces labels and icons; it never carries status alone. Component code consumes semantic variables rather than color literals.

## Typography

Inter is the interface face and JetBrains Mono is reserved for comparable technical values. Scale: 12px captions, 13px dense metadata, 14px body and controls, 16px section titles, 20px page titles, 24px dashboard display values. Body line-height is 1.5; headings use 1.25. Weights are 400, 500, 600, and 700. Comparable numerals use tabular figures.

## Spacing

A 4px base creates the only spacing steps: `4, 8, 12, 16, 20, 24, 32, 40, 48`. Use 8px within a compact control, 12–16px within components, 20–24px between sections, and 24–32px at page edges. Page → section → component → content follows that rhythm; optical exceptions require an explanatory comment.

## Shape and elevation

Radii are 4px for compact elements, 6px for controls, and 8px for surfaces and overlays. Pills alone may use a full radius. Resting surfaces use no shadow or `0 1px 2px rgba(16,24,40,.05)`; menus use a medium shadow; modals and drawers use the elevated shadow. Borders define most hierarchy.

## Controls and forms

Default controls are 38px high; compact table actions are 30px. Primary brand buttons are used once per action region. Secondary buttons are neutral and bordered; tertiary actions are text buttons; destructive actions use the error semantic and confirmation. Form rows use 16px gaps, label-to-control spacing is 8px, and validation copy is 4px below its control. Every control has a visible `:focus-visible` ring.

## Tables and mobile lists

Desktop CRM rows are 56px high with a 40px header, subtle separators, a restrained hover, tabular values, and a stable actions column. Column priority is Business, Location, Category, Website, Email, Phone, Status, Actions. Row actions are keyboard reachable. At 767px and below, the table is replaced by an intentional business list: identity and selection first, then location/category, qualification signals, and a predictable detail action. Horizontal table overflow is not the mobile experience.

## Filters and export

Search is a debounced text input. City and Category are select/search controls. Qualification uses checkboxes only: Has website, No website, Has email, Has phone. Website choices are mutually exclusive; contact choices combine independently. All filters are server-side and combine with AND semantics. Active filters are summarized and can be reset. Export qualification uses the same language and backend contract.

## Layout

The application shell uses a 236px desktop sidebar, 72px collapsed rail, and 64px header. The sidebar becomes an overlay drawer below 992px. Content width is fluid with 24–32px gutters. Dashboard order is header/action, KPI strip, operational panels, then recent activity. Navigation is a single clear list with product identity at the top and system/theme controls at the bottom.

## Overlays and states

Modal padding is 24px with 20px section gaps. Drawers use 24px padding and section separators; at 520px they occupy the viewport width. Loading uses geometry-matched skeletons, empty states explain the next action, read errors are inline with retry, and mutation results use concise global feedback. Reduced-motion preferences disable non-essential transitions.

## Verification

Before release, verify every route at 1440×900, 991×900, and 375×812; test light and dark themes; confirm no horizontal overflow; run typecheck, lint, build, real-backend integration, and the full Playwright suite. Boolean filter combinations must be proven against the backend.
