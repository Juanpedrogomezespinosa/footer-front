import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export type ToastType = "success" | "error";

export interface Toast {
  type: ToastType;
  message: string; // HTML permitido
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

  private showToast(type: ToastType, message: string) {
    this.toastSubject.next({ type, message });
  }
}
