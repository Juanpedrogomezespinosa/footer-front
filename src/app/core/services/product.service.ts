import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

/**
 * Interfaz para los productos recibidos desde la API.
 * --- ACTUALIZADA ---
 * Ahora incluye los campos 'category' y 'sub_category'
 * y usa tipos literales para 'category'.
 */
export interface ProductApiResponse {
  id: number;
  name: string;
  description?: string;
  price: number; // La API devuelve string, pero HttpClient lo puede parsear
  image?: string;
  averageRating?: number;
  ratingCount?: number;
  size?: string;
  brand?: string;
  color?: string;
  stock?: number;
  category: "zapatillas" | "ropa" | "complementos"; // Tipado estricto
  sub_category?: string;
  gender?: "hombre" | "mujer" | "unisex";
  // Otros campos según respuesta de la API
}

/**
 * Interfaz de producto para uso interno del frontend.
 * --- ACTUALIZADA ---
 */
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  rating?: number;
  ratingCount?: number;
  size?: string;
  category: "zapatillas" | "ropa" | "complementos";
  // Otros campos que necesites
}

/**
 * Estructura de la respuesta paginada desde el backend.
 */
export interface PaginatedProductResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  nextPage: number | null;
  prevPage: number | null; // Corregido de 'previousPage' a 'prevPage' para que coincida con tu API
  products: ProductApiResponse[];
}

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private readonly apiUrl = "http://localhost:3000/api/products";

  constructor(private httpClient: HttpClient) {}

  /**
   * Obtiene productos desde la API con soporte para paginación, filtros y ordenamiento.
   * --- REFACTORIZADO ---
   */
  getProducts(
    page: number,
    limit: number,
    // El 'Record' es la clave. Aceptará { category: ['ropa'], brand: ['Adidas'] }
    filters: Record<string, string | string[]> = {},
    sort: string = ""
  ): Observable<PaginatedProductResponse> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("limit", limit.toString());

    // --- MEJORA ---
    // Ya no se hardcodea 'stock=true'.
    // El componente que llame al servicio debe incluirlo en los filtros si lo desea.
    // Ej: filters: { stock: 'true', category: 'zapatillas' }

    for (const key in filters) {
      if (Object.prototype.hasOwnProperty.call(filters, key)) {
        const value = filters[key];

        // Comprobamos si el valor es un array (como 'category' o 'brand')
        if (Array.isArray(value)) {
          value.forEach((v) => {
            params = params.append(key, v);
          });
        } else {
          // Si es un valor único (como 'stock' o 'minPrice')
          params = params.set(key, value as string);
        }
      }
    }

    // El switch de ordenación está perfecto, sin cambios.
    switch (sort) {
      case "price_asc":
        params = params.set("sortBy", "price").set("order", "ASC");
        break;
      case "price_desc":
        params = params.set("sortBy", "price").set("order", "DESC");
        break;
      case "rating_desc":
        params = params.set("sortBy", "averageRating").set("order", "DESC");
        break;
      case "rating_count_desc":
        params = params.set("sortBy", "ratingCount").set("order", "DESC");
        break;
      // ... más casos si los necesitas
    }

    return this.httpClient.get<PaginatedProductResponse>(this.apiUrl, {
      params,
    });
  }

  /**
   * Obtiene un producto específico por su ID.
   */
  getProductById(productId: number): Observable<ProductApiResponse> {
    return this.httpClient.get<ProductApiResponse>(
      `${this.apiUrl}/${productId}`
    );
  }
}
