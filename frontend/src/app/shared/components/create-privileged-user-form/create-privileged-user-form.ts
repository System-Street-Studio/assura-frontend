import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

export interface CreatePrivilegedUserFormValue {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}

@Component({
    selector: 'app-create-privileged-user-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './create-privileged-user-form.html',
    styleUrls: ['./create-privileged-user-form.css'],
})
export class CreatePrivilegedUserFormComponent {
    private fb = inject(FormBuilder);

    // Fixed attributes the created account will be locked to — shown read-only, never editable.
    roleLabel = input.required<string>();
    divisionLabel = input.required<string>();
    loading = input(false);
    errorMessage = input<string | null>(null);

    formSubmit = output<CreatePrivilegedUserFormValue>();

    form = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: [''],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });

    showPassword = false;
    showConfirmPassword = false;

    private passwordMatchValidator(g: any) {
        return g.get('password').value === g.get('confirmPassword').value
            ? null : { mismatch: true };
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        const { firstName, lastName, username, email, phoneNumber, password } = this.form.value;
        this.formSubmit.emit({
            firstName: firstName!,
            lastName: lastName!,
            username: username!,
            email: email!,
            phoneNumber: phoneNumber || undefined,
            password: password!,
        });
    }
}
