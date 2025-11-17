// src/app/admin/components/order-details-modal/order-details-modal.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalService } from "../../../core/services/modal.service";
import { AdminService } from "../../../core/services/admin.service";
import { FullAdminOrder } from "../../../core/models/admin.types";
import { Observable, of } from "rxjs";
import { switchMap, catchError } from "rxjs/operators";

@Component({
  selector: "app-order-details-modal",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./order-details-modal.component.html",
})
export class OrderDetailsModalComponent implements OnInit {
  // Observable para guardar los detalles del pedido
  orderDetails$: Observable<FullAdminOrder | null>;
  isLoading: boolean = true;

  constructor(
    public modalService: ModalService,
    private adminService: AdminService
  ) {
    // Inicializamos el observable
    this.orderDetails$ = of(null);
  }

  ngOnInit(): void {
    // Nos suscribimos al ID del pedido que queremos ver
    this.orderDetails$ = this.modalService.orderToViewId$.pipe(
      switchMap((orderId) => {
        if (!orderId) {
          this.isLoading = false;
          return of(null); // Si no hay ID, devolvemos null
        }
        this.isLoading = true;
        // Si hay ID, llamamos al servicio para buscar los detalles
        return this.adminService.getAdminOrderById(orderId).pipe(
          catchError((err) => {
            console.error("Error al cargar detalles del pedido:", err);
            this.isLoading = false;
            return of(null); // Devolvemos null en caso de error
          })
        );
      })
    );

    // Nos suscribimos solo para apagar el 'isLoading'
    this.orderDetails$.subscribe((details) => {
      if (details) {
        this.isLoading = false;
      }
    });
  }

  /**
   * Cierra el modal
   */
  close(): void {
    this.modalService.closeOrderDetailsModal();
  }

  // --- MÉTODOS HELPERS PARA CÁLCULOS MATEMÁTICOS ---

  getProductsTotal(order: any): number {
    if (!order?.OrderItems) return 0;
    return order.OrderItems.reduce((acc: number, item: any) => {
      // Aseguramos que item.price sea número
      return acc + Number(item.price) * item.quantity;
    }, 0);
  }

  getShippingCost(order: any): number {
    if (!order) return 0;
    const total = Number(order.total);
    const productsTotal = this.getProductsTotal(order);
    const diff = total - productsTotal;
    return diff > 0.01 ? diff : 0;
  }

  getSubtotal(order: any): number {
    return this.getProductsTotal(order) / 1.21;
  }

  getTax(order: any): number {
    const productsTotal = this.getProductsTotal(order);
    return productsTotal - productsTotal / 1.21;
  }
}
