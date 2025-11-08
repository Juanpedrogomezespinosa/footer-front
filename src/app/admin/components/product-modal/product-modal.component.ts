// src/app/admin/components/product-modal/product-modal.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
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
  selectedFile: File | null = null;
  fileName: string = "Ningún archivo seleccionado";

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
      stock: [0, [Validators.required, Validators.min(0)]], // <-- ¡CAMBIO AÑADIDO!
      size: ["", Validators.required],
      color: ["", Validators.required],
      brand: ["", Validators.required],
      category: ["", Validators.required], // zapatillas, ropa, complementos
      gender: ["", Validators.required], // unisex, hombre, mujer
      material: [""],
      season: [""], // invierno, verano
      is_new: [true],
      image: [null, Validators.required], // Para el control del formulario
    });
  }

  ngOnInit(): void {}

  onFileChange(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      this.fileName = this.selectedFile.name;
      // Validamos el formulario
      this.productForm.patchValue({ image: this.selectedFile });
    } else {
      this.selectedFile = null;
      this.fileName = "Ningún archivo seleccionado";
      this.productForm.patchValue({ image: null });
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.toast.showError("Por favor, completa todos los campos requeridos.");
      this.productForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFile) {
      this.toast.showError(
        "Por favor, selecciona una imagen para el producto."
      );
      return;
    }

    // Usamos FormData para enviar la imagen
    const formData = new FormData();

    // Añadimos todos los campos del formulario al FormData
    Object.keys(this.productForm.value).forEach((key) => {
      if (key !== "image") {
        formData.append(key, this.productForm.value[key]);
      }
    });

    // Tu backend espera 'images' (plural) según 'productRoutes.js'
    formData.append("images", this.selectedFile, this.selectedFile.name);

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
    // ¡CAMBIO AÑADIDO! Reseteamos 'stock' a 0 también
    this.productForm.reset({ is_new: true, price: 0, stock: 0 });
    this.selectedFile = null;
    this.fileName = "Ningún archivo seleccionado";
  }
}
