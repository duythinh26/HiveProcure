import { Link } from 'react-router-dom'
import { invoiceTotal, findPoById, listInvoices, supplierForInvoice } from '../data/selectors'
import type { InvoiceStatus } from '../data/types'

/** `Approved for payment` -> `badge-approved-for-payment`, so index.css can colour it. */
export function statusClass(status: InvoiceStatus): string {
  return `badge badge-${status.toLowerCase().replace(/\s+/g, '-')}`
}

/**
 * HP-003 — the invoice list, rendered straight from the §3 seed modules.
 * No fetch, no XMLHttpRequest, no backend: the rows below are imported literals.
 */
export default function InvoicesPage() {
  const invoices = listInvoices()

  return (
    <section className="page">
      <header className="page-header">
        <h1>Invoices</h1>
      </header>

      <p className="muted" data-testid="invoice-count">
        {invoices.length} invoices loaded from in-memory seed data.
      </p>

      <table className="table">
        <thead>
          <tr>
            <th scope="col">Invoice</th>
            <th scope="col">Purchase order</th>
            <th scope="col">Supplier</th>
            <th scope="col">Category</th>
            <th scope="col">Item</th>
            <th scope="col">Status</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => {
            const po = findPoById(invoice.poId)
            const supplier = supplierForInvoice(invoice)
            return (
              <tr key={invoice.id} data-testid={`invoice-row-${invoice.id}`}>
                <td>
                  <Link to={`/invoices/${invoice.id}`}>{invoice.id}</Link>
                </td>
                <td>{invoice.poId}</td>
                <td>{supplier ? supplier.name : '—'}</td>
                <td>{po ? po.category : '—'}</td>
                <td>{invoice.lines[0]?.item ?? '—'}</td>
                <td>
                  <span className={statusClass(invoice.status)}>{invoice.status}</span>
                </td>
                <td className="numeric">{invoiceTotal(invoice).toFixed(2)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
