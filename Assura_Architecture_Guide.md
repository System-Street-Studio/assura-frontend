# Assura Frontend Architecture — Team Teaching Guide

How **Shared components**, **Shell components**, and **Feature modules** connect together.

---

## 1. The Big Picture

The app has **3 main layers** — think of them as nesting dolls:

```
Browser URL
  └── AppComponent  (app.html — just a <router-outlet>)
        └── ShellComponent  (sidebar + navbar + <router-outlet>)
              └── Feature Page  (procurement, hr, inventory, etc.)
```

The **Shared components** (`DataTable`, `Pagination`, `FilterDropdown`, etc.) are **bricks** that any Feature page can pick up and use.

---

## 2. Layer 1 — App Routes (`app.routes.ts`)

This is the **top-level router**. It only knows about two things:

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'auth',                   // 👉 Login/Register — loads WITHOUT the shell
    loadChildren: () => import('./features/auth/auth.routes')...
  },
  {
    path: '',
    component: ShellComponent,      // 👉 Everything else — loads INSIDE the shell
    children: shellRoutes,          // 👈 all authenticated pages come here
  },
  { path: '**', redirectTo: '' }
];
```

**Key insight:** `auth` is outside the shell (no sidebar/navbar). Everything else is a *child* of `ShellComponent`.

---

## 3. Layer 2 — The Shell (`shell.ts` + `shell.routes.ts`)

### What the Shell IS

`ShellComponent` is the **permanent outer frame** — it shows the sidebar and navbar, and has a `<router-outlet>` where feature pages load.

```typescript
// shell.ts — the entire template is just this:
template: `
  <div class="shell-layout">
    <app-sidebar></app-sidebar>        <!-- shell component -->
    <div class="main-area">
      <app-navbar></app-navbar>         <!-- shell component -->
      <main class="content">
        <router-outlet></router-outlet> <!-- feature pages load HERE -->
      </main>
    </div>
  </div>
`
```

### Shell Routes — connecting features

`shell.routes.ts` is the **switchboard** that directs URLs to feature route files:

```typescript
// shell.routes.ts
export const shellRoutes: Routes = [
  { path: 'overview', loadComponent: () => import('./pages/overview/overview')... },

  // Each feature gets its own sub-router:
  { path: 'inventory',     loadChildren: () => import('../inventory/inventory.routes')... },
  { path: 'procurement',   loadChildren: () => import('../procurement/procurement.routes')... },
  { path: 'hr',            loadChildren: () => import('../hr/hr.routes')... },
  { path: 'maintenance',   loadChildren: () => import('../maintenance/maintenance.routes')... },
  { path: 'employee',      loadChildren: () => import('../employee/employee.routes')... },
  // ... and so on for every role/module
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
];
```

> [!IMPORTANT]
> `loadChildren` = **lazy loading**. The feature code is NOT downloaded until the user navigates to that path. This keeps the initial app bundle small.

---

## 4. Layer 3 — Feature Routes (e.g. Procurement)

Each feature has its **own internal router**. Example: `procurement.routes.ts`

```
URL: /procurement/purchase-orders       → PurchaseOrdersComponent
URL: /procurement/purchase-orders/create → PoCreate
URL: /procurement/purchase-orders/:id   → PurchaseOrderDetailsComponent
URL: /procurement/overview              → OverviewComponent
URL: /procurement                       → redirects to /procurement/overview
```

```typescript
// procurement.routes.ts
export const procurementRoutes: Routes = [
  { path: 'purchase-orders',
    loadComponent: () => import('./pages/purchase-orders/purchase-orders.component')... },
  { path: 'purchase-orders/create',
    loadComponent: () => import('./pages/po-create/po-create')... },
  { path: 'purchase-orders/:id',
    loadComponent: () => import('./pages/purchase-order-details/...')... },
  { path: 'overview',
    loadComponent: () => import('./pages/overview/overview.component')... },
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
];
```

**When you add a new page to your feature:** add an entry here. That's it — the shell and app routes don't need to change.

---

## 5. The Shared Components — The Reusable Bricks

Located at: `src/app/shared/components/`

| Component | Selector | What it does |
|---|---|---|
| `DataTableComponent` | `<app-data-table>` | Renders a table from `columns` + `data` inputs |
| `PaginationComponent` | `<app-pagination>` | Prev/Next page controls |
| `FilterDropdownComponent` | `<app-filter-dropdown>` | Filter panel with checkbox groups |
| `SearchBarComponent` | `<app-search-bar>` | Search input field |
| `StatusBadgeComponent` | `<app-status-badge>` | Colored pill for statuses |
| `StatusCardComponent` | `<app-status-card>` | Dashboard summary card |
| `ActionButtonComponent` | `<app-action-button>` | Standard action button with icon |
| `ButtonComponent` | `<app-button>` | Generic button |
| `ConfirmationModalComponent` | — | Delete/confirm dialog |

### How `@Input` / `@Output` work (the contract)

```typescript
// data-table.ts — the shared component DECLARES its contract:
export class DataTableComponent {
  @Input() columns: ColumnDef[] = [];  // Feature sends column definitions IN
  @Input() data: any[] = [];           // Feature sends row data IN
  @Output() rowClick = new EventEmitter<any>(); // Component fires events OUT
}

// pagination.ts
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() pageNumbers: number[] = [];
  @Output() pageChange = new EventEmitter<number>(); // fires when user clicks a page
}
```

---

## 6. How a Feature Page USES Shared Components

Here's the **real example** from `purchase-orders.component.ts`:

### Step A — Import the shared component

```typescript
// purchase-orders.component.ts
import { FilterDropdownComponent, FilterGroup }
    from '../../../../shared/components/filter-dropdown/filter-dropdown';
