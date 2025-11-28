import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

// Buena práctica: definir la forma de los datos
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Injectable({
  providedIn: "root",
})
export class ContactService {
  // La URL del endpoint de backend que creamos
  private apiUrl = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) {}

  /**
   * Envía los datos del formulario de contacto al backend
   * @param formData Los datos del formulario
   * @returns Un Observable con la respuesta del servidor
   */
  sendMessage(formData: ContactFormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
}
