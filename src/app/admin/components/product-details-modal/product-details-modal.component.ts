import { Component, OnInit, OnDestroy, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms"; // Lo mantenemos solo si CommonModule no importa ngSwitch
import { ModalService } from "../../../core/services/modal.service";
import { FullAdminProduct } from "../../../core/models/admin.types";
import { Subscription } from "rxjs";

interface GroupedVariant {
  color: string;
  sizeStocks: { size: string; stock: number }[];
}

@Component({
  selector: "app-product-details-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./product-details-modal.component.html",
})
export class ProductDetailsModalComponent implements OnInit, OnDestroy {
  product = signal<FullAdminProduct | null>(null);
  groupedVariants = signal<GroupedVariant[]>([]);

  private productSubscription: Subscription | null = null;

  constructor(public modalService: ModalService) {}

  ngOnInit(): void {
    this.productSubscription = this.modalService.productToView$.subscribe(
      (product) => {
        if (product) {
          this.product.set(product);
          this.groupedVariants.set(this.groupVariantsByColor(product.variants));
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.productSubscription?.unsubscribe();
  }

  groupVariantsByColor(
    variants: FullAdminProduct["variants"]
  ): GroupedVariant[] {
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

  close(): void {
    this.modalService.closeProductDetailsModal();
  }
}
