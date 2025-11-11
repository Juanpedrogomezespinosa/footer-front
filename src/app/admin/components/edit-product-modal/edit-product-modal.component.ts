// src/app/admin/components/edit-product-modal/edit-product-modal.component.ts
import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  FormArray, // <-- 1. Importar FormArray
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ModalService } from "../../../core/services/modal.service";
import { AdminService } from "../../../core/services/admin.service";
import { ToastService } from "../../../core/services/toast.service";
import { FullAdminProduct } from "../../../core/models/admin.types";
import { Subscription } from "rxjs";

@Component({
  selector: "app-edit-product-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./edit-product-modal.component.html",
})
export class EditProductModalComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  product: FullAdminProduct | null = null;
  private productSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    public modalService: ModalService,
    private adminService: AdminService,
    private toast: ToastService
  ) {
    // --- 2. ACTUALIZAR EL FORMULARIO ---
    this.productForm = this.fb.group({
      name: ["", Validators.required],
      description: ["", Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      brand: ["", Validators.required],
      category: ["", Validators.required],
      gender: ["", Validators.required],
      material: [""],
      season: [""],
      is_new: [false],
      // --- Campos antiguos eliminados (stock, size, color) ---
      // --- Nuevo FormArray para las variantes ---
      variants: this.fb.array([], Validators.required),
    });
    // ------------------------------------
  }

  ngOnInit(): void {
    // Nos suscribimos al producto que el ModalService nos pasa
    this.productSubscription = this.modalService.productToEdit$.subscribe(
      (product) => {
        if (product) {
          this.product = product;

          // --- 3. RELLENAR EL FORMULARIO (LÓGICA ACTUALIZADA) ---
          // Rellenamos los campos principales
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            price: parseFloat(product.price), // Convertir a número
            brand: product.brand,
            category: product.category,
            gender: product.gender,
            material: product.material,
            season: product.season,
            is_new: product.is_new,
          });

          // Rellenamos el FormArray 'variants'
          this.variants.clear(); // Limpiamos por si acaso
          if (product.variants && product.variants.length > 0) {
            product.variants.forEach((variant) => {
              this.variants.push(this.createVariantGroup(variant));
            });
          }
        }
      }
    );
  }

  ngOnDestroy(): void {
    // Limpiamos la suscripción
    this.productSubscription?.unsubscribe();
  }

  // --- 4. HELPERS PARA EL FORMULARIO DE VARIANTES ---
  get variants(): FormArray {
    return this.productForm.get("variants") as FormArray;
  }

  createVariantGroup(variant?: {
    color: string;
    size: string;
    stock: number;
  }): FormGroup {
    return this.fb.group({
      color: [variant?.color || "", Validators.required],
      size: [variant?.size || "", Validators.required],
      stock: [variant?.stock || 0, [Validators.required, Validators.min(0)]],
    });
  }

  addVariant(): void {
    this.variants.push(this.createVariantGroup());
  }

  removeVariant(index: number): void {
    this.variants.removeAt(index);
  }
  // -------------------------------------------

  // --- 5. LÓGICA DE 'onSubmit' ACTUALIZADA ---
  onSubmit(): void {
    if (this.productForm.invalid || !this.product) {
      this.toast.showError("Formulario inválido. Revisa las variantes.");
      return;
    }

    const formValue = this.productForm.value;

    // El backend (productController.js) espera 'variants' como un string JSON
    const updatedData = {
      ...formValue,
      variants: JSON.stringify(formValue.variants),
    };

    this.adminService.updateProduct(this.product.id, updatedData).subscribe({
      next: () => {
        this.toast.showSuccess("¡Producto actualizado con éxito!");
        this.close();
      },
      error: (err) => {
        console.error("Error al actualizar producto:", err);
        this.toast.showError(
          err.error?.message || "Error al actualizar el producto."
        );
      },
    });
  }

  close(): void {
    this.modalService.closeEditModal();
  }
}
