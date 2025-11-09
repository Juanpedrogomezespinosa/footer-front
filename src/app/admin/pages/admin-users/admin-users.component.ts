// src/app/admin/pages/admin-users/admin-users.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AdminService } from "../../../core/services/admin.service";
import { ToastService } from "../../../core/services/toast.service";
import { AuthService } from "../../../core/services/auth.service";
import { AdminUser } from "../../../core/models/admin.types";
import { Observable, of } from "rxjs";
import { catchError, take, skip, filter } from "rxjs/operators";
import { ModalService } from "../../../core/services/modal.service"; // 1. Importar ModalService

@Component({
  selector: "app-admin-users",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./admin-users.component.html",
})
export class AdminUsersComponent implements OnInit {
  users$: Observable<AdminUser[]> = of([]); // Observable para la lista
  isLoading: boolean = true;
  currentAdminId: number | null = null; // Para evitar la auto-eliminación

  constructor(
    private adminService: AdminService,
    private toast: ToastService,
    private authService: AuthService,
    private modalService: ModalService // 2. Inyectar ModalService
  ) {
    // Obtenemos el ID del admin actual para deshabilitar su propio botón de borrado
    this.authService.user$.pipe(take(1)).subscribe((user) => {
      this.currentAdminId = user?.id || null;
    });
  }

  ngOnInit(): void {
    this.loadUsers();

    // 3. Escuchar el cierre del modal de ELIMINAR USUARIO para refrescar
    this.modalService.isDeleteUserModalOpen$
      .pipe(
        skip(1), // Ignorar el valor inicial
        filter((isOpen) => !isOpen) // Filtrar solo cuando se cierra
      )
      .subscribe(() => {
        this.loadUsers(); // Recargar la lista de usuarios
      });
  }

  /**
   * Carga (o recarga) la lista de usuarios desde el servicio.
   */
  loadUsers(): void {
    this.isLoading = true;
    this.users$ = this.adminService.getUsers().pipe(
      catchError((err) => {
        console.error("Error al cargar usuarios:", err);
        this.toast.showError("Error al cargar la lista de usuarios.");
        this.isLoading = false;
        return of([]); // Devolver un array vacío en caso de error
      })
    );

    this.users$.subscribe(() => {
      this.isLoading = false;
    });
  }

  /**
   * Pide confirmación y elimina un usuario.
   */
  onDeleteUser(userId: number, username: string): void {
    if (userId === this.currentAdminId) {
      this.toast.showError("No puedes eliminarte a ti mismo.");
      return;
    }

    // 4. --- ¡LÓGICA ACTUALIZADA! ---
    // Ya no usamos window.confirm
    this.modalService.openDeleteUserModal({ id: userId, username: username });

    // El resto de la lógica (llamar al servicio, mostrar toast,
    // y refrescar la lista) se maneja ahora desde:
    // 1. El 'delete-user-modal.component.ts' (la llamada)
    // 2. El 'ngOnInit' de este componente (el refresco)
  }
}
