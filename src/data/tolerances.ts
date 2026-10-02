/**
 * HP-003 — §3.1 Matching tolerances.
 *
 * Transcribed field for field from the §3.1 table:
 *
 *   | Category        | Price tolerance | Quantity tolerance |
 *   | --------------- | --------------- | ------------------ |
 *   | Office Supplies | ±3%             | 0 units            |
 *   | IT Hardware     | ±2%             | 0 units            |
 *
 * In-memory literals only: no backend, database, network call or authentication.
 */

import type { Tolerance } from './types'

export const tolerances: readonly Tolerance[] = [
  { category: 'Office Supplies', pricePercent: 3, quantityUnits: 0 },
  { category: 'IT Hardware', pricePercent: 2, quantityUnits: 0 }
] as const
