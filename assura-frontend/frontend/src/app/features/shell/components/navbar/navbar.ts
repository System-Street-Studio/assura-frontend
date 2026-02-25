import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './navbar.html',
    styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
    title: string = 'Discarded Notes';

    constructor(private router: Router) { }

    ngOnInit() {
        this.updateTitle(this.router.url);
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.updateTitle(event.urlAfterRedirects);
        });
    }

    private updateTitle(url: string) {
        if (url.includes('overview')) this.title = 'Overview';
        else if (url.includes('my-assets')) this.title = 'My Assets';
        else if (url.includes('discarded-notes')) this.title = 'Discarded Notes';
        else if (url.includes('buyer')) this.title = 'Buyer';
    }

    toggleMenu() {
        // TODO: emit event to toggle sidebar
    }

    goToRoleSelect() {
        this.router.navigate(['/']);
    }
}