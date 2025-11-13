// src/app/admin/components/user-details-modal/user-details-modal.component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
// --- ¡¡¡RUTAS CORREGIDAS!!! (Subir 3 niveles a 'core') ---
import { ModalService } from "../../../core/services/modal.service";
import { Observable } from "rxjs";
import { FullAdminUser } from "../../../core/models/admin.types";

@Component({
  selector: "app-user-details-modal",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./user-details-modal.component.html",
})
export class UserDetailsModalComponent {
  user$: Observable<FullAdminUser | null>;

  constructor(public modalService: ModalService) {
    this.user$ = this.modalService.userToView$;
  }

  close(): void {
    this.modalService.closeUserDetailsModal();
  }
}
