import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ModalService,
  ProductDeleteInfo,
} from "../../../core/services/modal.service";
import { AdminService } from "../../../core/services/admin.service";
import { ToastService } from "../../../core/services/toast.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-delete-product-modal",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./delete-product-modal.component.html",
})
export class DeleteProductModalComponent implements OnInit, OnDestroy {
  productInfo: ProductDeleteInfo | null = null;
  private productSubscription: Subscription | null = null;
  isDeleting: boolean = false; // Para deshabilitar el botón mientras se borra

  constructor(
    public modalService: ModalService,
    private adminService: AdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // Nos suscribimos al producto que se va a eliminar
    this.productSubscription = this.modalService.productToDelete$.subscribe(
      (info) => {
        this.productInfo = info;
      }
    );
  }

  ngOnDestroy(): void {
    this.productSubscription?.unsubscribe();
  }

  /**
   * Cierra el modal (botón "Cancelar")
   */
  close(): void {
    this.modalService.closeDeleteModal();
  }

  /**
   * Confirma y ejecuta la eliminación del producto
   */
  confirmDelete(): void {
    if (!this.productInfo) return;

    this.isDeleting = true; // Deshabilitar botón

    this.adminService.deleteProduct(this.productInfo.id).subscribe({
      next: () => {
        this.toast.showSuccess(
          `Producto "${this.productInfo?.name}" eliminado.`
        );
        this.isDeleting = false;
        this.close(); // Cierra el modal (esto disparará el refresh en la página de productos)
      },
      error: (err) => {
        console.error("Error al eliminar producto:", err);
        this.toast.showError(
          err.error?.message || "Error al eliminar el producto."
        );
        this.isDeleting = false;
      },
    });
  }
}
