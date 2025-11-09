// src/app/core/services/modal.service.ts
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { FullAdminProduct } from "../models/admin.types";

// Interface para los datos del modal de borrado
export interface ProductDeleteInfo {
  id: number;
  name: string;
}

// --- ¡NUEVA INTERFAZ! ---
// Interface para los datos del modal de estado
export interface OrderStatusInfo {
  id: number;
  status: string;
}

@Injectable({
  providedIn: "root",
})
export class ModalService {
  // --- Modal de CREAR producto ---
  private productModalSubject = new BehaviorSubject<boolean>(false);
  isProductModalOpen$ = this.productModalSubject.asObservable();

  // --- Modal de EDITAR producto ---
  private editModalSubject = new BehaviorSubject<boolean>(false);
  isEditModalOpen$ = this.editModalSubject.asObservable();
  private productToEditSubject = new BehaviorSubject<FullAdminProduct | null>(
    null
  );
  productToEdit$ = this.productToEditSubject.asObservable();

  // --- Modal de ELIMINAR producto ---
  private deleteModalSubject = new BehaviorSubject<boolean>(false);
  isDeleteModalOpen$ = this.deleteModalSubject.asObservable();
  private productToDeleteSubject =
    new BehaviorSubject<ProductDeleteInfo | null>(null);
  productToDelete$ = this.productToDeleteSubject.asObservable();

  // --- Modal de DETALLES DE PEDIDO ---
  private orderDetailsModalSubject = new BehaviorSubject<boolean>(false);
  isOrderDetailsModalOpen$ = this.orderDetailsModalSubject.asObservable();
  private orderToViewIdSubject = new BehaviorSubject<number | null>(null);
  orderToViewId$ = this.orderToViewIdSubject.asObservable();

  // --- ¡NUEVO! Modal de ACTUALIZAR ESTADO ---
  private statusUpdateModalSubject = new BehaviorSubject<boolean>(false);
  isStatusUpdateModalOpen$ = this.statusUpdateModalSubject.asObservable();
  private orderToUpdateSubject = new BehaviorSubject<OrderStatusInfo | null>(
    null
  );
  orderToUpdate$ = this.orderToUpdateSubject.asObservable();

  constructor() {}

  // --- Métodos CREAR ---
  openProductModal() {
    this.productModalSubject.next(true);
  }
  closeProductModal() {
    this.productModalSubject.next(false);
  }

  // --- Métodos EDITAR ---
  openEditModal(product: FullAdminProduct) {
    this.productToEditSubject.next(product);
    this.editModalSubject.next(true);
  }
  closeEditModal() {
    this.editModalSubject.next(false);
    this.productToEditSubject.next(null);
  }

  // --- Métodos ELIMINAR ---
  openDeleteModal(productInfo: ProductDeleteInfo) {
    this.productToDeleteSubject.next(productInfo);
    this.deleteModalSubject.next(true);
  }
  closeDeleteModal() {
    this.deleteModalSubject.next(false);
    this.productToDeleteSubject.next(null);
  }

  // --- Métodos DETALLES DE PEDIDO ---
  openOrderDetailsModal(orderId: number) {
    this.orderToViewIdSubject.next(orderId);
    this.orderDetailsModalSubject.next(true);
  }
  closeOrderDetailsModal() {
    this.orderDetailsModalSubject.next(false);
    this.orderToViewIdSubject.next(null);
  }

  // --- ¡NUEVO! Métodos ACTUALIZAR ESTADO ---
  openStatusUpdateModal(orderInfo: OrderStatusInfo) {
    this.orderToUpdateSubject.next(orderInfo);
    this.statusUpdateModalSubject.next(true);
  }
  closeStatusUpdateModal() {
    this.statusUpdateModalSubject.next(false);
    this.orderToUpdateSubject.next(null);
  }
}
