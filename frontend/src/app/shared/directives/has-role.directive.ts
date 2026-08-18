import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Directive({
    selector: '[appHasRole]',
    standalone: true
})
export class HasRoleDirective implements OnInit {
    private currentRole: string | string[] = [];
    private templateRef = inject(TemplateRef<unknown>);
    private viewContainer = inject(ViewContainerRef);
    private authService = inject(AuthService);

    @Input()
    set appHasRole(role: string | string[]) {
        this.currentRole = role;
        this.updateView();
    }

    ngOnInit() {
        this.updateView();
    }

    private updateView() {
        this.viewContainer.clear();
        if (this.authService.hasRole(this.currentRole)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        }
    }
}
