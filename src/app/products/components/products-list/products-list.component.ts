import { Component, signal, computed, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { FooterComponent } from "../../../shared/components/footer/footer.component";
import { ProductsFiltersComponent } from "../../../shared/components/filters/products-filters.component";
import { ProductService, Product } from "app/core/services/product.service";

@Component({
  selector: "app-products-list",
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    ProductCardComponent,
    ProductsFiltersComponent,
  ],
  templateUrl: "./products-list.component.html",
  styleUrls: ["./products-list.component.scss"],
})
export class ProductsListComponent {
  products = signal<Product[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  readonly itemsPerPage = 18;

  selectedFilters: Record<string, string[]> = {};
  selectedSort: string = "";

  showMobileFilters = false;
  isMobile = window.innerWidth <= 900;

  constructor(private productService: ProductService) {
    this.fetchProducts();
    window.addEventListener("resize", this.onResize.bind(this));
  }

  onResize() {
    this.isMobile = window.innerWidth <= 900;
  }

  toggleFilters() {
    this.showMobileFilters = !this.showMobileFilters;
  }

  fetchProducts(): void {
    const page = this.currentPage();
    const filters = this.selectedFilters;
    const sort = this.selectedSort;

    this.productService
      .getProducts(page, this.itemsPerPage, filters, sort)
      .subscribe({
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

  onFiltersChanged(filters: Record<string, string | string[]>): void {
    const normalizedFilters: Record<string, string[]> = {};
    for (const key in filters) {
      const value = filters[key];
      if (Array.isArray(value)) {
        normalizedFilters[key] = value;
      } else if (typeof value === "string") {
        normalizedFilters[key] = [value];
      } else {
        normalizedFilters[key] = [];
      }
    }

    this.selectedFilters = normalizedFilters;
    this.currentPage.set(1);
    this.fetchProducts();
  }

  onSortChanged(sortValue: string): void {
    this.selectedSort = sortValue;
    this.currentPage.set(1);
    this.fetchProducts();
  }
}
