# Threat model — HP-004

- Method: STRIDE
- Option: Option A — Single self-contained pure module

All of HP-004 lives in one file: `runInvoiceAgent` filters to `Received`, runs matching, derives status and summary through module-private helper functions, with no injection points and no shared rule infrastructure. Determinism is guaranteed structurally because the module imports only types and pure utilities.

## Spoofing

### Agent treats its `data` argument as authoritative with no provenance check

Mitigated: Document and enforce the trust boundary at the caller: `runInvoiceAgent` consumes no identity claims and performs no authorisation, so invoice records must be authenticated and tenant-scoped by the ingestion/ERP adapter before the call. The module's type contract accepts only already-validated domain objects, and the calling service is covered by its own authentication tests so forged invoice payloads cannot reach the pure function.

### Fabricated `Received` status on an inbound invoice drives a false exception result

Mitigated: Status is not re-derived inside the agent, so the upstream mapper is the single place that sets `Received`; that mapper validates the status transition against the source system record and rejects unknown or self-asserted statuses. The agent's filter is pinned by acceptance tests so it cannot silently widen to accept other statuses.

## Tampering

### Matching rules and the pinned acceptance tests share one file, so a rule edit can silently change financial outcomes

Mitigated: Require CODEOWNERS review on `src/agents/invoiceAgent.ts`, and back the acceptance tests with golden-fixture snapshots of `InvoiceResult[]` so that any change in matching, status derivation or summary text produces a reviewable diff in CI rather than passing unnoticed. Determinism makes the golden comparison exact.

### Returned result objects may alias the caller's input, allowing downstream mutation of source data

Mitigated: Construct every `InvoiceResult` from freshly allocated objects and primitives rather than re-exporting references drawn from `data`; add a test that deep-freezes the input before the call and asserts no write occurs, plus a test that mutating a returned result leaves the input unchanged.

## Repudiation

### The pure function emits no audit trail, so an exception decision cannot be explained or defended after the fact

Mitigated: Make the caller responsible for the audit record: persist the exact input snapshot, the returned `InvoiceResult[]`, and the module version/commit hash for each run. Because the function is deterministic and dependency-free, the stored input replays to a byte-identical output, which is the evidence for any later dispute.

### Rule precedence is implicit in control flow, so the reason a given status won cannot be reconstructed from the output

Mitigated: Have the summariser emit an explicit, stable rule-identifier for the rule that determined the status on each `InvoiceResult`, so the recorded output names the deciding rule without a reader having to re-read the function body.

## Information disclosure

### Human-readable summary strings may embed vendor, amount or line-item detail that then flows into logs and UI

Mitigated: Restrict the summariser to a fixed allowlist of fields and never interpolate free-text supplier or payment detail into the summary; cover the allowlist with a test asserting that summaries for a fixture containing sensitive values contain none of them.

### An unexpected input shape throws, and the stack trace or error message carries invoice payload fragments

Mitigated: Throw only fixed, payload-free error messages keyed to the field name, never the field value, and have the caller catch at the agent boundary so raw objects are not serialised into logs or error-reporting tooling.

## Denial of service

### Unbounded invoice batch combined with pairwise matching blocks the Node event loop

Mitigated: Cap batch size at the caller before invoking the agent and keep the matching pass at linear or indexed-lookup complexity rather than nested scans; add a performance test asserting a worst-case batch completes inside the service's request budget.

### Pathological input (very long strings, deeply nested or cyclic references) causes runaway work inside helpers

Mitigated: Validate and bound field lengths and collection sizes in the upstream schema check before the data reaches the agent, and keep all helpers non-recursive over caller-supplied structure so a cyclic or deep object cannot cause unbounded traversal.

## Elevation of privilege

### Pressure to unit-test individual rules leads to exporting module internals, widening the privileged API surface

Mitigated: Keep helpers unexported and assert the public surface in a test that enumerates module exports (only `runInvoiceAgent` and types); route all rule assertions through the public function so no internal entry point exists for a caller to invoke matching or summarising with hand-crafted state.

### The agent runs in-process at the caller's privilege level, so a compromised transitive 'pure utility' dependency executes with full host rights

Mitigated: Hold the import list to types and a pinned, lockfile-verified allowlist of pure utilities, enforce it with a dependency-boundary lint rule on this file, and run supply-chain scanning in CI so new imports into the agent are an explicit review event.

### One shared rule body applies to every tenant, so no tenant can be given stricter or weaker exception handling

Accepted: Option A deliberately has no per-tenant seam; uniform rules for all tenants is the intended behaviour for HP-004, and the uniformity is itself a safety property here since no tenant can obtain a weaker exception policy than any other. If differentiated policy becomes a requirement it is a change of architecture, not a control to add inside this option.
