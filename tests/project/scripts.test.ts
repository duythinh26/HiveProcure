import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')

type Manifest = {
  scripts?: Record<string, string>
}

const EXPECTED_SCRIPTS: Record<string, string> = {
  dev: 'vite',
  start: 'vite --host 127.0.0.1 --port 5173 --strictPort',
  build: 'tsc --noEmit && vite build',
  typecheck: 'tsc --noEmit',
  test: 'vitest run',
}

function readManifest(): Manifest {
  const raw = readFileSync(resolve(repoRoot, 'package.json'), 'utf8')
  return JSON.parse(raw) as Manifest
}

it('package.json scripts match the spec verbatim', () => {
  const manifest = readManifest()
  const scripts = manifest.scripts

  expect(scripts, 'package.json must declare a scripts block').toBeDefined()
  const declared = scripts as Record<string, string>

  // Exactly the five named scripts - no more, no fewer.
  expect(Object.keys(declared).sort()).toEqual(Object.keys(EXPECTED_SCRIPTS).sort())

  // Each command string, character for character.
  expect(declared).toEqual(EXPECTED_SCRIPTS)

  for (const [name, command] of Object.entries(EXPECTED_SCRIPTS)) {
    expect(declared[name], `script "${name}"`).toBe(command)
  }
})
