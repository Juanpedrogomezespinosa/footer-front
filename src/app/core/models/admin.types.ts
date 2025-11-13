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

// --- ¡¡¡NUEVA INTERFAZ REUTILIZABLE!!! ---
// Una única fuente de verdad para las Direcciones
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
  // --- ¡REFACTORIZADO! ---
  // Ahora usa la interfaz reutilizable
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

// --- ¡NUEVA INTERFAZ! ---
// Para: GET /api/admin/users/:id
export interface FullAdminUser extends AdminUser {
  Addresses: AdminAddress[]; // <-- Reutiliza la interfaz
}

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
  stock: number; // Este 'stock' es el que tu HTML usaba antes
  category: string;
  brand: string;
  image: string | null; // La imagen principal
  averageRating: number;
  ratingCount: number;
  totalStock: number; // Este es el nuevo campo correcto para la lista
}

// --- Para: GET /api/products/:id (Detalle de producto para editar) ---
export interface FullAdminProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  color: string; // Color principal del producto padre
  brand: string;
  category: string;
  sub_category?: string | null;
  gender: string;
  material: string | null;
  season: string | null;
  is_new: boolean;
  images: { id: number; imageUrl: string; displayOrder: number }[];
  averageRating: number;
  variants: {
    id: number;
    color: string;
    size: string;
    stock: number;
  }[];
  siblings: {
    id: number;
    color: string;
    image: string | null;
  }[];
}

// --- Para: GET /api/orders/:id (Detalle de un pedido) ---

// --- ¡INTERFAZ ELIMINADA! ---
// 'AdminOrderUserAddress' ya no es necesaria, usamos 'AdminAddress'
/*
export interface AdminOrderUserAddress {
  id: number;
  alias: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string | null;
}
*/

export interface AdminOrderItemProduct {
  id: number;
  name: string;
  image: string | null; // Asumimos que el backend devuelve la imagen principal
}

export interface AdminOrderItem {
  quantity: number;
  price: string; // La API devuelve 'price' como string
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
  // --- ¡REFACTORIZADO! ---
  // Ahora usa la interfaz reutilizable
  Address: AdminAddress;
  OrderItems: AdminOrderItem[];
}
