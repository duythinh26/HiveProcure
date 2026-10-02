/**
 * HP-003 — AC-3.
 *
 * The app is mounted in jsdom with every network primitive replaced by a stub
 * that records the attempt and then throws. If any part of the render path
 * reached for the network the attempt list would be non-empty and the screen
 * would fail to render, so one assertion covers both halves of the criterion.
 */

import { afterEach, beforeEach, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import App from '../../src/App'

const attempts: string[] = []

type GlobalWithNetwork = typeof globalThis & {
  fetch?: unknown
  XMLHttpRequest?: unknown
  WebSocket?: unknown
  EventSource?: unknown
  navigator: Navigator & { sendBeacon?: unknown }
}

const target = globalThis as GlobalWithNetwork

const originals: Record<string, unknown> = {}

function stub(name: 'fetch' | 'XMLHttpRequest' | 'WebSocket' | 'EventSource', value: unknown) {
  originals[name] = (target as Record<string, unknown>)[name]
  Object.defineProperty(target, name, { value, writable: true, configurable: true })
}

/** Every stub records what was asked for and then refuses, loudly. */
function refuse(what: string, detail: unknown): never {
  attempts.push(`${what}: ${String(detail)}`)
  throw new Error(`network access is forbidden in this app (${what} ${String(detail)})`)
}

class FailingXMLHttpRequest {
  open(method: string, url: string): void {
    refuse('XMLHttpRequest.open', `${method} ${url}`)
  }

  send(): void {
    refuse('XMLHttpRequest.send', '')
  }

  setRequestHeader(): void {
    refuse('XMLHttpRequest.setRequestHeader', '')
  }

  addEventListener(): void {
    /* listeners alone are not a network attempt */
  }
}

class FailingWebSocket {
  constructor(url: string) {
    refuse('WebSocket', url)
  }
}

class FailingEventSource {
  constructor(url: string) {
    refuse('EventSource', url)
  }
}

beforeEach(() => {
  attempts.length = 0
  stub('fetch', (input: unknown) => refuse('fetch', input))
  stub('XMLHttpRequest', FailingXMLHttpRequest)
  stub('WebSocket', FailingWebSocket)
  stub('EventSource', FailingEventSource)

  originals.sendBeacon = target.navigator.sendBeacon
  Object.defineProperty(target.navigator, 'sendBeacon', {
    value: (url: string) => refuse('navigator.sendBeacon', url),
    writable: true,
    configurable: true
  })
})

afterEach(() => {
  for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource']) {
    Object.defineProperty(target, name, {
      value: originals[name],
      writable: true,
      configurable: true
    })
  }
  Object.defineProperty(target.navigator, 'sendBeacon', {
    value: originals.sendBeacon,
    writable: true,
    configurable: true
  })
})

it('app performs no network calls', async () => {
  const user = userEvent.setup()

  // Given: the app mounted at /invoices, with fetch and XHR stubbed to fail.
  render(
    <MemoryRouter initialEntries={['/invoices']}>
      <App />
    </MemoryRouter>
  )

  // Then: the list screen renders, from the in-memory seed data alone.
  expect(screen.getByRole('heading', { name: 'Invoices', level: 1 })).toBeInTheDocument()
  expect(screen.getByTestId('invoice-row-INV-7001')).toBeInTheDocument()
  expect(screen.getAllByText('Received')).toHaveLength(6)
  expect(attempts, `network attempted while rendering /invoices: ${attempts.join(', ')}`).toEqual([])

  // When: an invoice detail is opened by following its link.
  await user.click(screen.getByRole('link', { name: 'INV-7005' }))

  // Then: the detail screen renders too — PO-2215, which has no receipt.
  expect(await screen.findByRole('heading', { name: 'INV-7005', level: 1 })).toBeInTheDocument()
  expect(screen.getByTestId('invoice-po')).toHaveTextContent('PO-2215')
  expect(screen.getByTestId('invoice-status')).toHaveTextContent('Received')
  expect(screen.getByTestId('no-receipts')).toHaveTextContent(
    'No goods receipt recorded against PO-2215.'
  )

  // And back to the list, then into an invoice whose PO does have receipts.
  // The header nav and the breadcrumb both offer that link; either will do.
  await user.click(screen.getAllByRole('link', { name: 'Invoices' })[0]!)
  await user.click(await screen.findByRole('link', { name: 'INV-7001' }))

  const receiptRow = await screen.findByTestId('receipt-row-GR-3301')
  expect(within(receiptRow).getByText('Copy paper, A4, 80 gsm')).toBeInTheDocument()

  // And: not one network call was attempted on any of those screens.
  expect(attempts, `network attempted: ${attempts.join(', ')}`).toEqual([])
  expect(attempts).toHaveLength(0)
})
