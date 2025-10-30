import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ProductApiResponse } from "./product.service";

// Interfaz para un item del carrito, tal como lo devuelve tu API
export interface CartItem {
  id: number;
  quantity: number;
  productId: number;
  userId: number;
  Product: ProductApiResponse;
}

// Interfaz para la respuesta de /checkout
export interface OrderResponse {
  message: string;
  order: {
    id: number;
    total: number;
    status: string;
    createdAt: string;
    items: any[];
  };
}

@Injectable({
  providedIn: "root",
})
export class CartService {
  private readonly apiUrl = "http://localhost:3000/api/cart";

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los productos del carrito del usuario
   * Backend: GET /api/cart
   */
  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl);
  }

  // --- 👇 ESTE ES EL MÉTODO QUE FALTABA ---
  /**
   * Añade un producto al carrito
   * Backend: POST /api/cart/add
   * Tu backend espera: { productId, quantity }
   */
  addToCart(productId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { productId, quantity });
  }
  // --- FIN DEL NUEVO MÉTODO ---

  /**
   * Actualiza la cantidad de un item en el carrito
   * Backend: PUT /api/cart/item/:itemId
   */
  updateItemQuantity(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/item/${itemId}`, { quantity });
  }

  /**
   * Elimina un item del carrito
   * Backend: DELETE /api/cart/item/:itemId
   */
  removeItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/item/${itemId}`);
  }

  /**
   * Procesa el pago
   * Backend: POST /api/cart/checkout
   */
  checkout(): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/checkout`, {});
  }
}
