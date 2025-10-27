import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./register.component.html",
})
export class RegisterComponent {
  form: FormGroup;
  passwordFieldType = "password";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group(
      {
        name: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        password: ["", Validators.required],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordMatchValidator() }
    );
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType =
      this.passwordFieldType === "password" ? "text" : "password";
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.form.value;
    this.authService.register({ username: name, email, password }).subscribe({
      next: () => {
        this.toast.showSuccess("Registro completado con éxito");
        this.router.navigate(["/products"]);
      },
      error: (err) => {
        const message = err?.error?.message || "Error en el registro";
        this.toast.showError(message);
      },
    });
  }

  private passwordMatchValidator(): ValidatorFn {
    return (form: AbstractControl) => {
      const pass = form.get("password")?.value;
      const confirm = form.get("confirmPassword")?.value;
      return pass && confirm && pass !== confirm
        ? { passwordMismatch: true }
        : null;
    };
  }
}
