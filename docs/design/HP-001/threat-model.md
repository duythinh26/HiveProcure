# Threat model — HP-001

- Method: STRIDE
- Option: Flat single-bundle SPA: one store, agent as a plain module

A minimal Vite + React 18 + TS single-page app where `src/pages` components read and write one global Zustand store, and `src/agents/invoiceAgent.ts` is a plain async function imported directly by store actions, with `src/data` exporting typed seed literals. Vitest/jsdom tests under `tests/**` exercise the real store and real agent against the seed data with no test doubles.

## Spoofing

### Agent-generated records are indistinguishable from user-entered records in the single global store

Mitigated: Give every record written through a store action an explicit `source: 'seed' | 'user' | 'agent'` field plus the agent run id that produced it, set only inside the store action (never by the caller), and render the provenance badge on invoice/procurement rows so a fabricated or hallucinated agent line cannot pass as human-entered input.

### Dependency substitution against the flat Vite dependency tree (no lockfile/integrity discipline in a greenfield scaffold)

Mitigated: Commit the lockfile with the initial scaffold, install in CI with `npm ci` only, pin `vite`, `react`, `react-router-dom`, `zustand`, `vitest` and Testing Library to exact versions, and enable `npm audit signatures` in the CI job so a typosquatted or republished package cannot silently enter the single bundle.

## Tampering

### All client state is attacker-controlled: the Zustand store and `src/data` seed literals can be edited at runtime via devtools

Accepted: The app is a client-only SPA with no backend and no authority behind the data; the seed literals are synthetic demo content, so a user rewriting their own store has no victim beyond themselves. This acceptance is recorded as a precondition: the moment a real backend is introduced, server-side validation of anything the store sends becomes mandatory, because the directness trade-off means call sites, not a config seam, will carry that change.

### Pages can mutate store state directly because nothing in code enforces the action boundary

Mitigated: Expose the store with state fields typed `readonly`/`Readonly<...>` and all mutation funnelled through named actions; add an ESLint `no-restricted-syntax` rule banning `useStore.setState` outside `src/store/`, and have each action validate agent output shape (parse-at-the-boundary) before merging it, so a malformed agent pass cannot corrupt unrelated slices of the one global store.

### Unsanitised agent output rendered into the DOM (stored XSS into the single bundle's one origin)

Mitigated: Rely on React's default escaping and ban `dangerouslySetInnerHTML` repo-wide with `react/no-danger` set to error; never build hrefs from agent strings without an allowlist of `https:`/`mailto:` schemes; ship a strict `Content-Security-Policy` meta/header (`default-src 'self'`, no `unsafe-inline` script) with the built bundle.

## Repudiation

### No durable record of agent runs: an invoice decision cannot be reconstructed after a reload

Mitigated: Have the store action that invokes `src/agents/invoiceAgent.ts` append an entry to an append-only `auditLog` slice (timestamp, agent version constant, input invoice ids, decision, duration) that is rendered on a run-history view; keep entries immutable in the reducer and cover the append with a test under `tests/store/`.

### Non-deterministic agent makes test failures and reported bugs unreproducible, so 'the agent did it' cannot be verified

Mitigated: Make `invoiceAgent` a pure function of its inputs plus an injected clock/random passed from the store action, and have `tests/**` pin those inputs so a real-agent-against-real-seed run is byte-reproducible; log the seed data version constant in each audit entry so a reported outcome can be replayed.

## Information disclosure

### Everything in `src/data` and `src/agents` ships to the browser inside the single bundle

Mitigated: Treat `src/` as public by rule: keep seed literals synthetic with no real supplier names, prices, bank details or contacts; add a CI grep/secret-scan step that fails on `VITE_`-prefixed secrets, API keys or tokens anywhere in `src/`, and document in the README that no credential may ever be added to the agent module because it is a plain imported module, not a server seam.

### Agent and store errors leaked through console logs, source maps and verbose error boundaries in production builds

Mitigated: Disable `build.sourcemap` for production (or upload maps privately rather than serving them), strip `console.*` via esbuild `drop` in the production config, and render a generic error boundary message while keeping detailed diagnostics behind an explicit dev-only flag.

## Denial of service

### A long agent pass blocks the main thread and freezes the UI (no worker or queue boundary)

Mitigated: Bound the work rather than add a boundary: cap the number of invoices a single agent pass accepts, wrap the call in a store-managed `AbortController` with a hard timeout that resolves the slice into an error state, and keep a `pending` flag so the UI disables re-submission instead of stacking concurrent passes.

### Re-render storms and unbounded growth in the one global store as screens are added

Mitigated: Require selector-based subscriptions (`useStore(s => s.x)`, shallow comparison for object selections) and forbid whole-store subscription with an ESLint rule; cap the `auditLog` slice at a fixed ring-buffer length so repeated agent runs cannot exhaust memory in a long-lived tab.

## Elevation of privilege

### Layering is folder-name convention only: a page can import and call the agent directly, bypassing store validation, audit logging and the pending/abort guards

Mitigated: Enforce the boundary in code with ESLint `no-restricted-imports` zones — `src/pages/**` may not import `src/agents/**`, and `src/agents/**` may not import `src/store/**` — wired into the CI lint gate, plus a test under `tests/` asserting the rule is active so the enforcement cannot be quietly dropped.

### Dev-time toolchain escalation: Vite dev server exposure and arbitrary code execution from dependencies/plugins during build and Vitest runs

Mitigated: Keep the dev server bound to localhost (do not set `--host`), configure `server.fs.strict` with no allow-list widening outside the project root, and run installs/builds/tests in CI with a pinned Node version and least-privileged credentials so a malicious postinstall or plugin cannot reach deployment secrets.
