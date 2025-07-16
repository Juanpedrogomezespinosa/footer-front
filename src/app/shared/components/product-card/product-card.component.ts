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

  // URL base del backend donde están las imágenes
  backendUrl: string = "http://localhost:3000";

  // Ruta de la imagen por defecto cuando no hay imagen o falla la carga
  defaultImage: string = "assets/icons/agregar-carrito.png";

  /**
   * Construye la URL completa de la imagen del producto.
   * Si no tiene imagen, devuelve la imagen por defecto local.
   */
  getProductImage(): string {
    if (this.product.image && this.product.image.trim() !== "") {
      // Mostrar en consola para debug
      console.log("Cargando imagen de producto:", this.product.image);
      return `${this.backendUrl}/uploads/${this.product.image}`;
    } else {
      console.warn(
        "Producto sin imagen, usando imagen por defecto",
        this.product
      );
      return this.defaultImage;
    }
  }

  /**
   * Manejador del error en la carga de la imagen.
   * Cambia la imagen por la imagen por defecto si la carga falla.
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    console.error("Error al cargar la imagen del producto:", target.src);
    target.src = this.defaultImage;
  }

  /**
   * Acción al agregar un producto al carrito.
   */
  addToCart(): void {
    console.log(`Producto agregado al carrito: ${this.product.name}`);
  }
}
