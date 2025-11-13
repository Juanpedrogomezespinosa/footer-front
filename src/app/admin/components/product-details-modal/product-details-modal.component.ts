// src/app/admin/components/product-details-modal/product-details-modal.component.ts
import { Component, OnInit, OnDestroy, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms"; // Lo mantenemos solo si CommonModule no importa ngSwitch
import { ModalService } from "../../../core/services/modal.service";
import { FullAdminProduct } from "../../../core/models/admin.types";
import { Subscription } from "rxjs";

// Interfaz para nuestra nueva estructura de datos agrupada
interface GroupedVariant {
  color: string;
  sizeStocks: { size: string; stock: number }[];
}

@Component({
  selector: "app-product-details-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Mantenemos ReactiveFormsModule por [ngSwitch]
  templateUrl: "./product-details-modal.component.html",
})
export class ProductDetailsModalComponent implements OnInit, OnDestroy {
  // Ya no necesitamos un FormGroup
  product = signal<FullAdminProduct | null>(null);
  groupedVariants = signal<GroupedVariant[]>([]); // <-- Nueva señal para la tabla
  private productSubscription: Subscription | null = null;

  constructor(public modalService: ModalService) {
    // El constructor ahora está limpio
  }

  ngOnInit(): void {
    // Nos suscribimos al observable del modal service
    this.productSubscription = this.modalService.productToView$.subscribe(
      (product) => {
        if (product) {
          this.product.set(product);
          // Agrupamos las variantes para mostrarlas en la(s) tabla(s)
          this.groupedVariants.set(this.groupVariantsByColor(product.variants));
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.productSubscription?.unsubscribe();
  }

  /**
   * Helper para agrupar el array plano de variantes de la API
   * en la estructura anidada que necesita nuestra tabla.
   */
  groupVariantsByColor(
    variants: FullAdminProduct["variants"]
  ): GroupedVariant[] {
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

  close(): void {
    this.modalService.closeProductDetailsModal();
  }
}
