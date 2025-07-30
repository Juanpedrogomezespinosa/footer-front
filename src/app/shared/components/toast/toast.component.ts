import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription, timer } from "rxjs";
import { ToastService, Toast } from "../../../core/services/toast.service";
import { trigger, style, animate, transition } from "@angular/animations";

@Component({
  selector: "app-toast",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./toast.component.html",
  styleUrls: ["./toast.component.scss"],
  animations: [
    trigger("fadeAnimation", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("400ms ease-out", style({ opacity: 1 })),
      ]),
      transition(":leave", [animate("400ms ease-in", style({ opacity: 0 }))]),
    ]),
  ],
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.sub = this.toastService.toast$.subscribe((toast) => {
      this.toasts.push(toast);
      timer(5000).subscribe(() => this.removeToast(toast));
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  removeToast(toast: Toast) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}
