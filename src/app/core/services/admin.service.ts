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

  // --- ¡NUEVO MÉTODO AÑADIDO! ---
  /**
   * Actualiza el estado de un pedido.
   * PUT /api/admin/orders/:id/status
   */
  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/orders/${id}/status`, { status });
  }
}
