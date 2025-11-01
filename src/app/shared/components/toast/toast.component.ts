import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  WritableSignal,
} from "@angular/core"; // 1. Importar signal
import { CommonModule } from "@angular/common";
import { Subscription, timer } from "rxjs";
import { ToastService, Toast } from "../../../core/services/toast.service";
import { trigger, style, animate, transition } from "@angular/animations";
import { Router, NavigationEnd } from "@angular/router"; // 2. Importar Router y NavigationEnd
import { filter } from "rxjs/operators";

@Component({
  selector: "app-toast",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./toast.component.html",
  styleUrls: [],
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
  private toastSub!: Subscription;
  private routerSub!: Subscription; // 4. Añadir subscripción al router

  // 5. Crear un signal para saber si estamos en la página de productos
  public isProductsPage: WritableSignal<boolean> = signal(false);

  constructor(
    private toastService: ToastService,
    private router: Router // 3. Inyectar el Router
  ) {}

  ngOnInit() {
    this.toastSub = this.toastService.toast$.subscribe((toast) => {
      this.toasts.push(toast);
      timer(5000).subscribe(() => this.removeToast(toast));
    });

    // 6. Escuchar los eventos de navegación
    this.routerSub = this.router.events
      .pipe(
        // Filtrar solo los eventos de 'NavigationEnd'
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        // Comprobar si la URL actual (después de redirecciones) incluye '/products'
        this.isProductsPage.set(event.urlAfterRedirects.includes("/products"));
      });
  }

  ngOnDestroy() {
    this.toastSub.unsubscribe();
    this.routerSub.unsubscribe(); // 7. Limpiar la subscripción
  }

  removeToast(toast: Toast) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}
