import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')

/**
 * This spec runs `npm test` as a child process, and `npm test` is this very suite.
 * The child is told it is the nested run through this environment variable and
 * returns immediately instead of spawning a third level.
 */
const NESTED_FLAG = 'HIVE_AC1_NESTED'
const isNestedRun = process.env[NESTED_FLAG] === '1'

type RunResult = {
  command: string
  status: number | null
  signal: NodeJS.Signals | null
  output: string
}

function childEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {}
  for (const [key, value] of Object.entries(process.env)) {
    // Drop the parent runner's own markers so the child starts clean.
    if (key.startsWith('VITEST')) continue
    env[key] = value
  }
  env[NESTED_FLAG] = '1'
  env.CI = '1'
  return env
}

function run(args: string[]): RunResult {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const result = spawnSync(npm, args, {
    cwd: repoRoot,
    env: childEnv(),
    encoding: 'utf8',
    timeout: 480_000,
    maxBuffer: 64 * 1024 * 1024,
  })

  return {
    command: `npm ${args.join(' ')}`,
    status: result.status,
    signal: result.signal,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  }
}

function describeResult(result: RunResult): string {
  const tail = result.output.split('\n').slice(-40).join('\n')
  return `${result.command} exited with status=${String(result.status)} signal=${String(
    result.signal,
  )}\n--- output (last 40 lines) ---\n${tail}`
}

it(
  'npm test and npm run build exit 0',
  () => {
    if (isNestedRun) {
      // Nested invocation: the outer run is the one asserting the exit codes.
      expect(process.env[NESTED_FLAG]).toBe('1')
      return
    }

    // Given: a clean checkout with dependencies installed.
    expect(
      existsSync(resolve(repoRoot, 'node_modules')),
      'dependencies must be installed (npm install)',
    ).toBe(true)
    expect(existsSync(resolve(repoRoot, 'node_modules', '.bin'))).toBe(true)

    // When: npm test and npm run build are run in sequence.
    const testRun = run(['test'])
    const buildRun = testRun.status === 0 ? run(['run', 'build']) : null

    // Then: both processes exit with code 0.
    expect(testRun.status, describeResult(testRun)).toBe(0)
    expect(buildRun, 'npm run build must have been reached').not.toBeNull()
    expect((buildRun as RunResult).status, describeResult(buildRun as RunResult)).toBe(0)
  },
  600_000,
)
