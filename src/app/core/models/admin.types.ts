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
  totalStock: number; // <-- ¡¡¡CORRECCIÓN AÑADIDA AQUÍ!!!
  // Añade más campos si los necesitas en la tabla
}

// --- Para: GET /api/products/:id (Detalle de producto para editar) ---
export interface FullAdminProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  size: string;
  color: string;
  brand: string;
  category: string;
  sub_category?: string | null;
  gender: string;
  material: string | null;
  season: string | null;
  is_new: boolean;
  images: { id: number; imageUrl: string; displayOrder: number }[];
  averageRating: number;
}

// --- ¡NUEVAS INTERFACES AÑADIDAS! ---

// --- Para: GET /api/orders/:id (Detalle de un pedido) ---

/**
 * Información de la dirección tal como se devuelve en un pedido
 */
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

/**
 * Información simplificada del producto dentro de un OrderItem
 */
export interface AdminOrderItemProduct {
  id: number;
  name: string;
  image: string | null; // Asumimos que el backend devuelve la imagen principal
}

/**
 * Un item (producto) dentro de un pedido
 */
export interface AdminOrderItem {
  quantity: number;
  price: string; // La API devuelve 'price' como string
  Product: AdminOrderItemProduct;
}

/**
 * El objeto completo de detalles de un pedido para el modal de admin
 */
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
  Address: AdminOrderUserAddress;
  OrderItems: AdminOrderItem[];
}
