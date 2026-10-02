import { Link, useParams } from 'react-router-dom'
import {
  findInvoiceById,
  findPoById,
  findSupplierById,
  invoiceTotal,
  purchaseOrderTotal,
  receiptsForPo,
  toleranceForCategory
} from '../data/selectors'
import { statusClass } from './InvoicesPage'

/**
 * HP-003 — one invoice, joined in memory to its purchase order, its goods
 * receipts (PO-2215 has none) and the tolerance for its category. Every value
 * comes from an imported literal; nothing here performs I/O.
 */
export default function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const invoice = findInvoiceById(invoiceId)

  if (!invoice) {
    return (
      <section className="page">
        <h1>Invoice not found</h1>
        <p className="muted">No invoice with id {invoiceId} is loaded.</p>
        <Link to="/invoices">Back to invoices</Link>
      </section>
    )
  }

  const po = findPoById(invoice.poId)
  const supplier = findSupplierById(po?.supplierId)
  const poReceipts = receiptsForPo(invoice.poId)
  const tolerance = toleranceForCategory(po?.category)

  return (
    <section className="page">
      <nav className="breadcrumb">
        <Link to="/invoices">Invoices</Link> <span aria-hidden="true">/</span> {invoice.id}
      </nav>

      <h1>{invoice.id}</h1>

      <dl className="detail-grid">
        <dt>Status</dt>
        <dd>
          <span className={statusClass(invoice.status)} data-testid="invoice-status">
            {invoice.status}
          </span>
        </dd>
        <dt>Purchase order</dt>
        <dd data-testid="invoice-po">{invoice.poId}</dd>
        <dt>Supplier</dt>
        <dd>{supplier ? `${supplier.name} — ${supplier.city}, ${supplier.province}` : '—'}</dd>
        <dt>Category</dt>
        <dd>{po ? po.category : '—'}</dd>
        <dt>Tolerance</dt>
        <dd data-testid="invoice-tolerance">
          {tolerance
            ? `±${tolerance.pricePercent}% price / ${tolerance.quantityUnits} units quantity`
            : '—'}
        </dd>
      </dl>

      <h2>Invoice lines</h2>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Qty</th>
            <th scope="col">Unit price</th>
            <th scope="col">Line total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line) => (
            <tr key={`${invoice.id}-${line.item}`}>
              <td>{line.item}</td>
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
              {invoiceTotal(invoice).toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>

      <h2>Purchase order</h2>
      {po ? (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">PO</th>
              <th scope="col">Item</th>
              <th scope="col">Qty</th>
              <th scope="col">Unit price</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {po.lines.map((line) => (
              <tr key={`${po.id}-${line.item}`}>
                <td>{po.id}</td>
                <td>{line.item}</td>
                <td className="numeric">{line.quantity}</td>
                <td className="numeric">{line.unitPrice.toFixed(2)}</td>
                <td className="numeric">{purchaseOrderTotal(po).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="muted">No purchase order {invoice.poId} is loaded.</p>
      )}

      <h2>Goods receipts</h2>
      {poReceipts.length === 0 ? (
        <p className="muted" data-testid="no-receipts">
          No goods receipt recorded against {invoice.poId}.
        </p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Receipt</th>
              <th scope="col">Item</th>
              <th scope="col">Qty received</th>
            </tr>
          </thead>
          <tbody>
            {poReceipts.flatMap((receipt) =>
              receipt.lines.map((line) => (
                <tr key={`${receipt.id}-${line.item}`} data-testid={`receipt-row-${receipt.id}`}>
                  <td>{receipt.id}</td>
                  <td>{line.item}</td>
                  <td className="numeric">{line.quantity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </section>
  )
}
