# Assura Frontend - Developer Guide 📘

This guide explains the architecture of our **Shell** and **Shared** modules. Use this as a reference when developing new features to ensure consistency.

---

## 1. 🐚 Shell Architecture (`src/app/features/shell`)

The **Shell** is the main layout for authenticated users. It wraps every feature page.

### Structure
- **Navbar**: Top header (Search, Notifications, Profile).
- **Sidebar**: Left navigation menu (Role-based links).
- **RouterOutlet**: Where feature pages (Dashboard, Inventory, etc.) are rendered.

> [!TIP]
> For a detailed guide on how to integrate new feature pages with the shell, see [SHELL_INTEGRATION_GUIDE.md](./SHELL_INTEGRATION_GUIDE.md).

---

## 2. 🚀 Feature Modules (`src/app/features`)

Each folder corresponds to a specific **User Role** or **Functional Area**.

| Folder | Role / Purpose | Key Features |
|---|---|---|
| **`auth`** | Public Access | Login, Forgot Password. No Shell layout. |
| **`shell`** | Layout Wrapper | The main layout wrapper. |
| **`employee`** | **All Staff** | Common portal for everyone. |
| **`hr`** | **HR Manager** | Specific manager portals. |
| **`inventory`** | **Storekeeper** | Specific manager portals. |
| **`procurement`** | **Procurement Mgr** | Supplier Management, Tenders, Purchase Orders. |
| **`maintenance`** | **Maintenance** | General Maintenance Tasks. |
| **`superintendent`** | **Superintendent** | Asset Discarding, Repairs, Disposal Notes. |
| **`approvals`** | **Division Head** | Approve/Reject functionality for requests. |
| **`reporting`** | **Auditor** | Reports, Analytics, Logs. |
| **`accountant`** | **Accountant** | Asset Valuation, Depreciation, Financial Audit. |

---

### Standard Feature Structure
Every feature module follows this strict directory structure:

```
src/app/features/[feature-name]/
├── components/    # Dumb/Presentational components specific to this feature
├── models/        # Interfaces, Types, Enums
├── pages/         # Smart/routed components (Top-level views)
├── services/      # Feature-specific services/API calls
└── [feature].routes.ts  # Routing configuration
```

**Example:** `src/app/features/inventory/pages/manage-assets/`

---

### Usage
When creating a new feature route in `app.routes.ts`, wrap it inside the Shell:

```typescript
{
  path: '',
  component: ShellComponent, 
  canActivate: [AuthGuard],
  children: [
    { path: 'dashboard', loadComponent: ... },
    { path: 'inventory', loadComponent: ... }
  ]
}
```

---

## 2. 🧩 Shared Module (`src/app/shared`)

The **Shared** module contains reusable UI components, directives, and pipes.
**Rule:** If a component is used in more than one feature, move it here!

### Components (`shared/components`)

#### 🔘 Action Button (`<app-action-button>`)
Standard button for main actions (Create, Edit, Delete).
- **Inputs**: `label` (string), `icon` (string), `variant` ('primary'|'secondary'|'danger')
- **Outputs**: `action` (event)

#### 📊 Data Table (`<app-data-table>`)
Reusable table with sorting and pagination.
- **Inputs**: `data` (any[]), `columns` (ColumnConfig[])
- **Outputs**: `rowClick`, `sort`

#### 🔍 Search Bar (`<app-search-bar>`)
Standard input with debounce.
- **Outputs**: `search` (string) - emits after user stops typing.

#### 🏷️ Status Badge (`<app-status-badge>`)
Displays status with color coding (e.g., Active = Green, Pending = Orange).
- **Inputs**: `status` (string), `size` ('sm'|'md')

### Directives (`shared/directives`)

#### 🛡️ HasRole (`*appHasRole`)
Conditionally shows elements based on user role.
```html
<div *appHasRole="'Admin'">
  <button>Delete User</button>
</div>
<div *appHasRole="['Admin', 'Manager']">
  <button>Edit User</button>
</div>
```

### Pipes (`shared/pipes`)

#### ✂️ Truncate (`| truncate`)
Shortens long text.
```html
<p>{{ description | truncate:50 }}</p> 
<!-- Output: "This is a long desc..." -->
```

---

## 3. 🛠️ Development Workflow

1.  **New Components**: Always create as `standalone: true`.
2.  **State Management**: Use **Services** with `BehaviorSubject` for global state.
3.  **API Calls**: Use `core/services/api.service.ts` wrappers (get/post/put/delete).

### Adding a New Shared Component
1.  Run `ng g c shared/components/MyComponent --standalone`
2.  Ensure it uses `OnPush` change detection for performance.
3.  Add unit tests in `.spec.ts` file.

### Testing
- Run **Unit Tests**: `npm run test`
- Run **Linting**: `npm run lint`
- Run **Format**: `npm run format`

---

---

## 4. 🌿 Git Branching Strategy

We follow a structured branching model to keep our codebase clean and stable.

### Main Branches
- **`main`**: Production-ready code. Do not push directly to this branch.
- **`develop`**: Integration branch. All new features are merged here first.

### Feature Branches
When working on a specific module, checkout the corresponding feature branch:

| Feature | Branch Name |
|---|---|
| **Auth** | `feature/auth` |
| **Shell** | `feature/shell` |
| **Employee** | `feature/employee` |
| **HR** | `feature/hr` |
| **Inventory** | `feature/inventory` |
| **Procurement** | `feature/procurement` |
| **Maintenance** | `feature/maintenance` |
| **Superintendent** | `feature/superintendent` |
| **Approvals** | `feature/approvals` |
| **Reporting** | `feature/reporting` |
| **Accountant** | `feature/accountant` |

### Workflow
1.  **Checkout** the feature branch: `git checkout feature/inventory`
2.  **Commit** your changes: `git commit -m "feat: added new asset form"`
3.  **Push** to origin: `git push origin feature/inventory`
4.  **Create PR** to merge into `develop`.

---
*Happy Coding! 🚀*
