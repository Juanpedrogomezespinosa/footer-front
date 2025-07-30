import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ProductService, Product } from "app/core/services/product.service";
import { HttpClientModule } from "@angular/common/http";
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
  styleUrls: ["./product-detail.component.scss"],
})
export class ProductDetailComponent implements OnInit {
  product!: Product;
  isLoading: boolean = true;
  error: string = "";
  selectedSize: string = "";
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

  backendUrl: string = "http://localhost:3000";
  defaultImage: string = "/assets/icons/agregar-carrito.png";

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    console.log("ProductDetailComponent: ngOnInit iniciado");

    const productIdString = this.route.snapshot.paramMap.get("id");
    console.log("Parámetro id recibido:", productIdString);

    const productId = Number(productIdString);

    if (isNaN(productId)) {
      this.error = "ID de producto inválido.";
      this.isLoading = false;
      console.error(this.error);
      return;
    }

    this.productService.getProducts(1, 100).subscribe({
      next: (res) => {
        console.log("Respuesta del servicio getProducts:", res);
        const found = res.products.find((p) => p.id === productId);
        if (found) {
          this.product = {
            ...found,
            rating: found.averageRating,
          };
          console.log("Producto encontrado:", this.product);
        } else {
          this.error = "Producto no encontrado.";
          console.error(this.error);
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
    return this.product?.image
      ? `${this.backendUrl}/uploads/${this.product.image}`
      : this.defaultImage;
  }

  addToCart(): void {
    console.log(
      "Producto añadido al carrito:",
      this.product.name,
      "Talla:",
      this.selectedSize
    );
  }

  buyNow(): void {
    console.log(
      "Compra directa del producto:",
      this.product.name,
      "Talla:",
      this.selectedSize
    );
  }
}
