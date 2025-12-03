import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  AdminOrdersResponse,
  AdminUser,
  DashboardStats,
  SalesGraph,
  AdminProductsResponse,
  FullAdminProduct,
  FullAdminOrder,
  FullAdminUser,
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
  // Usamos environment para que cambie automáticamente entre local y Render
  private apiUrl = `${environment.apiUrl}/admin`;
  private productsApiUrl = `${environment.apiUrl}/products`;
  private ordersApiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats/dashboard`);
  }
  getSalesGraph(): Observable<SalesGraph> {
    return this.http.get<SalesGraph>(`${this.apiUrl}/stats/sales-graph`);
  }

  getUsers(searchQuery?: string | null): Observable<AdminUser[]> {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.set("search", searchQuery);
    }
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`, { params });
  }

  getAdminUserById(id: number): Observable<FullAdminUser> {
    return this.http.get<FullAdminUser>(`${this.apiUrl}/users/${id}`);
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

  /**
   * Obtiene la lista de productos con paginación y filtros.
   */
  getProducts(
    page: number = 1,
    limit: number = 10,
    filters: ProductFilters = {}
  ): Observable<AdminProductsResponse> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("limit", limit.toString());

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
      params,
    });
  }

  createProduct(productData: FormData): Observable<any> {
    // Angular maneja automáticamente el Content-Type: multipart/form-data
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
