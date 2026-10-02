/**
 * HP-003 — §3.3 Purchase orders.
 *
 * Transcribed field for field from the §3.3 table. Each purchase order carries
 * a supplier, a category and exactly one line of item / qty / unitPrice:
 *
 *   | PO      | Supplier | Category        | Item                         | Qty | Unit price |
 *   | ------- | -------- | --------------- | ---------------------------- | --- | ---------- |
 *   | PO-2211 | SUP-001  | Office Supplies | Copy paper, A4, 80 gsm       | 200 |       6.40 |
 *   | PO-2212 | SUP-002  | IT Hardware     | USB-C docking station        |  25 |     189.00 |
 *   | PO-2213 | SUP-001  | Office Supplies | Ergonomic task chair         |  12 |     245.00 |
 *   | PO-2214 | SUP-002  | IT Hardware     | 27-inch 4K monitor           |  10 |     429.00 |
 *   | PO-2215 | SUP-001  | Office Supplies | Whiteboard marker, box of 12 |  40 |      11.25 |
 *
 * In-memory literals only: no backend, database, network call or authentication.
 */

import type { PurchaseOrder } from './types'

export const purchaseOrders: readonly PurchaseOrder[] = [
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
] as const
