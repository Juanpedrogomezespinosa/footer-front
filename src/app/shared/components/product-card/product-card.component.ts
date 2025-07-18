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

  backendUrl: string = "http://localhost:3000";
  defaultImage: string = "assets/icons/agregar-carrito.png";

  /**
   * Devuelve la URL de la imagen del producto si está disponible.
   * En caso contrario, devuelve la imagen por defecto.
   */
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

  /**
   * Maneja el error al cargar la imagen. Reemplaza con imagen por defecto.
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    console.error("Error al cargar imagen:", target.src);
    target.src = this.defaultImage;
  }

  /**
   * Agrega el producto al carrito (por ahora muestra en consola).
   */
  addToCart(): void {
    console.log(`Producto agregado al carrito: ${this.product.name}`);
  }

  /**
   * Genera un array para mostrar estrellas completas, medias o vacías en el template.
   */
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
