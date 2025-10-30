import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router"; // <-- 1. IMPORTAR Router
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http"; // <-- IMPORTAR HttpErrorResponse
import { ProductService, Product } from "app/core/services/product.service";
import { CartService } from "app/core/services/cart.service"; // <-- 2. IMPORTAR CartService
import { ToastService } from "app/core/services/toast.service"; // <-- 3. IMPORTAR ToastService
// --- CAMBIO: Eliminados NavbarComponent y FooterComponent de imports ---
// (Están causando warnings y probablemente se cargan desde app.component)

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // NavbarComponent, // <-- Eliminado
    // FooterComponent, // <-- Eliminado
  ],
  templateUrl: "./product-detail.component.html",
  styleUrls: [],
})
export class ProductDetailComponent implements OnInit {
  product!: Product;
  isLoading = true;
  error = "";
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

  backendUrl = "http://localhost:3000";
  defaultImage = "/assets/icons/agregar-carrito.png";

  constructor(
    private route: ActivatedRoute,
    private router: Router, // <-- 4. INYECTAR Router
    private productService: ProductService,
    private cartService: CartService, // <-- 5. INYECTAR CartService
    private toastService: ToastService // <-- 6. INYECTAR ToastService
  ) {}

  ngOnInit(): void {
    const productIdParam = this.route.snapshot.paramMap.get("id");
    const productId = Number(productIdParam);

    if (isNaN(productId)) {
      this.error = "ID de producto inválido.";
      this.isLoading = false;
      return;
    }

    // --- Lógica de carga más eficiente ---
    this.productService.getProductById(productId).subscribe({
      next: (foundProduct) => {
        if (foundProduct) {
          this.product = {
            ...foundProduct,
            price: Number(foundProduct.price), // Aseguramos que sea número
            rating: foundProduct.averageRating,
          };
        } else {
          this.error = "Producto no encontrado.";
        }
        this.isLoading = false;
      },
      // --- CAMBIO: Tipado del error ---
      error: (err: HttpErrorResponse) => {
        console.error("Error al cargar el producto:", err);
        this.error = "Error al cargar el producto.";
        this.isLoading = false;
      },
    });
  }

  getProductImage(): string {
    if (this.product?.image && this.product.image.trim() !== "") {
      return `${this.backendUrl}/uploads/${this.product.image}`;
    }
    return this.defaultImage;
  }

  // --- Lógica real de "Añadir al Carrito" ---
  addToCart(): void {
    if (!this.selectedSize) {
      this.toastService.showError("Por favor, selecciona una talla.");
      return;
    }

    console.log(
      `🛒 Añadiendo al carrito: ${this.product?.name}, Talla: ${this.selectedSize}`
    );

    this.cartService.addToCart(this.product.id, 1).subscribe({
      next: () => {
        this.toastService.showSuccess("¡Producto añadido a la cesta!");
      },
      // --- CAMBIO: Tipado del error ---
      error: (err: HttpErrorResponse) => {
        console.error("Error al añadir al carrito:", err);
        this.toastService.showError(
          err.error?.message || "No se pudo añadir el producto."
        );
      },
    });
  }

  // --- Lógica real de "Comprar Ahora" ---
  buyNow(): void {
    if (!this.selectedSize) {
      this.toastService.showError("Por favor, selecciona una talla.");
      return;
    }

    console.log(
      `💳 Compra directa: ${this.product?.name}, Talla: ${this.selectedSize}`
    );

    this.cartService.addToCart(this.product.id, 1).subscribe({
      next: () => {
        // Al tener éxito, navega directo al carrito para el checkout
        this.router.navigate(["/cart"]);
      },
      // --- CAMBIO: Tipado del error ---
      error: (err: HttpErrorResponse) => {
        console.error("Error en Compra Directa:", err);
        this.toastService.showError(
          err.error?.message || "No se pudo añadir el producto."
        );
      },
    });
  }
}
