// src/app/core/services/cart.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

// --- INTERFACES DE CARRITO ---

/**
 * El producto "padre" dentro del carrito
 */
export interface CartProduct {
  id: number;
  name: string;
  price: string; // El precio base del producto
  image: string | null;
}

/**
 * La variante específica (color/talla/stock) dentro del carrito
 */
export interface CartVariant {
  id: number; // Este es el productVariantStockId
  color: string;
  size: string;
  stock: number;
  // CORRECCIÓN: Añadimos el precio específico de la variante para que TypeScript no se queje
  price?: string;
}

/**
 * La estructura principal de un item en el carrito
 */
export interface CartItem {
  id: number; // ID del CartItem
  quantity: number;
  product: CartProduct;
  variant: CartVariant;
}

@Injectable({
  providedIn: "root",
})
export class CartService {
  private readonly apiUrl = "http://localhost:3000/api/cart";

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los productos del carrito.
   */
  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl);
  }

  /**
   * Añade una variante de producto específica al carrito.
   */
  addToCart(productVariantStockId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, {
      productVariantStockId,
      quantity,
    });
  }

  /**
   * Actualiza la cantidad de un item
   */
  updateItemQuantity(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/item/${itemId}`, { quantity });
  }

  /**
   * Elimina un item del carrito
   */
  removeItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/item/${itemId}`);
  }
}
