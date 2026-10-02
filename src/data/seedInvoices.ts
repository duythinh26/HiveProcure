/**
 * Seed data for HiveProcure.
 *
 * Synthetic demo content only: no real supplier names, bank details or
 * contacts ever belong here, because everything under `src/` ships to the
 * browser inside the single bundle.
 */

export type InvoiceStatus = 'draft' | 'received' | 'approved' | 'disputed'

export type RecordSource = 'seed' | 'user' | 'agent'

export interface InvoiceLine {
  readonly id: string
  readonly description: string
  readonly quantity: number
  readonly unitPrice: number
}

export interface Invoice {
  readonly id: string
  readonly number: string
  readonly vendor: string
  readonly currency: string
  readonly issuedOn: string
  readonly dueOn: string
  readonly poNumber: string | null
  readonly status: InvoiceStatus
  readonly source: RecordSource
  readonly lines: readonly InvoiceLine[]
}

/** Bumped whenever the literals below change, so an agent run can be replayed. */
export const SEED_VERSION = '2024.1'

export const seedInvoices: readonly Invoice[] = [
  {
    id: 'inv-1001',
    number: 'HP-2024-1001',
    vendor: 'Northwind Office Supplies',
    currency: 'EUR',
    issuedOn: '2024-03-04',
    dueOn: '2024-04-03',
    poNumber: 'PO-5567',
    status: 'received',
    source: 'seed',
    lines: [
      { id: 'inv-1001-l1', description: 'Recycled A4 paper, 500 sheets', quantity: 40, unitPrice: 4.5 },
      { id: 'inv-1001-l2', description: 'Toner cartridge, black', quantity: 6, unitPrice: 62 },
      { id: 'inv-1001-l3', description: 'Desk organiser', quantity: 12, unitPrice: 9.75 }
    ]
  },
  {
    id: 'inv-1002',
    number: 'HP-2024-1002',
    vendor: 'Harbour Logistics',
    currency: 'EUR',
    issuedOn: '2024-03-11',
    dueOn: '2024-03-25',
    poNumber: null,
    status: 'received',
    source: 'seed',
    lines: [
      { id: 'inv-1002-l1', description: 'Pallet freight, zone 2', quantity: 18, unitPrice: 120 },
      { id: 'inv-1002-l2', description: 'Fuel surcharge', quantity: 1, unitPrice: 340.5 }
    ]
  },
  {
    id: 'inv-1003',
    number: 'HP-2024-1003',
    vendor: 'Meridian Facilities',
    currency: 'EUR',
    issuedOn: '2024-02-28',
    dueOn: '2024-03-14',
    poNumber: 'PO-5512',
    status: 'approved',
    source: 'seed',
    lines: [
      { id: 'inv-1003-l1', description: 'Cleaning services, February', quantity: 1, unitPrice: 2150 }
    ]
  },
  {
    id: 'inv-1004',
    number: 'HP-2024-1004',
    vendor: 'Cobalt Software Licensing',
    currency: 'USD',
    issuedOn: '2024-03-18',
    dueOn: '2024-04-17',
    poNumber: 'PO-5601',
    status: 'draft',
    source: 'seed',
    lines: [
      { id: 'inv-1004-l1', description: 'Seat licence, annual', quantity: 25, unitPrice: 288 },
      { id: 'inv-1004-l2', description: 'Priority support uplift', quantity: 1, unitPrice: 1200 }
    ]
  },
  {
    id: 'inv-1005',
    number: 'HP-2024-1005',
    vendor: 'Granite Works',
    currency: 'EUR',
    issuedOn: '2024-03-21',
    dueOn: '2024-04-20',
    poNumber: null,
    status: 'disputed',
    source: 'seed',
    lines: [
      { id: 'inv-1005-l1', description: 'Site survey', quantity: 2, unitPrice: 480 },
      { id: 'inv-1005-l2', description: 'Materials handling', quantity: 9, unitPrice: 73.2 }
    ]
  }
]

export function invoiceTotal(invoice: Invoice): number {
  const cents = invoice.lines.reduce(
    (sum, line) => sum + Math.round(line.quantity * line.unitPrice * 100),
    0
  )
  return cents / 100
}
