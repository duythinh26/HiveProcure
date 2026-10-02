/**
 * HP-003 — in-memory selectors over the §3 seed modules.
 *
 * Pure array joins: every function reads the imported literals and returns
 * plain values. There is no fetch, no XMLHttpRequest, no storage access and no
 * I/O of any kind in this file, which is what lets the UI render the whole
 * dataset without a single network request.
 */

import { invoices } from './invoices'
import { purchaseOrders } from './purchaseOrders'
import { receipts } from './receipts'
import { suppliers } from './suppliers'
import { tolerances } from './tolerances'
import type { Category, Invoice, PurchaseOrder, Receipt, Supplier, Tolerance } from './types'

export function listInvoices(): readonly Invoice[] {
  return invoices
}

export function findInvoiceById(invoiceId: string | undefined): Invoice | undefined {
  return invoices.find((invoice) => invoice.id === invoiceId)
}

export function findPoById(poId: string | undefined): PurchaseOrder | undefined {
  return purchaseOrders.find((po) => po.id === poId)
}

export function findSupplierById(supplierId: string | undefined): Supplier | undefined {
  return suppliers.find((supplier) => supplier.id === supplierId)
}

/** Every receipt booked against a purchase order — an empty array for PO-2215. */
export function receiptsForPo(poId: string | undefined): readonly Receipt[] {
  return receipts.filter((receipt) => receipt.poId === poId)
}

export function toleranceForCategory(category: Category | undefined): Tolerance | undefined {
  return tolerances.find((tolerance) => tolerance.category === category)
}

/** The supplier an invoice is billed by, resolved through its purchase order. */
export function supplierForInvoice(invoice: Invoice): Supplier | undefined {
  return findSupplierById(findPoById(invoice.poId)?.supplierId)
}

/** Total of an invoice's lines, rounded to cents. */
export function invoiceTotal(invoice: Invoice): number {
  const cents = invoice.lines.reduce(
    (sum, line) => sum + Math.round(line.quantity * line.unitPrice * 100),
    0
  )
  return cents / 100
}

/** Total of a purchase order's lines, rounded to cents. */
export function purchaseOrderTotal(po: PurchaseOrder): number {
  const cents = po.lines.reduce(
    (sum, line) => sum + Math.round(line.quantity * line.unitPrice * 100),
    0
  )
  return cents / 100
}

/** Quantity received against a purchase order, summed over its receipts. */
export function receivedQuantityForPo(poId: string | undefined): number {
  return receiptsForPo(poId).reduce(
    (sum, receipt) => sum + receipt.lines.reduce((lineSum, line) => lineSum + line.quantity, 0),
    0
  )
}
