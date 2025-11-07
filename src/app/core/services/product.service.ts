import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

/**
 * Interfaz para los productos recibidos desde la API.
 * (Sin cambios)
 */
export interface ProductApiResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  averageRating?: number;
  ratingCount?: number;
  size?: string;
  brand?: string;
  color?: string;
  stock?: number;
  category: "zapatillas" | "ropa" | "complementos";
  sub_category?: string;
  gender?: "hombre" | "mujer" | "unisex";
}

/**
 * Interfaz para las imágenes de la galería
 */
export interface ProductImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

/**
 * Interfaz de producto para uso interno del frontend.
 * (Completa)
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
  brand?: string;
  oldPrice?: number;
  color?: string;
  material?: string;
  gender?: "hombre" | "mujer" | "unisex";
}

/**
 * Estructura de la respuesta paginada desde el backend.
 * (Sin cambios)
 */
export interface PaginatedProductResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  nextPage: number | null;
  prevPage: number | null;
  products: ProductApiResponse[];
}

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private readonly apiUrl = "http://localhost:3000/api/products";

  constructor(private httpClient: HttpClient) {}

  /**
   * Obtiene productos desde la API...
   * (Sin cambios)
   */
  getProducts(
    page: number,
    limit: number,
    filters: Record<string, string | string[]> = {},
    sort: string = ""
  ): Observable<PaginatedProductResponse> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("limit", limit.toString());

    for (const key in filters) {
      if (Object.prototype.hasOwnProperty.call(filters, key)) {
        const value = filters[key];
        if (Array.isArray(value)) {
          value.forEach((v) => {
            params = params.append(key, v);
          });
        } else {
          params = params.set(key, value as string);
        }
      }
    }

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
    }

    return this.httpClient.get<PaginatedProductResponse>(this.apiUrl, {
      params,
    });
  }

  /**
   * Obtiene un producto específico por su ID.
   * (Sin cambios)
   */
  getProductById(productId: number): Observable<ProductApiResponse> {
    return this.httpClient.get<ProductApiResponse>(
      `${this.apiUrl}/${productId}`
    );
  }

  /**
   * --- ¡NUEVO MÉTODO AÑADIDO! ---
   * Obtiene los productos relacionados para "Completa tu look"
   * Llama a GET /api/products/:id/related
   */
  getRelatedProducts(productId: number): Observable<Product[]> {
    return this.httpClient.get<Product[]>(
      `${this.apiUrl}/${productId}/related`
    );
  }
}
