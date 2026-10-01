# Threat model — HP-002

- Method: STRIDE
- Option: Single-package app with one unified Vite/Vitest config

One root package.json, one vite.config.ts that carries both the build config and the Vitest test block, and one tsconfig.json covering sources, tests and config files. The five scripts invoke the locally installed vite, vitest and tsc binaries directly with no indirection.

## Spoofing

### Substituted toolchain packages: a spoofed `vite`, `vitest` or `typescript` resolved at install time

Mitigated: Commit `package-lock.json` with integrity hashes and install with `npm ci` rather than `npm install` wherever reproducibility matters; pin the registry explicitly in `.npmrc`, forbid un-scoped internal names, and require review of any new or renamed dependency in a lockfile diff. The five scripts invoke the local `node_modules/.bin` binaries only, so no globally installed look-alike can be picked up.

### Dev server identity: `dev` → bare `vite` inherits whatever host/port the shared config supplies, so a developer cannot tell which origin they are trusting

Mitigated: Keep `server.host` unset (loopback default) in the single `vite.config.ts` and treat `start`'s explicit `--host 127.0.0.1 --port 5173 --strictPort` as the canonical reviewable origin; document that `dev` is loopback-only and reject any config change that introduces `server.host: true` or a proxy to an unverified upstream.

## Tampering

### One config object: a test-only edit (environment, coverage, reporters) silently reshapes the production build

Mitigated: Confine all Vitest settings to the single `test:` key of `vite.config.ts` and forbid test concerns from touching `build`, `define`, `resolve` or `plugins`; gate the file behind code review and add a build smoke check (artifact exists, expected entry/asset names) so a config regression fails `npm run build` rather than shipping.

### Install-time lifecycle scripts can rewrite sources, config or lockfile before any gate runs

Mitigated: Install with `npm ci` plus `--ignore-scripts` by default and allow-list the few packages that genuinely need a postinstall step; run `npm audit signatures`, and verify the working tree is clean (`git status --porcelain`) after install so an install-time mutation is detected before `test`/`build`.

### The five exact command strings in `package.json` are asserted by nothing executable

Accepted: Acceptance criterion 1 is deliberately left to code review in this option. `package.json` is a small, low-churn, highly visible file and every diff to it is reviewed; adding a meta-test that string-matches its own scripts would duplicate the review gate while adding a maintenance surface that breaks on legitimate flag changes. The risk accepted is a silently drifted script string that still exits zero.

## Repudiation

### No pinned CI definition: a claimed green `test`/`build` cannot be attributed, reproduced or disputed

Mitigated: Add a CI job that runs `npm ci && npm run typecheck && npm test && npm run build` on a pinned Node version (recorded in `.nvmrc`/`engines`) and retain its logs and exit codes per commit; require the committed lockfile so 'green' is tied to an exact dependency set rather than to one machine's `npm install` resolution.

## Information disclosure

### Shared build surface leaks internals into client output: source maps, `define`-injected env values, or files served from a widened dev server root

Mitigated: Keep production `build.sourcemap` off (or upload maps to a private sink rather than the published bundle), never use `define`/`import.meta.env` for secrets and restrict client env to the `VITE_` prefix, and leave `server.fs.allow` at the project-root default so the dev server cannot serve files outside the package.

### Test artefacts expose repository and environment detail: coverage reports and Vitest output carry absolute paths, env dumps and failure payloads

Mitigated: Write coverage and reporter output to a git-ignored directory, keep the default non-verbose reporter for local runs, and scrub or avoid logging `process.env` in tests; publish CI logs only to the same trust boundary as the source.

## Denial of service

### `start` uses `--strictPort`, so a single occupied port 5173 makes the script fail outright instead of degrading

Accepted: Hard failure is the intended behaviour: the requirement fixes the origin at 127.0.0.1:5173 so that dependent tooling and documentation can rely on it, and silently drifting to another port would be a worse failure mode than an explicit non-zero exit. The cost is a loud, self-explanatory local error that the developer resolves by freeing the port.

### `build` is gated on `tsc --noEmit` over the config file, so a tooling type error in `vite.config.ts` or a Vitest type-reference drift blocks all builds

Mitigated: Pin exact `vite`, `vitest` and `typescript` versions in the lockfile so type surfaces change only on deliberate upgrade, keep `typecheck` as a separate script so the failure is isolated to the type step rather than attributed to application code, and treat the vitest types reference in `vite.config.ts` as a reviewed, test-covered dependency of the build.

### Unreproducible install: unpinned transitive resolution or registry unavailability makes `npm install` the weakest link in 'green'

Mitigated: Commit the lockfile and use `npm ci` in CI, cache `~/.npm` so a registry outage does not block already-resolved installs, and declare a supported Node range in `engines` so a mismatched runtime fails fast with a clear message instead of producing an obscure test or build failure.

## Elevation of privilege

### Config and test code execute as full-privilege Node: any dependency, test file or plugin runs with the developer's or CI runner's rights

Mitigated: Run install, `test` and `build` in a least-privilege container or dedicated CI identity with no production credentials and no long-lived tokens on the filesystem; combine `--ignore-scripts` with lockfile review so newly introduced executable code is a visible diff, and never grant the build job write access to deployment targets.

### One tsconfig widens the type environment: test-only libs and globals make unsafe application code type-check clean

Mitigated: Keep the shared tsconfig in `strict` mode and set Vitest `globals: false` so tests import from `vitest` explicitly rather than relying on ambient globals; restrict `lib`/`types` to what the Node test environment and the app genuinely need, and add a lint rule barring test-only imports from `src/` so the widened surface cannot be reached by shipped code.
