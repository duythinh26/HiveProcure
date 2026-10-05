# Threat model — HP-005

- Method: STRIDE
- Option: A. Ordered rule chain compiled into one matching service

A single matching service that pairs lines, computes priceVariance and quantityGap, then walks a hardcoded ordered list of six predicates and returns on the first that fires, reading POs, receipts and category tolerances straight from the procurement database.

## Spoofing

### Unauthenticated caller impersonates the AP system to submit invoice lines for matching

Mitigated: Require mutual TLS plus signed service tokens (short-lived, audience-scoped) on every call into the matching service; reject any evaluation request whose caller identity is not on the allow-list of AP/ingestion services, and bind the supplier scope in the token to the supplier on the invoice being matched.

### Forged or look-alike `item` text causes an invoice line to pair with the wrong PO line

Mitigated: Normalise and canonicalise `item` text (trim, case-fold, strip control/zero-width and homoglyph characters) before the pairing comparison, require the invoice's PO reference to match the PO the line is paired against, and flag multi-candidate or zero-candidate pairings for manual review instead of silently selecting one.

## Tampering

### Direct edits to category tolerance rows in the procurement database silently change PRICE_OUT/QUANTITY outcomes

Mitigated: Restrict write access on the tolerance tables to a controlled change process (no direct DBA/app writes), make tolerance rows append-only with effective-from timestamps and an author, and emit a change event to the audit log so every outcome shift is traceable to a reviewed tolerance change.

### Insertion or back-dating of receipt rows flips MISSING_RECEIPT or suppresses a QUANTITY result

Mitigated: Make receipts immutable once posted (corrections via compensating entries, not updates), restrict receipt insertion to the goods-receipt service account, and have the matching service record the receipt IDs and their posting timestamps that contributed to the received-quantity aggregate for each decision.

## Repudiation

### A decision cannot be reproduced or defended because only the current tolerance row is stored

Mitigated: At evaluation time write an immutable decision record containing the invoice and PO line identifiers, the computed priceVariance and quantityGap, the exact tolerance values used, the matched rule name, the set of receipt and prior-invoice IDs consulted, and the deployed service version / source commit hash of the rule chain, so the decision is re-derivable without re-running the chain.

### Auditors cannot show which precedence applied because the ordered chain lives only in source code

Mitigated: Publish a generated rule table (order, rule name, condition expression) emitted from the same source as the chain at build time, version it with the release, and attach the rule-table version to every decision record so an auditor can inspect precedence without reading code.

## Information disclosure

### Duplicate lookup and variance output leak supplier unit prices and PO totals across tenants or buyers

Mitigated: Scope every query (duplicate search, receipts, POs) by the caller's authorised supplier/buying-entity at the data-access layer rather than in the rule logic, and return only the match result plus the variance figures the caller is entitled to see.

### Debug logs and error traces from the matching service expose unit prices, tolerances and supplier identities

Mitigated: Redact price, tolerance and supplier fields from application logs and exception messages (log identifiers only), disable verbose SQL echo in production, and restrict decision-record and log access to the finance-audit role.

## Denial of service

### Per-evaluation SQL aggregates for received quantity and the 30-day duplicate scan degrade as volume grows

Mitigated: Add covering indexes on (po_id, item) for receipts and (supplier, po_id, total, received_at) for invoices, enforce per-query statement timeouts and a per-caller rate limit, and batch/cache the received-quantity aggregate for a PO across the lines of one invoice so each invoice triggers one aggregate pass rather than one per line.

### Variance maths, duplicate search and rule ordering share one process, so a slow duplicate query stalls all matching

Mitigated: Isolate the duplicate-lookup path behind its own connection pool and bulkhead with a circuit breaker and bounded queue, so saturation there sheds load to a retry queue rather than exhausting threads and connections needed for the rest of the chain; run multiple stateless instances behind a health-checked load balancer.

## Elevation of privilege

### Unsanitised `item` text or supplier values used in pairing and duplicate queries enable SQL injection against the procurement database

Mitigated: Use parameterised statements exclusively for all PO, receipt, invoice and tolerance reads, validate `item` against an expected character set and length before use, and run the service under a read-only database role limited to the specific tables it needs, with no DDL or write grants.

### A code change to the hardcoded chain reorders rules or inserts a seventh rule without finance sign-off

Mitigated: Protect the rule-chain source path with mandatory code-owner review from finance control plus a second engineer, require a passing precedence regression suite (golden cases for each of the six outcomes) in CI, and sign and verify deployment artefacts so only reviewed builds reach production.
