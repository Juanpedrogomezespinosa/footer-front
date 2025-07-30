import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Product } from "app/core/services/product.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-product-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./product-card.component.html",
  styleUrls: ["./product-card.component.scss"],
})
export class ProductCardComponent {
  @Input() product!: Product;

  backendUrl: string = "http://localhost:3000";
  defaultImage: string = "assets/icons/agregar-carrito.png";

  constructor(private router: Router) {}

  getProductImage(): string {
    if (this.product.image && this.product.image.trim() !== "") {
      return `${this.backendUrl}/uploads/${this.product.image}`;
    } else {
      console.warn(
        "Producto sin imagen. Usando imagen por defecto:",
        this.product
      );
      return this.defaultImage;
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    console.error("Error al cargar imagen:", target.src);
    target.src = this.defaultImage;
  }

  goToProductDetail(): void {
    console.log("Click en producto:", this.product);
    if (!this.product || !this.product.id) {
      console.error("Producto o ID inválido, no se puede navegar.");
      return;
    }
    console.log(`Navegando a /products/${this.product.id}`);
    this.router.navigate(["/products", this.product.id]).then(
      (success) => {
        console.log("Navegación completada:", success);
      },
      (error) => {
        console.error("Error en navegación:", error);
      }
    );
  }

  addToCart(): void {
    console.log(`Producto agregado al carrito: ${this.product.name}`);
  }

  getStars(): ("full" | "half" | "empty")[] {
    const stars: ("full" | "half" | "empty")[] = [];
    let rating = this.product.rating ?? 0;
    for (let i = 1; i <= 5; i++) {
      if (rating >= 1) {
        stars.push("full");
      } else if (rating >= 0.5) {
        stars.push("half");
      } else {
        stars.push("empty");
      }
      rating -= 1;
    }
    return stars;
  }
}
