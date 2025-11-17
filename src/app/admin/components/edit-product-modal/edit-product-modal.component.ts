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
  private categorySubscription: Subscription | null = null;

  currentCategory = signal<string>("");
  // Añadida Talla Única
  clothingSizes = ["Talla Única", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  sneakerMin = 35;
  sneakerMax = 45;

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
      colorGroups: this.fb.array([], Validators.required),
    });
  }

  ngOnInit(): void {
    this.productSubscription = this.modalService.productToEdit$.subscribe(
      (product) => {
        if (product) {
          this.product = product;
          this.currentCategory.set(product.category);

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

          const groupedVariants = this.groupVariantsByColor(product.variants);
          this.colorGroups.clear();

          groupedVariants.forEach((group) => {
            const sizeStockFormGroups = group.sizeStocks.map((ss) => {
              const sizeStockGroup = this.createSizeStockGroup();
              // Aplicar lógica ANTES de rellenar
              this.applySizeLogic(sizeStockGroup.get("size"), product.category);
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

          if (groupedVariants.length === 0) {
            this.colorGroups.push(this.createColorGroup());
            this.updateAllSizeControls(this.currentCategory());
          }

          this.categorySubscription?.unsubscribe();
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
    this.productSubscription?.unsubscribe();
    this.categorySubscription?.unsubscribe();
  }

  groupVariantsByColor(
    variants: FullAdminProduct["variants"]
  ): { color: string; sizeStocks: { size: string; stock: number }[] }[] {
    if (!variants) return [];
    const grouped = new Map<string, { size: string; stock: number }[]>();
    variants.forEach((v) => {
      if (!grouped.has(v.color)) {
        grouped.set(v.color, []);
      }
      grouped.get(v.color)!.push({ size: v.size, stock: v.stock });
    });
    return Array.from(grouped.entries()).map(([color, sizeStocks]) => ({
      color,
      sizeStocks,
    }));
  }

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
        const currentValue = sizeControl?.value;
        this.applySizeLogic(sizeControl, category);

        // Lógica unificada para ropa y complementos
        if (category === "ropa" || category === "complementos") {
          if (this.clothingSizes.includes(currentValue)) {
            sizeControl?.setValue(currentValue);
          } else {
            sizeControl?.setValue("");
          }
        } else if (category === "zapatillas") {
          if (typeof currentValue === "number") {
            sizeControl?.setValue(currentValue);
          } else {
            sizeControl?.setValue("");
          }
        }
      });
    });
  }

  applySizeLogic(sizeControl: AbstractControl | null, category: string): void {
    if (!sizeControl) return;

    sizeControl.clearValidators();
    sizeControl.enable();

    if (category === "zapatillas") {
      sizeControl.setValidators([
        Validators.required,
        Validators.min(this.sneakerMin),
        Validators.max(this.sneakerMax),
      ]);
    } else if (category === "ropa" || category === "complementos") {
      sizeControl.setValidators([Validators.required]);
    } else {
      sizeControl.setValidators([Validators.required]);
      sizeControl.disable();
    }
    sizeControl.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.productForm.invalid || !this.product) {
      this.toast.showError("Formulario inválido. Revisa las variantes.");
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.getRawValue();

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

    const updatedData = {
      ...formValue,
      colorGroups: undefined,
      variants: JSON.stringify(variantsForApi),
    };
    delete updatedData.colorGroups;

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
