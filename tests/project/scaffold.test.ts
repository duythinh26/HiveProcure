/**
 * HP-001 — greenfield project scaffold, stack and directory layout.
 *
 * These three tests are the ones the acceptance criteria name:
 *   AC-1  declares the mandated stack and no UI framework
 *   AC-2  mandated directory layout exists
 *   AC-3  vitest runs jsdom over tests/**
 */

import { readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { glob } from 'tinyglobby'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it } from 'vitest'
import App from '../../src/App'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

function readJson(relativePath: string): Record<string, any> {
  return JSON.parse(readFileSync(resolve(repoRoot, relativePath), 'utf8'))
}

function majorOf(range: string): number {
  const match = /(\d+)\./.exec(range.replace(/^[\^~>=<\s]*/, ''))
  return match ? Number(match[1]) : Number.NaN
}

function exists(relativePath: string): boolean {
  try {
    statSync(resolve(repoRoot, relativePath))
    return true
  } catch {
    return false
  }
}

function isDirectory(relativePath: string): boolean {
  try {
    return statSync(resolve(repoRoot, relativePath)).isDirectory()
  } catch {
    return false
  }
}

function isFile(relativePath: string): boolean {
  try {
    return statSync(resolve(repoRoot, relativePath)).isFile()
  } catch {
    return false
  }
}

/**
 * UI component and style frameworks the requirement forbids: the app is styled
 * with plain CSS in src/index.css and nothing else.
 */
const FORBIDDEN_UI_FRAMEWORKS = [
  '@mui/material',
  '@mui/core',
  '@material-ui/core',
  '@chakra-ui/react',
  '@mantine/core',
  '@radix-ui/themes',
  '@fluentui/react',
  '@blueprintjs/core',
  '@ant-design/icons',
  'antd',
  'bootstrap',
  'react-bootstrap',
  'bulma',
  'foundation-sites',
  'materialize-css',
  'semantic-ui-react',
  'semantic-ui-css',
  'primereact',
  'primeng',
  'tailwindcss',
  'daisyui',
  'windicss',
  'unocss',
  '@emotion/react',
  '@emotion/styled',
  'styled-components',
  'styled-jsx',
  'sass',
  'node-sass',
  'less',
  'stylus',
  'bulma-extensions',
  'shadcn-ui',
  'flowbite',
  'flowbite-react'
]

it('declares the mandated stack and no UI framework', async () => {
  const manifest = readJson('package.json')
  const lock = readJson('package-lock.json')

  const dependencies: Record<string, string> = manifest.dependencies ?? {}
  const devDependencies: Record<string, string> = manifest.devDependencies ?? {}

  // --- the mandated runtime stack, in package.json ------------------------
  expect(Object.keys(dependencies)).toEqual(
    expect.arrayContaining(['react', 'react-dom', 'react-router-dom', 'zustand'])
  )
  expect(majorOf(dependencies.react)).toBe(18)
  expect(majorOf(dependencies['react-dom'])).toBe(18)
  expect(majorOf(dependencies['react-router-dom'])).toBe(6)
  expect(dependencies.zustand).toBeTruthy()
  expect(devDependencies.vite).toBeTruthy()

  // --- the same stack, resolved in the lockfile ---------------------------
  expect(lock.lockfileVersion).toBeGreaterThanOrEqual(2)
  const lockPackages: Record<string, { version?: string; dependencies?: Record<string, string> }> =
    lock.packages ?? {}

  const resolvedVersion = (name: string): string => {
    const entry = lockPackages[`node_modules/${name}`]
    expect(entry, `${name} is missing from package-lock.json`).toBeTruthy()
    return String(entry!.version)
  }

  expect(majorOf(resolvedVersion('react'))).toBe(18)
  expect(majorOf(resolvedVersion('react-dom'))).toBe(18)
  expect(majorOf(resolvedVersion('react-router-dom'))).toBe(6)
  expect(resolvedVersion('zustand')).toMatch(/^\d+\./)
  expect(resolvedVersion('vite')).toMatch(/^\d+\./)

  // The lockfile's record of the root package has to agree with the manifest,
  // so a hand-edited manifest cannot claim a stack the lockfile never locked.
  const lockRoot = lockPackages[''] ?? {}
  expect(lockRoot.dependencies ?? {}).toMatchObject({
    react: dependencies.react,
    'react-dom': dependencies['react-dom'],
    'react-router-dom': dependencies['react-router-dom'],
    zustand: dependencies.zustand
  })

  // --- and no UI component or style framework anywhere -------------------
  const declared = [...Object.keys(dependencies), ...Object.keys(devDependencies)]
  const installed = Object.keys(lockPackages)
    .filter((key) => key.startsWith('node_modules/'))
    .map((key) => key.slice('node_modules/'.length))

  const offendersDeclared = declared.filter((name) => FORBIDDEN_UI_FRAMEWORKS.includes(name))
  const offendersInstalled = installed.filter((name) => FORBIDDEN_UI_FRAMEWORKS.includes(name))

  expect(offendersDeclared, 'package.json declares a UI framework').toEqual([])
  expect(offendersInstalled, 'package-lock.json resolves a UI framework').toEqual([])
})

