// src/app/core/services/modal.service.ts
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { FullAdminProduct } from "../models/admin.types"; // 1. Importar la nueva interfaz

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

  // Subject para pasar los datos del producto al modal de edición
  private productToEditSubject = new BehaviorSubject<FullAdminProduct | null>(
    null
  );
  productToEdit$ = this.productToEditSubject.asObservable();

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
    this.productToEditSubject.next(product); // 1. Guardar el producto
    this.editModalSubject.next(true); // 2. Abrir el modal
  }

  closeEditModal() {
    this.editModalSubject.next(false);
    this.productToEditSubject.next(null); // Limpiar el producto al cerrar
  }
}
