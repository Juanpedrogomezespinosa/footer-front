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
  FullAdminProduct,
  FullAdminOrder,
} from "../models/admin.types";

// Interfaz para los filtros de producto
export interface ProductFilters {
  name?: string;
  category?: string;
  stock?: string;
}

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private apiUrl = "/api/admin"; // <-- Ruta de Admin
  private productsApiUrl = "/api/products";
  private ordersApiUrl = "/api/orders"; // <-- Ruta de Usuario

  constructor(private http: HttpClient) {}

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

  // --- ¡MÉTODO MODIFICADO! ---
  /**
   * Obtiene la lista de productos con paginación y filtros.
   * GET /api/products
   */
  getProducts(
    page: number = 1,
    limit: number = 10,
    filters: ProductFilters = {} // 1. Aceptar objeto de filtros
  ): Observable<AdminProductsResponse> {
    // 2. Empezar con la paginación
    let params = new HttpParams()
      .set("page", page.toString())
      .set("limit", limit.toString());

    // 3. Añadir filtros dinámicamente solo si existen
    if (filters.name) {
      params = params.set("name", filters.name);
    }
    if (filters.category) {
      params = params.set("category", filters.category);
    }
    if (filters.stock) {
      params = params.set("stock", filters.stock);
    }

    return this.http.get<AdminProductsResponse>(this.productsApiUrl, {
      params, // 4. Enviar todos los parámetros
    });
  }

  createProduct(productData: FormData): Observable<any> {
    return this.http.post<any>(this.productsApiUrl, productData);
  }
  getProductById(id: number): Observable<FullAdminProduct> {
    return this.http.get<FullAdminProduct>(`${this.productsApiUrl}/${id}`);
  }
  updateProduct(id: number, productData: any): Observable<any> {
    return this.http.put<any>(`${this.productsApiUrl}/${id}`, productData);
  }
  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.productsApiUrl}/${id}`);
  }

  getAdminOrderById(id: number): Observable<FullAdminOrder> {
    return this.http.get<FullAdminOrder>(`${this.apiUrl}/orders/${id}`);
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/orders/${id}/status`, { status });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${id}`);
  }
}
