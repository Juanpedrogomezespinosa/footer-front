import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

interface ProductApiResponse {
  id: number;
  name: string;
  price: number;
  image?: string;
  averageRating?: number;
  ratingCount?: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  rating?: number;
  ratingCount?: number;
}

export interface PaginatedResponse {
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
  private apiUrl = "http://localhost:3000/api/products";

  constructor(private http: HttpClient) {}

  getProducts(
    page: number,
    limit: number,
    filters: Record<string, string[]> = {},
    sort: string = ""
  ): Observable<PaginatedResponse> {
    let params = new HttpParams()
      .set("page", page)
      .set("limit", limit)
      .set("stock", "true");

    // Añadir filtros múltiples (arrays en query string)
    for (const key in filters) {
      filters[key].forEach((value) => {
        params = params.append(key, value);
      });
    }

    // Parseo de orden
    if (sort === "price_asc") {
      params = params.set("sortBy", "price").set("order", "ASC");
    } else if (sort === "price_desc") {
      params = params.set("sortBy", "price").set("order", "DESC");
    } else if (sort === "rating_desc") {
      params = params.set("sortBy", "averageRating").set("order", "DESC");
    } else if (sort === "rating_count_desc") {
      params = params.set("sortBy", "ratingCount").set("order", "DESC");
    }

    return this.http.get<PaginatedResponse>(this.apiUrl, { params });
  }
}
