import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Product } from "app/core/services/product.service";
import { CartService } from "app/core/services/cart.service"; // <-- 1. IMPORTAR
import { ToastService } from "app/core/services/toast.service"; // <-- 2. IMPORTAR
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-product-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./product-card.component.html",
  styleUrls: [],
})
export class ProductCardComponent {
  @Input() product!: Product;

  backendUrl: string = "http://localhost:3000";
  defaultImage: string = "assets/icons/agregar-carrito.png";

  constructor(
    private router: Router,
    private cartService: CartService, // <-- 3. INYECTAR
    private toastService: ToastService // <-- 4. INYECTAR
  ) {}

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
    console.error("Error al cargar la imagen:", target.src);
    target.src = this.defaultImage;
  }

  goToProductDetail(): void {
    if (!this.product || !this.product.id) {
      console.error("Producto o ID inválido, no se puede navegar.");
      return;
    }
    this.router.navigate(["/products", "product", this.product.id]).then(
      (success) => {
        console.log("Navegación completada:", success);
      },
      (error) => {
        console.error("Error al navegar al detalle:", error);
      }
    );
  }

  // --- 👇 5. LÓGICA DE AÑADIR AL CARRITO ---
  addToCart(event: MouseEvent): void {
    // Detiene el clic para que no se propague al div padre (que navega al detalle)
    event.stopPropagation();

    this.cartService.addToCart(this.product.id, 1).subscribe({
      next: () => {
        this.toastService.showSuccess("Producto añadido al carrito");
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error al añadir al carrito:", err);
        this.toastService.showError(
          err.error?.message || "No se pudo añadir el producto."
        );
      },
    });
  }
  // --- FIN DE LA LÓGICA ---

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
