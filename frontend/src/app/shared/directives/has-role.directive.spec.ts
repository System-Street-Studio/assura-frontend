import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AuthService } from '../../core/auth/auth.service';
import { HasRoleDirective } from './has-role.directive';

// Mock component to test the directive
@Component({
    standalone: true,
    imports: [HasRoleDirective],
    template: `
    <div *appHasRole="'Admin'">Admin Content</div>
    <div *appHasRole="'User'">User Content</div>
  `
})
class TestComponent { }

describe('HasRoleDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('AuthService', ['hasRole']);
        // Default behavior for spy
        spy.hasRole.and.returnValue(false);

        await TestBed.configureTestingModule({
            imports: [TestComponent, HasRoleDirective], // Import Standalone Component
            providers: [
                { provide: AuthService, useValue: spy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    });

    it('should display content if user has role', () => {
        authServiceSpy.hasRole.and.callFake((role) => role === 'Admin');

        fixture.detectChanges(); // Trigger change detection

        const adminDiv = fixture.debugElement.query(By.css('div'));
        expect(adminDiv).toBeTruthy();
        expect(adminDiv.nativeElement.textContent).toContain('Admin Content');
    });

    it('should NOT display content if user lacks role', () => {
        authServiceSpy.hasRole.and.returnValue(false);

        fixture.detectChanges();

        const divs = fixture.debugElement.queryAll(By.css('div'));
        expect(divs.length).toBe(0);
    });
});
