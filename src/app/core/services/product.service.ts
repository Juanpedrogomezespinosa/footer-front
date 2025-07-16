import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";

export interface Product {
  id: number;
  name: string;
  price: number;
  image?: string; // opcional si no siempre hay
}

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private apiUrl = "http://localhost:3000/api/products";

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<{ products: Product[] }>(this.apiUrl).pipe(
      map((response) => {
        if (!Array.isArray(response.products)) {
          console.error("getProducts no devolvió un array", response);
          return [];
        }
        return response.products;
      })
    );
  }
}
