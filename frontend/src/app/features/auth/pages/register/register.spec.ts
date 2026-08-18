import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register';
import { AuthService } from '../../../../core/auth/auth.service';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
        authServiceSpy.register.and.returnValue(of({ message: 'ok' }));

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

    it('should call authService.register on submit', fakeAsync(() => {
        const router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate');

        component.registerForm.patchValue({
            firstName: 'John',
            lastName: 'Doe',
            username: '1234567890',
            email: 'john@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        });

        component.onSubmit();
        expect(authServiceSpy.register).toHaveBeenCalled();

        tick(3000);
        expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    }));
});
