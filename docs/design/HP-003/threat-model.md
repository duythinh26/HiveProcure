# Threat model — HP-003

- Method: STRIDE
- Option: A — Flat literal modules, one file per §3 table

Each required file under `src/data/` is a hand-transcribed `as const` array of row literals typed by a shared `types.ts`, with no validation layer and no derivation; the UI imports the modules directly and joins them with small in-memory selector helpers, while a Vitest/jsdom suite asserts every field against the §3 tables.

## Spoofing

Not applicable: The option has no authentication, no sessions, no server, no network calls and no inter-process messaging — the entire application is static TypeScript literals rendered in one browser tab. There is no identity, credential, token or remote endpoint for an attacker to impersonate, so the category has no surface here; impersonation of a build-time dependency is covered under tampering.

## Tampering

### Hand-transcribed literals silently drift from the §3 tables

Mitigated: The Vitest/jsdom suite asserts every field of every row (tolerance percentages and unit allowances, both supplier records, all five POs with supplier/category/item/qty/unitPrice, all four receipts, all six invoices and their initial `Received` status) against the §3 values, and the suite is a required CI gate on every pull request, so a mistranscribed literal fails the build rather than reaching a release.

### Duplicated item text edited in purchaseOrders.ts but not invoices.ts (criterion 2 breaks while types still pass)

Mitigated: A dedicated cross-table test iterates every invoice, resolves its PO via the stored PO reference, and asserts strict string equality of the line item text; a second test asserts PO-2215 has zero receipts. Both files are listed under the same CODEOWNERS entry so a one-sided edit is flagged in review as well as by CI.

### UI code mutates the shared seed arrays at runtime (e.g. an in-place status change corrupting the baseline dataset)

Mitigated: `as const` plus `readonly` array/row types in `types.ts` make in-place writes a compile error, and selector helpers are written to return new objects/arrays rather than exposing mutable references; a test asserts each exported module still deep-equals its §3 baseline after the UI smoke render.

### Build toolchain or npm dependency compromise alters the shipped seed data

Mitigated: Committed lockfile with integrity hashes, CI builds from a clean checkout with `npm ci`, dependency set kept to Vite/TypeScript/Vitest/jsdom only, and the data assertion suite runs against the built artefact so post-build substitution of row values fails the pipeline.

## Repudiation

### Invoice status transitions (Received → Approved for payment / On hold / Rejected) leave no audit record of who changed what

Accepted: The requirement forbids backend, database, network and authentication, so there is no identity to attribute an action to and no store to write a log into. Status changes are local, non-binding demo state discarded on reload; nothing of financial or legal consequence is being recorded, so the absence of an audit trail is accepted for this scope.

### No traceable provenance linking a data module to the §3 table revision it was transcribed from

Mitigated: Each `src/data/*.ts` module carries a header comment naming the requirement (HP-003) and the spec revision it was transcribed from, and the mirrored test fixture cites the same revision; changes to either reach main only via reviewed commits, so git history records who transcribed which revision.

## Information disclosure

### All supplier, pricing and invoice data ships inside the client bundle and is readable by anyone who loads the page

Mitigated: The dataset is restricted by review policy to the fictional §3 seed rows only (Great Lakes Office Supply, Maple Circuit IT and the listed POs/receipts/invoices); a documented rule and PR checklist forbid substituting real supplier names, contacts, contract prices or any personal data into these modules, so there is nothing confidential in the bundle to disclose.

### Production source maps and unminified module names expose the full data model and any commented-out or draft rows

Mitigated: Production builds are configured with source maps disabled and tree-shaking/minification enabled; the data modules are kept free of commented-out alternative rows or TODO values, enforced by lint rules against commented code in `src/data/`.

## Denial of service

### A transcription error that still type-checks (e.g. a quantity typed as a string-free NaN expression, or a null unit price) crashes the render for every user

Mitigated: Because there is no validation layer, the jsdom suite includes a whole-dataset smoke render that mounts every screen over all five POs, four receipts and six invoices plus the tolerance records, so any value that breaks rendering or arithmetic fails CI instead of reaching the screen.

### Naive nested-loop selector joins degrade as the dataset grows

Accepted: The dataset is fixed by §3 at two tolerance categories, two suppliers, five POs, four receipts and six invoices, all in memory with no pagination or external fetch; linear scans over fewer than twenty rows are imperceptible, and any future growth would be a spec change requiring its own design pass.

## Elevation of privilege

### Any viewer can drive an invoice to `Approved for payment` because there is no authentication or approver role

Accepted: The requirement explicitly scopes the deliverable to in-memory seed data with no backend, network or authentication, so no privilege tiers exist to escalate between and no approval carries real-world payment authority. Status values are confined to the closed set and the change lives only in the current browser session; introducing roles would contradict the stated requirement.
