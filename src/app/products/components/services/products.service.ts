import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
}

@Injectable({
  providedIn: "root",
})
export class ProductsService {
  private apiUrl = "http://localhost:3000/api/products"; // Cambia la URL por la de tu backend

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
}
