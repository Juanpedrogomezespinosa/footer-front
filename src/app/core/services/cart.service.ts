import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ProductApiResponse } from "./product.service";

export interface CartItem {
  id: number;
  quantity: number;
  productId: number;
  userId: number;
  Product: ProductApiResponse;
}

// (La interfaz OrderResponse se ha movido a order.service.ts)

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

  /**
   * Añade un producto al carrito
   * Backend: POST /api/cart/add
   */
  addToCart(productId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { productId, quantity });
  }

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
   * El método checkout() se ha movido a OrderService
   * ya que tu backend lo maneja en /api/orders/checkout
   */
}
