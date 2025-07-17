import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";

/**
 * Tipo que representa el producto tal como viene desde la API.
 */
interface ProductApiResponse {
  id: number;
  name: string;
  price: number;
  image?: string;
  averageRating?: number; // Valor promedio de valoraciones (del backend)
  ratingCount?: number; // Cantidad de valoraciones (del backend)
}

/**
 * Tipo usado en la aplicación para representar un producto.
 */
export interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  rating?: number; // Renombrado desde averageRating
  ratingCount?: number; // Cantidad de valoraciones
}

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private apiUrl = "http://localhost:3000/api/products";

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de productos desde la API.
   * Mapea averageRating a rating y pasa ratingCount para el componente.
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<{ products: ProductApiResponse[] }>(this.apiUrl).pipe(
      map((response) => {
        if (!Array.isArray(response.products)) {
          console.error("La respuesta de getProducts no es un array", response);
          return [];
        }
        return response.products.map((producto) => ({
          id: producto.id,
          name: producto.name,
          price: producto.price,
          image: producto.image,
          rating: producto.averageRating ?? 0,
          ratingCount: producto.ratingCount ?? 0,
        }));
      })
    );
  }
}
