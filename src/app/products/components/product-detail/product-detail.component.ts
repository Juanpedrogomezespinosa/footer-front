import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router"; // <-- 1. IMPORTAR RouterModule
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
// --- 2. IMPORTAR 'ProductImage' DESDE EL SERVICIO ---
import {
  ProductService,
  Product,
  ProductImage,
} from "app/core/services/product.service";
import { CartService } from "app/core/services/cart.service";
import { ToastService } from "app/core/services/toast.service";

@Component({
  selector: "app-product-detail",
  standalone: true,
  // --- 3. AÑADIR 'RouterModule' A LOS IMPORTS ---
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./product-detail.component.html",
  styleUrls: [],
})
export class ProductDetailComponent implements OnInit {
  // Señales de estado
  product = signal<(Product & { images: ProductImage[] }) | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Señales para interacción
  selectedSize = signal<string>(""); // Cambiado a signal
  selectedImageUrl = signal<string>("");
  quantity = signal(1); // Signal para la cantidad
  activeTab = signal("description"); // Signal para las pestañas

  // (He quitado 'isWishlisted' ya que restauraremos tus dos botones)

  // Datos y utilidades
  availableSizes: string[] = [
    "36",
    "37",
    "38",
    "39",
    "40",
    "41",
    "42",
    "43",
    "44",
  ];
  backendUrl = "http://localhost:3000";
  defaultImage = "https://placehold.co/600x600/f0f0f0/6C757D?text=Footer";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const productIdParam = this.route.snapshot.paramMap.get("id");
    const productId = Number(productIdParam);

    if (isNaN(productId)) {
      this.error.set("ID de producto inválido.");
      this.isLoading.set(false);
      return;
    }

    this.productService.getProductById(productId).subscribe({
      next: (foundProduct: any) => {
        if (foundProduct) {
          // --- 4. ¡MAPEADO CORREGIDO! ---
          // (Añadimos los campos que faltaban para las pestañas)
          const productData = {
            ...foundProduct,
            price: Number(foundProduct.price),
            rating: foundProduct.averageRating,
            ratingCount: foundProduct.ratingCount,
            images: Array.isArray(foundProduct.images)
              ? foundProduct.images
              : [],
            oldPrice:
              Number(foundProduct.price) < 150
                ? Number(foundProduct.price) + 30
                : undefined,
            // --- Campos que faltaban: ---
            color: foundProduct.color,
            material: foundProduct.material,
            gender: foundProduct.gender,
          };
          this.product.set(productData);

          if (productData.images.length > 0) {
            this.selectedImageUrl.set(productData.images[0].imageUrl);
          }
        } else {
          this.error.set("Producto no encontrado.");
        }
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error al cargar el producto:", err);
        this.error.set("Error al cargar el producto.");
        this.isLoading.set(false);
      },
    });
  }

  // --- Métodos de la Galería (sin cambios) ---

  getProductImage(): string {
    if (this.selectedImageUrl()) {
      return `${this.backendUrl}${this.selectedImageUrl()}`;
    }
    const product = this.product();
    if (product && product.images.length > 0) {
      return `${this.backendUrl}${product.images[0].imageUrl}`;
    }
    return this.defaultImage;
  }

  selectImage(imageUrl: string): void {
    this.selectedImageUrl.set(imageUrl);
  }

  // --- Métodos de Acciones de Producto ---

  selectSize(size: string): void {
    this.selectedSize.set(size);
  }

  incrementQuantity(): void {
    this.quantity.update((q) => q + 1);
  }

  decrementQuantity(): void {
    this.quantity.update((q) => (q > 1 ? q - 1 : 1));
  }

  addToCart(): void {
    if (!this.selectedSize()) {
      this.toastService.showError("Por favor, selecciona una talla.");
      return;
    }
    const product = this.product();
    if (!product) return;

    this.cartService.addToCart(product.id, this.quantity()).subscribe({
      next: () => {
        this.toastService.showSuccess("¡Producto añadido a la cesta!");
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error al añadir al carrito:", err);
        this.toastService.showError(
          err.error?.message || "No se pudo añadir el producto."
        );
      },
    });
  }

  // --- 5. ¡MÉTODO 'buyNow' RESTAURADO! ---
  buyNow(): void {
    if (!this.selectedSize()) {
      this.toastService.showError("Por favor, selecciona una talla.");
      return;
    }
    const product = this.product();
    if (!product) return;

    // Añade la cantidad seleccionada al carrito
    this.cartService.addToCart(product.id, this.quantity()).subscribe({
      next: () => {
        // Al tener éxito, navega directo al carrito para el checkout
        this.router.navigate(["/cart"]);
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error en Compra Directa:", err);
        this.toastService.showError(
          err.error?.message || "No se pudo añadir el producto."
        );
      },
    });
  }

  // --- Métodos de Pestañas (sin cambios) ---

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  // --- Métodos de Valoración (Estrellas) (sin cambios) ---
  getStars(): ("full" | "half" | "empty")[] {
    const stars: ("full" | "half" | "empty")[] = [];
    let rating = this.product()?.rating ?? 0;

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
