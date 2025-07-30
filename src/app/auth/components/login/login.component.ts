import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    if (this.form.invalid) {
      return;
    }

    const formValues = this.form.getRawValue();
    const email: string = formValues.email;
    const password: string = formValues.password;

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
