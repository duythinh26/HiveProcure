/**
 * HP-003 — §3.2 Suppliers.
 *
 * Transcribed field for field from the §3.2 table:
 *
 *   | Id      | Name                      | City    | Province |
 *   | ------- | ------------------------- | ------- | -------- |
 *   | SUP-001 | Great Lakes Office Supply | Toronto | ON       |
 *   | SUP-002 | Maple Circuit IT          | Ottawa  | ON       |
 *
 * Synthetic demo content: these are not real suppliers, and no contact, bank
 * or contract detail ever belongs in this file — everything under `src/`
 * ships to the browser.
 */

import type { Supplier } from './types'

export const suppliers: readonly Supplier[] = [
  { id: 'SUP-001', name: 'Great Lakes Office Supply', city: 'Toronto', province: 'ON' },
  { id: 'SUP-002', name: 'Maple Circuit IT', city: 'Ottawa', province: 'ON' }
] as const
