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
  private categorySubscription: Subscription | null = null;

  // Mapa para almacenar archivos por índice de grupo de color
  filesByColorIndex: Map<number, File[]> = new Map();

  currentCategory = signal<string>("");
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
      is_new: [true],
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

  get colorGroups(): FormArray {
    return this.productForm.get("colorGroups") as FormArray;
  }

  createColorGroup(): FormGroup {
    return this.fb.group({
      color: ["", Validators.required],
      price: [0], // <-- AÑADIDO: Precio de la variante
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
    if (this.colorGroups.length > 1) {
      this.colorGroups.removeAt(index);
      this.filesByColorIndex.delete(index);
      this.reindexFilesMap(index);
    } else {
      this.toast.showError("Debe haber al menos un grupo de color.");
    }
  }

  private reindexFilesMap(deletedIndex: number) {
    const newMap = new Map<number, File[]>();
    this.filesByColorIndex.forEach((files, key) => {
      if (key < deletedIndex) {
        newMap.set(key, files);
      } else if (key > deletedIndex) {
        newMap.set(key - 1, files);
      }
    });
    this.filesByColorIndex = newMap;
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
        this.applySizeLogic(sizeControl, category);
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
      if (
        sizeControl.value &&
        (isNaN(sizeControl.value) || sizeControl.value < this.sneakerMin)
      ) {
        sizeControl.setValue("");
      }
    } else if (category === "ropa" || category === "complementos") {
      sizeControl.setValidators([Validators.required]);
      if (
        sizeControl.value &&
        !this.clothingSizes.includes(sizeControl.value)
      ) {
        sizeControl.setValue("");
      }
    } else {
      sizeControl.setValidators([Validators.required]);
      sizeControl.disable();
      sizeControl.setValue("");
    }
    sizeControl.updateValueAndValidity();
  }

  onColorImagesChange(event: Event, index: number): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      const files = Array.from(fileList);
      this.filesByColorIndex.set(index, files);
    } else {
      this.filesByColorIndex.delete(index);
    }
  }

  getFileCountForColor(index: number): number {
    return this.filesByColorIndex.get(index)?.length || 0;
  }

  getFilesForColor(index: number): File[] {
    return this.filesByColorIndex.get(index) || [];
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.toast.showError("Por favor, completa todos los campos requeridos.");
      this.productForm.markAllAsTouched();
      return;
    }

    let allColorsHaveImages = true;
    this.colorGroups.controls.forEach((_, index) => {
      if (
        !this.filesByColorIndex.has(index) ||
        this.filesByColorIndex.get(index)!.length === 0
      ) {
        allColorsHaveImages = false;
      }
    });

    if (!allColorsHaveImages) {
      this.toast.showError(
        "Debes subir al menos una imagen para cada variante de color."
      );
      return;
    }

    const formData = new FormData();
    const formValue = this.productForm.getRawValue();

    const variantsForApi: {
      color: string;
      size: string;
      stock: number;
      price: number;
    }[] = [];

    formValue.colorGroups.forEach(
      (group: {
        color: string;
        price: number; // Recibimos el precio
        sizeStocks: { size: string; stock: number }[];
      }) => {
        const color = group.color;
        const variantPrice = group.price;

        group.sizeStocks.forEach((sizeStock) => {
          variantsForApi.push({
            color: color,
            size: sizeStock.size.toString(),
            stock: sizeStock.stock,
            price: variantPrice, // Lo enviamos al API
          });
        });
      }
    );

    Object.keys(formValue).forEach((key) => {
      if (key !== "colorGroups") {
        formData.append(key, formValue[key]);
      }
    });

    formData.append("variants", JSON.stringify(variantsForApi));

    const imageMetadata: { filename: string; color: string }[] = [];

    this.colorGroups.controls.forEach((control, index) => {
      const colorName = control.get("color")?.value;
      const files = this.filesByColorIndex.get(index);

      if (files && colorName) {
        files.forEach((file) => {
          formData.append("images", file, file.name);
          imageMetadata.push({
            filename: file.name,
            color: colorName,
          });
        });
      }
    });

    formData.append("imageMetadata", JSON.stringify(imageMetadata));

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
    this.colorGroups.clear();
    this.filesByColorIndex.clear();

    const initialColorGroup = this.createColorGroup();
    this.colorGroups.push(initialColorGroup);
    const initialSizeControl = (
      initialColorGroup.get("sizeStocks") as FormArray
    )
      .at(0)
      .get("size");
    this.applySizeLogic(initialSizeControl, "");
  }
}
