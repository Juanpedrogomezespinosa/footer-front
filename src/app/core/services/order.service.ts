import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ProductApiResponse } from "./product.service";

// Interfaz para los items que enviamos al crear la orden
// (Basado en tu backend)
export interface OrderItemInput {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

// Interfaz para la respuesta de /checkout de tu backend
export interface CreateOrderResponse {
  message: string;
  orderId: number;
  checkoutUrl: string; // <-- La URL de Stripe
}

// Interfaz para los detalles de una orden (para la página de confirmación)
export interface OrderDetails {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  OrderItems: {
    quantity: number;
    price: number;
    Product: ProductApiResponse;
  }[];
}

@Injectable({
  providedIn: "root",
})
export class OrderService {
  // La ruta base correcta según tu orderRoutes.js
  private readonly apiUrl = "http://localhost:3000/api/orders";

  constructor(private http: HttpClient) {}

  /**
   * Llama al backend para crear una orden y obtener la sesión de Stripe
   * Backend: POST /api/orders/checkout
   */
  createOrder(items: OrderItemInput[]): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(`${this.apiUrl}/checkout`, {
      items,
    });
  }

  /**
   * Obtiene una orden específica por su ID
   * Backend: GET /api/orders/:id (¡Lo añadiremos a tu backend ahora!)
   */
  getOrderById(orderId: number): Observable<OrderDetails> {
    return this.http.get<OrderDetails>(`${this.apiUrl}/${orderId}`);
  }

  /**
   * Obtiene el historial de pedidos del usuario
   * Backend: GET /api/orders/history
   */
  getOrderHistory(): Observable<{ orders: OrderDetails[] }> {
    return this.http.get<{ orders: OrderDetails[] }>(`${this.apiUrl}/history`);
  }
}
