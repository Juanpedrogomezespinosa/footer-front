// src/app/core/services/product.service.ts
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

// Interfaz para los "hermanos" (otros colores)
export interface ProductSibling {
  id: number;
  color: string;
  image: string | null;
}

// Interfaz para las variantes de TALLA y STOCK del producto actual
export interface ProductVariantStock {
  id: number;
  color: string;
  size: string;
  stock: number;
}

// Interfaz para las imágenes de la galería
export interface ProductImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

/**
 * Interfaz para los productos recibidos desde la API.
 * Esta es la respuesta DIRECTA del backend.
 */
export interface ProductApiResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string; // Imagen principal (de la lista)
  averageRating?: number;
  ratingCount?: number;
  // 'size: string' ya no existe
  brand?: string;
  color?: string; // Color principal
  category: "zapatillas" | "ropa" | "complementos";
  sub_category?: string;
  gender?: "hombre" | "mujer" | "unisex";
  material?: string | null;
  images?: ProductImage[]; // Galería de imágenes
  variants?: ProductVariantStock[]; // Tallas y stock
  siblings?: ProductSibling[]; // Hermanos (otros colores)
}

/**
 * Interfaz de producto para uso interno del frontend.
 * (Completa y actualizada)
 */
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  rating?: number;
  ratingCount?: number;
  category: "zapatillas" | "ropa" | "complementos";
  brand?: string;
  oldPrice?: number;
  color?: string;
  material?: string | null;
  gender?: "hombre" | "mujer" | "unisex";
  // --- ¡CAMBIOS AQUÍ! Hechos opcionales ---
  images?: ProductImage[];
  variants?: ProductVariantStock[];
  siblings?: ProductSibling[]; // <-- Arregla el error "siblings"
}

/**
 * Estructura de la respuesta paginada desde el backend.
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

  getProductById(productId: number): Observable<ProductApiResponse> {
    return this.httpClient.get<ProductApiResponse>(
      `${this.apiUrl}/${productId}`
    );
  }

  getRelatedProducts(productId: number): Observable<ProductApiResponse[]> {
    return this.httpClient.get<ProductApiResponse[]>(
      `${this.apiUrl}/${productId}/related`
    );
  }
}
