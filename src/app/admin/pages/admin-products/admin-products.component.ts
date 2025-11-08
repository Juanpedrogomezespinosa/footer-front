// src/app/admin/pages/admin-products/admin-products.component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalService } from "../../../core/services/modal.service"; // Ruta corregida (../../../)

@Component({
  selector: "app-admin-products",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./admin-products.component.html",
})
export class AdminProductsComponent {
  // ¡Clase Corregida!

  constructor(private modalService: ModalService) {}

  // Este componente también podrá abrir el modal
  openProductModal(): void {
    this.modalService.openProductModal();
  }
}
