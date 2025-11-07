import { Component, OnInit, signal } from "@angular/core"; // <-- 1. Importar signal
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { ProductService, Product } from "app/core/services/product.service";
import { CartService } from "app/core/services/cart.service";
import { ToastService } from "app/core/services/toast.service";

// --- 2. IMPORTAR LA NUEVA INTERFAZ DE IMAGEN ---
// (Necesitamos la interfaz ProductImage que está en productModel.js...
// la definiremos aquí temporalmente, aunque lo ideal sería moverla
// a 'product.service.ts' junto a 'Product')
interface ProductImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./product-detail.component.html",
  styleUrls: [],
})
export class ProductDetailComponent implements OnInit {
  // --- 3. MODIFICAR 'product' PARA QUE ACEPTE LA GALERÍA ---
  // Hacemos 'product' un Signal para mejor reactividad
  product = signal<
    (Product & { images: ProductImage[] }) | null // El producto AHORA incluye un array 'images'
  >(null);

  isLoading = signal(true); // <-- Convertido a signal
  error = signal<string | null>(null); // <-- Convertido a signal
  selectedSize = "";
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

  // --- 4. NUEVO SIGNAL PARA LA IMAGEN SELECCIONADA ---
  selectedImageUrl = signal<string>("");

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
        // Usamos 'any' para aceptar 'images'
        if (foundProduct) {
          const productData = {
            ...foundProduct,
            price: Number(foundProduct.price),
            rating: foundProduct.averageRating,
            // Asegurarnos de que 'images' sea un array
            images: Array.isArray(foundProduct.images)
              ? foundProduct.images
              : [],
          };
          this.product.set(productData);

          // --- 5. ESTABLECER LA IMAGEN PRINCIPAL ---
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

  // --- 6. FUNCIÓN DE IMAGEN PRINCIPAL (AHORA USA EL SIGNAL) ---
  getProductImage(): string {
    if (this.selectedImageUrl()) {
      return `${this.backendUrl}${this.selectedImageUrl()}`;
    }
    // Fallback si no hay imagen seleccionada (aunque ngOnInit debería cubrirlo)
    const product = this.product();
    if (product && product.images.length > 0) {
      return `${this.backendUrl}${product.images[0].imageUrl}`;
    }
    return this.defaultImage;
  }

  // --- 7. NUEVA FUNCIÓN para cambiar la imagen principal ---
  selectImage(imageUrl: string): void {
    this.selectedImageUrl.set(imageUrl);
  }

  // --- Lógica de "Añadir al Carrito" (sin cambios) ---
  addToCart(): void {
    if (!this.selectedSize) {
      this.toastService.showError("Por favor, selecciona una talla.");
      return;
    }
    const product = this.product(); // Obtenemos el valor del signal
    if (!product) return;

    this.cartService.addToCart(product.id, 1).subscribe({
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

  // --- Lógica de "Comprar Ahora" (sin cambios) ---
  buyNow(): void {
    if (!this.selectedSize) {
      this.toastService.showError("Por favor, selecciona una talla.");
      return;
    }
    const product = this.product(); // Obtenemos el valor del signal
    if (!product) return;

    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
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
}
