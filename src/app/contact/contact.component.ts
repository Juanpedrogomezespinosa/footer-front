import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  ContactService,
  ContactFormData,
} from "../core/services/contact.service";
import { ToastService } from "../core/services/toast.service";

import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: "app-contact",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./contact.component.html",
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private contactService: ContactService,
    private toastService: ToastService
  ) {
    this.contactForm = this.formBuilder.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      subject: ["", Validators.required],
      message: ["", Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.contactForm.value as ContactFormData;

    this.contactService.sendMessage(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastService.showSuccess(
          response.message || "Mensaje enviado con éxito"
        );
        this.contactForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage =
          error.error?.message || "Hubo un error al enviar el mensaje";
        this.toastService.showError(errorMessage);
        console.error("Error al enviar formulario de contacto:", error);
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.contactForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.contactForm.get(fieldName);
    if (!control || !control.errors) return "";
    if (control.errors["required"]) return "Este campo es obligatorio.";
    if (control.errors["email"]) return "Por favor, introduce un email válido.";
    return "El valor es inválido.";
  }
}
