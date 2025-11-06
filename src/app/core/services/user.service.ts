import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

/**
 * Interfaz para representar los datos esenciales del usuario.
 */
export interface UserProfile {
  id: number;
  username: string;
  lastName?: string | null;
  phone?: string | null;
  email: string;
  role: string;
  avatarUrl?: string | null; // 🆕 Añadido avatarUrl
}

/**
 * Interfaz para la carga de actualización de perfil (solo texto).
 */
export interface UpdateProfilePayload {
  username?: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string;
  password?: string;
}

// ----------------------------------------------------
// --- NUEVAS INTERFACES PARA DIRECCIONES ---
// ----------------------------------------------------

/**
 * Representa una dirección tal como la devuelve la API.
 */
export interface UserAddress {
  id: number;
  userId: number;
  alias: string;
  street: string;
  city: string;
  state: string; // Provincia/Estado
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
  created_at?: string; // La API de Sequelize los añade
  updated_at?: string; // La API de Sequelize los añade
}

/**
 * Payload para CREAR o ACTUALIZAR una dirección.
 * Omitimos los campos que genera el servidor (id, userId, timestamps).
 */
export type AddressPayload = Omit<
  UserAddress,
  "id" | "userId" | "created_at" | "updated_at"
>;

// ----------------------------------------------------

@Injectable({
  providedIn: "root",
})
export class UserService {
  // Endpoints de la API
  private apiUrl = "/api/users";
  private addressesApiUrl = "/api/addresses"; // <-- NUEVO ENDPOINT

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los datos del perfil del usuario autenticado.
   */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  /**
   * Actualiza el perfil de texto del usuario.
   */
  updateProfile(
    data: UpdateProfilePayload
  ): Observable<{ message: string; user: UserProfile }> {
    return this.http.put<{ message: string; user: UserProfile }>(
      `${this.apiUrl}/profile`,
      data
    );
  }

  /**
   * 🆕 Sube una nueva imagen de perfil.
   * El backend espera un campo 'avatar' en el FormData.
   */
  updateAvatar(file: File): Observable<{ message: string; avatarUrl: string }> {
    const formData = new FormData();
    formData.append("avatar", file, file.name);

    return this.http.post<{ message: string; avatarUrl: string }>(
      `${this.apiUrl}/profile/avatar`,
      formData
    );
  }

  // ----------------------------------------------------
  // --- NUEVOS MÉTODOS CRUD PARA DIRECCIONES ---
  // ----------------------------------------------------

  /**
   * Obtiene todas las direcciones del usuario autenticado
   * GET /api/addresses
   */
  getAddresses(): Observable<UserAddress[]> {
    return this.http.get<UserAddress[]>(this.addressesApiUrl);
  }

  /**
   * Crea una nueva dirección para el usuario
   * POST /api/addresses
   */
  createAddress(data: AddressPayload): Observable<UserAddress> {
    return this.http.post<UserAddress>(this.addressesApiUrl, data);
  }

  /**
   * Actualiza una dirección existente
   * PUT /api/addresses/:id
   */
  updateAddress(id: number, data: AddressPayload): Observable<UserAddress> {
    return this.http.put<UserAddress>(`${this.addressesApiUrl}/${id}`, data);
  }

  /**
   * Elimina una dirección
   * DELETE /api/addresses/:id
   */
  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.addressesApiUrl}/${id}`);
  }
}
