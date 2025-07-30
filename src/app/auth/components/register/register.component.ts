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
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent {
  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.form = this.formBuilder.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const formValues = this.form.getRawValue();
    const name: string = formValues.name;
    const email: string = formValues.email;
    const password: string = formValues.password;

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
}
