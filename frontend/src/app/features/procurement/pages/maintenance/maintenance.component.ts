import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-procurement-maintenance',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="page-container">
      <h2 class="page-title">Maintenance</h2>
      <p class="coming-soon">Coming soon...</p>
    </div>
  `,
    styles: [`
    .page-container { padding: 2rem; }
    .page-title { font-family: 'Jost', sans-serif; font-size: 1.8rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem; }
    .coming-soon { color: #666; font-family: 'Jost', sans-serif; }
  `]
})
export class ProcurementMaintenanceComponent { }