it('mandated directory layout exists', () => {
  // The single stylesheet, and nothing but plain CSS.
  expect(isFile('src/index.css'), 'src/index.css must exist').toBe(true)
  expect(readFileSync(resolve(repoRoot, 'src/index.css'), 'utf8').trim().length).toBeGreaterThan(0)

  // The four mandated source directories.
  for (const directory of ['src/data', 'src/agents', 'src/store', 'src/pages']) {
    expect(isDirectory(directory), `${directory} must exist and be a directory`).toBe(true)
  }

  // The agent entry point, by name.
  expect(isFile('src/agents/invoiceAgent.ts'), 'src/agents/invoiceAgent.ts must exist').toBe(true)

  // Each mandated directory actually holds the module the layout is for.
  expect(exists('src/data/seedInvoices.ts')).toBe(true)
  expect(exists('src/store/invoiceStore.ts')).toBe(true)
  expect(exists('src/pages/InvoicesPage.tsx')).toBe(true)
  expect(exists('src/pages/InvoiceDetailPage.tsx')).toBe(true)

  // The agent entry point exports a callable agent.
  const agentSource = readFileSync(resolve(repoRoot, 'src/agents/invoiceAgent.ts'), 'utf8')
  expect(agentSource).toMatch(/export\s+(async\s+)?function\s+runInvoiceAgent/)
})

it('vitest runs jsdom over tests/**', async () => {
  const config = (await import('../../vitest.config')).default as {
    test?: { environment?: string; include?: string[] }
  }

  expect(config.test, 'vitest.config.ts must declare a test block').toBeTruthy()
  expect(config.test!.environment).toBe('jsdom')

  const include = config.test!.include ?? []
  expect(include).toContain('tests/**/*.test.{ts,tsx}')

  // The glob is not merely declared: it resolves real files under tests/**,
  // this one among them.
  const matched = await glob(include, { cwd: repoRoot, absolute: false })
  expect(matched.length).toBeGreaterThan(0)
  expect(matched).toContain('tests/project/scaffold.test.ts')
  for (const file of matched) {
    expect(file.startsWith('tests/')).toBe(true)
    expect(file).toMatch(/\.test\.tsx?$/)
  }

  // And the environment the suite is actually executing in is jsdom.
  expect(typeof document).toBe('object')
  expect(typeof window).toBe('object')
  expect(navigator.userAgent).toMatch(/jsdom/i)
})

it('renders the app shell with Testing Library in jsdom', () => {
  // This file is .ts, not .tsx, so the element tree is built with
  // createElement rather than JSX.
  render(
    createElement(MemoryRouter, { initialEntries: ['/invoices'] }, createElement(App))
  )

  expect(screen.getByRole('heading', { name: 'Invoices', level: 1 })).toBeInTheDocument()
  expect(screen.getByText('HiveProcure')).toBeInTheDocument()
})
