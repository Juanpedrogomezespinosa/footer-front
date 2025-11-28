import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { environment } from "../../environments/environment";

import {
  ProductService,
  PaginatedProductResponse,
  Product,
} from "../core/services/product.service";
import { ToastService } from "../core/services/toast.service";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./home.component.html",
  styleUrls: [],
})
export class HomeComponent implements OnInit {
  // URL dinámica
  private backendUrl = environment.apiUrl.replace("/api", "");

  categories = ["Zapatillas", "Ropa", "Complementos"];
  latestProducts: Product[] = [];
  isLoading: boolean = true;

  constructor(
    private productService: ProductService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadLatestProducts();
  }

  loadLatestProducts(): void {
    this.isLoading = true;
    this.productService.getProducts(1, 4).subscribe({
      next: (response: PaginatedProductResponse) => {
        this.latestProducts = response.products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error al cargar los últimos productos:", error);
        this.toastService.showError(
          "No se pudieron cargar las novedades. Inténtalo de nuevo."
        );
        this.isLoading = false;
      },
    });
  }

  /**
   * Construye la URL completa para la imagen del backend
   * @param imagePath La ruta relativa (ej: /uploads/img.png)
   */
  getFullImagePath(imagePath: string | undefined): string {
    const placeholder =
      "https://placehold.co/600x800/e2e8f0/94a3b8?text=Footer";

    if (!imagePath) {
      return placeholder;
    }
    // Corrección para localhost
    if (imagePath.includes("localhost:3000")) {
      return imagePath.replace("http://localhost:3000", this.backendUrl);
    }
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    return `${this.backendUrl}${imagePath}`;
  }

  /**
   * Maneja el evento de error de carga de una imagen
   */
  getPlaceholderImage(event: Event) {
    (event.target as HTMLImageElement).src =
      "https://placehold.co/600x800/e2e8f0/94a3b8?text=Footer";
  }
}
