import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ModalService,
  UserDeleteInfo,
} from "../../../core/services/modal.service"; // Importar UserDeleteInfo
import { AdminService } from "../../../core/services/admin.service";
import { ToastService } from "../../../core/services/toast.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-delete-user-modal",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./delete-user-modal.component.html",
})
export class DeleteUserModalComponent implements OnInit, OnDestroy {
  userInfo: UserDeleteInfo | null = null;
  private userSubscription: Subscription | null = null;
  isDeleting: boolean = false;

  constructor(
    public modalService: ModalService,
    private adminService: AdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // Nos suscribimos al usuario que se va a eliminar
    this.userSubscription = this.modalService.userToDelete$.subscribe(
      (info) => {
        this.userInfo = info;
      }
    );
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  /**
   * Cierra el modal (botón "Cancelar")
   */
  close(): void {
    this.modalService.closeDeleteUserModal();
  }

  /**
   * Confirma y ejecuta la eliminación del usuario
   */
  confirmDelete(): void {
    if (!this.userInfo) return;

    this.isDeleting = true; // Deshabilitar botón

    this.adminService.deleteUser(this.userInfo.id).subscribe({
      next: () => {
        this.toast.showSuccess(
          `Usuario "${this.userInfo?.username}" eliminado.`
        );
        this.isDeleting = false;
        this.close(); // Cierra el modal (esto disparará el refresh en la página de usuarios)
      },
      error: (err) => {
        console.error("Error al eliminar usuario:", err);
        this.toast.showError(
          err.error?.message || "Error al eliminar el usuario."
        );
        this.isDeleting = false;
      },
    });
  }
}
