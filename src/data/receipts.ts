/**
 * HP-003 — §3.4 Goods receipts.
 *
 * Transcribed field for field from the §3.4 table. There are four receipts, and
 * PO-2215 deliberately has none — nothing has been received against it:
 *
 *   | Receipt | PO      | Item                   | Qty received |
 *   | ------- | ------- | ---------------------- | ------------ |
 *   | GR-3301 | PO-2211 | Copy paper, A4, 80 gsm |          200 |
 *   | GR-3302 | PO-2212 | USB-C docking station  |           25 |
 *   | GR-3303 | PO-2213 | Ergonomic task chair   |           10 |
 *   | GR-3304 | PO-2214 | 27-inch 4K monitor     |           10 |
 *   | (none)  | PO-2215 | —                      |            — |
 *
 * In-memory literals only: no backend, database, network call or authentication.
 */

import type { Receipt } from './types'

export const receipts: readonly Receipt[] = [
  {
    id: 'GR-3301',
    poId: 'PO-2211',
    lines: [{ item: 'Copy paper, A4, 80 gsm', quantity: 200 }]
  },
  {
    id: 'GR-3302',
    poId: 'PO-2212',
    lines: [{ item: 'USB-C docking station', quantity: 25 }]
  },
  {
    id: 'GR-3303',
    poId: 'PO-2213',
    lines: [{ item: 'Ergonomic task chair', quantity: 10 }]
  },
  {
    id: 'GR-3304',
    poId: 'PO-2214',
    lines: [{ item: '27-inch 4K monitor', quantity: 10 }]
  }
] as const
