Project: simple-point-of-sale — Developer Guidelines (Service)

This document captures project-specific notes to speed up development and reduce friction when building, testing, and debugging the Service (Deepkit) portion of the repository.

Scope: Focused on the service/ workspace which contains a Deepkit-based Node/TypeScript application with HTTP, RPC, and CLI entrypoints and a Jest-based test suite.


1. Build and Configuration Instructions

- Workspace layout
  - service/: Deepkit app (server, tests, build). The client/ directory is separate and not covered here.
  - Entry points: app.ts (CLI + server), client.rpc.ts (example RPC client).

- Node/TypeScript toolchain
  - TypeScript 5.8 with experimentalDecorators enabled.
  - Deepkit requires type reflection; service/tsconfig.json sets "reflection": true and configures module/target appropriately.
  - A post-install hook is defined: "install": "deepkit-type-install". This ensures Deepkit’s type compiler integration is installed/configured for the workspace.

- Install
  - cd service
  - npm install
    - This runs deepkit-type-install automatically via the install script.

- Build (for deployment)
  - npm run build
  - Output is placed in service/dist.
  - Run in production mode:
    - APP_ENVIRONMENT=production node dist/app.js server:start
  - Notes about production:
    - In production (AppConfig.environment === 'production') the logger switches to JSON and Deepkit’s FrameworkModule debug UI is disabled (see app.ts setup()).

- Running locally (no build)
  - Start server via ts-node:
    - npm run app server:start
  - Watch mode reloads on change:
    - npm run app:watch server:start
  - HTTP endpoints (from the example controller):
    - GET /hello/:name  -> returns "Hello <name>!" (max length 6 enforced by Deepkit type constraint)
  - Debug UI (development only):
    - http://localhost:8080/_debug/ (enabled because FrameworkModule({ debug: true }))

- Ports and host configuration
  - APP_FRAMEWORK_PORT to change port (default 8080)
  - APP_FRAMEWORK_HOST to change host (default 0.0.0.0)


2. Testing Information

- Test stack
  - Jest 29 with ts-jest, configured inline in service/package.json.
  - testMatch: **/*.spec.ts
  - testEnvironment: node
  - No pre-building required; ts-jest transpiles TS on-the-fly using service/tsconfig.json (which includes Deepkit reflection support).

- Run all tests
  - cd service
  - npm test

- Writing tests: patterns and helpers
  - Direct unit test (no container):
    - Instantiate dependencies manually (see tests/app.spec.ts with MemoryLoggerTransport + Logger).
  - Using Deepkit’s testing container (no HTTP server):
    - const testing = createTestingApp({ providers: [Service], controllers: [...] });
    - Access resolved instances: testing.app.get(Service)
  - HTTP tests with ephemeral server:
    - await testing.startServer();
    - Use testing.request(HttpRequest.GET('/hello/World'))
    - Always stop the server in finally: await testing.stopServer();
  - RPC tests with ephemeral server:
    - await testing.startServer();
    - const client = testing.createRpcClient();
    - const controller = client.controller<HelloWorldControllerRpc>('/main');
    - await controller.hello('World')
    - finally { await testing.stopServer(); }

- Adding a new test file
  - Location: service/tests/*.spec.ts (Jest picks up automatically).
  - Example minimal test you can copy:
    - File: service/tests/demo.example.spec.ts
      import { test, expect } from '@jest/globals';
      test('demo works', () => { expect(2 + 2).toBe(4); });
  - Then run: npm test
  - Clean up: Remove ad-hoc demo/example files after use if they’re not intended to remain in the repo.

- Tips for reliable tests
  - Always use try/finally around startServer()/stopServer() to avoid port leakage and cross-test interference.
  - Keep RPC/HTTP controller paths consistent with implementation (e.g., @rpc.controller('/main')).
  - For logging assertions, prefer MemoryLoggerTransport to avoid flaky console output checks.

- Verified test suite
  - As of 2025-08-25, the following suites pass locally:
    - tests/app.spec.ts, tests/http.spec.ts, tests/cli.spec.ts, tests/rpc.spec.ts
  - Example “demo” test (arithmetic) was created and executed successfully during preparation, then removed to keep the repo clean.


3. Additional Development Information

- Deepkit specifics
  - Reflection and decorators: Ensure tsconfig "experimentalDecorators": true and "reflection": true remain enabled; required for Deepkit’s type system and DI.
  - AppConfig/environment: APP_ENVIRONMENT toggles behavior (JSON logger and debug UI). Default is development.
  - Controllers: HTTP via @deepkit/http (http.GET) and RPC via @deepkit/rpc (rpc.controller, rpc.action). CLI via @deepkit/app (cli.controller).

- Running the example RPC client
  - With the server running (npm run app server:start):
    - npm run client-rpc
  - The client imports types with import type to avoid pulling server code into the client bundle at runtime.

- Code style and structure
  - Strict TypeScript is enabled ("strict": true). Prefer explicit types, avoid any, and use Deepkit’s type helpers (e.g., MaxLength<6>) to enforce runtime validation.
  - Keep controller methods small; route validation via Deepkit type constraints is encouraged instead of ad-hoc checks.

- Debugging
  - Development debug UI at /_debug/ provides route maps, controllers, and error details when FrameworkModule debug is true.
  - For production logs, expect JSON format; use structured log viewers when tailing production output.

- Dependency management
  - @deepkit/* packages are versioned ^1.0.1. Use npm run update-deepkit to update all Deepkit packages in lockstep.
  - If TypeScript compiler or ts-jest behavior changes, re-run npm install to ensure deepkit-type-install remains properly applied.

- Common pitfalls
  - Forgetting to stop the server in tests will cause subsequent tests to fail due to occupied ports.
  - Changing controller paths (e.g., '/main') without updating tests/clients will break RPC calls silently (404/route mismatch).
  - tsconfig “files” currently lists app.ts and client.rpc.ts for builds; tests are executed via ts-jest and do not need to be in tsconfig.


Appendix: Frequently Used Commands
- Install: cd service && npm install
- Run dev server: npm run app server:start
- Watch server: npm run app:watch server:start
- Run RPC client: npm run client-rpc
- Run tests: npm test
- Build: npm run build && node dist/app.js server:start
