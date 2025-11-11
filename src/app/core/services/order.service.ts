// src/app/core/services/order.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ProductApiResponse } from "./product.service";
import { UserAddress } from "./user.service";

// --- ¡INTERFAZ ELIMINADA! ---
// Ya no enviamos esta información desde el frontend.
// export interface OrderItemInput { ... }

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
    // Esta interfaz probablemente necesite un refactor
    // para usar la nueva 'CartItem' (product + variant),
    // pero de momento lo dejamos para que compile.
    Product: ProductApiResponse;
  }[];
  Address: UserAddress;
}

@Injectable({
  providedIn: "root",
})
export class OrderService {
  // La ruta base correcta según tu orderRoutes.js
  private readonly apiUrl = "http://localhost:3000/api/orders";

  constructor(private http: HttpClient) {}

  /**
   * --- ¡¡¡MÉTODO CORREGIDO!!! ---
   * Llama al backend para crear una orden y obtener la sesión de Stripe
   * Backend: POST /api/orders/checkout
   */
  createOrder(
    addressId: number // <-- 1. Solo pedimos el addressId
  ): Observable<CreateOrderResponse> {
    // 2. ENVIAMOS SOLO el 'addressId'
    return this.http.post<CreateOrderResponse>(`${this.apiUrl}/checkout`, {
      addressId,
    });
  }

  /**
   * Obtiene una orden específica por su ID
   * Backend: GET /api/orders/:id
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
