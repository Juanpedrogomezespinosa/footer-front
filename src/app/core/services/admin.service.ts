// src/app/core/services/admin.service.ts
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  AdminOrdersResponse,
  AdminUser,
  DashboardStats,
  SalesGraph,
  AdminProductsResponse, // 1. Importar la nueva interfaz
} from "../models/admin.types";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private apiUrl = "/api/admin";
  private productsApiUrl = "/api/products"; // URL base de productos

  constructor(private http: HttpClient) {}

  /**
   * Obtiene las estadísticas principales para el dashboard.
   * GET /api/admin/stats/dashboard
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats/dashboard`);
  }

  /**
   * Obtiene los datos para la gráfica de ventas.
   * GET /api/admin/stats/sales-graph
   */
  getSalesGraph(): Observable<SalesGraph> {
    return this.http.get<SalesGraph>(`${this.apiUrl}/stats/sales-graph`);
  }

  /**
   * Obtiene la lista de todos los usuarios.
   * GET /api/admin/users
   */
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  /**
   * Obtiene la lista de pedidos con paginación.
   * GET /api/admin/orders
   */
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

  // --- ¡NUEVO MÉTODO AÑADIDO! ---
  /**
   * Obtiene la lista de productos con paginación.
   * GET /api/products
   */
  getProducts(
    page: number = 1,
    limit: number = 10
  ): Observable<AdminProductsResponse> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("limit", limit.toString());

    // Nota: Usamos 'productsApiUrl' (público), no 'apiUrl' (admin)
    return this.http.get<AdminProductsResponse>(this.productsApiUrl, {
      params,
    });
  }

  /**
   * Crea un nuevo producto.
   * Llama a: POST /api/products
   */
  createProduct(productData: FormData): Observable<any> {
    // No se necesita 'Content-Type', HttpClient lo pone solo con FormData
    return this.http.post<any>(this.productsApiUrl, productData);
  }
}
