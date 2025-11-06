import { Component, OnInit } from "@angular/core";
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  TitleCasePipe,
} from "@angular/common";
import { Observable, catchError, of, tap } from "rxjs";
import { OrderDetails, OrderService } from "app/core/services/order.service";
import { ToastService } from "app/core/services/toast.service";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-order-history",
  standalone: true,
  // Importamos Pipes para formatear fecha, moneda y el estado (titlecase)
  // Importamos RouterModule para los enlaces a los productos
  imports: [CommonModule, DatePipe, CurrencyPipe, TitleCasePipe, RouterModule],
  templateUrl: "./order-history.component.html",
})
export class OrderHistoryComponent implements OnInit {
  // Usamos un observable para manejar los datos con el pipe async
  public orders$: Observable<{ orders: OrderDetails[] } | null> | undefined;
  public loading: boolean = true;
  public error: string | null = null;

  constructor(
    private orderService: OrderService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Llamamos al servicio para obtener el historial
    this.orders$ = this.orderService.getOrderHistory().pipe(
      tap(() => {
        // Cuando los datos llegan, ocultamos el loading
        this.loading = false;
      }),
      catchError((err) => {
        // Si hay un error, lo manejamos
        this.loading = false;
        this.error = "No se pudo cargar el historial de pedidos.";
        this.toastService.showError(this.error);
        console.error("Error fetching order history:", err);
        // Devolvemos un observable nulo para que el pipe async no falle
        return of(null);
      })
    );
  }
}
