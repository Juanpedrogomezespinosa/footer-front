import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router"; // Importar RouterLink

@Component({
  selector: "app-about",
  standalone: true,
  imports: [CommonModule, RouterLink], // Añadir RouterLink
  templateUrl: "./about.component.html",
  styleUrls: [],
})
export class AboutComponent {}
