// src/app/admin/components/product-modal/product-modal.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray, // <-- ¡IMPORTAR FORM ARRAY!
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
  selectedFiles: File[] = []; // <-- ¡CAMBIO A PLURAL!
  fileNames: string[] = []; // <-- ¡CAMBIO A PLURAL!

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
      // --- CAMPOS ELIMINADOS ---
      // stock: [0, [Validators.required, Validators.min(0)]],
      // size: ["", Validators.required],
      // color: ["", Validators.required],
      // -------------------------
      brand: ["", Validators.required],
      category: ["", Validators.required], // zapatillas, ropa, complementos
      gender: ["", Validators.required], // unisex, hombre, mujer
      material: [""],
      season: [""], // invierno, verano
      is_new: [true],
      images: [null, Validators.required], // Cambiado de 'image' a 'images'
      // --- ¡¡¡CAMPO AÑADIDO!!! ---
      variants: this.fb.array([this.createVariantGroup()], Validators.required),
    });
  }

  ngOnInit(): void {}

  // --- ¡NUEVO! Helper para crear un grupo de variante ---
  createVariantGroup(): FormGroup {
    return this.fb.group({
      color: ["", Validators.required],
      size: ["", Validators.required], // Ej: "36", "S", "Única"
      stock: [0, [Validators.required, Validators.min(0)]],
    });
  }

  // --- ¡NUEVO! Getter para acceder fácil al FormArray desde el HTML ---
  get variantsArray(): FormArray {
    return this.productForm.get("variants") as FormArray;
  }

  // --- ¡NUEVO! Método para añadir una nueva variante vacía ---
  addVariant(): void {
    this.variantsArray.push(this.createVariantGroup());
  }

  // --- ¡NUEVO! Método para eliminar una variante ---
  removeVariant(index: number): void {
    if (this.variantsArray.length > 1) {
      this.variantsArray.removeAt(index);
    } else {
      this.toast.showError("Debe haber al menos una variante.");
    }
  }
  // --- FIN DE NUEVOS MÉTODOS ---

  onFileChange(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      // Permitimos múltiples archivos
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
      // Log para debug
      console.log("Formulario inválido:", this.productForm.value);
      Object.keys(this.productForm.controls).forEach((key) => {
        const controlErrors = this.productForm.get(key)?.errors;
        if (controlErrors) {
          console.log("Control con error:", key, controlErrors);
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

    // Añadimos los campos del producto padre
    Object.keys(this.productForm.value).forEach((key) => {
      // No añadimos 'images' (archivos) ni 'variants' (array) directamente
      if (key !== "images" && key !== "variants") {
        formData.append(key, this.productForm.value[key]);
      }
    });

    // --- ¡CAMBIO IMPORTANTE! ---
    // Añadimos el array de variantes como un string JSON
    formData.append(
      "variants",
      JSON.stringify(this.productForm.value.variants)
    );
    // ----------------------------

    // Añadimos todas las imágenes seleccionadas
    this.selectedFiles.forEach((file) => {
      formData.append("images", file, file.name); // El backend espera 'images'
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
    });
    // Reseteamos el FormArray
    this.variantsArray.clear();
    this.variantsArray.push(this.createVariantGroup());

    this.selectedFiles = [];
    this.fileNames = [];
  }
}