import { PaginationComponent }
    from '../../../../shared/components/pagination/pagination';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FilterDropdownComponent,   // ← register shared component
    PaginationComponent,       // ← register shared component
  ],
  ...
})
export class PurchaseOrdersComponent { ... }
```

> [!NOTE]
> Because all components are **standalone** (no NgModule), the import path is direct — you just import the class. No module file to edit.

### Step B — Wire up the data in the component class

```typescript
// The feature page manages its own state:
ordersCurrentPage = 1;
ordersPageSize = 5;
get ordersTotalPages() { return Math.ceil(this.orders.length / this.ordersPageSize); }
get ordersPageNumbers() { return Array.from({ length: this.ordersTotalPages }, (_, i) => i + 1); }
get pagedOrders() {
  return this.orders.slice(
    (this.ordersCurrentPage - 1) * this.ordersPageSize,
    this.ordersCurrentPage * this.ordersPageSize
  );
}
goToOrdersPage(page: number) { this.ordersCurrentPage = page; }
```

### Step C — Use the component in the HTML template

```html
<!-- purchase-orders.component.html -->

<!-- Send data IN with [property binding], receive events OUT with (event binding) -->
<app-pagination
  [currentPage]="ordersCurrentPage"
  [totalPages]="ordersTotalPages"
  [pageNumbers]="ordersPageNumbers"
  (pageChange)="goToOrdersPage($event)">   <!-- $event = the page number emitted -->
</app-pagination>

<app-filter-dropdown
  [isOpen]="isFilterOpen"
  [filterGroups]="filterGroups"
  (filterClose)="onFilterClose($event)">
</app-filter-dropdown>
```

---

## 7. The Shell Components (Sidebar & Navbar)

`SidebarComponent` and `NavbarComponent` live inside `features/shell/components/` and are **only used by `ShellComponent`**. They are NOT in the shared folder because they belong to the app frame, not to individual feature pages.

### Sidebar navigation links

The sidebar knows the links for every role. Crucially, it uses Angular `RouterLink` to navigate — when a user clicks "PO", it navigates to `/procurement/purchase-orders` which the shell routes pick up:

```typescript
// sidebar.ts — each menu item declares which roles can see it
menuItems = [
  { label: 'PO', icon: 'receipt_long', link: 'purchase-orders', roles: ['PROCUREMENT'] },
  { label: 'Maintenance', icon: 'build', link: 'maintenance',   roles: ['SUPERINTENDENT'] },
  // ...
];
```

```html
<!-- sidebar.html -->
<a [routerLink]="item.link" routerLinkActive="active">
  {{ item.label }}
</a>
```

---

## 8. Complete URL Flow — End to End

Here is the full journey of navigating to **Purchase Orders**:

```
User clicks "PO" in sidebar
  │
  ▼
RouterLink fires: navigate to '/procurement/purchase-orders'
  │
  ▼
app.routes.ts: path '' → ShellComponent (already rendered, stays put)
  │
  ▼
shell.routes.ts: path 'procurement' → lazy-loads procurement.routes.ts
  │
  ▼
procurement.routes.ts: path 'purchase-orders' → lazy-loads PurchaseOrdersComponent
  │
  ▼
Shell's <router-outlet> renders PurchaseOrdersComponent
  │
  ▼
PurchaseOrdersComponent template uses <app-pagination> and <app-filter-dropdown>
  │
  ▼
Shared components render with the data the feature page passes via @Input
```

---

## 9. Recipe — How to Add a New Feature Page

Suppose **your team member** is adding a "Suppliers" page to the Procurement module:

```typescript
// 1. Create the component file
// features/procurement/pages/suppliers/suppliers.component.ts

// 2. Add the route in procurement.routes.ts
{ path: 'suppliers', loadComponent: () => import('./pages/suppliers/suppliers.component').then(m => m.SuppliersComponent) }

// 3. Import and use shared components inside the new component
import { DataTableComponent } from '../../../../shared/components/data-table/data-table';

@Component({
  standalone: true,
  imports: [DataTableComponent],
  ...
})
export class SuppliersComponent {
  columns = [{ key: 'name', label: 'Name' }, { key: 'contact', label: 'Contact' }];
  data = [ /* your data array */ ];
}
```

```html
<!-- suppliers.component.html -->
<app-data-table [columns]="columns" [data]="data" (rowClick)="onRowClick($event)">
</app-data-table>
```

**That's it.** The shell, sidebar, and router all "just work" — you only touched the feature folder and the feature's own route file.

---

## 10. File Locations Summary

```
src/app/
├── app.routes.ts              ← TOP: auth vs shell split
│
├── features/
│   ├── shell/
│   │   ├── shell.ts           ← THE FRAME (sidebar + navbar + outlet)
│   │   ├── shell.routes.ts    ← connects URL paths to feature modules
│   │   └── components/
│   │       ├── sidebar/       ← navigation links (shell-only)
│   │       └── navbar/        ← top bar (shell-only)
│   │
│   ├── procurement/           ← a feature module
│   │   ├── procurement.routes.ts  ← internal page routing
│   │   ├── pages/             ← each page is a standalone component
│   │   ├── components/        ← procurement-specific sub-components
│   │   ├── services/          ← API calls for this feature
│   │   └── models/            ← TypeScript interfaces/types
│   │
│   └── hr/ inventory/ ...     ← same structure for every feature
│
└── shared/
    └── components/
        ├── data-table/        ← reusable table
        ├── pagination/        ← reusable pager
        ├── filter-dropdown/   ← reusable filter panel
        ├── search-bar/        ← reusable search
        └── status-badge/ ...  ← more reusable bricks
```
