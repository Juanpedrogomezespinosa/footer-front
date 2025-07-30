import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

/**
 * Interfaz para los productos recibidos desde la API.
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
  // Otros campos según respuesta de la API
}

/**
 * Interfaz de producto para uso interno del frontend.
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
  previousPage: number | null;
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
   */
  getProducts(
    page: number,
    limit: number,
    filters: Record<string, string[]> = {},
    sort: string = ""
  ): Observable<PaginatedProductResponse> {
    let params = new HttpParams()
      .set("page", page)
      .set("limit", limit)
      .set("stock", "true");

    for (const key in filters) {
      filters[key].forEach((value) => {
        params = params.append(key, value);
      });
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
   */
  getProductById(productId: number): Observable<ProductApiResponse> {
    return this.httpClient.get<ProductApiResponse>(
      `${this.apiUrl}/${productId}`
    );
  }
}
