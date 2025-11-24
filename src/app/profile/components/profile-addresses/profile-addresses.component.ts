import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  UserService,
  UserAddress,
  AddressPayload,
} from "app/core/services/user.service";
import { ToastService } from "app/core/services/toast.service";
import { catchError, of, tap } from "rxjs";

@Component({
  selector: "app-profile-addresses",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./profile-addresses.component.html",
})
export class ProfileAddressesComponent implements OnInit {
  // Estado de la UI
  public loading: boolean = true;
  public submitting: boolean = false;
  public error: string | null = null;
  public showForm: boolean = false;
  public isEditing: boolean = false;

  // Datos
  public addresses: UserAddress[] = [];
  public addressForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAddresses();
  }

  /**
   * Inicializa el formulario reactivo
   */
  private initForm(): void {
    this.addressForm = this.fb.group({
      id: [null], // Lo usamos para saber qué ID editar
      alias: ["", [Validators.required, Validators.maxLength(100)]],
      street: ["", [Validators.required, Validators.maxLength(255)]],
      city: ["", [Validators.required, Validators.maxLength(100)]],
      state: ["", [Validators.required, Validators.maxLength(100)]],
      postalCode: ["", [Validators.required, Validators.maxLength(20)]],
      country: ["España", [Validators.required, Validators.maxLength(100)]], // Valor por defecto
      // --- CAMBIO: Añadido Validators.required ---
      phone: ["", [Validators.required, Validators.maxLength(20)]],
      isDefault: [false, Validators.required],
    });
  }

  /**
   * Carga la lista de direcciones del usuario
   */
  public loadAddresses(): void {
    this.loading = true;
    this.userService
      .getAddresses()
      .pipe(
        tap((data) => {
          this.addresses = data;
          this.loading = false;
        }),
        catchError((err) => {
          this.loading = false;
          this.error = "No se pudieron cargar las direcciones.";
          this.toastService.showError(this.error);
          console.error("Error fetching addresses:", err);
          return of([]);
        })
      )
      .subscribe();
  }

  /**
   * Muestra u oculta el formulario.
   * Si se pasa una dirección, entra en modo "edición".
   */
  public toggleForm(address: UserAddress | null = null): void {
    if (address) {
      // Editando una dirección existente
      this.isEditing = true;
      this.addressForm.patchValue(address);
    } else {
      // Creando una nueva dirección
      this.isEditing = false;
      this.addressForm.reset({
        country: "España",
        isDefault: false,
      });
    }
    this.showForm = true;
  }

  /**
   * Oculta y resetea el formulario (botón Cancelar)
   */
  public cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.addressForm.reset();
  }

  /**
   * Maneja el envío del formulario (Crear o Actualizar)
   */
  public onFormSubmit(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.toastService.showError(
        "Por favor, revisa los campos del formulario."
      );
      return;
    }

    this.submitting = true;
    const formValue = this.addressForm.getRawValue();

    // Preparamos el payload (sin el campo 'id')
    const payload: AddressPayload = {
      alias: formValue.alias,
      street: formValue.street,
      city: formValue.city,
      state: formValue.state,
      postalCode: formValue.postalCode,
      country: formValue.country,
      phone: formValue.phone || null,
      isDefault: formValue.isDefault,
    };

    if (this.isEditing) {
      // --- Lógica de ACTUALIZAR ---
      this.userService.updateAddress(formValue.id, payload).subscribe({
        next: (updatedAddress) => {
          this.toastService.showSuccess("Dirección actualizada correctamente.");
          this.submitting = false;
          this.cancelForm();
          this.loadAddresses(); // Recargamos la lista
        },
        error: (err) => {
          this.submitting = false;
          this.toastService.showError(
            err.error?.message || "Error al actualizar la dirección."
          );
        },
      });
    } else {
      // --- Lógica de CREAR ---
      this.userService.createAddress(payload).subscribe({
        next: (newAddress) => {
          this.toastService.showSuccess("Dirección creada correctamente.");
          this.submitting = false;
          this.cancelForm();
          this.loadAddresses(); // Recargamos la lista
        },
        error: (err) => {
          this.submitting = false;
          this.toastService.showError(
            err.error?.message || "Error al crear la dirección."
          );
        },
      });
    }
  }

  /**
   * Elimina una dirección
   */
  public onDeleteAddress(id: number): void {
    this.userService.deleteAddress(id).subscribe({
      next: () => {
        this.toastService.showSuccess("Dirección eliminada.");
        // Recargamos la lista filtrando la eliminada
        this.addresses = this.addresses.filter((addr) => addr.id !== id);
      },
      error: (err) => {
        this.toastService.showError(
          err.error?.message || "Error al eliminar la dirección."
        );
      },
    });
  }

  // Getter para acceso fácil en el HTML
  get f() {
    return this.addressForm.controls;
  }
}
