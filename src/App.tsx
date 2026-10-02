import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import InvoicesPage from './pages/InvoicesPage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <span className="brand">HiveProcure</span>
        <nav className="app-nav">
          <NavLink to="/invoices">Invoices</NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/invoices" replace />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/:invoiceId" element={<InvoiceDetailPage />} />
          <Route path="*" element={<Navigate to="/invoices" replace />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <small>Synthetic demo data. No real supplier information.</small>
      </footer>
    </div>
  )
}
