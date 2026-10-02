import { TextEncoder as NodeTextEncoder } from 'node:util'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/*
 * jsdom runs in its own VM realm, so the `Uint8Array` the test code sees is not
 * the one Node's TextEncoder produces. Any module that asserts
 * `new TextEncoder().encode('') instanceof Uint8Array` — esbuild does, at import
 * time, and vite pulls esbuild in — therefore refuses to load.
 *
 * The fix is to hand back a Uint8Array from the realm the tests run in. Only the
 * realm of the result changes; the bytes are Node's.
 */
const nodeEncoder = new NodeTextEncoder()

class RealmTextEncoder {
  get encoding(): string {
    return 'utf-8'
  }

  encode(input = ''): Uint8Array {
    const bytes = nodeEncoder.encode(input)
    const copy = new Uint8Array(bytes.length)
    copy.set(bytes)
    return copy
  }

  encodeInto(source: string, destination: Uint8Array) {
    return nodeEncoder.encodeInto(source, destination)
  }
}

if (!(new globalThis.TextEncoder().encode('') instanceof Uint8Array)) {
  Object.defineProperty(globalThis, 'TextEncoder', {
    value: RealmTextEncoder,
    writable: true,
    configurable: true
  })
}

afterEach(() => {
  cleanup()
})
