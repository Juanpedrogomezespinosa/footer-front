// src/app/admin/components/status-update-modal/status-update-modal.component.ts
import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  ModalService,
  OrderStatusInfo,
} from "../../../core/services/modal.service";
import { AdminService } from "../../../core/services/admin.service";
import { ToastService } from "../../../core/services/toast.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-status-update-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./status-update-modal.component.html",
})
export class StatusUpdateModalComponent implements OnInit, OnDestroy {
  orderInfo: OrderStatusInfo | null = null;
  private orderSubscription: Subscription | null = null;
  isSaving: boolean = false;
  statusForm: FormGroup;

  orderStatuses = [
    { value: "pagado", label: "Por Enviar" },
    { value: "enviado", label: "Enviado" },
    { value: "entregado", label: "Entregado" },
    { value: "cancelado", label: "Cancelado" },
  ];

  constructor(
    private fb: FormBuilder,
    public modalService: ModalService,
    private adminService: AdminService,
    private toast: ToastService
  ) {
    this.statusForm = this.fb.group({
      status: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    // Nos suscribimos al pedido que se va a actualizar
    this.orderSubscription = this.modalService.orderToUpdate$.subscribe(
      (info) => {
        this.orderInfo = info;
        if (info) {
          // Rellenamos el formulario con el estado actual
          this.statusForm.patchValue({ status: info.status });
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.orderSubscription?.unsubscribe();
  }

  /**
   * Cierra el modal (botón "Cancelar")
   */
  close(): void {
    this.modalService.closeStatusUpdateModal();
  }

  /**
   * Confirma y guarda el nuevo estado
   */
  saveStatus(): void {
    if (this.statusForm.invalid || !this.orderInfo) return;

    this.isSaving = true;
    const newStatus = this.statusForm.value.status;

    this.adminService
      .updateOrderStatus(this.orderInfo.id, newStatus)
      .subscribe({
        next: () => {
          this.toast.showSuccess(
            `Estado del pedido #${this.orderInfo?.id} actualizado.`
          );
          this.isSaving = false;
          this.close(); // Cierra el modal (esto disparará el refresh en la página de pedidos)
        },
        error: (err) => {
          console.error("Error al actualizar estado:", err);
          this.toast.showError(
            err.error?.message || "Error al actualizar estado."
          );
          this.isSaving = false;
        },
      });
  }
}
