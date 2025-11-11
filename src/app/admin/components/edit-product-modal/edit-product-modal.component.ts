// src/app/admin/components/edit-product-modal/edit-product-modal.component.ts
import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
  AbstractControl, // <-- 1. Importar AbstractControl
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

  // --- 2. Añadir variables de estado para las tallas ---
  currentCategory: string = ""; // Rastreador de categoría
  clothingSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  sneakerMin = 35;
  sneakerMax = 45;
  uniqueSize = "Talla Única";
  // --------------------------------------------------

  constructor(
    private fb: FormBuilder,
    public modalService: ModalService,
    private adminService: AdminService,
    private toast: ToastService
  ) {
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
      variants: this.fb.array([], Validators.required),
    });
  }

  ngOnInit(): void {
    // Nos suscribimos al producto que el ModalService nos pasa
    this.productSubscription = this.modalService.productToEdit$.subscribe(
      (product) => {
        if (product) {
          this.product = product;
          this.currentCategory = product.category; // <-- 3. Establecer categoría actual

          // Rellenamos los campos principales
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            brand: product.brand,
            category: product.category,
            gender: product.gender,
            material: product.material,
            season: product.season,
            is_new: product.is_new,
          });

          // Rellenamos el FormArray 'variants'
          this.variants.clear();
          if (product.variants && product.variants.length > 0) {
            product.variants.forEach((variant) => {
              // --- 4. Pasar la categoría para aplicar la lógica de talla correcta ---
              this.variants.push(
                this.createVariantGroup(this.currentCategory, variant)
              );
            });
          }

          // --- 5. Escuchar cambios en la categoría (si el admin la cambia) ---
          this.productForm
            .get("category")
            ?.valueChanges.subscribe((newCategory) => {
              this.currentCategory = newCategory;
              this.updateVariantSizeControls(newCategory);
            });
        }
      }
    );
  }

  ngOnDestroy(): void {
    // Limpiamos la suscripción
    this.productSubscription?.unsubscribe();
  }

  // --- 6. HELPERS PARA EL FORMULARIO DE VARIANTES (Mejorados) ---
  get variants(): FormArray {
    return this.productForm.get("variants") as FormArray;
  }

  /**
   * Aplica la lógica de validación/valor al control de TALLA
   */
  applySizeLogic(sizeControl: AbstractControl | null, category: string): void {
    if (!sizeControl) return;

    sizeControl.clearValidators();
    sizeControl.enable();
    // No reseteamos el valor aquí, porque estamos cargando datos existentes

    if (category === "zapatillas") {
      sizeControl.setValidators([
        Validators.required,
        Validators.min(this.sneakerMin),
        Validators.max(this.sneakerMax),
      ]);
    } else if (category === "ropa") {
      sizeControl.setValidators([Validators.required]);
    } else if (category === "complementos") {
      sizeControl.setValue(this.uniqueSize); // Establece el valor
      sizeControl.disable(); // Lo deshabilita
    } else {
      sizeControl.setValidators([Validators.required]);
      sizeControl.disable(); // Deshabilitar si no hay categoría
    }
    sizeControl.updateValueAndValidity();
  }

  /**
   * Actualiza TODAS las filas de variantes cuando la categoría principal cambia
   */
  updateVariantSizeControls(category: string): void {
    this.variants.controls.forEach((control) => {
      const variantGroup = control as FormGroup;
      const sizeControl = variantGroup.get("size");
      this.applySizeLogic(sizeControl, category);
      // Solo reseteamos el valor si NO es para complementos
      if (category !== "complementos") {
        sizeControl?.setValue("");
      }
    });
  }

  /**
   * Crea un grupo de variante, aplicando la lógica de talla
   */
  createVariantGroup(
    category: string, // Categoría actual
    variant?: { color: string; size: string; stock: number }
  ): FormGroup {
    const group = this.fb.group({
      color: [variant?.color || "", Validators.required],
      size: [variant?.size || "", Validators.required], // Se aplica lógica abajo
      stock: [variant?.stock || 0, [Validators.required, Validators.min(0)]],
    });

    // Aplicar la lógica de talla al control 'size' recién creado
    this.applySizeLogic(group.get("size"), category);
    return group;
  }

  addVariant(): void {
    const category = this.productForm.get("category")?.value;
    if (!category) {
      this.toast.showError("Por favor, selecciona una categoría primero.");
      return;
    }
    this.variants.push(this.createVariantGroup(category));
  }

  removeVariant(index: number): void {
    this.variants.removeAt(index);
    // Opcional: si es la última, no dejar borrar
    // if (this.variants.length > 0) {
    //   this.variants.removeAt(index);
    // } else {
    //   this.toast.showError("Debe haber al menos una variante.");
    // }
  }
  // -------------------------------------------

  onSubmit(): void {
    if (this.productForm.invalid || !this.product) {
      this.toast.showError("Formulario inválido. Revisa las variantes.");
      this.productForm.markAllAsTouched(); // Marcar para ver errores
      return;
    }

    // --- 7. Usar 'getRawValue()' para incluir campos deshabilitados ---
    const formValue = this.productForm.getRawValue();

    // El backend (productController.js) espera 'variants' como un string JSON
    const updatedData = {
      ...formValue,
      variants: JSON.stringify(formValue.variants), // 'variants' ahora tiene los valores correctos
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
