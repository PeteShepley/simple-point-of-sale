Project: simple-point-of-sale — Developer Guidelines (Client)

This document captures project-specific notes to speed up development and reduce friction when building, testing, and debugging the Client (React) portion of the repository.

Scope: Focused on the client/ workspace which contains a React + TypeScript application bundled with Vite. The server-side service/ workspace is documented separately in service/guidelines.md.


1. Build and Configuration Instructions

- Workspace layout
  - client/: React app (Vite, TS, ESLint). The service/ directory is separate and not covered here.
  - Entry points: index.html (HTML shell), src/main.tsx (bootstraps React), src/App.tsx (root component and routes).

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

4. Redux and Redux Toolkit Usage

- Overview
  - We use Redux Toolkit (RTK) for global state management. RTK provides opinionated defaults, immutable updates via Immer, and built-in thunk middleware.
  - React bindings are provided by react-redux.

- Store location and setup
  - Store is created in src/store/index.ts using configureStore.
  - Provider is wired in src/main.tsx:
    import { Provider } from 'react-redux'
    import { store } from './store'
    ;<Provider store={store}> <App /> </Provider>
  - Typed utilities in src/store/hooks.ts:
    - useAppDispatch and useAppSelector should be used instead of raw useDispatch/useSelector.

- Environment configuration for API calls
  - API base URL can be provided via VITE_API_BASE (or VITE_API_BASE_URL). If unset, API helper will use relative paths like /api/menus.
  - Set in .env: VITE_API_BASE="http://localhost:8080"

- Slice structure and best practices
  - Co-locate feature state under src/features/<feature>/.
  - Example: src/features/menu/
    - menuSlice.ts: contains createSlice, async thunks with createAsyncThunk, selectors.
    - types.ts: request/response DTOs that match service/api.yml schemas.
  - State shape guidelines:
    - Keep normalized maps where helpful (e.g., byId) and arrays for listings.
    - Track loading and error flags per slice.
  - Async thunks:
    - Use createAsyncThunk for side effects. Return typed data; handle loading and error flags in extraReducers.
    - Group API helpers in the slice or in a small shared API file.

- Menu slice details (guided by service/api.yml)
  - Endpoints covered:
    - GET /api/menus (fetchMenus)
    - GET /api/menus/{menuId} (getMenu) with optional include=items|all
    - POST /api/menus (createMenu)
    - PUT /api/menus/{menuId} (updateMenu)
    - DELETE /api/menus/{menuId} (deleteMenu)
    - GET /api/menus/{menuId}/items (fetchMenuItems)
    - POST /api/menus/{menuId}/items (createMenuItem)
    - PUT /api/menus/{menuId}/items/{id} (updateMenuItem)
    - DELETE /api/menus/{menuId}/items/{id} (deleteMenuItem)
  - State shape:
    interface MenuState {
      menus: MenuResponse[]
      byId: Record<number, MenuResponse>
      itemsByMenuId: Record<number, MenuItemResponse[]>
      loading: boolean
      error?: string
    }
  - Selectors exported:
    - selectMenus, selectMenuById(id), selectItemsByMenuId(menuId), selectMenuLoading, selectMenuError

- Example usage in a component
  - Fetch all menus on mount and render:
    import { useEffect } from 'react'
    import { useAppDispatch, useAppSelector } from '../../store/hooks'
    import { fetchMenus, selectMenus, selectMenuLoading } from './menuSlice'

    export function MenuList() {
      const dispatch = useAppDispatch()
      const menus = useAppSelector(selectMenus)
      const loading = useAppSelector(selectMenuLoading)

      useEffect(() => { void dispatch(fetchMenus()) }, [dispatch])
      if (loading) return <p>Loading...</p>
      return (
        <ul>
          {menus.map(m => <li key={m.id}>{m.name}</li>)}
        </ul>
      )
    }

- Testing slices and thunks
  - Prefer testing via components or by exercising reducers with plain actions.
  - For thunks, you can mock fetch; or use MSW for integration-like tests in jsdom.

Verified status
- As of 2025-08-25, the client app builds, the Vitest test runner is configured (jsdom + RTL), and the example test src/App.test.tsx passes locally.
- Redux Toolkit is configured with a Menu slice and global store. Use the examples above to add more slices.

5. Routing (React Router)

- We use react-router-dom v7 with BrowserRouter.
- Router is initialized in src/main.tsx surrounding <App />.
- Routes are declared in src/App.tsx:
  - "/" → LandingPage (src/pages/LandingPage.tsx)
  - "/menus" → MenuListPage (src/pages/MenuListPage.tsx) – lists menu titles and links to details.
  - "/menus/new" → NewMenuPage (src/pages/NewMenuPage.tsx) – create a new menu and redirect to edit items.
  - "/menus/:id" → MenuDetailPage (src/pages/MenuDetailPage.tsx) – fetches and displays a full menu (with items).
  - "/menus/:id/edit" → MenuEditPage (src/pages/MenuEditPage.tsx) – add, edit, and remove items in a menu.
- Navigation helpers: use <Link> for client-side navigation; use useParams to read route params.
- Data flow:
  - MenuListPage dispatches fetchMenus on mount if menus are not loaded, renders titles with links, and provides a link to create a new menu.
  - NewMenuPage dispatches createMenu and navigates to /menus/:id/edit on success.
  - MenuDetailPage reads the id param, dispatches getMenu({ include: 'all' }) if details aren’t present, and renders menu description and items. It also provides a Delete Menu button that confirms, deletes the menu (and its items), and navigates back to the list.
  - MenuEditPage reads the id param, fetches the full menu if needed, and uses thunks createMenuItem, updateMenuItem, deleteMenuItem to mutate items.
 - API base URL for fetches comes from VITE_API_BASE (default http://0.0.0.0:8080 in the slice helper).
