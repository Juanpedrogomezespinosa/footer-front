import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

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
  avatarUrl?: string | null;
}

/**
 * Interfaz para la carga de actualización de perfil (solo texto).
 */
export interface UpdateProfilePayload {
  username?: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string;
  // password?: string; <-- ELIMINADO
}

/**
 * Payload para el cambio de contraseña
 */
export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ----------------------------------------------------
// --- INTERFACES DE DIRECCIONES  ---
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
  created_at?: string;
  updated_at?: string;
}

/**
 * Payload para CREAR o ACTUALIZAR una dirección.
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
  private apiUrl = `${environment.apiUrl}/users`;
  private addressesApiUrl = `${environment.apiUrl}/addresses`;

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
   * Actualiza la contraseña del usuario de forma segura.
   * Llama a: PUT /api/users/profile/password
   */
  updatePassword(data: UpdatePasswordPayload): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/profile/password`,
      data
    );
  }

  /**
   * Sube una nueva imagen de perfil.
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
  // --- MÉTODOS DE DIRECCIONES ---
  // ----------------------------------------------------

  getAddresses(): Observable<UserAddress[]> {
    return this.http.get<UserAddress[]>(this.addressesApiUrl);
  }

  createAddress(data: AddressPayload): Observable<UserAddress> {
    return this.http.post<UserAddress>(this.addressesApiUrl, data);
  }

  updateAddress(id: number, data: AddressPayload): Observable<UserAddress> {
    return this.http.put<UserAddress>(`${this.addressesApiUrl}/${id}`, data);
  }

  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.addressesApiUrl}/${id}`);
  }
}
