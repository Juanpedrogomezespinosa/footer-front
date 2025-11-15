// src/app/pages/faq/faq.component.ts

import { Component } from "@angular/core";
// 1. Quitar NgClass de esta línea
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms"; // Para el input de búsqueda

@Component({
  selector: "app-faq",
  standalone: true,
  // 2. Quitar NgClass de esta línea (CommonModule ya lo incluye)
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: "./faq.component.html",
  styleUrls: [],
})
export class FaqComponent {
  searchTerm: string = "";
  activeCategory: string = "Pedidos y Pagos";

  setCategory(category: string) {
    this.activeCategory = category;
    // Lógica futura para filtrar FAQs por categoría
    console.log("Categoría seleccionada:", category);
  }
}
