/**
 * HP-003 — §3.5 Invoices.
 *
 * Transcribed field for field from the §3.5 table. Every invoice starts at
 * status `Received`, and every invoice line's item text is the same string as
 * the item text on the line of the purchase order it is billed against:
 *
 *   | Invoice  | PO      | Status   | Item                         | Qty | Unit price |
 *   | -------- | ------- | -------- | ---------------------------- | --- | ---------- |
 *   | INV-7001 | PO-2211 | Received | Copy paper, A4, 80 gsm       | 200 |       6.40 |
 *   | INV-7002 | PO-2212 | Received | USB-C docking station        |  25 |     192.00 |
 *   | INV-7003 | PO-2213 | Received | Ergonomic task chair         |  12 |     245.00 |
 *   | INV-7004 | PO-2214 | Received | 27-inch 4K monitor           |  10 |     449.00 |
 *   | INV-7005 | PO-2215 | Received | Whiteboard marker, box of 12 |  40 |      11.25 |
 *   | INV-7006 | PO-2211 | Received | Copy paper, A4, 80 gsm       | 200 |       6.40 |
 *
 * In-memory literals only: no backend, database, network call or authentication.
 */

import type { Invoice } from './types'

export const invoices: readonly Invoice[] = [
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
] as const
