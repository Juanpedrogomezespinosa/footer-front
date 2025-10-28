import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./home.component.html",
  styleUrls: [],
})
export class HomeComponent {
  categories = ["Camisetas", "Pantalones", "Zapatillas", "Sudaderas"];
  products = [
    { name: "Camiseta deportiva", price: 29.99 },
    { name: "Pantalón cargo", price: 49.99 },
    { name: "Zapatillas urbanas", price: 79.99 },
    { name: "Sudadera premium", price: 59.99 },
  ];
}
