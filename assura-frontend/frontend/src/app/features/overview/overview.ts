import { Component } from '@angular/core';

@Component({
    selector: 'app-overview',
    standalone: true,
    template: `
    <div style="padding: 24px;">
      <h1 style="font-family: 'Jost', sans-serif;">Overview</h1>
      <p style="font-family: 'Jost', sans-serif; color: #666;">This is the dashboard overview page.</p>
    </div>
  `
})
export class OverviewComponent { }
