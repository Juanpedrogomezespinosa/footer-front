// src/app/admin/components/product-modal/product-modal.component.ts
import { Component, OnInit, signal, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
  AbstractControl,
} from "@angular/forms";
import { ModalService } from "../../../core/services/modal.service";
import { AdminService } from "../../../core/services/admin.service";
import { ToastService } from "../../../core/services/toast.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-product-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./product-modal.component.html",
})
export class ProductModalComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  selectedFiles: File[] = [];
  fileNames: string[] = [];
  private categorySubscription: Subscription | null = null;

  currentCategory = signal<string>("");
  clothingSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  sneakerMin = 35;
  sneakerMax = 45;
  uniqueSize = "Talla Única";

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
      is_new: [true],
      images: [null, Validators.required],
      colorGroups: this.fb.array(
        [this.createColorGroup()],
        Validators.required
      ),
    });
  }

  ngOnInit(): void {
    this.categorySubscription = this.productForm
      .get("category")!
      .valueChanges.subscribe((category) => {
        this.currentCategory.set(category);
        this.updateAllSizeControls(category);
      });
  }

  ngOnDestroy(): void {
    this.categorySubscription?.unsubscribe();
  }

  // --- GRUPO DE COLOR ---
  get colorGroups(): FormArray {
    return this.productForm.get("colorGroups") as FormArray;
  }

  createColorGroup(): FormGroup {
    return this.fb.group({
      color: ["", Validators.required],
      sizeStocks: this.fb.array(
        [this.createSizeStockGroup()], // Inicializar con una talla/stock
        Validators.required
      ),
    });
  }

  addColorGroup(): void {
    this.colorGroups.push(this.createColorGroup());
    // Aplicar la lógica de tallas a la primera fila del nuevo grupo
    const newGroupIndex = this.colorGroups.length - 1;
    const sizeStockArray = this.getSizeStocks(newGroupIndex);
    const sizeControl = sizeStockArray.at(0).get("size");
    this.applySizeLogic(sizeControl, this.currentCategory());
  }

  removeColorGroup(index: number): void {
    if (this.colorGroups.length > 1) {
      this.colorGroups.removeAt(index);
    } else {
      this.toast.showError("Debe haber al menos un grupo de color.");
    }
  }

  // --- PAREJA TALLA/STOCK ---
  getSizeStocks(colorIndex: number): FormArray {
    return this.colorGroups.at(colorIndex).get("sizeStocks") as FormArray;
  }

  createSizeStockGroup(): FormGroup {
    const sizeControl = this.fb.control(""); // Valor inicial vacío
    this.applySizeLogic(sizeControl, this.currentCategory()); // Aplicar lógica inicial
    return this.fb.group({
      size: sizeControl,
      stock: [0, [Validators.required, Validators.min(0)]],
    });
  }

  addSizeStock(colorIndex: number): void {
    this.getSizeStocks(colorIndex).push(this.createSizeStockGroup());
    // No hace falta aplicar applySizeLogic aquí porque ya se hace en createSizeStockGroup
  }

  removeSizeStock(colorIndex: number, sizeIndex: number): void {
    const sizeStocks = this.getSizeStocks(colorIndex);
    if (sizeStocks.length > 1) {
      sizeStocks.removeAt(sizeIndex);
    } else {
      this.toast.showError("Debe haber al menos una talla por color.");
    }
  }

  /**
   * Itera por TODOS los grupos y TODAS las tallas y aplica la lógica de validación y estado.
   * Utiliza `AbstractControl.enable()`/`disable()` y `setValue()` para evitar la advertencia de Angular.
   */
  updateAllSizeControls(category: string): void {
    this.colorGroups.controls.forEach((colorGroup) => {
      const sizeStocks = (colorGroup as FormGroup).get(
        "sizeStocks"
      ) as FormArray;
      sizeStocks.controls.forEach((sizeStockControl) => {
        const sizeControl = (sizeStockControl as FormGroup).get("size");
        this.applySizeLogic(sizeControl, category);
      });
    });
  }

  /**
   * Aplica validadores/valor/estado a UN solo control de talla.
   * La clave para la advertencia de `disabled` es usar `control.disable()`/`enable()`
   * en lugar de `[disabled]` en el HTML.
   */
  applySizeLogic(sizeControl: AbstractControl | null, category: string): void {
    if (!sizeControl) return;

    sizeControl.clearValidators();
    sizeControl.enable(); // Primero habilitar para limpiar estados anteriores
    sizeControl.setValue(""); // Siempre resetear el valor

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
      sizeControl.disable(); // Deshabilitar el control en TS
    } else {
      // Categoría no seleccionada o inválida
      sizeControl.setValidators([Validators.required]);
      sizeControl.disable(); // Deshabilitar el control en TS
      sizeControl.setValue(""); // Asegurarse de que esté vacío
    }
    sizeControl.updateValueAndValidity(); // Actualizar validación
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
      // Debugging más profundo para formularios anidados
      console.log("Formulario inválido:", this.productForm.value);
      this.colorGroups.controls.forEach((colorGroup, i) => {
        if (colorGroup.invalid) {
          console.log(`Grupo de Color ${i} inválido:`, colorGroup.value);
          (
            (colorGroup as FormGroup).get("sizeStocks") as FormArray
          ).controls.forEach((sizeStock, j) => {
            if (sizeStock.invalid) {
              console.log(`  Talla/Stock ${j} inválida:`, sizeStock.value);
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
    const formValue = this.productForm.getRawValue(); // Incluir campos disabled

    // 1. Aplanar la estructura de 'colorGroups' a 'variants'
    const variantsForApi: { color: string; size: string; stock: number }[] = [];
    formValue.colorGroups.forEach(
      (group: {
        color: string;
        sizeStocks: { size: string; stock: number }[];
      }) => {
        const color = group.color;
        group.sizeStocks.forEach((sizeStock) => {
          variantsForApi.push({
            color: color,
            size: sizeStock.size,
            stock: sizeStock.stock,
          });
        });
      }
    );

    // 2. Añadir los campos del producto padre
    Object.keys(formValue).forEach((key) => {
      // Omitimos 'images' y la estructura anidada 'colorGroups'
      if (key !== "images" && key !== "colorGroups") {
        formData.append(key, formValue[key]);
      }
    });

    // 3. Añadir el array "aplastado" como string JSON
    formData.append("variants", JSON.stringify(variantsForApi));

    // 4. Añadir todas las imágenes seleccionadas
    this.selectedFiles.forEach((file) => {
      formData.append("images", file, file.name);
    });

    // 5. Enviar a la API
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
      category: "",
    });
    // Reseteamos el FormArray
    this.colorGroups.clear();
    // Añadimos un grupo de color inicial y aplicamos la lógica de talla
    const initialColorGroup = this.createColorGroup();
    this.colorGroups.push(initialColorGroup);
    const initialSizeControl = (
      initialColorGroup.get("sizeStocks") as FormArray
    )
      .at(0)
      .get("size");
    this.applySizeLogic(initialSizeControl, ""); // Aplicar estado inicial (categoría vacía)

    this.selectedFiles = [];
    this.fileNames = [];
  }
}
