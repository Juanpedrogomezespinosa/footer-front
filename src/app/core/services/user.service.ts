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

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiUrl = "/api/users";

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
}
