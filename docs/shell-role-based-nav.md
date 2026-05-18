# Role-Based Sidebar & Navbar — Developer Guide

This guide explains how the shell (Sidebar + Navbar) automatically filters navigation items and displays the role based on the logged-in user's JWT token.

---

## How It Works — Big Picture

```
JWT Token (in localStorage)
        │
        ▼
  AuthService.getRoles()       ← reads & normalises roles from JWT
        │
        ├──▶ SidebarComponent  ← filters menu items by primary role
        │
        └──▶ NavbarComponent   ← displays the primary role name
```

---

## Step 1 — AuthService (`auth.service.ts`)

**File:** `src/app/core/auth/auth.service.ts`

The `AuthService` has three key methods:

### `getRoles(): string[]`
Reads the JWT from `localStorage` and returns **all roles** as a string array.
Handles both a single role (`string`) and multiple roles (`string[]`) from .NET:

```typescript
getRoles(): string[] {
  // ...decodes JWT and normalises to string[]
  // e.g. ["Admin", "Procurement"]
}
```

### `getRole(): string | null`
Returns the **first** role — used internally.

### `hasRole(requiredRole): boolean`
Checks whether the user has a specific role. Works with both a single role string or an array.

---

## Step 2 — Sidebar Filtering (`sidebar.ts`)

**File:** `src/app/features/shell/components/sidebar/sidebar.ts`

### MenuItem structure
Every item in `menuItems` has a `roles` array:

```typescript
menuItems: MenuItem[] = [
  { label: 'Overview',  icon: 'home',         link: '/procurement/overview',        roles: ['ANY'] },
  { label: 'PO',        icon: 'receipt_long',  link: '/procurement/purchase-orders', roles: ['PROCUREMENT', 'ADMIN'] },
  { label: 'Suppliers', icon: 'local_shipping',link: '/procurement/suppliers',       roles: ['PROCUREMENT', 'STOREKEEPER', 'ADMIN'] },
  // ...
];
```

| `roles` value | Meaning |
|---|---|
| `['ANY']` | Visible to **all** authenticated users |
| `['PROCUREMENT']` | Only visible to PROCUREMENT users |
| `['PROCUREMENT', 'ADMIN']` | Visible to PROCUREMENT **or** ADMIN |

### `filteredMenuItems` getter
This getter runs the filter logic:

```typescript
get filteredMenuItems(): MenuItem[] {
  const allRoles = this.authService.getRoles();
  // Use the LAST role — the most specific one
  // e.g. ["Admin", "Procurement"] → primary = "PROCUREMENT"
  const primaryRole = allRoles.length > 0
    ? allRoles[allRoles.length - 1].toUpperCase()
    : null;

  return this.menuItems.filter(item =>
    item.roles.includes('ANY') ||
    (primaryRole !== null && item.roles.includes(primaryRole))
  );
}
```

> **Why the last role?**
> When a .NET backend assigns multiple roles (e.g. Admin + Procurement),
> the last role in the JWT array is the most specific/primary one.
> Using only the primary role prevents an "Admin" assignment from
> unlocking all menu items for a Procurement user.

### Template
The sidebar HTML iterates over `filteredMenuItems` — not `menuItems`:

```html
<a *ngFor="let item of filteredMenuItems" class="nav-item" ...>
```

---

## Step 3 — Navbar Role Display (`navbar.ts`)

**File:** `src/app/features/shell/components/navbar/navbar.ts`

```typescript
get roleName(): string {
  const roles = this.authService.getRoles();
  // Show the last (most specific) role, or 'Guest' if unauthenticated
  return roles.length > 0 ? roles[roles.length - 1] : 'Guest';
}
```

The navbar template binds to this getter:

```html
<span class="role-name">{{ roleName }}</span>
```

---

## Step 4 — Adding a New Sidebar Item for Your Role

If you are implementing a new feature and need a new sidebar link, follow these steps:

### 4.1 — Add the menu item in `sidebar.ts`

```typescript
{
  label: 'My New Page',
  icon: 'insert_chart',           // any Material Icon name
  link: '/your-feature/my-page', // absolute route path
  roles: ['YOUR_ROLE']            // uppercase, matches JWT role
}
```

