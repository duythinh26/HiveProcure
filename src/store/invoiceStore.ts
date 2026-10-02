/**
 * The single global store. All state is read-only to callers; every mutation
 * goes through a named action, and the agent is only ever invoked from here.
 */

import { create } from 'zustand'
import { seedInvoices, SEED_VERSION, type Invoice } from '../data/seedInvoices'
import {
  runInvoiceAgent,
  AGENT_VERSION,
  type AgentFinding,
  type AgentRunResult
} from '../agents/invoiceAgent'

export interface AuditEntry {
  readonly runId: string
  readonly agentVersion: string
  readonly seedVersion: string
  readonly at: string
  readonly invoiceIds: readonly string[]
  readonly decisions: Readonly<Record<string, string>>
}

export interface InvoiceState {
  readonly invoices: readonly Invoice[]
  readonly findings: Readonly<Record<string, AgentFinding>>
  readonly auditLog: readonly AuditEntry[]
  readonly agentStatus: 'idle' | 'running' | 'done'
  readonly lastRun: AgentRunResult | null
  runAgent: (deps?: { now?: () => string; runId?: string }) => Promise<AgentRunResult>
  reset: () => void
}

let runCounter = 0

function nextRunId(): string {
  runCounter += 1
  return `run-${runCounter}`
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: seedInvoices,
  findings: {},
  auditLog: [],
  agentStatus: 'idle',
  lastRun: null,

  async runAgent(deps) {
    set({ agentStatus: 'running' })
    const result = await runInvoiceAgent(get().invoices, {
      now: deps?.now ?? (() => new Date().toISOString()),
      runId: deps?.runId ?? nextRunId()
    })

    const findings: Record<string, AgentFinding> = {}
    const decisions: Record<string, string> = {}
    for (const finding of result.findings) {
      findings[finding.invoiceId] = finding
      decisions[finding.invoiceId] = finding.decision
    }

    const entry: AuditEntry = {
      runId: result.runId,
      agentVersion: AGENT_VERSION,
      seedVersion: SEED_VERSION,
      at: result.ranAt,
      invoiceIds: result.findings.map((f) => f.invoiceId),
      decisions
    }

    set((state) => ({
      findings,
      lastRun: result,
      agentStatus: 'done',
      auditLog: [...state.auditLog, entry]
    }))

    return result
  },

  reset() {
    runCounter = 0
    set({
      invoices: seedInvoices,
      findings: {},
      auditLog: [],
      agentStatus: 'idle',
      lastRun: null
    })
  }
}))

export function selectInvoiceById(id: string | undefined) {
  return (state: InvoiceState): Invoice | undefined =>
    state.invoices.find((invoice) => invoice.id === id)
}
