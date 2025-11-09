// src/app/core/services/cart.service.ts
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
  // --- ¡CAMPO AÑADIDO! ---
  size?: string; // Hacemos la talla opcional
}

@Injectable({
  providedIn: "root",
})
export class CartService {
  private readonly apiUrl = "http://localhost:3000/api/cart";

  constructor(private http: HttpClient) {}

  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl);
  }

  /**
   * Añade un producto al carrito
   * --- ¡MODIFICADO! ---
   */
  addToCart(
    productId: number,
    quantity: number,
    size?: string // <-- Acepta la talla (opcional)
  ): Observable<any> {
    // Envía la talla al backend
    return this.http.post(`${this.apiUrl}/add`, { productId, quantity, size });
  }

  updateItemQuantity(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/item/${itemId}`, { quantity });
  }

  removeItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/item/${itemId}`);
  }
}
