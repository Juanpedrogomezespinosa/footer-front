import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

// Actualizamos los tipos permitidos
export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  type: ToastType;
  message: string;
}

@Injectable({
  providedIn: "root",
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  toast$ = this.toastSubject.asObservable();

  showSuccess(message: string) {
    this.showToast("success", message);
  }

  showError(message: string) {
    this.showToast("error", message);
  }

  showInfo(message: string) {
    this.showToast("info", message);
  }

  // añadimos warning
  showWarning(message: string) {
    this.showToast("warning", message);
  }

  private showToast(type: ToastType, message: string) {
    this.toastSubject.next({ type, message });
  }
}