### 4.2 — Make sure the route exists

In your feature's `routes.ts`:

```typescript
{
  path: 'my-page',
  loadComponent: () => import('./pages/my-page/my-page.component')
    .then(m => m.MyPageComponent)
}
```

### 4.3 — Role names must match exactly (case-insensitive)

The sidebar comparison converts JWT roles to **uppercase** before matching.
So `"Procurement"` in the JWT → matches `"PROCUREMENT"` in the `roles` array.

---

## Role → Sidebar Items Quick Reference

| Role | Visible Sidebar Items |
|---|---|
| `PROCUREMENT` | Overview, My Assets, Suppliers, PO, Maintenance, New Arrivals |
| `STOREKEEPER` | Overview, My Assets, Assets, Products, Suppliers, Check In, Check Out, Maintenance, Assets Requests |
| `ADMIN` | Overview, My Assets, Assets, Products, Suppliers, PO, Check In, Check Out, Maintenance, Assets Requests, Track Assets |
| `AUDITOR` | Overview, My Assets, Assets, Check Out, Reports, Audit Logs, Export |
| `HR` | Overview, My Assets, Pending, Assigned |
| `ACCOUNTANT` | Overview, My Assets, Discarded |
| `SUPERINTENDENT` | Overview, My Assets, Discarded Notes |

---

## Files Changed (Summary)

| File | What Changed |
|---|---|
| `core/auth/auth.service.ts` | Added `getRoles()` — handles single and array JWT roles |
| `shell/components/sidebar/sidebar.ts` | `filteredMenuItems` uses primary role; all links are absolute paths |
| `shell/components/sidebar/sidebar.css` | Active item shows left-border indicator instead of blue background |
| `shell/components/navbar/navbar.ts` | `roleName` getter reads last JWT role, falls back to `'Guest'` |

---

## How to Get These Changes into Your Feature Branch

> ✅ **Already done:** The `refactor/shell-auth-wiring` branch has been created, committed, pushed, and merged into `develop` via Pull Request.
>
> 👇 **What YOU need to do** — follow these steps to bring the changes into your own feature branch.

---

### Step 1 — Make sure you have the latest `develop` locally

```bash
git checkout develop
git pull origin develop
```

---

### Step 2 — Switch to your feature branch

```bash
git checkout feature/your-feature-name
```

For example:
```bash
git checkout feature/storekeeper
git checkout feature/hr
git checkout feature/auditor
```

---

### Step 3 — Merge `develop` into your feature branch

```bash
git merge develop
```

This brings in the shell refactoring (AuthService, sidebar filtering, navbar role display) into your branch.

---

### Step 4 — Handle merge conflicts (if any)

If Git shows a conflict, open the conflicted file and resolve it.
To accept the `develop` version of a specific file (recommended for shell files):

```bash
git checkout develop -- src/app/features/shell/components/sidebar/sidebar.ts
git checkout develop -- src/app/features/shell/components/navbar/navbar.ts
git checkout develop -- src/app/core/auth/auth.service.ts
```

---

### Step 5 — Commit the merge

```bash
git add .
git commit -m "merge: bring shell-auth-wiring refactor from develop"
```

---

### Step 6 — Push your updated feature branch

```bash
git push origin feature/your-feature-name
```

---

### What you get after merging

After merging `develop` into your branch, your app will automatically:

- ✅ Show only the sidebar items for your role
- ✅ Display your role name in the navbar
- ✅ Use absolute links in the sidebar (no broken navigation)

---

### Branch Flow (What Already Happened → What You Do)

```
develop  ◀── refactor/shell-auth-wiring  [ALREADY MERGED ✅]
    │
    │  git merge develop
    ▼
feature/your-feature  ← you are here
```

---

### Important Rules

| ✅ Do | ❌ Don't |
|---|---|
| Always merge `develop` into your branch regularly | Don't let your branch fall far behind `develop` |
| Accept `develop` version for shared shell files | Don't rewrite `sidebar.ts` or `auth.service.ts` in your branch |
| Write clear commit messages | Don't commit unrelated changes together |


