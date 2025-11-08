// src/app/core/services/admin.service.ts
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  AdminOrdersResponse,
  AdminUser,
  DashboardStats,
  SalesGraph,
} from "../models/admin.types"; // <-- Importa las interfaces

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private apiUrl = "/api/admin"; // Usando el proxy

  constructor(private http: HttpClient) {}

  // Para las tarjetas del Dashboard
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats/dashboard`);
  }

  // Para la gráfica de ventas
  getSalesGraph(): Observable<SalesGraph> {
    return this.http.get<SalesGraph>(`${this.apiUrl}/stats/sales-graph`);
  }

  // Para la lista de usuarios
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  // Para la lista de pedidos (con paginación)
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

  // Aquí añadiremos los métodos para CRUD de productos, eliminar usuarios, etc.
  // deleteUser(userId: number): Observable<any> { ... }
  // updateProduct(productId: number, data: any): Observable<any> { ... }
}
