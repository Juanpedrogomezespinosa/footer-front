import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Product } from "app/core/services/product.service";
@Component({
  selector: "app-product-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./product-card.component.html",
  styleUrls: ["./product-card.component.scss"],
})
export class ProductCardComponent {
  @Input() product!: Product;
}
