// src/app/products/components/product-detail/product-detail.component.ts
import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import {
  ProductService,
  Product,
  ProductImage,
  ProductApiResponse,
  ProductVariantStock, // <-- Importamos la interfaz correcta
  ProductSibling, // <-- Importamos la interfaz correcta
} from "app/core/services/product.service";
import { CartService } from "app/core/services/cart.service";
import { ToastService } from "app/core/services/toast.service";

import { RelatedProductsComponent } from "app/shared/components/related-products/related-products.component";

// Definir la interfaz completa para la señal
// El tipo 'Product' del servicio ya es la interfaz completa
type ProductDetail = Product;

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RelatedProductsComponent],
  templateUrl: "./product-detail.component.html",
  styleUrls: [],
})
export class ProductDetailComponent implements OnInit {
  // Señales de estado
  product = signal<ProductDetail | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Señales para interacción
  selectedSize = signal<string>("");
  selectedImageUrl = signal<string>("");
  quantity = signal(1);
  activeTab = signal("description");

  // Esta señal ahora se rellenará dinámicamente
  availableSizes = signal<string[]>([]);
  // ¡NUEVA SEÑAL PARA HERMANOS!
  siblings = signal<ProductSibling[]>([]);

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
    // --- ¡LÓGICA DE CARGA MODIFICADA! ---
    this.route.paramMap.subscribe((params) => {
      const productIdParam = params.get("id");
      const productId = Number(productIdParam);

      // 1. Comprobar si ya tenemos un producto cargado (es un cambio de variante)
      const isVariantSwitch = this.product() !== null;

      if (!isVariantSwitch) {
        // --- Carga COMPLETA (primera vez que entras) ---
        this.isLoading.set(true);
        this.product.set(null);
        window.scrollTo(0, 0); // Solo hacemos scroll al inicio aquí
      }

      // En ambos casos, reseteamos la selección
      this.selectedSize.set("");
      this.availableSizes.set([]);
      this.siblings.set([]);

      if (isNaN(productId)) {
        this.error.set("ID de producto inválido.");
        this.isLoading.set(false);
        return;
      }

      // 2. Llamar a loadProduct en ambos casos.
      this.loadProduct(productId);
    });
  }

  loadProduct(productId: number): void {
    this.productService.getProductById(productId).subscribe({
      next: (foundProduct: ProductApiResponse) => {
        // Usamos la interfaz de API
        if (foundProduct) {
          // --- ¡LÓGICA DE TALLAS CORREGIDA! ---
          // Leemos el array 'variants' (tallas/stock)
          const variants = foundProduct.variants || []; // <-- Aseguramos que sea un array

          // Extraemos las tallas únicas y con stock
          const processedSizes = variants
            .filter((v) => v.stock > 0) // Solo mostrar tallas con stock
            .map((v) => v.size)
            .filter((v, i, a) => a.indexOf(v) === i); // Quitar duplicados

          this.availableSizes.set(processedSizes);
          // ------------------------------------

          // --- ¡LÓGICA DE HERMANOS AÑADIDA! ---
          const siblings = foundProduct.siblings || []; // <-- Aseguramos que sea un array
          this.siblings.set(siblings);
          // ---------------------------------

          // Creamos el objeto 'Product' completo para el frontend
          const productData: ProductDetail = {
            id: foundProduct.id,
            name: foundProduct.name,
            description: foundProduct.description,
            price: Number(foundProduct.price),
            rating: foundProduct.averageRating,
            ratingCount: foundProduct.ratingCount,
            images: foundProduct.images || [], // <-- Aseguramos que sea un array
            variants: variants,
            siblings: siblings,
            oldPrice:
              Number(foundProduct.price) < 150
                ? Number(foundProduct.price) + 30
                : undefined,
            color: foundProduct.color,
            material: foundProduct.material,
            gender: foundProduct.gender,
            category: foundProduct.category,
            brand: foundProduct.brand,
            // 'size' (el string) ya no existe
          };
          this.product.set(productData);

          // Si es un cambio de variante, actualizamos la imagen principal
          if (productData.images && productData.images.length > 0) {
            // <-- Arregla "posiblemente undefined"
            this.selectedImageUrl.set(productData.images[0].imageUrl);
          }
        } else {
          this.error.set("Producto no encontrado.");
        }
        this.isLoading.set(false); // Ponemos isLoading(false) en ambos casos
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error al cargar el producto:", err);
        this.error.set("Error al cargar el producto.");
        this.isLoading.set(false);
      },
    });
  }

  // --- Métodos de la Galería ---
  getProductImage(): string {
    if (this.selectedImageUrl()) {
      return `${this.backendUrl}${this.selectedImageUrl()}`;
    }
    const product = this.product();
    if (product && product.images && product.images.length > 0) {
      // <-- Arregla "posiblemente undefined"
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

  // --- ¡¡¡FUNCIÓN 'addToCart' CORREGIDA!!! ---
  addToCart(): void {
    const product = this.product();
    if (!product) return;

    let variantId: number;

    // Comprobar si el producto tiene tallas (ej: Zapatillas)
    if (this.availableSizes().length > 0) {
      if (!this.selectedSize()) {
        this.toastService.showError("Por favor, selecciona una talla.");
        return;
      }
      // Encontrar la variante específica (id, color, size, stock)
      const selectedVariant = (product.variants || []).find(
        (v) => v.size === this.selectedSize()
      );
      if (!selectedVariant) {
        this.toastService.showError("Error al encontrar la variante de talla.");
        return;
      }
      variantId = selectedVariant.id;
    } else {
      // Producto SIN tallas (ej: Gorra "Talla Única")
      if (!product.variants || product.variants.length === 0) {
        this.toastService.showError("Este producto no tiene stock definido.");
        return;
      }
      // Asumimos que es la primera (y única) variante
      variantId = product.variants[0].id;
    }

    // --- ¡Nueva llamada al servicio! ---
    // Asumimos que cartService.addToCart ahora espera (variantId, quantity)
    this.cartService.addToCart(variantId, this.quantity()).subscribe({
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

  // --- ¡¡¡FUNCIÓN 'buyNow' CORREGIDA!!! ---
  buyNow(): void {
    const product = this.product();
    if (!product) return;

    let variantId: number;

    // (Misma lógica de 'addToCart' para encontrar el variantId)
    if (this.availableSizes().length > 0) {
      if (!this.selectedSize()) {
        this.toastService.showError("Por favor, selecciona una talla.");
        return;
      }
      const selectedVariant = (product.variants || []).find(
        (v) => v.size === this.selectedSize()
      );
      if (!selectedVariant) {
        this.toastService.showError("Error al encontrar la variante de talla.");
        return;
      }
      variantId = selectedVariant.id;
    } else {
      if (!product.variants || product.variants.length === 0) {
        this.toastService.showError("Este producto no tiene stock definido.");
        return;
      }
      variantId = product.variants[0].id;
    }

    // --- ¡Nueva llamada al servicio! ---
    this.cartService.addToCart(variantId, this.quantity()).subscribe({
      next: () => {
        // Redirigir al carrito después de añadir
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

  // --- Métodos de Pestañas ---
  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  // --- Métodos de Valoración (Estrellas) ---
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
