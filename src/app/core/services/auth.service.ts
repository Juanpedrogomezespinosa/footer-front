import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { jwtDecode } from "jwt-decode";

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface TokenResponse {
  token: string;
}

interface User {
  email: string;
  username: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private userSubject: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private httpClient: HttpClient) {
    const token = localStorage.getItem("token");
    if (token) {
      this.decodeToken(token);
    }
  }

  public login(credentials: LoginCredentials): Observable<TokenResponse> {
    return this.httpClient
      .post<TokenResponse>("/api/auth/login", credentials)
      .pipe(tap((response) => this.handleToken(response.token)));
  }

  public register(data: RegisterData): Observable<TokenResponse> {
    return this.httpClient
      .post<TokenResponse>("/api/auth/register", data)
      .pipe(tap((response) => this.handleToken(response.token)));
  }

  public logout(): void {
    localStorage.removeItem("token");
    this.userSubject.next(null);
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  }

  private handleToken(token: string): void {
    localStorage.setItem("token", token);
    this.decodeToken(token);
  }

  private decodeToken(token: string): void {
    const decodedUser: User = jwtDecode<User>(token);
    this.userSubject.next(decodedUser);
  }
}
