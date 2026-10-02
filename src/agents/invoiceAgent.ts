/**
 * The invoice agent — the entry point AC-2 names.
 *
 * A plain, pure async function imported directly by the store action. Every
 * non-deterministic input (clock, run id) is injected by the caller, so a run
 * against the seed data is byte-reproducible.
 */

import { invoiceTotal, type Invoice } from '../data/seedInvoices'

export const AGENT_VERSION = '1.0.0'

export type AgentDecision = 'approve' | 'review' | 'hold'

export interface AgentFinding {
  readonly invoiceId: string
  readonly decision: AgentDecision
  readonly reasons: readonly string[]
  readonly total: number
}

export interface AgentRunDeps {
  /** Injected so the result is reproducible under test. */
  readonly now: () => string
  readonly runId: string
}

export interface AgentRunResult {
  readonly runId: string
  readonly agentVersion: string
  readonly ranAt: string
  readonly findings: readonly AgentFinding[]
}

/** An invoice above this total is never auto-approved. */
export const AUTO_APPROVE_CEILING = 2000

export function reviewInvoice(invoice: Invoice): AgentFinding {
  const total = invoiceTotal(invoice)
  const reasons: string[] = []

  if (invoice.poNumber === null) {
    reasons.push('No purchase order reference')
  }
  if (total > AUTO_APPROVE_CEILING) {
    reasons.push(`Total ${total.toFixed(2)} ${invoice.currency} exceeds the auto-approval ceiling`)
  }
  if (invoice.status === 'disputed') {
    reasons.push('Invoice is already disputed')
  }
  if (new Date(invoice.dueOn).getTime() < new Date(invoice.issuedOn).getTime()) {
    reasons.push('Due date precedes the issue date')
  }

  let decision: AgentDecision = 'approve'
  if (invoice.status === 'disputed') {
    decision = 'hold'
  } else if (reasons.length > 0) {
    decision = 'review'
  } else {
    reasons.push('Matched against its purchase order and within the auto-approval ceiling')
  }

  return { invoiceId: invoice.id, decision, reasons, total }
}

export async function runInvoiceAgent(
  invoices: readonly Invoice[],
  deps: AgentRunDeps
): Promise<AgentRunResult> {
  const findings = invoices.map(reviewInvoice)
  return {
    runId: deps.runId,
    agentVersion: AGENT_VERSION,
    ranAt: deps.now(),
    findings
  }
}
