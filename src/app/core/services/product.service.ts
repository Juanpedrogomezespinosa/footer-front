// src/app/core/services/product.service.ts
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

// Interfaz para los "hermanos" (otros colores como productos distintos)
export interface ProductSibling {
  id: number;
  color: string;
  image: string | null;
}

// Interfaz simple para la variante dentro del grupo de colores
export interface VariantOption {
  id: number;
  size: string;
  stock: number;
  price?: number;
}

// Interfaz para las imágenes de la galería
export interface ProductImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

/**
 * Interfaz principal de respuesta de la API.
 * Contiene toda la información del producto.
 */
export interface ProductApiResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  // --- AQUÍ ESTÁ LA CORRECCIÓN CLAVE ---
  discountPrice?: number | null; // <--- ¡ESTO FALTABA!
  image?: string;
  averageRating?: number;
  ratingCount?: number;
  brand?: string;
  color?: string;
  category: "zapatillas" | "ropa" | "complementos";
  sub_category?: string;
  gender?: "hombre" | "mujer" | "unisex";
  material?: string | null;
  oldPrice?: number;

  // --- Datos específicos de la vista de detalle ---
  availableColors: string[];
  imagesByColor: { [key: string]: ProductImage[] };
  variantsByColor: { [key: string]: VariantOption[] };

  siblings?: ProductSibling[];

  // Mantenemos compatibilidad
  images?: ProductImage[];
  variants?: any[];
}

// Alias para mantener compatibilidad con otros componentes (Home, etc.)
export type Product = ProductApiResponse;

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
