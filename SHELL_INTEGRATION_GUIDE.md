# Shell Component Integration Guide

This guide explains how to use the shell components (Sidebar, Navbar) with every page in the Assura frontend.

## 🏛️ Architectural Overview

The application uses an **Outreach-Shell Pattern** where:
1.  `ShellComponent` (`src/app/features/shell/shell.ts`) contains the layout structure.
2.  `app.routes.ts` defines the high-level routing, wrapping protected paths with the `ShellComponent`.
3.  `shell.routes.ts` acts as the central registry where individual feature routes are plugged in.

---

## 🛠️ Integration Guide for Feature Branches

To ensure your feature pages use the shell components, follow these steps in your branch:

### 1. Define Your Feature Routes
Each feature should have its own routes file (e.g., `src/app/features/my-feature/my-feature.routes.ts`).

```typescript
// src/app/features/my-feature/my-feature.routes.ts
import { Routes } from '@angular/router';
import { MyPageComponent } from './pages/my-page/my-page';

export const myFeatureRoutes: Routes = [
  { path: 'some-page', component: MyPageComponent },
  { path: '', redirectTo: 'some-page', pathMatch: 'full' }
];
```

### 2. Register with the Shell
In your branch, ensure your feature is imported into `src/app/features/shell/shell.routes.ts`.

```typescript
// src/app/features/shell/shell.routes.ts
export const shellRoutes: Routes = [
  {
    path: 'my-feature',
    loadChildren: () => import('../my-feature/my-feature.routes').then(m => m.myFeatureRoutes)
  },
  // ... other features
];
```

### 3. Register Navigation in Sidebar
Add your feature to the `menuItems` array in `src/app/features/shell/components/sidebar/sidebar.ts`.

```typescript
// src/app/features/shell/components/sidebar/sidebar.ts
menuItems: MenuItem[] = [
  // ...
  { 
    label: 'My Feature', 
    icon: 'star', 
    link: 'my-feature/some-page', 
    roles: ['MY_ROLE', 'ADMIN'] // or ['ANY']
  },
];
```

---

## 🔍 Verification

To verify that your page is correctly using the shell:
1.  **Run Locally**: Execute `npm start` and navigate to your feature path.
2.  **Check Layout**: Observe if the Sidebar and Navbar are visible around your content.
