Project: simple-point-of-sale — Developer Guidelines (Client)

This document captures project-specific notes to speed up development and reduce friction when building, testing, and debugging the Client (React) portion of the repository.

Scope: Focused on the client/ workspace which contains a React + TypeScript application bundled with Vite. The server-side service/ workspace is documented separately in service/guidelines.md.


1. Build and Configuration Instructions

- Workspace layout
  - client/: React app (Vite, TS, ESLint). The service/ directory is separate and not covered here.
  - Entry points: index.html (HTML shell), src/main.tsx (bootstraps React), src/App.tsx (root component).

- Toolchain
  - React 19 with react-dom 19.
  - Vite 7 for dev server and build pipeline.
  - TypeScript 5.8 with strict settings (see tsconfig.app.json).
  - ESLint 9 configured via eslint.config.js with @eslint/js, typescript-eslint, react-hooks, and react-refresh rules.

- Install
  - cd client
  - npm install

- Running locally (development server with HMR)
  - npm run dev
  - Default dev server URL: http://localhost:5173/
  - You can change the dev server port/host via CLI flags:
    - npm run dev -- --port 5174
    - npm run dev -- --host 0.0.0.0

- Build (for deployment)
  - npm run build
  - Output is placed in client/dist
  - Preview the production build locally:
    - npm run preview
    - Default preview URL: http://localhost:4173/

- TypeScript configuration
  - tsconfig.json uses project references to tsconfig.app.json (app code) and tsconfig.node.json (Vite config).
  - tsconfig.app.json:
    - target ES2022, lib includes DOM/DOM.Iterable.
    - moduleResolution: bundler; jsx: react-jsx; strict: true; noEmit: true.
  - tsconfig.node.json:
    - for Vite config typing (vite.config.ts); noEmit: true.

- Environment variables
  - Vite exposes variables that start with VITE_ to the client code.
  - Define env values in .env, .env.local, or mode-specific files. Examples:
    - VITE_API_BASE_URL="http://localhost:8080"
  - Access in code via import.meta.env.VITE_API_BASE_URL.


2. Testing Information

- Test stack
  - Vitest 2 for the test runner, configured in vite.config.ts under the test key.
  - React Testing Library (@testing-library/react) for rendering and querying.
  - @testing-library/jest-dom extends expect with DOM-specific matchers.
  - jsdom provides a browser-like DOM environment for component tests.

- Commands
  - Run all tests once: npm test
  - Watch mode: npm run test:watch
  - Coverage (text + lcov): npm run test:coverage
  - Optional UI runner: npm run test:ui

- File locations and naming
  - Place tests alongside components or in dedicated folders, e.g.:
    - src/**/*.test.tsx (recommended)
    - src/**/*.test.ts
  - Example provided: src/App.test.tsx

- Test environment and setup
  - Configured to use jsdom and global test APIs (it, expect) via vite.config.ts test.globals=true.
  - Global setup file: src/test/setup.ts
    - Imports @testing-library/jest-dom/vitest to register matchers like toBeInTheDocument, toHaveTextContent.

- Writing component tests
  - Render with render from @testing-library/react; query via screen.getByRole/getByText.
  - Prefer role-based queries and accessible names; avoid brittle selectors.
  - Example pattern:
    import { render, screen } from '@testing-library/react'
    import App from './App'
    it('renders heading', () => {
      render(<App />)
      expect(screen.getByRole('heading', { name: /vite \+ react/i })).toBeInTheDocument()
    })

- Tips for reliable tests
  - Avoid depending on implementation details (class names, internal state).
  - If you add async behavior, use findBy*/waitFor and user-event; clean up happens automatically per test.
  - If you introduce MSW for API mocking, initialize it from src/test/setup.ts and stop it in cleanup.

- TypeScript integration
  - tsconfig.app.json includes types: ["vitest", "vite/client"] so IDEs know global test types.


3. Additional Development Information

- Interacting with the service API
  - The service app (Deepkit) typically runs at http://localhost:8080 in development (see service/guidelines.md).
  - Consider configuring an env variable such as VITE_API_BASE_URL to point to the service.
  - For fetch/axios calls, prefer reading the base URL from import.meta.env to simplify switching between dev and prod.

- CORS / proxying
  - If the service enforces CORS and you encounter cross-origin issues during local development, you can:
    - Enable CORS on the service; or
    - Add a Vite dev server proxy in vite.config.ts (not currently configured). Example:
      import { defineConfig } from 'vite'
      export default defineConfig({
        server: { proxy: { '/api': 'http://localhost:8080' } },
      })

- Code style and structure
  - Strict TypeScript is enabled. Prefer explicit types and keep components small.
  - React hooks linting is enabled; follow exhaustive-deps and rules-of-hooks to avoid runtime issues.

- Dependency management
  - Keep React and Vite plugins in sync with Vite 7.
  - Run npm run lint to check code quality; adjust eslint.config.js if you need type-aware rules (see client/README.md for examples).

- Common pitfalls
  - Forgetting to prefix env vars with VITE_ means they won’t be exposed to client code.
  - Changing dev server port without updating any external references (e.g., OAuth redirect URIs) can cause local auth/integration issues.
  - Importing server-only code into the client bundle will fail; keep service types/APIs isolated behind HTTP/RPC calls.


Appendix: Frequently Used Commands
- Install: cd client && npm install
- Run dev server: npm run dev
- Change dev port: npm run dev -- --port 5174
- Lint: npm run lint
- Build: npm run build
- Preview production build: npm run preview
- Run tests: npm test
- Watch tests: npm run test:watch
- Coverage: npm run test:coverage

Verified status
- As of 2025-08-25, the client app builds, the Vitest test runner is configured (jsdom + RTL), and the example test src/App.test.tsx passes locally.
