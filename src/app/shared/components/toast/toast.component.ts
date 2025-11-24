import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  WritableSignal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription, timer } from "rxjs";
import { ToastService, Toast } from "../../../core/services/toast.service";
import { trigger, style, animate, transition } from "@angular/animations";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-toast",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./toast.component.html",
  styleUrls: [], // Usamos Tailwind en el HTML
  animations: [
    trigger("fadeAnimation", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(10px)" }),
        animate(
          "300ms ease-out",
          style({ opacity: 1, transform: "translateY(0)" })
        ),
      ]),
      transition(":leave", [
        animate(
          "300ms ease-in",
          style({ opacity: 0, transform: "translateY(10px)" })
        ),
      ]),
    ]),
  ],
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private toastSub!: Subscription;
  private routerSub!: Subscription;

  // Signal para saber si estamos en la página de productos
  public isProductsPage: WritableSignal<boolean> = signal(false);

  constructor(private toastService: ToastService, private router: Router) {}

  ngOnInit() {
    this.toastSub = this.toastService.toast$.subscribe((toast) => {
      this.toasts.push(toast);
      // Auto-eliminar después de 5 segundos
      timer(5000).subscribe(() => this.removeToast(toast));
    });

    // Escuchar navegación para ajustar la posición
    this.routerSub = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        this.isProductsPage.set(event.urlAfterRedirects.includes("/products"));
      });
  }

  ngOnDestroy() {
    if (this.toastSub) this.toastSub.unsubscribe();
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  removeToast(toast: Toast) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}
