import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register';
import { AuthService } from '../../../../core/auth/auth.service';
import { Router, provideRouter } from '@angular/router';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

        await TestBed.configureTestingModule({
            imports: [RegisterComponent],
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                provideRouter([])
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with invalid form', () => {
        expect(component.registerForm.valid).toBeFalse();
    });

    it('should validate password match', () => {
        const form = component.registerForm;
        form.patchValue({
            password: 'password123',
            confirmPassword: 'password123'
        });
        // Other fields are required so form is still invalid, but let's check the password match error specifically
        // The validator is on the group level
        expect(form.hasError('mismatch')).toBeFalse();

        form.patchValue({
            password: 'password123',
            confirmPassword: 'otherpassword'
        });
        expect(form.hasError('mismatch')).toBeTrue();
    });

    it('should be valid when all fields are correct', () => {
        const form = component.registerForm;
        form.patchValue({
            firstName: 'John',
            lastName: 'Doe',
            username: 'johndoe',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        });
        expect(form.valid).toBeTrue();
    });

    it('should simulate submission logic', fakeAsync(() => {
        spyOn(window, 'alert').and.stub(); // Stub alert to prevent popup
        const router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate');

        // Mock valid form
        component.registerForm.patchValue({
            firstName: 'John',
            lastName: 'Doe',
            username: 'johndoe',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        });

        component.onSubmit();
        expect(component.isLoading).toBeTrue();

        tick(1500);

        expect(component.isLoading).toBeFalse();
        expect(component.isSuccess).toBeTrue();
    }));
});
