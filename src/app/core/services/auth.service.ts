// src/app/core/services/auth.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";

// --- Interfaces de Autenticación ---
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interfaz de Usuario completa
 */
export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

// --- 👇 NUEVAS INTERFACES AÑADIDAS ---
export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}
// --- FIN DE NUEVAS INTERFACES ---

@Injectable({ providedIn: "root" })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  private backendUrl = "http://localhost:3000/api/auth";

  constructor(private http: HttpClient) {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    if (token && userString) {
      const user = JSON.parse(userString);

      this.userSubject.next(user);
    }
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.backendUrl}/login`, credentials)
      .pipe(
        tap((res) => {
          this.handleLoginResponse(res);
        })
      );
  }

  register(data: RegisterData): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.backendUrl}/register`, data)
      .pipe(
        tap((res) => {
          this.handleLoginResponse(res);
        })
      );
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.userSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  /**
   * Actualiza el avatar del usuario en el estado global.
   */
  public updateUserAvatar(avatarUrl: string): void {
    const currentUser = this.userSubject.getValue();

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        avatarUrl: avatarUrl,
      };

      this.userSubject.next(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else {
      console.warn(
        "⚠️ AuthService: No hay usuario actual para actualizar avatar"
      );
    }
  }

  private handleLoginResponse(res: LoginResponse): void {
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    this.userSubject.next(res.user);
  }

  // --- 👇 NUEVOS MÉTODOS AÑADIDOS ---

  /**
   * Pide al backend que envíe un correo de reseteo.
   * @param email El email del usuario
   */
  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(
      `${this.backendUrl}/forgot-password`,
      { email }
    );
  }

  /**
   * Envía el token (del enlace del email) y la nueva contraseña.
   * @param data Objeto con el token y la newPassword
   */
  resetPassword(data: ResetPasswordData): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(
      `${this.backendUrl}/reset-password`,
      data
    );
  }
  // --- FIN DE NUEVOS MÉTODOS ---
}
