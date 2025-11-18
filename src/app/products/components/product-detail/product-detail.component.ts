// src/app/products/components/product-detail/product-detail.component.ts
import { Component, OnInit, signal, computed } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import {
  ProductService,
  ProductApiResponse,
  ProductImage,
  ProductSibling,
} from "app/core/services/product.service";
import { CartService } from "app/core/services/cart.service";
import { ToastService } from "app/core/services/toast.service";

import { RelatedProductsComponent } from "app/shared/components/related-products/related-products.component";

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RelatedProductsComponent],
  templateUrl: "./product-detail.component.html",
  styleUrls: [],
})
export class ProductDetailComponent implements OnInit {
  // Señales de estado
  product = signal<ProductApiResponse | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Señales para interacción
  selectedColor = signal<string>("");
  selectedSize = signal<string>("");
  selectedImageUrl = signal<string>("");
  quantity = signal(1);
  activeTab = signal("description");
  isSizeGuideOpen = signal(false);

  // Señales dinámicas
  currentImages = signal<ProductImage[]>([]);
  availableSizes = signal<string[]>([]);
  availableColors = signal<string[]>([]);

  // Nueva señal para el precio dinámico
  currentPrice = signal<number>(0);

  // Señal computada para obtener el ID de la variante seleccionada
  selectedVariantId = computed<number | null>(() => {
    const p = this.product();
    const color = this.selectedColor();
    const size = this.selectedSize();

    if (!p || !p.variantsByColor || !color || !size) return null;

    const variantsForColor = p.variantsByColor[color];
    if (!variantsForColor) return null;

    const variant = variantsForColor.find((v) => v.size === size);
    return variant ? variant.id : null;
  });

  siblings = signal<ProductSibling[]>([]);

  backendUrl = "http://localhost:3000";
  defaultImage = "https://placehold.co/600x600/f0f0f0/6C757D?text=No+Image";

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

      this.resetState();

      if (isNaN(productId)) {
        this.error.set("ID de producto inválido.");
        this.isLoading.set(false);
        return;
      }

      this.loadProduct(productId);
    });
  }

  private resetState() {
    this.isLoading.set(true);
    this.product.set(null);
    this.error.set(null);
    window.scrollTo(0, 0);

    this.selectedColor.set("");
    this.selectedSize.set("");
    this.availableSizes.set([]);
    this.availableColors.set([]);
    this.siblings.set([]);
    this.currentImages.set([]);
    this.currentPrice.set(0); // Resetear precio
    this.isSizeGuideOpen.set(false);
  }

  loadProduct(productId: number): void {
    this.productService.getProductById(productId).subscribe({
      next: (foundProduct: ProductApiResponse) => {
        if (foundProduct) {
          if (foundProduct.price < 150) {
            foundProduct.oldPrice = foundProduct.price + 30;
          }

          this.product.set(foundProduct);
          this.currentPrice.set(foundProduct.price); // Precio base inicial
          this.siblings.set(foundProduct.siblings || []);

          const colors = foundProduct.availableColors || [];
          this.availableColors.set(colors);

          let initialColor = foundProduct.color;
          if (!initialColor || !colors.includes(initialColor)) {
            initialColor = colors.length > 0 ? colors[0] : "";
          }

          if (initialColor) {
            this.selectColor(initialColor);
          } else {
            if (
              foundProduct.imagesByColor &&
              foundProduct.imagesByColor["generic"]
            ) {
              this.currentImages.set(foundProduct.imagesByColor["generic"]);
              this.selectedImageUrl.set(
                this.currentImages()[0]?.imageUrl || ""
              );
            }
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

  getProductImage(): string {
    if (this.selectedImageUrl()) {
      return `${this.backendUrl}${this.selectedImageUrl()}`;
    }
    const images = this.currentImages();
    if (images && images.length > 0) {
      return `${this.backendUrl}${images[0].imageUrl}`;
    }
    return this.defaultImage;
  }

  selectImage(imageUrl: string | undefined): void {
    this.selectedImageUrl.set(imageUrl || "");
  }

  getPlaceholderImage(event: Event) {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);
    this.selectedSize.set("");

    const product = this.product();
    if (!product) return;

    // 1. Actualizar Imágenes
    let imagesForColor = product.imagesByColor[color];
    if (!imagesForColor || imagesForColor.length === 0) {
      imagesForColor = product.imagesByColor["generic"] || [];
    }

    this.currentImages.set(imagesForColor);

    if (imagesForColor.length > 0) {
      this.selectedImageUrl.set(imagesForColor[0].imageUrl);
    } else {
      this.selectedImageUrl.set("");
    }

    // 2. Actualizar Tallas y STOCK
    const variantsForColor = product.variantsByColor[color] || [];
    const sizes = variantsForColor
      .filter((v) => v.stock > 0)
      .map((v) => v.size);

    this.availableSizes.set([...new Set(sizes)]);

    // 3. ACTUALIZAR PRECIO
    // Buscamos si alguna variante de este color tiene un precio específico distinto de 0
    const variantWithPrice = variantsForColor.find(
      (v) => v.price && v.price > 0
    );

    if (variantWithPrice) {
      this.currentPrice.set(variantWithPrice.price!);
    } else {
      // Si no tiene precio específico, volvemos al precio base del producto padre
      this.currentPrice.set(product.price);
    }
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

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  getStars(): ("full" | "half" | "empty")[] {
    const stars: ("full" | "half" | "empty")[] = [];
    let rating = this.product()?.averageRating ?? 0;
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

  openSizeGuide(): void {
    this.isSizeGuideOpen.set(true);
  }

  closeSizeGuide(): void {
    this.isSizeGuideOpen.set(false);
  }
}
