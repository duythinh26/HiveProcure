import { Link } from 'react-router-dom'
import { useInvoiceStore } from '../store/invoiceStore'
import { invoiceTotal } from '../data/seedInvoices'

export default function InvoicesPage() {
  const invoices = useInvoiceStore((state) => state.invoices)
  const findings = useInvoiceStore((state) => state.findings)
  const agentStatus = useInvoiceStore((state) => state.agentStatus)
  const runAgent = useInvoiceStore((state) => state.runAgent)

  return (
    <section className="page">
      <header className="page-header">
        <h1>Invoices</h1>
        <button
          type="button"
          className="button"
          onClick={() => {
            void runAgent()
          }}
          disabled={agentStatus === 'running'}
        >
          {agentStatus === 'running' ? 'Running agent…' : 'Run invoice agent'}
        </button>
      </header>

      <p className="muted" data-testid="agent-status">
        Agent status: {agentStatus}
      </p>

      <table className="table">
        <thead>
          <tr>
            <th scope="col">Invoice</th>
            <th scope="col">Vendor</th>
            <th scope="col">Status</th>
            <th scope="col">Total</th>
            <th scope="col">Agent</th>
            <th scope="col">Source</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => {
            const finding = findings[invoice.id]
            return (
              <tr key={invoice.id} data-testid={`invoice-row-${invoice.id}`}>
                <td>
                  <Link to={`/invoices/${invoice.id}`}>{invoice.number}</Link>
                </td>
                <td>{invoice.vendor}</td>
                <td>
                  <span className={`badge badge-${invoice.status}`}>{invoice.status}</span>
                </td>
                <td className="numeric">
                  {invoiceTotal(invoice).toFixed(2)} {invoice.currency}
                </td>
                <td>
                  {finding ? (
                    <span className={`badge badge-${finding.decision}`}>{finding.decision}</span>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td>
                  <span className="badge badge-source">{invoice.source}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
