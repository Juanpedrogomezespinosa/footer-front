import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router"; // Importar RouterLink

@Component({
  selector: "app-privacy",
  standalone: true,
  imports: [CommonModule, RouterLink], // Añadir RouterLink
  templateUrl: "./privacy.component.html",
  styleUrls: [],
})
export class PrivacyComponent {}
