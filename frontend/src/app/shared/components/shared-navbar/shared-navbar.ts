import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shared-navbar',
  standalone: true,
  templateUrl: './shared-navbar.html',
  styleUrls: ['./shared-navbar.css'],
})
export class SharedNavbarComponent {
  @Input() title = 'Human Resource';
}
