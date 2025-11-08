// src/app/core/services/admin.service.ts
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  AdminOrdersResponse,
  AdminUser,
  DashboardStats,
  SalesGraph,
  AdminProductsResponse,
  FullAdminProduct, // 1. Importar la nueva interfaz
} from "../models/admin.types";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private apiUrl = "/api/admin";
  private productsApiUrl = "/api/products"; // URL base de productos

  constructor(private http: HttpClient) {}

  // ... (getDashboardStats, getSalesGraph, getUsers, getOrders, getProducts, createProduct se quedan igual) ...
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats/dashboard`);
  }
  getSalesGraph(): Observable<SalesGraph> {
    return this.http.get<SalesGraph>(`${this.apiUrl}/stats/sales-graph`);
  }
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }
  getOrders(
    page: number = 1,
    limit: number = 10
  ): Observable<AdminOrdersResponse> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("limit", limit.toString());
    return this.http.get<AdminOrdersResponse>(`${this.apiUrl}/orders`, {
      params,
    });
  }
  getProducts(
    page: number = 1,
    limit: number = 10
  ): Observable<AdminProductsResponse> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("limit", limit.toString());
    return this.http.get<AdminProductsResponse>(this.productsApiUrl, {
      params,
    });
  }
  createProduct(productData: FormData): Observable<any> {
    return this.http.post<any>(this.productsApiUrl, productData);
  }

  // --- ¡NUEVO MÉTODO AÑADIDO! ---
  /**
   * Obtiene un solo producto por su ID (para el modal de edición).
   * GET /api/products/:id
   */
  getProductById(id: number): Observable<FullAdminProduct> {
    return this.http.get<FullAdminProduct>(`${this.productsApiUrl}/${id}`);
  }

  // --- ¡NUEVO MÉTODO AÑADIDO! ---
  /**
   * Actualiza un producto (solo campos de texto).
   * PUT /api/products/:id
   */
  updateProduct(id: number, productData: any): Observable<any> {
    // Tu backend no espera FormData aquí, solo JSON
    return this.http.put<any>(`${this.productsApiUrl}/${id}`, productData);
  }

  // --- ¡NUEVO MÉTODO AÑADIDO! ---
  /**
   * Elimina un producto.
   * DELETE /api/products/:id
   */
  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.productsApiUrl}/${id}`);
  }
}
