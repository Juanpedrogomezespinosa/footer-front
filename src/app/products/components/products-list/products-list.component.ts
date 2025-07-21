import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { FooterComponent } from "../../../shared/components/footer/footer.component";
import { ProductService, Product } from "app/core/services/product.service";

@Component({
  selector: "app-products-list",
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    ProductCardComponent,
  ],
  templateUrl: "./products-list.component.html",
  styleUrls: ["./products-list.component.scss"],
})
export class ProductsListComponent {
  products = signal<Product[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  readonly itemsPerPage = 18;

  constructor(private productService: ProductService) {
    this.fetchProducts();
  }

  fetchProducts(): void {
    const pageNumber = this.currentPage();

    this.productService.getProducts(pageNumber, this.itemsPerPage).subscribe({
      next: (response) => {
        const mappedProducts = response.products.map((product) => ({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image,
          rating: product.averageRating ?? 0,
          ratingCount: product.ratingCount ?? 0,
        }));

        this.products.set(mappedProducts);
        this.totalPages.set(response.totalPages);
      },
      error: (error) => {
        console.error("Error al cargar los productos:", error);
        this.products.set([]);
      },
    });
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages()) {
      this.currentPage.set(pageNumber);
      this.fetchProducts();
    }
  }

  goToNextPage(): void {
    const nextPage = this.currentPage() + 1;
    if (nextPage <= this.totalPages()) {
      this.goToPage(nextPage);
    }
  }

  goToPreviousPage(): void {
    const previousPage = this.currentPage() - 1;
    if (previousPage >= 1) {
      this.goToPage(previousPage);
    }
  }
}
