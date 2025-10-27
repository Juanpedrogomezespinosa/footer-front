import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
}

interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  private backendUrl = "http://localhost:3000/api/auth"; // Cambia puerto si es necesario

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

  private handleLoginResponse(res: LoginResponse) {
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    this.userSubject.next(res.user);
  }
}
