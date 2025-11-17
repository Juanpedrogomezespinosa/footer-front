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
  // Añadimos "Talla Única" al array de tallas disponibles
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
    if (this.colorGroups.length > 1) {
      this.colorGroups.removeAt(index);
    } else {
      this.toast.showError("Debe haber al menos un grupo de color.");
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
        !sizeControl.value ||
        isNaN(sizeControl.value) ||
        sizeControl.value < this.sneakerMin
      ) {
        sizeControl.setValue("");
      }
    }
    // CAMBIO: Ropa y Complementos ahora comparten lógica
    else if (category === "ropa" || category === "complementos") {
      sizeControl.setValidators([Validators.required]);
      if (!this.clothingSizes.includes(sizeControl.value)) {
        sizeControl.setValue("");
      }
    } else {
      sizeControl.setValidators([Validators.required]);
      sizeControl.disable();
      sizeControl.setValue("");
    }
    sizeControl.updateValueAndValidity();
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
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.toast.showError(
        "Por favor, selecciona al menos una imagen para el producto."
      );
      return;
    }

    const formData = new FormData();
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

    Object.keys(formValue).forEach((key) => {
      if (key !== "images" && key !== "colorGroups") {
        formData.append(key, formValue[key]);
      }
    });

    formData.append("variants", JSON.stringify(variantsForApi));

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
      category: "",
    });
    this.colorGroups.clear();
    const initialColorGroup = this.createColorGroup();
    this.colorGroups.push(initialColorGroup);
    const initialSizeControl = (
      initialColorGroup.get("sizeStocks") as FormArray
    )
      .at(0)
      .get("size");
    this.applySizeLogic(initialSizeControl, "");

    this.selectedFiles = [];
    this.fileNames = [];
  }
}
