// src/app/core/services/modal.service.ts
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ModalService {
  // BehaviorSubject para el modal de producto
  private productModalSubject = new BehaviorSubject<boolean>(false);
  isProductModalOpen$ = this.productModalSubject.asObservable();

  constructor() {}

  openProductModal() {
    this.productModalSubject.next(true);
  }

  closeProductModal() {
    this.productModalSubject.next(false);
  }

  // Aquí podrías añadir más observables para otros modals (ej. editarProducto, eliminarUsuario)
}
