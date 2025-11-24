import {
  Component,
  OnInit,
  signal,
  WritableSignal,
  Signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { OrderService, OrderDetails } from "../core/services/order.service"; // <-- 1. Importamos el servicio
import { AuthService, User } from "../core/services/auth.service";
import { map } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-confirmation",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./confirmation.component.html",
  styleUrls: [],
})
export class ConfirmationComponent implements OnInit {
  // Signals para el estado
  public order: WritableSignal<OrderDetails | null> = signal(null);
  public isLoading = signal(true);
  public error: WritableSignal<string | null> = signal(null);
  public userEmail: WritableSignal<string | undefined> = signal(undefined);

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private orderService: OrderService // <-- 2. Inyectamos el servicio correcto
  ) {
    // Obtenemos el email del AuthService
    this.authService.user$
      .pipe(map((user) => user?.email))
      .subscribe((email) => {
        this.userEmail.set(email);
      });
  }

  ngOnInit(): void {
    const orderIdParam = this.route.snapshot.paramMap.get("orderId");
    const orderId = Number(orderIdParam);

    if (isNaN(orderId)) {
      this.error.set("Número de pedido inválido.");
      this.isLoading.set(false);
      return;
    }

    // Usamos el OrderService (que llama a /api/orders/:id)
    // en lugar de una llamada http manual a la URL incorrecta.
    this.orderService.getOrderById(orderId).subscribe({
      next: (orderData) => {
        this.order.set(orderData);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error al cargar la confirmación:", err);
        this.error.set(err.error?.message || "No se pudo encontrar el pedido.");
        this.isLoading.set(false);
      },
    });
  }
}
