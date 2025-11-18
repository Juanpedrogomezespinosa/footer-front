// src/app/core/models/admin.types.ts

// --- Para: /api/admin/stats/dashboard ---
export interface DashboardStats {
  totalRevenue: StatCard;
  ordersToday: StatCard;
  newUsers: StatCard;
  pendingShipments: StatCard;
}

export interface StatCard {
  amount?: number;
  count?: number;
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

// --- Interfaz Reutilizable para Direcciones ---
export interface AdminAddress {
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
  Address: AdminAddress | null;
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

// --- Para: GET /api/admin/users/:id ---
export interface FullAdminUser extends AdminUser {
  Addresses: AdminAddress[];
}

// --- Para: GET /api/products (Listado) ---
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
  price: string;
  stock: number;
  category: string;
  brand: string;
  image: string | null;
  averageRating: number;
  ratingCount: number;
  totalStock: number;
}

// --- NUEVA INTERFAZ PARA LA VARIANTE ---
// Esto soluciona el error TS2339 al incluir 'price'
export interface AdminVariant {
  id: number;
  color: string;
  size: string;
  stock: number;
  price?: number; // <--- ¡CAMPO AÑADIDO!
}

// --- Para: GET /api/products/:id (Detalle para editar) ---
export interface FullAdminProduct {
  id: number;
  name: string;
  description: string;
  price: string; // Precio base
  color: string;
  brand: string;
  category: string;
  sub_category?: string | null;
  gender: "hombre" | "mujer" | "unisex"; // Ajustado para coincidir con el form
  material: string | null;
  season: string | null;
  is_new: boolean;
  is_active: boolean; // Añadido is_active que suele ser necesario
  images: { id: number; imageUrl: string; displayOrder: number }[];
  averageRating: number;

  // Usamos la nueva interfaz AdminVariant
  variants: AdminVariant[];

  siblings: {
    id: number;
    color: string;
    image: string | null;
  }[];
}

// --- Para: GET /api/orders/:id (Detalle) ---

export interface AdminOrderItemProduct {
  id: number;
  name: string;
  image: string | null;
}

export interface AdminOrderItem {
  quantity: number;
  price: string;
  Product: AdminOrderItemProduct;
}

export interface FullAdminOrder {
  id: number;
  status: string;
  total: string;
  createdAt: string;
  User: {
    id: number;
    username: string;
    email: string;
  };
  Address: AdminAddress;
  OrderItems: AdminOrderItem[];
}
