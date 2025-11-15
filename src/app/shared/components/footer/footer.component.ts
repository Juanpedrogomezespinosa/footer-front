import { Component } from "@angular/core";
import { CommonModule } from "@angular/common"; // Para usar {{ currentYear }}
import { RouterLink } from "@angular/router"; // Para usar [routerLink]

@Component({
  selector: "app-footer",
  standalone: true, // Asumo que este también es standalone
  imports: [CommonModule, RouterLink], // Añadir CommonModule y RouterLink
  templateUrl: "./footer.component.html",
  styleUrls: [],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
