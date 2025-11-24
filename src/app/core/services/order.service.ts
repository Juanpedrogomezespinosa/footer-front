import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ProductApiResponse } from "./product.service";
import { UserAddress } from "./user.service";

// Interfaz para la respuesta de /checkout
export interface CreateOrderResponse {
  message: string;
  orderId: number;
  checkoutUrl: string;
}

// Interfaz para los detalles de una orden
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
  Address: UserAddress;
}

@Injectable({
  providedIn: "root",
})
export class OrderService {
  private readonly apiUrl = "http://localhost:3000/api/orders";

  constructor(private http: HttpClient) {}

  /**
   * Crea una orden
   */
  createOrder(
    addressId: number,
    shippingMethod: string = "standard"
  ): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(`${this.apiUrl}/checkout`, {
      addressId,
      shippingMethod,
    });
  }

  /**
   * Obtiene una orden específica por su ID
   */
  getOrderById(orderId: number): Observable<OrderDetails> {
    return this.http.get<OrderDetails>(`${this.apiUrl}/${orderId}`);
  }

  /**
   * Obtiene el historial de pedidos del usuario
   */
  getOrderHistory(): Observable<{ orders: OrderDetails[] }> {
    return this.http.get<{ orders: OrderDetails[] }>(`${this.apiUrl}/history`);
  }

  /**
   * Cancela un pedido.
   */
  cancelOrder(orderId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}/cancel`, {});
  }
}
