// src/app/admin/pages/admin-products/admin-products.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router"; // 1. Importar RouterModule
import { ModalService } from "../../../core/services/modal.service";
import { AdminService } from "../../../core/services/admin.service";
import { AdminProductsResponse } from "../../../core/models/admin.types";
import { filter, skip } from "rxjs/operators";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-admin-products",
  standalone: true,
  imports: [CommonModule, RouterModule], // 2. Añadir RouterModule aquí
  templateUrl: "./admin-products.component.html",
})
export class AdminProductsComponent implements OnInit {
  productsResponse: AdminProductsResponse | null = null;

  constructor(
    private modalService: ModalService,
    private adminService: AdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts(1);

    // Escuchar el cierre del modal de CREAR para refrescar
    this.modalService.isProductModalOpen$
      .pipe(
        skip(1),
        filter((isOpen) => !isOpen)
      )
      .subscribe(() => {
        this.loadProducts(this.productsResponse?.currentPage || 1);
      });

    // Escuchar el cierre del modal de EDITAR para refrescar
    this.modalService.isEditModalOpen$
      .pipe(
        skip(1),
        filter((isOpen) => !isOpen)
      )
      .subscribe(() => {
        this.loadProducts(this.productsResponse?.currentPage || 1);
      });

    // Escuchar el cierre del modal de ELIMINAR para refrescar
    this.modalService.isDeleteModalOpen$
      .pipe(
        skip(1),
        filter((isOpen) => !isOpen)
      )
      .subscribe(() => {
        this.loadProducts(this.productsResponse?.currentPage || 1);
      });
  }

  /**
   * Carga la lista de productos para una página específica.
   */
  loadProducts(page: number): void {
    this.adminService.getProducts(page).subscribe({
      next: (response) => {
        this.productsResponse = response;
      },
      error: (err) => {
        console.error("Error al cargar productos:", err);
        this.toast.showError("Error al cargar productos.");
      },
    });
  }

  /**
   * Navega a la página siguiente.
   */
  onNextPage(): void {
    if (this.productsResponse && this.productsResponse.nextPage) {
      this.loadProducts(this.productsResponse.nextPage);
    }
  }

  /**
   * Navega a la página anterior.
   */
  onPrevPage(): void {
    if (this.productsResponse && this.productsResponse.prevPage) {
      this.loadProducts(this.productsResponse.prevPage);
    }
  }

  /**
   * Abre el modal para crear un nuevo producto.
   */
  openProductModal(): void {
    this.modalService.openProductModal();
  }

  /**
   * Pide confirmación y elimina un producto.
   */
  onDelete(id: number, name: string): void {
    // Llama al modal de confirmación en lugar de window.confirm
    this.modalService.openDeleteModal({ id, name });
  }

  /**
   * Obtiene los datos completos de un producto y abre el modal de edición.
   */
  onEdit(id: number): void {
    this.adminService.getProductById(id).subscribe({
      next: (product) => {
        this.modalService.openEditModal(product);
      },
      error: (err) => {
        console.error("Error al obtener detalles del producto:", err);
        this.toast.showError("No se pudieron cargar los datos para editar.");
      },
    });
  }
}
