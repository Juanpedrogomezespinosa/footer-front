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
import {
  filter,
  skip,
  debounceTime,
  distinctUntilChanged,
} from "rxjs/operators";
import { Subscription } from "rxjs";
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
      name: [""],
      category: [""],
      stock: [""],
    });
  }

  ngOnInit(): void {
    this.loadProducts(1);

    // Escuchar los cambios en los filtros
    this.filterSubscription = this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe((filters) => {
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

    // Escuchar el cierre del modal de DETALLES para refrescar
    this.modalService.isDetailsModalOpen$
      .pipe(
        skip(1),
        filter((isOpen) => !isOpen)
      )
      .subscribe(() => {
        this.loadProducts(this.productsResponse?.currentPage || 1);
      });
  }

  ngOnDestroy(): void {
    this.filterSubscription?.unsubscribe();
  }

  /**
   * Carga la lista de productos para una página específica y con filtros.
   */
  loadProducts(page: number, filters: ProductFilters | null = null): void {
    this.isLoading = true;
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

  /**
   * Obtiene los datos completos de un producto y abre el modal de DETALLES.
   */
  onDetails(id: number): void {
    this.adminService.getProductById(id).subscribe({
      next: (product) => {
        this.modalService.openProductDetailsModal(product);
      },
      error: (err) => {
        console.error("Error al obtener detalles del producto:", err);
        this.toast.showError("No se pudieron cargar los datos del producto.");
      },
    });
  }
}
