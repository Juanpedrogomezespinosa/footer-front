// src/app/admin/pages/admin-orders/admin-orders.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AdminService } from "../../../core/services/admin.service";
import { ModalService } from "../../../core/services/modal.service";
import { ToastService } from "../../../core/services/toast.service";
import { AdminOrdersResponse } from "../../../core/models/admin.types";
import { filter, skip } from "rxjs/operators";

@Component({
  selector: "app-admin-orders",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./admin-orders.component.html",
})
export class AdminOrdersComponent implements OnInit {
  // Propiedad para almacenar la respuesta completa (incluyendo paginación)
  ordersResponse: AdminOrdersResponse | null = null;
  isLoading: boolean = true;

  constructor(
    private adminService: AdminService,
    private modalService: ModalService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // Cargar la primera página de pedidos
    this.loadOrders(1);

    // Escuchar el cierre del modal de detalles para refrescar la lista
    this.modalService.isOrderDetailsModalOpen$
      .pipe(
        skip(1), // Ignorar el valor inicial
        filter((isOpen) => !isOpen) // Filtrar solo cuando se cierra
      )
      .subscribe(() => {
        this.loadOrders(this.ordersResponse?.currentPage || 1);
      });
  }

  /**
   * Carga la lista de pedidos para una página específica.
   */
  loadOrders(page: number): void {
    this.isLoading = true;
    this.adminService.getOrders(page).subscribe({
      next: (response) => {
        this.ordersResponse = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error al cargar pedidos:", err);
        this.toast.showError("Error al cargar la lista de pedidos.");
        this.isLoading = false;
      },
    });
  }

  /**
   * Navega a la página siguiente.
   */
  onNextPage(): void {
    if (this.ordersResponse && this.ordersResponse.nextPage) {
      this.loadOrders(this.ordersResponse.nextPage);
    }
  }

  /**
   * Navega a la página anterior.
   */
  onPrevPage(): void {
    if (this.ordersResponse && this.ordersResponse.prevPage) {
      this.loadOrders(this.ordersResponse.prevPage);
    }
  }

  /**
   * Abre el modal de detalles para un pedido específico.
   */
  openOrderDetailsModal(orderId: number): void {
    this.modalService.openOrderDetailsModal(orderId);
  }

  /**
   * (FUTURO) Abre un modal o menú para cambiar el estado del pedido.
   */
  openChangeStatusModal(orderId: number, currentStatus: string): void {
    // ¡CAMBIO AQUÍ! Usamos showSuccess en lugar de showInfo
    this.toast.showSuccess(`(Demo) Cambiar estado del pedido #${orderId}`);
  }
}
