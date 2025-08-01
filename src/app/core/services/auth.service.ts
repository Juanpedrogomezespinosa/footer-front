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
  private userSubject: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private httpClient: HttpClient) {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    if (token && userString) {
      this.userSubject.next(JSON.parse(userString));
    }
  }

  public login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.httpClient
      .post<LoginResponse>("/api/auth/login", credentials)
      .pipe(tap((response) => this.handleLoginResponse(response)));
  }

  public register(data: RegisterData): Observable<LoginResponse> {
    return this.httpClient
      .post<LoginResponse>("/api/auth/register", data)
      .pipe(tap((response) => this.handleLoginResponse(response)));
  }

  public logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.userSubject.next(null);
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  }

  private handleLoginResponse(response: LoginResponse): void {
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }
}
