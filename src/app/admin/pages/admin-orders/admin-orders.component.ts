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
        skip(1),
        filter((isOpen) => !isOpen)
      )
      .subscribe(() => {
        this.loadOrders(this.ordersResponse?.currentPage || 1);
      });

    // Escuchar el cierre del modal de ESTADO para refrescar la lista
    // Esto asegura que cuando cambies el estado, la tabla se actualice sola
    this.modalService.isStatusUpdateModalOpen$
      .pipe(
        skip(1),
        filter((isOpen) => !isOpen)
      )
      .subscribe(() => {
        this.loadOrders(this.ordersResponse?.currentPage || 1);
      });
  }

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

  onNextPage(): void {
    if (this.ordersResponse && this.ordersResponse.nextPage) {
      this.loadOrders(this.ordersResponse.nextPage);
    }
  }

  onPrevPage(): void {
    if (this.ordersResponse && this.ordersResponse.prevPage) {
      this.loadOrders(this.ordersResponse.prevPage);
    }
  }

  openOrderDetailsModal(orderId: number): void {
    this.modalService.openOrderDetailsModal(orderId);
  }

  /**
   * Abre el modal para cambiar el estado del pedido.
   */
  openChangeStatusModal(orderId: number, currentStatus: string): void {
    this.modalService.openStatusUpdateModal({
      id: orderId,
      status: currentStatus,
    });
  }
}
