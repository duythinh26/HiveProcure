/**
 * HP-003 — AC-1 and AC-2.
 *
 * The expectations below are the §3 tables themselves, written out again by
 * hand. The point is that the seed modules are compared with a second,
 * independent transcription of the spec rather than with themselves, so a
 * mistyped literal in `src/data/` fails here instead of reaching a screen.
 */

import { expect, it } from 'vitest'

import { tolerances } from '../../src/data/tolerances'
import { suppliers } from '../../src/data/suppliers'
import { purchaseOrders } from '../../src/data/purchaseOrders'
import { receipts } from '../../src/data/receipts'
import { invoices } from '../../src/data/invoices'
import { INVOICE_STATUSES, type InvoiceStatus } from '../../src/data/types'

// --- §3.1 Tolerances -------------------------------------------------------
const TOLERANCE_TABLE = [
  { category: 'Office Supplies', pricePercent: 3, quantityUnits: 0 },
  { category: 'IT Hardware', pricePercent: 2, quantityUnits: 0 }
]

// --- §3.2 Suppliers --------------------------------------------------------
const SUPPLIER_TABLE = [
  { id: 'SUP-001', name: 'Great Lakes Office Supply', city: 'Toronto', province: 'ON' },
  { id: 'SUP-002', name: 'Maple Circuit IT', city: 'Ottawa', province: 'ON' }
]

// --- §3.3 Purchase orders --------------------------------------------------
const PURCHASE_ORDER_TABLE = [
  {
    id: 'PO-2211',
    supplierId: 'SUP-001',
    category: 'Office Supplies',
    lines: [{ item: 'Copy paper, A4, 80 gsm', quantity: 200, unitPrice: 6.4 }]
  },
  {
    id: 'PO-2212',
    supplierId: 'SUP-002',
    category: 'IT Hardware',
    lines: [{ item: 'USB-C docking station', quantity: 25, unitPrice: 189 }]
  },
  {
    id: 'PO-2213',
    supplierId: 'SUP-001',
    category: 'Office Supplies',
    lines: [{ item: 'Ergonomic task chair', quantity: 12, unitPrice: 245 }]
  },
  {
    id: 'PO-2214',
    supplierId: 'SUP-002',
    category: 'IT Hardware',
    lines: [{ item: '27-inch 4K monitor', quantity: 10, unitPrice: 429 }]
  },
  {
    id: 'PO-2215',
    supplierId: 'SUP-001',
    category: 'Office Supplies',
    lines: [{ item: 'Whiteboard marker, box of 12', quantity: 40, unitPrice: 11.25 }]
  }
]

// --- §3.4 Goods receipts (four rows; PO-2215 has none) ---------------------
const RECEIPT_TABLE = [
  { id: 'GR-3301', poId: 'PO-2211', lines: [{ item: 'Copy paper, A4, 80 gsm', quantity: 200 }] },
  { id: 'GR-3302', poId: 'PO-2212', lines: [{ item: 'USB-C docking station', quantity: 25 }] },
  { id: 'GR-3303', poId: 'PO-2213', lines: [{ item: 'Ergonomic task chair', quantity: 10 }] },
  { id: 'GR-3304', poId: 'PO-2214', lines: [{ item: '27-inch 4K monitor', quantity: 10 }] }
]

