import { Component, signal, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
// Se eliminan NavbarComponent y FooterComponent, ya que son componentes globales.
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { ProductsFiltersComponent } from "../../../shared/components/filters/products-filters.component";
import { ProductService, Product } from "app/core/services/product.service";

@Component({
  selector: "app-products-list",
  standalone: true,
  imports: [
    CommonModule,
    // NavbarComponent, <-- Eliminado (causaba warning)
    // FooterComponent, <-- Eliminado (causaba warning)
    ProductCardComponent,
    ProductsFiltersComponent,
  ],
  templateUrl: "./products-list.component.html",
  styleUrls: [],
})
export class ProductsListComponent {
  // Signals
  products = signal<Product[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);

  readonly itemsPerPage = 18;

  // Filtros y orden
  // --- MEJORA ---
  // Actualizamos el tipo para que coincida con lo que el servicio espera
  selectedFilters: Record<string, string | string[]> = {};
  selectedSort: string = "";

  // Estado del sidebar de filtros (móvil y escritorio)
  showFilters = false;

  constructor(private productService: ProductService) {
    this.fetchProducts();

    // Escuchar tecla ESC para cerrar el sidebar
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape" && this.showFilters) {
        this.showFilters = false;
      }
    });
  }

  /** Alternar visibilidad del sidebar de filtros */
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  /** Obtener productos desde el servicio */
  fetchProducts(): void {
    const page = this.currentPage();
    const filters = this.selectedFilters;
    const sort = this.selectedSort;

    this.productService
      .getProducts(page, this.itemsPerPage, filters, sort)
      .subscribe({
        next: (response) => {
          // --- CORRECCIÓN ---
          // Mapeamos la respuesta completa de la API, incluyendo la 'category'
          const mappedProducts: Product[] = response.products.map(
            (product) => ({
              id: product.id,
              name: product.name,
              price: Number(product.price),
              image: product.image,
              rating: product.averageRating ?? 0,
              ratingCount: product.ratingCount ?? 0,
              category: product.category, // <-- ESTA LÍNEA FALTABA
            })
          );
          // --- FIN CORRECCIÓN ---

          this.products.set(mappedProducts);
          this.totalPages.set(response.totalPages);
        },
        error: (error) => {
          console.error("Error al cargar los productos:", error);
          this.products.set([]);
        },
      });
  }

  /** Navegar entre páginas */
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

  /** Actualizar productos al cambiar filtros */
  // --- MEJORA ---
  // Simplificamos este método. El servicio ya sabe cómo manejar los filtros.
  onFiltersChanged(filters: Record<string, string | string[]>): void {
    this.selectedFilters = filters;
    this.currentPage.set(1);
    this.fetchProducts();
  }
  // --- FIN MEJORA ---

  /** Actualizar productos al cambiar orden */
  onSortChanged(sortValue: string): void {
    this.selectedSort = sortValue;
    this.currentPage.set(1);
    this.fetchProducts();
  }
}
