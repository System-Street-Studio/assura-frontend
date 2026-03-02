import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private loadingService = inject(LoadingService);
  protected readonly title = signal('frontend');

  isLoading = this.loadingService.isLoading;
}
