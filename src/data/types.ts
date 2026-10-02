/**
 * HP-003 — shared row types for the §3 seed tables.
 *
 * Transcribed from the HP-003 requirement, §3 "Seed data" tables.
 *
 * Everything here is in-memory TypeScript: no backend, no database, no network
 * call and no authentication is involved in producing or reading these rows.
 * Every row type is `readonly` throughout so the shipped seed arrays cannot be
 * mutated in place by the UI.
 */

/** The two procurement categories §3.1 gives a tolerance for. */
export type Category = 'Office Supplies' | 'IT Hardware'

/** The closed set of invoice statuses the requirement names. */
export type InvoiceStatus = 'Received' | 'Approved for payment' | 'On hold' | 'Rejected'

/** Every value `InvoiceStatus` admits, in the order the requirement lists them. */
export const INVOICE_STATUSES = [
  'Received',
  'Approved for payment',
  'On hold',
  'Rejected'
] as const satisfies readonly InvoiceStatus[]

/** §3.1 — matching tolerance for one category. */
export interface Tolerance {
  readonly category: Category
  /** Allowed unit-price variance, in percent (e.g. 3 means ±3%). */
  readonly pricePercent: number
  /** Allowed quantity variance, in units (0 means an exact quantity match). */
  readonly quantityUnits: number
}

/** §3.2 — a supplier. */
export interface Supplier {
  readonly id: string
  readonly name: string
  readonly city: string
  readonly province: string
}

/** A single order line: the item text, how many, and the agreed unit price. */
export interface PurchaseOrderLine {
  readonly item: string
  readonly quantity: number
  readonly unitPrice: number
}

/** §3.3 — a purchase order: supplier, category and exactly one line. */
export interface PurchaseOrder {
  readonly id: string
  readonly supplierId: string
  readonly category: Category
  readonly lines: readonly PurchaseOrderLine[]
}

/** A goods-receipt line: the item text and the quantity actually received. */
export interface ReceiptLine {
  readonly item: string
  readonly quantity: number
}

/** §3.4 — a goods receipt against a purchase order. */
export interface Receipt {
  readonly id: string
  readonly poId: string
  readonly lines: readonly ReceiptLine[]
}

/** An invoice line: item text, quantity billed and billed unit price. */
export interface InvoiceLine {
  readonly item: string
  readonly quantity: number
  readonly unitPrice: number
}

/** §3.5 — a supplier invoice against a purchase order. */
export interface Invoice {
  readonly id: string
  readonly poId: string
  readonly status: InvoiceStatus
  readonly lines: readonly InvoiceLine[]
}
