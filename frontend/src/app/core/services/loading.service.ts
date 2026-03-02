import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private loadingCount = signal(0);

    readonly isLoading = () => this.loadingCount() > 0;

    show() {
        this.loadingCount.update(c => c + 1);
    }

    hide() {
        this.loadingCount.update(c => Math.max(0, c - 1));
    }
}
