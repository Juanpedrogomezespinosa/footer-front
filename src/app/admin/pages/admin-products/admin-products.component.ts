// src/app/admin/pages/admin-products/admin-products.component.ts
import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms";
import { ModalService } from "../../../core/services/modal.service";
import {
  AdminService,
  ProductFilters,
} from "../../../core/services/admin.service";
import { AdminProductsResponse } from "../../../core/models/admin.types";
// --- ¡CAMBIO AQUÍ! ---
import {
  filter,
  skip,
  debounceTime,
  distinctUntilChanged,
} from "rxjs/operators"; // Operadores de RxJS
import { Subscription } from "rxjs"; // 1. Subscription se importa de 'rxjs'
// --------------------
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-admin-products",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: "./admin-products.component.html",
})
export class AdminProductsComponent implements OnInit, OnDestroy {
  productsResponse: AdminProductsResponse | null = null;
  isLoading: boolean = true;
  filterForm: FormGroup;
  private filterSubscription: Subscription | null = null;

  constructor(
    private modalService: ModalService,
    private adminService: AdminService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      name: [""], // Para la barra de búsqueda
      category: [""], // Para el <select> de categoría
      stock: [""], // Para el <select> de stock
    });
  }

  ngOnInit(): void {
    this.loadProducts(1);

    // Escuchar los cambios en los filtros
    this.filterSubscription = this.filterForm.valueChanges
      .pipe(
        debounceTime(400), // Esperar 400ms después de la última pulsación
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ) // Solo si el valor es diferente
      )
      .subscribe((filters) => {
        // Cuando un filtro cambia, siempre volvemos a la página 1
        this.loadProducts(1, filters);
      });

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

  ngOnDestroy(): void {
    // Limpiar la suscripción a los filtros
    this.filterSubscription?.unsubscribe();
  }

  /**
   * Carga la lista de productos para una página específica y con filtros.
   */
  loadProducts(page: number, filters: ProductFilters | null = null): void {
    this.isLoading = true;

    // Si no se pasan filtros, usa los valores actuales del formulario
    const activeFilters = filters || this.filterForm.value;

    this.adminService.getProducts(page, 10, activeFilters).subscribe({
      next: (response) => {
        this.productsResponse = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error al cargar productos:", err);
        this.toast.showError("Error al cargar productos.");
        this.isLoading = false;
      },
    });
  }

  /**
   * Navega a la página siguiente.
   */
  onNextPage(): void {
    if (this.productsResponse && this.productsResponse.nextPage) {
      // Pasa la página siguiente, los filtros se cogen del formulario
      this.loadProducts(this.productsResponse.nextPage);
    }
  }

  /**
   * Navega a la página anterior.
   */
  onPrevPage(): void {
    if (this.productsResponse && this.productsResponse.prevPage) {
      // Pasa la página anterior, los filtros se cogen del formulario
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
