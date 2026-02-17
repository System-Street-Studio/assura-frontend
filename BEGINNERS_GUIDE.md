# 👶 Beginner's Guide: Creating a New Feature Page

Welcome to Assura Frontend! This guide provides **Copy-Paste Templates** so you can build pages quickly without worrying about complex setup.

---

## 1. ⚡ Quick Start: Standard Page Template

**Scenario:** You need to create a page for **"Manage Assets"** (Inventory Module).
**Goal:** A page with a Title, a "Create" button, and a Data Table.

### Step 1: Create the Component
Run this command in terminal:
```bash
ng g c features/inventory/pages/manage-assets --standalone
```

### Step 2: Copy-Paste this Code (`manage-assets.ts`)

Replace the content of your new `.ts` file with this:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// 1. Import Shared Components
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';

@Component({
  selector: 'app-manage-assets',
  standalone: true,
  // 2. Add imports here
  imports: [CommonModule, ActionButtonComponent, DataTableComponent, HasRoleDirective],
  template: `
    <!-- 🟢 PAGE LAYOUT CONTAINER -->
    <div class="p-6 bg-gray-50 h-full">

      <!-- 🟢 HEADER & ACTIONS -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Manage Assets</h1>
          <p class="text-gray-600">View and manage inventory items</p>
        </div>
        
        <!-- Only Admins or Storekeepers can see this button -->
        <div *appHasRole="['Admin', 'Storekeeper']">
          <app-action-button 
            label="Add New Asset" 
            icon="+" 
            variant="primary"
            (action)="onCreate()">
          </app-action-button>
        </div>
      </div>

      <!-- 🟢 DATA TABLE -->
      <div class="bg-white rounded-lg shadow">
        <app-data-table 
          [columns]="columns" 
          [data]="assets"
          (rowClick)="onRowClick($event)">
        </app-data-table>
      </div>

    </div>
  `
})
export class ManageAssetsComponent {
  // 🟢 COLUMN CONFIGURATION
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Asset Name' },
    { key: 'status', label: 'Status' },
    { key: 'value', label: 'Value ($)' }
  ];

  // 🟢 MOCK DATA (Connect to API Service later)
  assets = [
    { id: 1, name: 'Dell Laptop', status: 'Active', value: 1200 },
    { id: 2, name: 'Office Chair', status: 'In Use', value: 300 },
  ];

  onCreate() {
    console.log('Create button clicked!');
    // TODO: Open Modal or Navigate
  }

  onRowClick(item: any) {
    console.log('Row clicked:', item);
    // TODO: Navigate to details
  }
}
```

---

## 2. 🐚 How the Shell Works

**Question:** "Where do I put the Navbar and Sidebar?"
**Answer:** **You don't!**

The `ShellComponent` stays `fixed` on the screen. Your page (`ManageAssetsComponent`) is automatically loaded inside the **Main Content Area**.

**Just focus on your page content.** The layout is handled for you.

---

## 3. 🧩 Using Shared Components

| Component | Code Snippet | Use When... |
|---|---|---|
| **Action Button** | `<app-action-button label="Save" (action)="save()"></app-action-button>` | You need a standardized primary button. |
| **Data Table** | `<app-data-table [data]="list" [columns]="cols"></app-data-table>` | You need to display a list of items. |
| **Has Role** | `<div *appHasRole="'Admin'">...</div>` | You need to hide something from non-Admins. |

---

## 4. 🚀 Common Commands

- **Run App:** `npm start` (Open `localhost:4200`)
- **Run Tests:** `npm run test`
- **Lint Code:** `npm run lint` (Fixes style issues)

*Created for the Assura Team 2026*
