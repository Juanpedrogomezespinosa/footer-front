// src/app/core/models/admin.types.ts

// --- Para: /api/admin/stats/dashboard ---
export interface DashboardStats {
  totalRevenue: StatCard;
  ordersToday: StatCard;
  newUsers: StatCard;
  pendingShipments: StatCard;
}

export interface StatCard {
  amount?: number; // Usado para totalRevenue
  count?: number; // Usado para los otros
  percentage: number;
}

// --- Para: /api/admin/stats/sales-graph ---
export interface SalesGraph {
  totalSales: number;
  percentage: number;
  graphData: {
    labels: string[];
    data: number[];
  };
}

// --- Para: /api/admin/orders ---
export interface AdminOrdersResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  orders: AdminOrder[];
  nextPage: number | null;
  prevPage: number | null;
}

export interface AdminOrder {
  id: number;
  userId: number;
  addressId: number;
  status: string;
  total: string;
  createdAt: string;
  User: {
    id: number;
    username: string;
    email: string;
  };
  Address: {
    id: number;
    userId: number;
    alias: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string | null;
    isDefault: boolean;
    created_at: string;
    updated_at: string;
  } | null; // El address puede ser null
}

// --- Para: /api/admin/users ---
export interface AdminUser {
  id: number;
  username: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: "admin" | "client";
  created_at: string;
}

// --- ¡NUEVAS INTERFACES AÑADIDAS! ---

// --- Para: GET /api/products (Listado de productos) ---
export interface AdminProductsResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  products: AdminProduct[];
  nextPage: number | null;
  prevPage: number | null;
}

export interface AdminProduct {
  id: number;
  name: string;
  price: string; // La API lo devuelve como string
  stock: number;
  category: string;
  brand: string;
  image: string | null; // La imagen principal
  averageRating: number;
  ratingCount: number;
  // Añade más campos si los necesitas en la tabla
}
