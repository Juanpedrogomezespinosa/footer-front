import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";

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

  getProducts(page: number, limit: number): Observable<PaginatedResponse> {
    const url = `${this.apiUrl}?stock=true&page=${page}&limit=${limit}`;
    return this.http.get<PaginatedResponse>(url);
  }
}
