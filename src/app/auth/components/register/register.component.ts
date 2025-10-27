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
  styleUrls: [],
})
export class RegisterComponent {
  public form: FormGroup;
  public passwordFieldType: string = "password";

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.form = this.formBuilder.group(
      {
        name: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        password: ["", Validators.required],
        confirmPassword: ["", Validators.required],
      },
      {
        validators: this.passwordMatchValidator(),
      }
    );
  }

  public togglePasswordVisibility(): void {
    this.passwordFieldType =
      this.passwordFieldType === "password" ? "text" : "password";
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.form.getRawValue();

    this.authenticationService
      .register({ username: name, email, password })
      .subscribe({
        next: () => {
          this.toastService.showSuccess("Registro completado con éxito");
          this.router.navigate(["/products"]);
        },
        error: (errorResponse) => {
          const message: string =
            errorResponse?.error?.message || "Error en el registro";
          this.toastService.showError(message);
        },
      });
  }

  private passwordMatchValidator(): ValidatorFn {
    return (form: AbstractControl): { [key: string]: boolean } | null => {
      const password = form.get("password")?.value;
      const confirmPassword = form.get("confirmPassword")?.value;

      if (password && confirmPassword && password !== confirmPassword) {
        return { passwordMismatch: true };
      }
      return null;
    };
  }
}
