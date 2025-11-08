// src/app/admin/pages/admin-products/admin-products.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalService } from "../../../core/services/modal.service";
import { AdminService } from "../../../core/services/admin.service";
import { AdminProductsResponse } from "../../../core/models/admin.types";
import { filter, skip } from "rxjs/operators";
import { ToastService } from "../../../core/services/toast.service"; // 1. Importar ToastService

@Component({
  selector: "app-admin-products",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./admin-products.component.html",
})
export class AdminProductsComponent implements OnInit {
  productsResponse: AdminProductsResponse | null = null;

  constructor(
    private modalService: ModalService,
    private adminService: AdminService,
    private toast: ToastService // 2. Inyectar ToastService
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

    // 3. Escuchar el cierre del modal de EDITAR para refrescar
    this.modalService.isEditModalOpen$
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

  // --- ¡NUEVO MÉTODO AÑADIDO! ---
  /**
   * Pide confirmación y elimina un producto.
   */
  onDelete(id: number, name: string): void {
    const confirmation = window.confirm(
      `¿Estás seguro de que quieres eliminar el producto "${name}" (ID: ${id})? Esta acción no se puede deshacer.`
    );

    if (confirmation) {
      this.adminService.deleteProduct(id).subscribe({
        next: () => {
          this.toast.showSuccess("Producto eliminado correctamente.");
          // Recargar la página actual
          this.loadProducts(this.productsResponse?.currentPage || 1);
        },
        error: (err) => {
          console.error("Error al eliminar producto:", err);
          this.toast.showError(
            err.error?.message || "Error al eliminar el producto."
          );
        },
      });
    }
  }

  // --- ¡NUEVO MÉTODO AÑADIDO! ---
  /**
   * Obtiene los datos completos de un producto y abre el modal de edición.
   */
  onEdit(id: number): void {
    // 1. Obtenemos los datos completos del producto
    this.adminService.getProductById(id).subscribe({
      next: (product) => {
        // 2. Le pasamos los datos al modal service y lo abrimos
        this.modalService.openEditModal(product);
      },
      error: (err) => {
        console.error("Error al obtener detalles del producto:", err);
        this.toast.showError("No se pudieron cargar los datos para editar.");
      },
    });
  }
}
