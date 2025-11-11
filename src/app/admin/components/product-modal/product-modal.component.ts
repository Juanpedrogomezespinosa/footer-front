// src/app/admin/components/product-modal/product-modal.component.ts
import { Component, OnInit, signal } from "@angular/core"; // <-- 1. Importar signal
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
} from "@angular/forms";
import { ModalService } from "../../../core/services/modal.service";
import { AdminService } from "../../../core/services/admin.service";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-product-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./product-modal.component.html",
})
export class ProductModalComponent implements OnInit {
  productForm: FormGroup;
  selectedFiles: File[] = [];
  fileNames: string[] = [];

  // --- 2. Añadir variables de estado para las tallas ---
  currentCategory = signal<string>(""); // Rastrea la categoría
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
      category: ["", Validators.required], // zapatillas, ropa, complementos
      gender: ["", Validators.required], // unisex, hombre, mujer
      material: [""],
      season: [""],
      is_new: [true],
      images: [null, Validators.required],
      variants: this.fb.array([this.createVariantGroup()], Validators.required),
    });
  }

  ngOnInit(): void {
    // --- 3. Escuchar cambios en la categoría ---
    this.productForm.get("category")?.valueChanges.subscribe((category) => {
      this.currentCategory.set(category);
      this.updateVariantSizeControls(category);
    });
    // ------------------------------------------
  }

  // --- 4. Actualizar dinámicamente los validadores y valores de TALLA ---
  updateVariantSizeControls(category: string): void {
    this.variantsArray.controls.forEach((control) => {
      const variantGroup = control as FormGroup;
      const sizeControl = variantGroup.get("size");
      if (!sizeControl) return;

      // Resetear
      sizeControl.clearValidators();
      sizeControl.enable();
      sizeControl.setValue(""); // <-- Importante: resetear valor

      if (category === "zapatillas") {
        sizeControl.setValidators([
          Validators.required,
          Validators.min(this.sneakerMin),
          Validators.max(this.sneakerMax),
        ]);
      } else if (category === "ropa") {
        sizeControl.setValidators([Validators.required]);
      } else if (category === "complementos") {
        sizeControl.setValue(this.uniqueSize);
        sizeControl.disable(); // Deshabilitado, el valor se tomará con getRawValue()
      } else {
        // Categoría por defecto (o vacía)
        sizeControl.setValidators([Validators.required]);
        sizeControl.disable(); // Deshabilitar si no hay categoría
      }
      sizeControl.updateValueAndValidity();
    });
  }
  // -------------------------------------------------------------

  createVariantGroup(): FormGroup {
    return this.fb.group({
      color: ["", Validators.required],
      size: ["", Validators.required], // Ej: "36", "S", "Única"
      stock: [0, [Validators.required, Validators.min(0)]],
    });
  }

  get variantsArray(): FormArray {
    return this.productForm.get("variants") as FormArray;
  }

  // --- 5. Modificar 'addVariant' para que use la categoría actual ---
  addVariant(): void {
    const currentCategory = this.productForm.get("category")?.value;
    const newVariantGroup = this.createVariantGroup();

    // Aplicar la lógica de talla/validadores a la nueva fila
    const sizeControl = newVariantGroup.get("size");
    if (sizeControl) {
      if (currentCategory === "zapatillas") {
        sizeControl.setValidators([
          Validators.required,
          Validators.min(this.sneakerMin),
          Validators.max(this.sneakerMax),
        ]);
      } else if (currentCategory === "ropa") {
        sizeControl.setValidators([Validators.required]);
      } else if (currentCategory === "complementos") {
        sizeControl.setValue(this.uniqueSize);
        sizeControl.disable();
      } else {
        // No permitir añadir si no hay categoría
        this.toast.showError("Por favor, selecciona una categoría primero.");
        return;
      }
    }
    this.variantsArray.push(newVariantGroup);
  }
  // -------------------------------------------------------------

  removeVariant(index: number): void {
    if (this.variantsArray.length > 1) {
      this.variantsArray.removeAt(index);
    } else {
      this.toast.showError("Debe haber al menos una variante.");
    }
  }

  onFileChange(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      this.selectedFiles = Array.from(fileList);
      this.fileNames = this.selectedFiles.map((f) => f.name);
      this.productForm.patchValue({ images: this.selectedFiles });
    } else {
      this.selectedFiles = [];
      this.fileNames = [];
      this.productForm.patchValue({ images: null });
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.toast.showError("Por favor, completa todos los campos requeridos.");
      this.productForm.markAllAsTouched();

      console.log("Formulario inválido:", this.productForm.value);
      Object.keys(this.productForm.controls).forEach((key) => {
        const controlErrors = this.productForm.get(key)?.errors;
        if (controlErrors) {
          console.log("Control con error:", key, controlErrors);
        }
      });
      // Revisar errores en el FormArray
      this.variantsArray.controls.forEach((group, index) => {
        if (group.invalid) {
          console.log(`Variante ${index} inválida:`, group.errors, group.value);
          Object.keys((group as FormGroup).controls).forEach((key) => {
            const controlErrors = (group as FormGroup).get(key)?.errors;
            if (controlErrors) {
              console.log(
                `Control [${index}].${key} con error:`,
                controlErrors
              );
            }
          });
        }
      });
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.toast.showError(
        "Por favor, selecciona al menos una imagen para el producto."
      );
      return;
    }

    const formData = new FormData();

    // --- 6. Usar 'getRawValue()' para incluir campos deshabilitados ---
    const formValue = this.productForm.getRawValue();
    // ---------------------------------------------------------------

    // Añadimos los campos del producto padre
    Object.keys(formValue).forEach((key) => {
      if (key !== "images" && key !== "variants") {
        formData.append(key, formValue[key]);
      }
    });

    // Añadimos el array de variantes como un string JSON
    formData.append(
      "variants",
      JSON.stringify(formValue.variants) // 'variants' contendrá "Talla Única"
    );
    // ----------------------------

    // Añadimos todas las imágenes seleccionadas
    this.selectedFiles.forEach((file) => {
      formData.append("images", file, file.name);
    });

    this.adminService.createProduct(formData).subscribe({
      next: (response) => {
        this.toast.showSuccess("¡Producto creado con éxito!");
        this.close();
      },
      error: (err) => {
        console.error("Error al crear producto:", err);
        this.toast.showError(
          err.error?.message || "Error al crear el producto."
        );
      },
    });
  }

  close(): void {
    this.modalService.closeProductModal();
    this.productForm.reset({
      is_new: true,
      price: 0,
      category: "", // Resetear categoría
    });
    // Reseteamos el FormArray
    this.variantsArray.clear();
    this.variantsArray.push(this.createVariantGroup());

    // Resetear estado de tallas
    this.currentCategory.set("");
    this.updateVariantSizeControls(""); // Poner los inputs de talla en disabled

    this.selectedFiles = [];
    this.fileNames = [];
  }
}
