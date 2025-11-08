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

  // --- ¡NUEVO! Modal de ELIMINAR producto ---
  private deleteModalSubject = new BehaviorSubject<boolean>(false);
  isDeleteModalOpen$ = this.deleteModalSubject.asObservable();
  private productToDeleteSubject =
    new BehaviorSubject<ProductDeleteInfo | null>(null);
  productToDelete$ = this.productToDeleteSubject.asObservable();

  constructor() {}

  // --- Métodos para el modal de CREAR ---
  openProductModal() {
    this.productModalSubject.next(true);
  }
  closeProductModal() {
    this.productModalSubject.next(false);
  }

  // --- Métodos para el modal de EDITAR ---
  openEditModal(product: FullAdminProduct) {
    this.productToEditSubject.next(product);
    this.editModalSubject.next(true);
  }
  closeEditModal() {
    this.editModalSubject.next(false);
    this.productToEditSubject.next(null);
  }

  // --- ¡NUEVO! Métodos para el modal de ELIMINAR ---
  openDeleteModal(productInfo: ProductDeleteInfo) {
    this.productToDeleteSubject.next(productInfo);
    this.deleteModalSubject.next(true);
  }
  closeDeleteModal() {
    this.deleteModalSubject.next(false);
    this.productToDeleteSubject.next(null);
  }
}
