// src/app/admin/components/edit-product-modal/edit-product-modal.component.ts
import { Component, OnInit, OnDestroy, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
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
  private categorySubscription: Subscription | null = null; // <-- Para cambios de categoría

  // --- Variables de estado para las tallas ---
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
    // --- Formulario actualizado a la estructura anidada ---
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
      // 'variants' se reemplaza por 'colorGroups'
      colorGroups: this.fb.array([], Validators.required), // Empezar vacío
    });
  }

  ngOnInit(): void {
    // Nos suscribimos al producto que el ModalService nos pasa
    this.productSubscription = this.modalService.productToEdit$.subscribe(
      (product) => {
        if (product) {
          this.product = product;
          this.currentCategory.set(product.category); // Establecer categoría actual

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

          // --- ¡¡¡NUEVA LÓGICA DE CARGA DE VARIANTES!!! ---
          // 1. Agrupar las variantes planas por color
          const groupedVariants = this.groupVariantsByColor(product.variants);
          this.colorGroups.clear(); // Limpiar el array

          // 2. Crear los FormGroups anidados a partir de los datos agrupados
          groupedVariants.forEach((group) => {
            const sizeStockFormGroups = group.sizeStocks.map((ss) => {
              // Creamos el grupo de talla/stock...
              const sizeStockGroup = this.createSizeStockGroup();
              // ...le aplicamos la lógica de talla...
              this.applySizeLogic(sizeStockGroup.get("size"), product.category);
              // ...y le ponemos los valores
              sizeStockGroup.patchValue(ss);
              return sizeStockGroup;
            });

            this.colorGroups.push(
              this.fb.group({
                color: [group.color, Validators.required],
                sizeStocks: this.fb.array(
                  sizeStockFormGroups,
                  Validators.required
                ),
              })
            );
          });

          // Si por alguna razón no hay variantes, añadir un grupo vacío
          if (groupedVariants.length === 0) {
            this.colorGroups.push(this.createColorGroup());
            this.updateAllSizeControls(this.currentCategory());
          }

          // 3. Escuchar cambios en la categoría (si el admin la cambia)
          this.categorySubscription?.unsubscribe(); // Limpiar listener anterior
          this.categorySubscription = this.productForm
            .get("category")!
            .valueChanges.subscribe((newCategory) => {
              this.currentCategory.set(newCategory);
              this.updateAllSizeControls(newCategory);
            });
        }
      }
    );
  }

  ngOnDestroy(): void {
    // Limpiamos las suscripciones
    this.productSubscription?.unsubscribe();
    this.categorySubscription?.unsubscribe();
  }

  /**
   * Helper para agrupar el array plano de variantes de la API
   * en la estructura anidada que necesita nuestro formulario.
   */
  groupVariantsByColor(
    variants: FullAdminProduct["variants"]
  ): { color: string; sizeStocks: { size: string; stock: number }[] }[] {
    if (!variants) return [];

    const grouped = new Map<string, { size: string; stock: number }[]>();

    // Agrupar
    variants.forEach((v) => {
      if (!grouped.has(v.color)) {
        grouped.set(v.color, []);
      }
      grouped.get(v.color)!.push({ size: v.size, stock: v.stock });
    });

    // Convertir de Map a Array
    return Array.from(grouped.entries()).map(([color, sizeStocks]) => ({
      color,
      sizeStocks,
    }));
  }

  // --- HELPERS PARA FORMULARIOS ANIDADOS ---

  get colorGroups(): FormArray {
    return this.productForm.get("colorGroups") as FormArray;
  }

  createColorGroup(): FormGroup {
    return this.fb.group({
      color: ["", Validators.required],
      sizeStocks: this.fb.array(
        [this.createSizeStockGroup()],
        Validators.required
      ),
    });
  }

  addColorGroup(): void {
    this.colorGroups.push(this.createColorGroup());
    const newGroupIndex = this.colorGroups.length - 1;
    const sizeStockArray = this.getSizeStocks(newGroupIndex);
    const sizeControl = sizeStockArray.at(0).get("size");
    this.applySizeLogic(sizeControl, this.currentCategory());
  }

  removeColorGroup(index: number): void {
    if (this.colorGroups.length > 0) {
      // Permitir borrar hasta el último
      this.colorGroups.removeAt(index);
    }
  }

  getSizeStocks(colorIndex: number): FormArray {
    return this.colorGroups.at(colorIndex).get("sizeStocks") as FormArray;
  }

  createSizeStockGroup(): FormGroup {
    const sizeControl = this.fb.control("");
    this.applySizeLogic(sizeControl, this.currentCategory());
    return this.fb.group({
      size: sizeControl,
      stock: [0, [Validators.required, Validators.min(0)]],
    });
  }

  addSizeStock(colorIndex: number): void {
    this.getSizeStocks(colorIndex).push(this.createSizeStockGroup());
  }

  removeSizeStock(colorIndex: number, sizeIndex: number): void {
    const sizeStocks = this.getSizeStocks(colorIndex);
    if (sizeStocks.length > 1) {
      // Permitir borrar hasta la última
      sizeStocks.removeAt(sizeIndex);
    } else {
      this.toast.showError("Debe haber al menos una talla por color.");
    }
  }

  updateAllSizeControls(category: string): void {
    this.colorGroups.controls.forEach((colorGroup) => {
      const sizeStocks = (colorGroup as FormGroup).get(
        "sizeStocks"
      ) as FormArray;
      sizeStocks.controls.forEach((sizeStockControl) => {
        const sizeControl = (sizeStockControl as FormGroup).get("size");
        this.applySizeLogic(sizeControl, category);
        if (category !== "complementos") {
          sizeControl?.setValue("");
        }
      });
    });
  }

  applySizeLogic(sizeControl: AbstractControl | null, category: string): void {
    if (!sizeControl) return;
    sizeControl.clearValidators();
    sizeControl.enable();

    // Guardar el valor actual ANTES de resetear
    const currentValue = sizeControl.value;

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
      sizeControl.disable();
    } else {
      sizeControl.setValidators([Validators.required]);
      sizeControl.disable();
    }

    // Si la categoría no es complementos, re-aplicar el valor (si es válido)
    if (category !== "complementos") {
      sizeControl.setValue(currentValue);
    }

    sizeControl.updateValueAndValidity();
  }

  // --- FIN DE HELPERS ---

  onSubmit(): void {
    if (this.productForm.invalid || !this.product) {
      this.toast.showError("Formulario inválido. Revisa las variantes.");
      this.productForm.markAllAsTouched();
      // Debugging
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

    const formValue = this.productForm.getRawValue();

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

    // 2. Preparar los datos para enviar
    const updatedData = {
      ...formValue,
      colorGroups: undefined, // No enviar la estructura anidada
      variants: JSON.stringify(variantsForApi), // Enviar la estructura plana
    };
    delete updatedData.colorGroups; // Asegurarse de que se elimina

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
