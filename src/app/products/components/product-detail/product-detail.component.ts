// src/app/products/components/product-detail/product-detail.component.ts
import { Component, OnInit, signal, computed } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import {
  ProductService,
  Product,
  ProductImage,
  ProductApiResponse,
  ProductVariantStock,
  ProductSibling,
} from "app/core/services/product.service";
import { CartService } from "app/core/services/cart.service";
import { ToastService } from "app/core/services/toast.service";

import { RelatedProductsComponent } from "app/shared/components/related-products/related-products.component";

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
  selectedColor = signal<string>("");
  selectedSize = signal<string>("");
  selectedImageUrl = signal<string>("");
  quantity = signal(1);
  activeTab = signal("description");
  isSizeGuideOpen = signal(false);

  // Señales dinámicas para la UI
  availableColors = signal<string[]>([]);
  availableSizes = signal<string[]>([]);

  // Señal computada para obtener la variante
  selectedVariantId = computed<number | null>(() => {
    const p = this.product();
    const color = this.selectedColor();
    const size = this.selectedSize();

    if (!p || !p.variants || !color || !size) return null;

    const variant = p.variants.find(
      (v) => v.color === color && v.size === size
    );
    return variant ? variant.id : null;
  });

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
    this.route.paramMap.subscribe((params) => {
      const productIdParam = params.get("id");
      const productId = Number(productIdParam);

      this.isLoading.set(true);
      this.product.set(null);
      window.scrollTo(0, 0);

      this.selectedColor.set("");
      this.selectedSize.set("");
      this.availableColors.set([]);
      this.availableSizes.set([]);
      this.siblings.set([]);
      this.isSizeGuideOpen.set(false); // Asegurarse de que el modal esté cerrado al navegar

      if (isNaN(productId)) {
        this.error.set("ID de producto inválido.");
        this.isLoading.set(false);
        return;
      }

      this.loadProduct(productId);
    });
  }

  loadProduct(productId: number): void {
    this.productService.getProductById(productId).subscribe({
      next: (foundProduct: ProductApiResponse) => {
        if (foundProduct) {
          const variants = foundProduct.variants || [];
          const siblings = foundProduct.siblings || [];

          const colorsWithStock = variants
            .filter((v) => v.stock > 0)
            .map((v) => v.color)
            .filter((v, i, a) => a.indexOf(v) === i); // Unique
          this.availableColors.set(colorsWithStock);

          this.siblings.set(siblings);

          const productData: ProductDetail = {
            id: foundProduct.id,
            name: foundProduct.name,
            description: foundProduct.description,
            price: Number(foundProduct.price),
            rating: foundProduct.averageRating,
            ratingCount: foundProduct.ratingCount,
            images: foundProduct.images || [],
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
          };
          this.product.set(productData);

          if (productData.images && productData.images.length > 0) {
            this.selectedImageUrl.set(productData.images[0]?.imageUrl || "");
          }

          const mainColor = foundProduct.color;
          if (mainColor && colorsWithStock.includes(mainColor)) {
            this.selectColor(mainColor);
          } else if (colorsWithStock.length > 0) {
            this.selectColor(colorsWithStock[0]);
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

  // --- Métodos de la Galería ---
  getProductImage(): string {
    if (this.selectedImageUrl()) {
      return `${this.backendUrl}${this.selectedImageUrl()}`;
    }
    const product = this.product();
    if (product && product.images && product.images.length > 0) {
      return `${this.backendUrl}${product.images[0]?.imageUrl || ""}`;
    }
    return this.defaultImage;
  }

  selectImage(imageUrl: string | undefined): void {
    this.selectedImageUrl.set(imageUrl || "");
  }

  // --- Métodos de Acciones de Producto ---
  selectColor(color: string): void {
    this.selectedColor.set(color);
    this.selectedSize.set("");

    const product = this.product();
    if (!product) {
      this.availableSizes.set([]);
      return;
    }

    const variants = product.variants || [];

    const sizesForColor = variants
      .filter((v) => v.color === color && v.stock > 0)
      .map((v) => v.size)
      .filter((v, i, a) => a.indexOf(v) === i); // Unique

    this.availableSizes.set(sizesForColor);
  }

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
    const variantId = this.selectedVariantId();
    if (!variantId) {
      this.toastService.showError(
        "Por favor, selecciona un color y una talla."
      );
      return;
    }
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

  buyNow(): void {
    const variantId = this.selectedVariantId();
    if (!variantId) {
      this.toastService.showError(
        "Por favor, selecciona un color y una talla."
      );
      return;
    }
    this.cartService.addToCart(variantId, this.quantity()).subscribe({
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

  // --- 👇 FUNCIÓN AÑADIDA ---
  /**
   * Maneja el evento de error de carga de una imagen
   * y lo reemplaza con un placeholder.
   */
  getPlaceholderImage(event: Event) {
    // Usamos el 'defaultImage' que ya está definido en el componente
    (event.target as HTMLImageElement).src = this.defaultImage;
  }

  // --- Métodos para el Modal ---
  openSizeGuide(): void {
    this.isSizeGuideOpen.set(true);
  }

  closeSizeGuide(): void {
    this.isSizeGuideOpen.set(false);
  }
}
