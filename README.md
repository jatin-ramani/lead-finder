# Lead Finder — Frontend

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Ant Design 6 ·
Tailwind 4 · TanStack Query 5

The workspace UI for the [Lead Finder API](https://github.com/jatin-ramani/lead-find-api).

---

## Setup

```bash
npm install
cp .env.example .env.local     # point NEXT_PUBLIC_API_BASE_URL at your backend
npm run dev
```

The backend must be running. From the API repo:

```bash
uvicorn app:app --port 8000
# or: docker compose up
```

| Script | |
|---|---|
| `npm run dev` | Development server on :3000 |
| `npm run build` | Production build (type-checks as part of it) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run verify:api` | Check the live backend still matches `types/api.ts` |

---

## Configuration

Runtime and test-only variables are documented in [`.env.example`](.env.example):

```ini
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
PLAYWRIGHT_ADMIN_SECRET=
VERIFY_API_ADMIN_SECRET=
```

`NEXT_PUBLIC_` values are **inlined into the bundle at build time**, so they are
visible to anyone who loads the page and cannot be changed after the build. That
is fine for a base URL and unacceptable for a secret — there are none here, and
none should be added.

---

## Architecture

```
app/           routes, layouts, and the error/loading/not-found boundaries
services/      the API layer — the only place axios is imported
features/      one folder per product area: hooks + components that own it
components/    shared UI: the shell, primitives, and feedback states
hooks/         cross-cutting hooks with no feature knowledge
lib/           pure helpers — formatting, theme tokens, navigation
types/         the backend contract, mirrored
providers/     React context: query client, theme, Ant Design registry
```

### Server state lives in TanStack Query

There is no bespoke cache, no fetch-on-mount `useEffect`, and no context holding
a list of records. Every server read is a query; every write is a mutation.
Cache keys are built in [`services/query-keys.ts`](services/query-keys.ts) and
nowhere else, so invalidation can be exact instead of "refetch everything".

### One API client

Feature code imports from `@/services` and never reaches for axios. Each
endpoint is one typed function, so there is a single place to look when the
contract changes — and a single place it can be wrong.

### One error type

Every failure — HTTP, network, timeout, validation — reaches the UI as an
[`ApiError`](services/errors.ts) carrying `message`, a machine-readable `code`,
and the **`requestId`**.

That last field is the point. The backend stamps a request id on every response
and on every log line it writes while handling that request. It is shown in
every error state and copyable with one click, which turns "it broke this
morning" into one `grep`. It is never discarded — not for network failures,
where the request never arrived and the id is simply absent rather than lost.

Reads render errors inline, next to what failed, with a retry. Writes surface as
a notification, because the user pressed a button and needs an answer wherever
they are. Retries are automatic only for errors retrying can fix: a 404 or a 422
fails identically every time.

### Verifying the contract

```bash
VERIFY_API_ADMIN_SECRET=<development-secret> npm run verify:api
                                             # against localhost:8000
VERIFY_API_ADMIN_SECRET=<development-secret> npm run verify:api -- http://api.host
                                             # against anything else
```

32 checks against a **running** backend cover public health/version,
authenticated reads, error envelopes and request IDs, the complete boolean
qualification matrix, filtered/selected export parity, dashboard, and job route
contracts. Mutating routes receive deliberately invalid bodies, so no scan or
scrape work is launched. The credential comes only from
`VERIFY_API_ADMIN_SECRET` (or `PLAYWRIGHT_ADMIN_SECRET`) and is never logged.

This exists because of a specific bug. The list endpoint gained a pagination
envelope, the client still expected an array, and a defensive
`Array.isArray(data) ? data : []` turned the mismatch into an empty application
rather than an error. Nothing failed and nothing logged; every screen simply
showed zero results. TypeScript cannot catch that — it is erased at runtime.
This can.

---

## Accessibility

Held to these, not aspirationally:

- A skip link is the first tab stop; `#main-content` is focus-targetable, so it
  moves focus rather than only scrolling.
- `:focus-visible` rings on everything focusable, including Ant Design's own
  controls — visible in both themes.
- One `<h1>` per page; the navigation has an accessible name.
- Status that changes on its own sits in a polite live region; errors use
  `role="alert"`.
- Toggles report state with `aria-pressed` / `aria-expanded`.
- `prefers-reduced-motion` is respected.

---

## Conventions

- **No placeholder UI.** No dummy buttons, no "coming soon", no fake status.
  A control that does nothing is worse than an absent one: it teaches people the
  product is broken. The navigation lists only routes that exist and work.
- **No compatibility shims.** When the backend contract changes, the client
  changes to match. Nothing is written that is expected to be deleted.
- **The wire format is the source of truth.** `types/api.ts` uses the backend's
  field names, mixed casing and all, rather than maintaining two vocabularies
  and a mapping layer between them.
