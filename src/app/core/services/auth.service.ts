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
 * 🆕 Interfaz de Usuario actualizada
 * Ahora incluye los campos opcionales del backend
 */
export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null; // <-- CAMBIO: Añadido avatarUrl
}

export interface LoginResponse {
  message: string;
  user: User; // <-- Usará la interfaz User actualizada
  token: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  private backendUrl = "http://localhost:3000/api/auth";

  constructor(private http: HttpClient) {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    if (token && userString) {
      this.userSubject.next(JSON.parse(userString));
    }
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.backendUrl}/login`, credentials)
      .pipe(tap((res) => this.handleLoginResponse(res)));
  }

  register(data: RegisterData): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.backendUrl}/register`, data)
      .pipe(tap((res) => this.handleLoginResponse(res)));
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
   * 🆕 NUEVA FUNCIÓN: Actualiza el avatar del usuario en el estado global.
   * Esto notificará a la Navbar y a cualquier otro componente que escuche user$.
   */
  public updateUserAvatar(avatarUrl: string): void {
    const currentUser = this.userSubject.getValue();

    if (currentUser) {
      // 1. Crear un nuevo objeto de usuario con la URL actualizada
      const updatedUser = {
        ...currentUser,
        avatarUrl: avatarUrl,
      };

      // 2. Emitir el nuevo estado
      this.userSubject.next(updatedUser);

      // 3. Actualizar el localStorage para persistir el cambio
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }

  private handleLoginResponse(res: LoginResponse) {
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    this.userSubject.next(res.user);
  }
}