// --- §3.5 Invoices (six rows, every one of them `Received`) ----------------
const INVOICE_TABLE = [
  {
    id: 'INV-7001',
    poId: 'PO-2211',
    status: 'Received',
    lines: [{ item: 'Copy paper, A4, 80 gsm', quantity: 200, unitPrice: 6.4 }]
  },
  {
    id: 'INV-7002',
    poId: 'PO-2212',
    status: 'Received',
    lines: [{ item: 'USB-C docking station', quantity: 25, unitPrice: 192 }]
  },
  {
    id: 'INV-7003',
    poId: 'PO-2213',
    status: 'Received',
    lines: [{ item: 'Ergonomic task chair', quantity: 12, unitPrice: 245 }]
  },
  {
    id: 'INV-7004',
    poId: 'PO-2214',
    status: 'Received',
    lines: [{ item: '27-inch 4K monitor', quantity: 10, unitPrice: 449 }]
  },
  {
    id: 'INV-7005',
    poId: 'PO-2215',
    status: 'Received',
    lines: [{ item: 'Whiteboard marker, box of 12', quantity: 40, unitPrice: 11.25 }]
  },
  {
    id: 'INV-7006',
    poId: 'PO-2211',
    status: 'Received',
    lines: [{ item: 'Copy paper, A4, 80 gsm', quantity: 200, unitPrice: 6.4 }]
  }
]

/** Strips the `readonly` markers so the rows can be deep-compared as plain data. */
function plain<T>(rows: readonly T[]): T[] {
  return JSON.parse(JSON.stringify(rows)) as T[]
}

it('seed data matches the §3 tables exactly', () => {
  // §3.1 — Office Supplies ±3% price / 0 units, IT Hardware ±2% / 0 units.
  expect(plain(tolerances)).toEqual(TOLERANCE_TABLE)
  expect(tolerances).toHaveLength(2)

  // §3.2 — the two suppliers, name, city and province field for field.
  expect(plain(suppliers)).toEqual(SUPPLIER_TABLE)
  expect(suppliers).toHaveLength(2)

  // §3.3 — five POs, each with supplier, category and exactly one line.
  expect(plain(purchaseOrders)).toEqual(PURCHASE_ORDER_TABLE)
  expect(purchaseOrders).toHaveLength(5)
  for (const po of purchaseOrders) {
    expect(po.lines, `${po.id} must carry exactly one line`).toHaveLength(1)
    expect(suppliers.map((supplier) => supplier.id)).toContain(po.supplierId)
    expect(tolerances.map((tolerance) => tolerance.category)).toContain(po.category)
  }

  // §3.4 — four receipts, and PO-2215 has no receipt at all.
  expect(plain(receipts)).toEqual(RECEIPT_TABLE)
  expect(receipts).toHaveLength(4)
  expect(receipts.filter((receipt) => receipt.poId === 'PO-2215')).toEqual([])
  for (const receipt of receipts) {
    expect(purchaseOrders.map((po) => po.id)).toContain(receipt.poId)
  }

  // §3.5 — six invoices, every one of them starting at `Received`.
  expect(plain(invoices)).toEqual(INVOICE_TABLE)
  expect(invoices).toHaveLength(6)
  expect(invoices.map((invoice) => invoice.status)).toEqual([
    'Received',
    'Received',
    'Received',
    'Received',
    'Received',
    'Received'
  ])
  for (const invoice of invoices) {
    expect(invoice.lines, `${invoice.id} must carry exactly one line`).toHaveLength(1)
    expect(purchaseOrders.map((po) => po.id)).toContain(invoice.poId)
  }

  // The status vocabulary is the closed set the requirement names.
  expect([...INVOICE_STATUSES]).toEqual([
    'Received',
    'Approved for payment',
    'On hold',
    'Rejected'
  ])
  for (const invoice of invoices) {
    expect(INVOICE_STATUSES).toContain(invoice.status as InvoiceStatus)
  }
})

it('invoice line items match their PO line items', () => {
  expect(invoices).toHaveLength(6)

  for (const invoice of invoices) {
    const po = purchaseOrders.find((candidate) => candidate.id === invoice.poId)
    expect(po, `${invoice.id} references an unknown purchase order`).toBeDefined()

    const invoiceItem = invoice.lines[0]!.item
    const poItem = po!.lines[0]!.item

    // Identical strings, not merely similar ones.
    expect(invoiceItem, `${invoice.id} vs ${po!.id}`).toBe(poItem)
    expect(invoiceItem === poItem).toBe(true)
  }
})
