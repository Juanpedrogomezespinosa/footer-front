// src/app/core/services/cart.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
// import { ProductApiResponse } from "./product.service"; // <-- Ya no es necesaria

// --- ¡¡¡INTERFACES REESCRITAS!!! ---
// Definen la nueva estructura que devuelve la API (desde getCart)

/**
 * El producto "padre" dentro del carrito
 */
export interface CartProduct {
  id: number;
  name: string;
  price: string; // El precio viene del modelo Product (Decimal/String)
  image: string | null;
}

/**
 * La variante específica (color/talla/stock) dentro del carrito
 */
export interface CartVariant {
  id: number; // Este es el productVariantStockId
  color: string;
  size: string;
  stock: number; // Stock actual de esta variante
}

/**
 * La estructura principal de un item en el carrito
 */
export interface CartItem {
  id: number; // ID del CartItem (para borrarlo)
  quantity: number; // Cantidad en el carrito
  product: CartProduct;
  variant: CartVariant;
}
// ------------------------------------

@Injectable({
  providedIn: "root",
})
export class CartService {
  private readonly apiUrl = "http://localhost:3000/api/cart";

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los productos del carrito.
   * Devuelve la nueva interfaz CartItem[]
   */
  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl);
  }

  /**
   * --- ¡¡¡FUNCIÓN CORREGIDA!!! ---
   * Añade una variante de producto específica al carrito.
   */
  addToCart(
    productVariantStockId: number, // <-- CAMBIADO
    quantity: number
  ): Observable<any> {
    // Envía los nuevos campos al backend
    return this.http.post(`${this.apiUrl}/add`, {
      productVariantStockId,
      quantity,
    });
  }

  /**
   * Actualiza la cantidad de un item (por su cart_items.id)
   * (Esta función ya era correcta)
   */
  updateItemQuantity(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/item/${itemId}`, { quantity });
  }

  /**
   * Elimina un item del carrito (por su cart_items.id)
   * (Esta función ya era correcta)
   */
  removeItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/item/${itemId}`);
  }
}
