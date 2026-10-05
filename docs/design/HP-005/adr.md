# Architecture decision record — HP-005

- Drafted by: Design agent

## Decision

HP-005 adopts **A. Ordered rule chain compiled into one matching service**.

A single matching service that pairs lines, computes priceVariance and quantityGap, then walks a hardcoded ordered list of six predicates and returns on the first that fires, reading POs, receipts and category tolerances straight from the procurement database.

What it trades away:

- Trades configurability for directness: changing a tolerance value or inserting a seventh rule needs a code change, review and redeploy rather than a data edit.
- Trades rule transparency for compactness: the precedence order lives in source code, so auditors must read the chain rather than inspect a published rule table.
- Trades historical reproducibility: a re-evaluation after a tolerance change yields a different answer, because only the current tolerance row is stored.
- Trades read-time cost: received quantity and the 30-day duplicate lookup are SQL aggregates computed per evaluation, which grows heavy as receipt and invoice volume rises.
- Trades independent scaling: variance maths, duplicate search and rule ordering share one process and one failure domain.

## Reasoning

record this

## Rejected alternatives

### B. Data-driven decision table with versioned tolerance catalogue

Precedence, rule conditions and per-category tolerances are stored as versioned data in a rule registry; a generic evaluator loads the active rule set, runs conditions in their declared order against a prepared fact, and records which rule version decided each invoice.

Tradeoffs:

- Trades simplicity for indirection: reading the code no longer tells you the rule order, and debugging means inspecting both engine and registry data.
- Trades compile-time safety: a malformed condition or a mis-ordered precedence number is only caught by registry validation and tests, not by the compiler.
- Trades latency: every evaluation resolves the active rule-set version and tolerance rows, adding a cache and cache-invalidation concern.
- Trades a larger surface to govern: the registry needs authoring UI, approval workflow, versioning and access control that a hardcoded chain never needs.
- Trades effort up front: building a safe condition language expressive enough for the 30-day duplicate window costs more than writing six predicates.

### C. Event-driven matching over precomputed receipt and duplicate projections

Invoice, PO and receipt events flow through a stream processor that keeps running projections of received quantity per PO item and a rolling 30-day duplicate fingerprint index, so a stateless matcher evaluates the six rules in order against an already-complete fact and emits a result event.

Tradeoffs:

- Trades strong read consistency for throughput: a receipt still in flight can leave the projection briefly stale, so an invoice may be judged MISSING_RECEIPT and corrected by a later re-emission.
- Trades operational simplicity: brokers, projection state stores, replay tooling and retention windows are now part of the system to run and monitor.
- Trades ad-hoc queryability: answering why a result was reached means reading an event log and projection snapshot rather than a single SQL join.
- Trades ordering care: duplicate detection depends on event-time handling of the 30-day window, so late or out-of-order invoices need explicit watermark policy.
- Trades cost at low volume: the projection machinery is heavy for a workload that a nightly batch could have handled.
- Trades testing shape: acceptance scenarios must be expressed as event sequences plus expected result events rather than simple function calls.
