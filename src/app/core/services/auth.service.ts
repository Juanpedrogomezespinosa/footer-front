import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { jwtDecode } from "jwt-decode";
import { environment } from "../../../environments/environment";

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

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  // Cambiamos la URL fija por la variable de entorno
  private backendUrl = `${environment.apiUrl}/auth`;

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

  public handleLoginResponse(res: LoginResponse): void {
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    this.userSubject.next(res.user);
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(
      `${this.backendUrl}/forgot-password`,
      { email }
    );
  }

  resetPassword(data: ResetPasswordData): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(
      `${this.backendUrl}/reset-password`,
      data
    );
  }

  /**
   * Maneja el token recibido de Google en la URL.
   * Decodifica el token (que ahora contiene al usuario) y lo guarda.
   * @param token El JWT recibido del backend
   */
  public handleGoogleToken(token: string): User | null {
    try {
      // 1. Guardar el token
      localStorage.setItem("token", token);

      // 2. Decodificar el token para obtener el payload del usuario
      const userPayload = jwtDecode<User>(token);

      // 3. Guardar el usuario en localStorage y en el BehaviorSubject
      localStorage.setItem("user", JSON.stringify(userPayload));
      this.userSubject.next(userPayload);

      return userPayload;
    } catch (error) {
      console.error("Error al decodificar el token de Google:", error);
      this.logout();
      return null;
    }
  }
}
