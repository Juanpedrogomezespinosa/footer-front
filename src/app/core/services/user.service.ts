import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

/**
 * Interfaz para representar los datos esenciales del usuario.
 * Nota: No incluye 'password' por seguridad, salvo en el cuerpo de actualización.
 */
export interface UserProfile {
  id: number;
  username: string; // En el backend, lo llamas 'username', en el frontend lo usaremos para el 'Nombre'.
  email: string;
  // Puedes añadir otros campos si el backend los devuelve, como 'createdAt', 'role', etc.
  // Por ahora, usaremos un campo mock para el teléfono, ya que no está en el modelo User de Sequelize.
  phone?: string;
}

/**
 * Interfaz para la carga de actualización de perfil.
 */
export interface UpdateProfilePayload {
  username?: string;
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
   * Usamos la ruta GET /api/users/profile, asumiendo que el backend
   * utiliza esta ruta para obtener los datos del usuario autenticado (middleware).
   *
   * @returns Observable con los datos del perfil.
   */
  getProfile(): Observable<UserProfile> {
    // CORRECCIÓN: Usamos '/api/users/profile' para ser consistente con updateProfile.
    // Esto asume que el backend tiene un GET en esta ruta que devuelve el perfil.
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
