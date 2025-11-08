// src/app/admin/pages/admin-products/admin-products.component.ts
import { Component, OnInit } from "@angular/core"; // 1. Importar OnInit
import { CommonModule } from "@angular/common";
import { ModalService } from "../../../core/services/modal.service";
import { AdminService } from "../../../core/services/admin.service"; // 2. Importar AdminService
import { AdminProductsResponse } from "../../../core/models/admin.types"; // 3. Importar la interfaz de respuesta
import { filter, skip } from "rxjs/operators";

@Component({
  selector: "app-admin-products",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./admin-products.component.html",
})
export class AdminProductsComponent implements OnInit {
  // 4. Implementar OnInit

  // 5. Propiedad para almacenar la respuesta completa (incluyendo paginación)
  productsResponse: AdminProductsResponse | null = null;

  constructor(
    private modalService: ModalService,
    private adminService: AdminService // 6. Inyectar AdminService
  ) {}

  ngOnInit(): void {
    // 7. Cargar productos al iniciar el componente
    this.loadProducts(1);

    // 8. Escuchar el cierre del modal para refrescar la lista
    this.modalService.isProductModalOpen$
      .pipe(
        skip(1), // Ignorar el valor inicial
        filter((isOpen) => !isOpen) // Filtrar solo cuando isOpen es 'false' (se ha cerrado)
      )
      .subscribe(() => {
        // Recargar la página actual en la que estábamos
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
        // Aquí podrías usar tu ToastService
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

  // Futuros métodos
  // editProduct(productId: number): void { ... }
  // deleteProduct(productId: number): void { ... }
}
