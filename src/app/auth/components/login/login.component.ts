import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { RouterModule, Router } from "@angular/router"; // ✅ IMPORTA RouterModule
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // ✅ AÑADE RouterModule AQUÍ
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.form = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) return;

    const { email, password } = this.form.getRawValue();

    this.authenticationService.login({ email, password }).subscribe({
      next: () => {
        this.toastService.showSuccess("Inicio de sesión exitoso");
        this.router.navigate(["/products"]);
      },
      error: (errorResponse) => {
        const message: string =
          errorResponse?.error?.message || "Error en el inicio de sesión";
        this.toastService.showError(message);
      },
    });
  }
}
