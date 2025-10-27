import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { ProductService, Product } from "app/core/services/product.service";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { FooterComponent } from "../../../shared/components/footer/footer.component";

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    NavbarComponent,
    FooterComponent,
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
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const productIdParam = this.route.snapshot.paramMap.get("id");
    const productId = Number(productIdParam);

    if (isNaN(productId)) {
      this.error = "ID de producto inválido.";
      this.isLoading = false;
      return;
    }

    this.productService.getProducts(1, 100).subscribe({
      next: (res) => {
        const found = res.products.find((p) => p.id === productId);
        if (found) {
          this.product = {
            ...found,
            rating: found.averageRating,
          };
        } else {
          this.error = "Producto no encontrado.";
        }
        this.isLoading = false;
      },
      error: (err) => {
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

  addToCart(): void {
    console.log(
      `🛒 Producto añadido al carrito: ${this.product?.name}, Talla: ${this.selectedSize}`
    );
  }

  buyNow(): void {
    console.log(
      `💳 Compra directa: ${this.product?.name}, Talla: ${this.selectedSize}`
    );
  }
}
