import { Component, OnInit } from "@angular/core";
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  TitleCasePipe,
} from "@angular/common";
import { Observable, catchError, of, tap } from "rxjs";
import { OrderDetails, OrderService } from "app/core/services/order.service";
import { ToastService } from "app/core/services/toast.service";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-order-history",
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, TitleCasePipe, RouterModule],
  templateUrl: "./order-history.component.html",
})
export class OrderHistoryComponent implements OnInit {
  public orders$: Observable<{ orders: OrderDetails[] } | null> | undefined;
  public loading: boolean = true;
  public error: string | null = null;

  constructor(
    private orderService: OrderService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orders$ = this.orderService.getOrderHistory().pipe(
      tap(() => {
        this.loading = false;
      }),
      catchError((err) => {
        this.loading = false;
        this.error = "No se pudo cargar el historial de pedidos.";
        this.toastService.showError(this.error);
        console.error("Error fetching order history:", err);
        return of(null);
      })
    );
  }

  /**
   * Cancela un pedido si el usuario confirma.
   */
  onCancelOrder(orderId: number): void {
    if (
      confirm(
        "¿Estás seguro de que quieres cancelar este pedido? Esta acción no se puede deshacer."
      )
    ) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          this.toastService.showSuccess("Pedido cancelado correctamente.");
          this.loadOrders(); // Recargamos la lista para ver el cambio de estado
        },
        error: (err) => {
          console.error("Error cancelando pedido:", err);
          this.toastService.showError(
            err.error?.message || "Error al cancelar el pedido."
          );
        },
      });
    }
  }

  // --- HELPER: Calcular Total de Productos (Precio x Cantidad) ---
  private getProductsTotal(order: any): number {
    if (!order.OrderItems) return 0;
    return order.OrderItems.reduce((acc: number, item: any) => {
      return acc + Number(item.price) * item.quantity;
    }, 0);
  }

  // --- HELPER: Calcular Envío (Total Pedido - Total Productos) ---
  getShippingCost(order: any): number {
    const total = Number(order.total);
    const productsTotal = this.getProductsTotal(order);
    // Si la diferencia es muy pequeña (por flotantes), es 0
    const diff = total - productsTotal;
    return diff > 0.01 ? diff : 0;
  }

  // --- HELPER: Calcular Base Imponible (Productos / 1.21) ---
  getSubtotal(order: any): number {
    return this.getProductsTotal(order) / 1.21;
  }

  // --- HELPER: Calcular IVA (Productos - Base) ---
  getTax(order: any): number {
    const productsTotal = this.getProductsTotal(order);
    return productsTotal - productsTotal / 1.21;
  }
}
