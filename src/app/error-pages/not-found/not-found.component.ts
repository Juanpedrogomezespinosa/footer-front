import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router"; // 1. Importar Router
import { FormsModule } from "@angular/forms"; // 2. Importar FormsModule

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // 3. Añadir a imports
    FormsModule, // 3. Añadir a imports
  ],
  templateUrl: "./not-found.component.html",
})
export class NotFoundComponent {
  searchTerm: string = ""; // 4. Añadir propiedad para la búsqueda

  constructor(private router: Router) {} // 5. Inyectar Router

  /**
   * Navega a la página de resultados de búsqueda.
   */
  submitSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(["/products"], {
        queryParams: { name: this.searchTerm.trim() },
      });
      this.searchTerm = ""; // Limpiar el campo
    }
  }
}
