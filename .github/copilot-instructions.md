# Assura Frontend - AI Coding Agent Instructions

## Project Overview
Assura is an enterprise Fixed Assets Management System (FAMS) with a **role-based Angular frontend** (standalone components) that communicates with a .NET Core backend API. The system manages the complete lifecycle of organizational assets (registration, assignment, depreciation, disposal) across **10 distinct user roles** (HR Manager, Storekeeper, Procurement Manager, Superintendent, Accountant, Auditor, Admin, Employee, Division Head).

## Architecture Principles

### Shell + Feature Module Pattern
- **Shell wrapper** (`features/shell/`) provides the authenticated layout (navbar, sidebar, outlet) for all role-specific features
- **Auth module** (`features/auth/`) is the ONLY feature outside the Shell (public login/signup pages)
- All authenticated routes are children of `ShellComponent` in [app.routes.ts](frontend/src/app/app.routes.ts)

### Feature Module Structure (Mandatory)
Every feature follows this exact structure:
```
features/{feature-name}/
├── components/     # Presentational components (feature-specific)
├── models/         # Interfaces, types, enums (feature-specific)
├── pages/          # Smart/routed components (each page is a folder)
├── services/       # API calls and business logic
└── {feature}.routes.ts  # Lazy-loaded route definitions
```

**Example:** `features/inventory/pages/manage-assets/manage-assets.ts` (component files use base name, not `.component.ts`)

### Role-Based Access Control (RBAC)
- **Roles defined in:** [core/constants/roles.ts](frontend/src/app/core/constants/roles.ts) (use `ROLES.STOREKEEPER`, not hardcoded strings)
- **JWT authentication:** Token stored in localStorage as `access_token`, role extracted from JWT claims
- **Route protection:** Use `roleGuard` in route definitions (currently placeholder - needs implementation)
- **UI conditionals:** Use `*appHasRole` directive to show/hide elements:
  ```html
  <button *appHasRole="ROLES.STOREKEEPER">Add Asset</button>
  <div *appHasRole="[ROLES.HR, ROLES.ADMIN]">Multiple roles</div>
  ```

## Key Conventions

### Component Naming
- Files: `{name}.ts` (not `.component.ts`), `{name}.html`, `{name}.css`
- Selector: `app-{name}` (e.g., `app-data-table`)
- **All components are standalone** - import required modules directly in component metadata

### Routing
- Features use **lazy loading** with `loadChildren` pointing to `{feature}.routes.ts`
- Shell routes registry: [shell.routes.ts](frontend/src/app/features/shell/shell.routes.ts) (currently commented out - uncomment as features are built)
- Auth routes separate: `path: 'auth'` in root routes

### API Communication
- **Use ApiService** ([core/services/api.service.ts](frontend/src/app/core/services/api.service.ts)) for all HTTP calls:
  ```typescript
  this.apiService.get<Asset[]>('inventory/assets')
  this.apiService.post<Asset>('inventory/assets', newAsset)
  ```
- Base URL: `environment.apiUrl` (defaults to `https://localhost:5171/api`)
- Token injection handled by `AuthInterceptor` (ensure it's registered in providers)

### Shared Components
Use these reusable components from `shared/components/`:
- **`<app-data-table>`** - Sortable tables with pagination ([data-table.ts](frontend/src/app/shared/components/data-table/data-table.ts))
  - Input: `columns: ColumnDef[]`, `data: any[]`
  - Output: `(rowClick)="handleClick($event)"`
- **`<app-action-button>`** - Styled buttons with variants (primary, secondary, danger)
- **`<app-status-badge>`** - Color-coded status indicators (Active=green, Pending=orange)
- **`<app-search-bar>`** - Debounced search input
- **`<app-filter-dropdown>`** - Multi-select filter

**Rule:** If a component is used in >1 feature, move it to `shared/components/`.

## Development Workflow

### Running the Application
```bash
cd frontend
npm install
npm start  # Runs on http://localhost:4200
```
**Important:** Always `cd frontend` first - Angular project is nested in `frontend/` directory.

### Code Quality
- **Linting:** `npm run lint` (ESLint with Angular rules)
- **Formatting:** `npm run format` (Prettier with 100 char width, single quotes)
- **Testing:** `npm test` (Karma/Jasmine)

### Git Workflow (from [CONTRIBUTING.md](CONTRIBUTING.md))
- **Branches:** `feature/{description}`, `bugfix/{description}`, `refactor/{description}`
- **Commits:** Conventional Commits format (`feat:`, `fix:`, `refactor:`, `docs:`)

## Current State & TODOs

### Implemented
- JWT auth service with role extraction ([auth.service.ts](frontend/src/app/core/auth/auth.service.ts))
- Shell layout structure
- Shared component library (data-table, status-badge, action-button)
- HasRole directive for UI-level role checks
- Feature module scaffolding (10 role-based features)

### Not Yet Implemented (check before assuming functionality)
- **Role guard:** [role.guard.ts](frontend/src/app/core/guards/role.guard.ts) is a placeholder (returns `true` for all routes)
- **Feature routes:** All routes in [shell.routes.ts](frontend/src/app/features/shell/shell.routes.ts) are commented out
- **Auth interceptor:** Needs registration in `app.config.ts` providers
- **Individual feature pages:** Most feature modules have empty route files

### When Adding New Features
1. Create page component in `features/{role}/pages/{page-name}/{page-name}.ts`
2. Define route in `features/{role}/{role}.routes.ts` with `loadComponent`
3. Uncomment/add route in [shell.routes.ts](frontend/src/app/features/shell/shell.routes.ts)
4. Add role guard: `canActivate: [roleGuard], data: { roles: [ROLES.STOREKEEPER] }`
5. Use `ApiService` for backend calls, `*appHasRole` for conditional UI

## Backend Integration
- **.NET Core API** on `https://localhost:5171/api`
- **JWT claims:** Look for role in `decoded.role` or `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`
- **CORS:** Ensure backend allows `http://localhost:4200` in development

## Dependencies
- **Angular 21** (standalone components, signals)
- **Angular Material 21** for UI components
- **Chart.js + ng2-charts** for analytics dashboards
- **jwt-decode** for token parsing (no auth library - manual implementation)

## Questions to Resolve
- Should role guard redirect to `/unauthorized` or back to dashboard?
- Are there specific API response structures (e.g., wrapped in `{ data, status, message }`)?
- Which roles can access the `employee` feature (appears to be shared)?
