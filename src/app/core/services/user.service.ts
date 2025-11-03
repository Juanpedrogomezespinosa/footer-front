import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

/**
 * Interfaz para representar los datos esenciales del usuario.
 * Nota: 'username' se usa para 'Nombre'. 'email' es clave.
 */
export interface UserProfile {
  id: number;
  username: string;
  // 🆕 Nuevos campos del backend
  lastName?: string | null;
  phone?: string | null;
  // Fin de nuevos campos
  email: string;
  role: string;
}

/**
 * Interfaz para la carga de actualización de perfil.
 */
export interface UpdateProfilePayload {
  username?: string;
  // 🆕 Nuevos campos para enviar
  lastName?: string | null;
  phone?: string | null;
  // Fin de nuevos campos
  email?: string;
  password?: string;
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  // Utilizamos '/api/users' como base, asumiendo que el proxy redirige a tu backend
  private apiUrl = "/api/users";

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los datos del perfil del usuario autenticado.
   * Llama a la ruta GET /api/users/profile.
   *
   * @returns Observable con los datos del perfil.
   */
  getProfile(): Observable<UserProfile> {
    // CORRECCIÓN: Usamos '/api/users/profile' para ser consistente con updateProfile.
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  /**
   * Actualiza el perfil del usuario.
   * Llama a la ruta PUT /api/users/profile definida en userRoutes.js
   */
  updateProfile(
    data: UpdateProfilePayload
  ): Observable<{ message: string; user: UserProfile }> {
    return this.http.put<{ message: string; user: UserProfile }>(
      `${this.apiUrl}/profile`,
      data
    );
  }

  // Pendiente: getOrderHistory() para el historial de pedidos
}
