import { Component } from '@angular/core';

@Component({
    selector: 'app-my-assets',
    standalone: true,
    template: `
    <div style="padding: 24px;">
      <h1 style="font-family: 'Jost', sans-serif;">My Assets</h1>
      <p style="font-family: 'Jost', sans-serif; color: #666;">This page will display your active assets.</p>
    </div>
  `
})
export class MyAssetsComponent { }
