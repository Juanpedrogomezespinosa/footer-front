// src/app/admin/pages/admin-users/admin-users.component.ts
import { Component, OnInit } from "@angular/core"; // 1. Importar OnInit
import { CommonModule } from "@angular/common";
import { AdminService } from "../../../core/services/admin.service"; // 2. Importar servicios
import { ToastService } from "../../../core/services/toast.service";
import { AuthService } from "../../../core/services/auth.service";
import { AdminUser } from "../../../core/models/admin.types"; // 3. Importar el tipo de dato
import { Observable, of } from "rxjs";
import { catchError, take } from "rxjs/operators";

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
    private authService: AuthService
  ) {
    // Obtenemos el ID del admin actual para deshabilitar su propio botón de borrado
    this.authService.user$.pipe(take(1)).subscribe((user) => {
      this.currentAdminId = user?.id || null;
    });
  }

  ngOnInit(): void {
    this.loadUsers();
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

    // Solo para fines de 'isLoading', nos suscribimos.
    // El pipe 'async' en el HTML manejará la data.
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

    // Usamos el confirm de navegador por ahora.
    // (Podemos cambiarlo a un modal personalizado si lo prefieres)
    const confirmation = window.confirm(
      `¿Estás seguro de que quieres eliminar al usuario "${username}" (ID: ${userId})? Esta acción no se puede deshacer.`
    );

    if (confirmation) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.toast.showSuccess("Usuario eliminado correctamente.");
          this.loadUsers(); // Recargamos la lista
        },
        error: (err) => {
          console.error("Error al eliminar usuario:", err);
          this.toast.showError(
            err.error?.message || "Error al eliminar el usuario."
          );
        },
      });
    }
  }
}
