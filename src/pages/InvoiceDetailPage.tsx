import { Link, useParams } from 'react-router-dom'
import { useInvoiceStore } from '../store/invoiceStore'
import { invoiceTotal } from '../data/seedInvoices'

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const invoice = useInvoiceStore((state) =>
    state.invoices.find((candidate) => candidate.id === invoiceId)
  )
  const finding = useInvoiceStore((state) => (invoiceId ? state.findings[invoiceId] : undefined))

  if (!invoice) {
    return (
      <section className="page">
        <h1>Invoice not found</h1>
        <p className="muted">No invoice with id {invoiceId} is loaded.</p>
        <Link to="/invoices">Back to invoices</Link>
      </section>
    )
  }

  return (
    <section className="page">
      <nav className="breadcrumb">
        <Link to="/invoices">Invoices</Link> <span aria-hidden="true">/</span> {invoice.number}
      </nav>

      <h1>{invoice.number}</h1>

      <dl className="detail-grid">
        <dt>Vendor</dt>
        <dd>{invoice.vendor}</dd>
        <dt>Status</dt>
        <dd>
          <span className={`badge badge-${invoice.status}`}>{invoice.status}</span>
        </dd>
        <dt>Purchase order</dt>
        <dd>{invoice.poNumber ?? 'none'}</dd>
        <dt>Issued</dt>
        <dd>{invoice.issuedOn}</dd>
        <dt>Due</dt>
        <dd>{invoice.dueOn}</dd>
        <dt>Provenance</dt>
        <dd>
          <span className="badge badge-source">{invoice.source}</span>
        </dd>
      </dl>

      <h2>Lines</h2>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Description</th>
            <th scope="col">Qty</th>
            <th scope="col">Unit price</th>
            <th scope="col">Line total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line) => (
            <tr key={line.id}>
              <td>{line.description}</td>
              <td className="numeric">{line.quantity}</td>
              <td className="numeric">{line.unitPrice.toFixed(2)}</td>
              <td className="numeric">{(line.quantity * line.unitPrice).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={3}>
              Total
            </th>
            <td className="numeric" data-testid="invoice-total">
              {invoiceTotal(invoice).toFixed(2)} {invoice.currency}
            </td>
          </tr>
        </tfoot>
      </table>

      <h2>Agent assessment</h2>
      {finding ? (
        <div className="panel" data-testid="agent-finding">
          <p>
            Decision: <span className={`badge badge-${finding.decision}`}>{finding.decision}</span>
          </p>
          <ul>
            {finding.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="muted">The agent has not reviewed this invoice yet.</p>
      )}
    </section>
  )
}
