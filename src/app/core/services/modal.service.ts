// src/app/core/services/modal.service.ts
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { FullAdminProduct, FullAdminUser } from "../models/admin.types"; // <-- ¡Importado FullAdminUser!

// Interface para los datos del modal de borrado de producto
export interface ProductDeleteInfo {
  id: number;
  name: string;
}

// Interface para los datos del modal de estado de pedido
export interface OrderStatusInfo {
  id: number;
  status: string;
}

// Interface para los datos del modal de borrado de usuario
export interface UserDeleteInfo {
  id: number;
  username: string;
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

  // --- Modal de DETALLES de producto ---
  private detailsModalSubject = new BehaviorSubject<boolean>(false);
  isDetailsModalOpen$ = this.detailsModalSubject.asObservable();
  private productToViewSubject = new BehaviorSubject<FullAdminProduct | null>(
    null
  );
  productToView$ = this.productToViewSubject.asObservable();

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

  // --- Modal de ACTUALIZAR ESTADO ---
  private statusUpdateModalSubject = new BehaviorSubject<boolean>(false);
  isStatusUpdateModalOpen$ = this.statusUpdateModalSubject.asObservable();
  private orderToUpdateSubject = new BehaviorSubject<OrderStatusInfo | null>(
    null
  );
  orderToUpdate$ = this.orderToUpdateSubject.asObservable();

  // --- Modal de ELIMINAR USUARIO ---
  private deleteUserModalSubject = new BehaviorSubject<boolean>(false);
  isDeleteUserModalOpen$ = this.deleteUserModalSubject.asObservable();
  private userToDeleteSubject = new BehaviorSubject<UserDeleteInfo | null>(
    null
  );
  userToDelete$ = this.userToDeleteSubject.asObservable();

  // --- ¡¡¡NUEVO!!! Modal de DETALLES DE USUARIO ---
  private userDetailsModalSubject = new BehaviorSubject<boolean>(false);
  isUserDetailsModalOpen$ = this.userDetailsModalSubject.asObservable();
  private userToViewSubject = new BehaviorSubject<FullAdminUser | null>(null);
  userToView$ = this.userToViewSubject.asObservable();
  // ---------------------------------------------

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

  // --- Métodos DETALLES PRODUCTO ---
  openProductDetailsModal(product: FullAdminProduct) {
    this.productToViewSubject.next(product);
    this.detailsModalSubject.next(true);
  }
  closeProductDetailsModal() {
    this.detailsModalSubject.next(false);
    this.productToViewSubject.next(null);
  }

  // --- Métodos ELIMINAR PRODUCTO ---
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

  // --- Métodos ACTUALIZAR ESTADO ---
  openStatusUpdateModal(orderInfo: OrderStatusInfo) {
    this.orderToUpdateSubject.next(orderInfo);
    this.statusUpdateModalSubject.next(true);
  }
  closeStatusUpdateModal() {
    this.statusUpdateModalSubject.next(false);
    this.orderToUpdateSubject.next(null);
  }

  // --- Métodos ELIMINAR USUARIO ---
  openDeleteUserModal(userInfo: UserDeleteInfo) {
    this.userToDeleteSubject.next(userInfo);
    this.deleteUserModalSubject.next(true);
  }
  closeDeleteUserModal() {
    this.deleteUserModalSubject.next(false);
    this.userToDeleteSubject.next(null);
  }

  // --- ¡¡¡NUEVOS!!! Métodos DETALLES DE USUARIO ---
  openUserDetailsModal(user: FullAdminUser) {
    this.userToViewSubject.next(user);
    this.userDetailsModalSubject.next(true);
  }
  closeUserDetailsModal() {
    this.userDetailsModalSubject.next(false);
    this.userToViewSubject.next(null);
  }
  // -----------------------------------------
}
