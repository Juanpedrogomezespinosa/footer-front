// src/app/core/services/modal.service.ts
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { FullAdminProduct } from "../models/admin.types";

// Simple interface para los datos del modal de borrado
export interface ProductDeleteInfo {
  id: number;
  name: string;
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

  // --- ¡NUEVO! Modal de DETALLES DE PEDIDO ---
  private orderDetailsModalSubject = new BehaviorSubject<boolean>(false);
  isOrderDetailsModalOpen$ = this.orderDetailsModalSubject.asObservable();
  // Subject para pasar el ID del pedido a ver
  private orderToViewIdSubject = new BehaviorSubject<number | null>(null);
  orderToViewId$ = this.orderToViewIdSubject.asObservable();

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

  // --- ¡NUEVO! Métodos DETALLES DE PEDIDO ---
  openOrderDetailsModal(orderId: number) {
    this.orderToViewIdSubject.next(orderId);
    this.orderDetailsModalSubject.next(true);
  }
  closeOrderDetailsModal() {
    this.orderDetailsModalSubject.next(false);
    this.orderToViewIdSubject.next(null);
  }
}
