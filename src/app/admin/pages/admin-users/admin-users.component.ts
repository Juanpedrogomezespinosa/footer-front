import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AdminService } from "../../../core/services/admin.service";
import { ToastService } from "../../../core/services/toast.service";
import { AuthService } from "../../../core/services/auth.service";
import { AdminUser, FullAdminUser } from "../../../core/models/admin.types";
import { Observable, of, Subscription } from "rxjs";
import {
  catchError,
  take,
  skip,
  filter,
  debounceTime,
  distinctUntilChanged,
} from "rxjs/operators";
import { ModalService } from "../../../core/services/modal.service";
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: "app-admin-users",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./admin-users.component.html",
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  users$: Observable<AdminUser[]> = of([]);
  isLoading: boolean = true;
  currentAdminId: number | null = null;
  filterForm: FormGroup;
  private filterSubscription: Subscription | null = null;
  private modalSubscription: Subscription | null = null;

  constructor(
    private adminService: AdminService,
    private toast: ToastService,
    private authService: AuthService,
    private modalService: ModalService,
    private fb: FormBuilder
  ) {
    this.authService.user$.pipe(take(1)).subscribe((user) => {
      this.currentAdminId = user?.id || null;
    });

    this.filterForm = this.fb.group({
      search: [""],
    });
  }

  ngOnInit(): void {
    this.loadUsers();

    this.modalSubscription = this.modalService.isDeleteUserModalOpen$
      .pipe(
        skip(1),
        filter((isOpen) => !isOpen)
      )
      .subscribe(() => {
        this.loadUsers(this.filterForm.value.search); // Recargar con el filtro
      });

    this.modalService.isUserDetailsModalOpen$
      .pipe(
        skip(1),
        filter((isOpen) => !isOpen)
      )
      .subscribe();

    this.filterSubscription = this.filterForm
      .get("search")!
      .valueChanges.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.loadUsers(searchValue);
      });
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones
    this.filterSubscription?.unsubscribe();
    this.modalSubscription?.unsubscribe();
  }

  loadUsers(searchQuery: string | null = null): void {
    this.isLoading = true;
    this.users$ = this.adminService.getUsers(searchQuery).pipe(
      catchError((err) => {
        console.error("Error al cargar usuarios:", err);
        this.toast.showError("Error al cargar la lista de usuarios.");
        this.isLoading = false;
        return of([]);
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
    this.modalService.openDeleteUserModal({ id: userId, username: username });
  }

  /**
   * Obtiene los datos completos de un usuario y abre el modal de detalles.
   */
  onDetails(id: number): void {
    this.adminService.getAdminUserById(id).subscribe({
      next: (user) => {
        this.modalService.openUserDetailsModal(user);
      },
      error: (err) => {
        console.error("Error al obtener detalles del usuario:", err);
        this.toast.showError("No se pudieron cargar los datos del usuario.");
      },
    });
  }
}
