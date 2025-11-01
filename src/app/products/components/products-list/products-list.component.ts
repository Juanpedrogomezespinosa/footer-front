import {
  Component,
  signal,
  OnInit,
  Signal,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Renderer2,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { ProductsFiltersComponent } from "../../../shared/components/filters/products-filters.component";
import { ProductService, Product } from "app/core/services/product.service";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { combineLatest } from "rxjs";
import { UiStateService } from "app/core/services/ui-state.service";

@Component({
  selector: "app-products-list",
  standalone: true,
  imports: [CommonModule, ProductCardComponent, ProductsFiltersComponent],
  templateUrl: "./products-list.component.html",
  styleUrls: [],
})
export class ProductsListComponent implements OnInit, AfterViewInit, OnDestroy {
  // <-- Implementamos interfaces

  public isMobileMenuOpen: Signal<boolean>;

  // --- 👇 LÓGICA PARA EL BOTÓN FLOTANTE ---
  @ViewChild("filterButton") filterButton!: ElementRef;
  private footerObserver: IntersectionObserver | null = null;
  private readonly buttonBottomMargin = 24; // 1.5rem (bottom-6)

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private uiStateService: UiStateService,
    private renderer: Renderer2 // <-- Inyectamos Renderer2
  ) {
    this.isMobileMenuOpen = this.uiStateService.isMobileMenuOpen.asReadonly();

    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape" && this.showFilters) {
        this.showFilters = false;
      }
    });
  }

  private currentCategory: string | null = null;
  private currentSearchTerm: string | null = null;

  products = signal<Product[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);

  readonly itemsPerPage = 18;
  selectedFilters: Record<string, string | string[]> = {};
  selectedSort: string = "";
  showFilters = false;

  ngOnInit(): void {
    combineLatest({
      params: this.route.paramMap,
      queryParams: this.route.queryParamMap,
    }).subscribe(({ params, queryParams }) => {
      this.currentCategory = params.get("categoryName");
      this.currentSearchTerm = queryParams.get("name");
      const pageFromUrl = parseInt(queryParams.get("page") || "1", 10);

      if (this.currentPage() !== pageFromUrl) {
        this.currentPage.set(pageFromUrl);
      }

      // IMPORTANTE: Aquí no se llama a fetchProducts() porque la suscripción se
      // lanza al iniciar. El filtrado se llama desde onFiltersChanged.
      // Pero sí necesitamos re-cargar si cambia la categoría o búsqueda de la URL.
      this.fetchProducts();
    });
  }

  // --- 👇 LÓGICA DEL OBSERVER CORREGIDA ---
  ngAfterViewInit(): void {
    const footer = document.querySelector("app-footer");
    const buttonEl = this.filterButton?.nativeElement;

    if (!footer || !buttonEl) {
      console.warn(
        "No se encontró el footer o el botón de filtro para la lógica de 'choque'."
      );
      return;
    }

    const options = {
      root: null, // Observa contra el viewport
      rootMargin: "0px",
      // Creamos un array de thresholds para que la animación sea más suave
      threshold: Array.from({ length: 101 }, (_, i) => i / 100),
    };

    this.footerObserver = new IntersectionObserver(([entry]) => {
      // --- 👇 CORRECCIÓN: Añadida comprobación de nulidad para rootBounds ---
      if (!entry.rootBounds) {
        return;
      }

      // Comprobamos si el footer está intersectando Y si su borde superior
      // está por encima del borde inferior del viewport.
      const isIntersectingAtBottom =
        entry.isIntersecting &&
        entry.boundingClientRect.top < entry.rootBounds.height;

      if (isIntersectingAtBottom) {
        // El footer está "chocando" con el borde inferior.
        // Calculamos cuánto se ha "metido" el footer en la pantalla:
        const overlap = entry.rootBounds.height - entry.boundingClientRect.top;

        // El nuevo 'bottom' es ese solapamiento + el margen que queremos
        const newBottom = overlap + this.buttonBottomMargin;

        // Nos aseguramos de que el botón no suba más que el alto del footer
        const maxBottom =
          entry.boundingClientRect.height + this.buttonBottomMargin;

        this.renderer.setStyle(
          buttonEl,
          "bottom",
          `${Math.min(newBottom, maxBottom)}px`
        );
      } else {
        // El footer no está visible, o ya hemos scrollado por encima de él.
        // El botón vuelve a su posición fija original.
        this.renderer.setStyle(
          buttonEl,
          "bottom",
          `${this.buttonBottomMargin}px`
        );
      }
    }, options);

    this.footerObserver.observe(footer);
  }
  // --- FIN DE LA LÓGICA CORREGIDA ---

  // --- 👇 NUEVO: ngOnDestroy para limpiar el Observer ---
  ngOnDestroy(): void {
    if (this.footerObserver) {
      this.footerObserver.disconnect();
    }
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  fetchProducts(): void {
    const page = this.currentPage();
    const sort = this.selectedSort;
    const filters = { ...this.selectedFilters };

    if (this.currentCategory) {
      filters["category"] = [this.currentCategory];
    }
    if (this.currentSearchTerm) {
      filters["name"] = this.currentSearchTerm;
    }

    filters["stock"] = "true";

    this.productService
      .getProducts(page, this.itemsPerPage, filters, sort)
      .subscribe({
        next: (response) => {
          const mappedProducts: Product[] = response.products.map(
            (product) => ({
              id: product.id,
              name: product.name,
              price: Number(product.price),
              image: product.image,
              rating: product.averageRating ?? 0,
              ratingCount: product.ratingCount ?? 0,
              category: product.category,
            })
          );
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
    if (
      pageNumber >= 1 &&
      pageNumber <= this.totalPages() &&
      pageNumber !== this.currentPage()
    ) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: pageNumber },
        queryParamsHandling: "merge",
      });
    }
  }

  goToNextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  goToPreviousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  /**
   * Maneja el cambio de filtros. Actualiza el estado y recarga los productos.
   * La clave para el filtrado en tiempo real es llamar a fetchProducts() aquí.
   */
  onFiltersChanged(filters: Record<string, string | string[]>): void {
    // 1. Actualizar el estado interno de los filtros
    this.selectedFilters = filters;

    // 2. Resetear la paginación a la página 1.
    if (this.currentPage() !== 1) {
      this.currentPage.set(1);
    }

    // 3. Forzar la recarga de productos con los nuevos filtros (Real-time filtering)
    this.fetchProducts();

    // Nota: Eliminamos la navegación aquí para forzar el filtrado en tiempo real.
    // Si quieres que el filtro se refleje en la URL, puedes reintroducir la navegación,
    // pero debe estar sincronizado con fetchProducts.
  }

  /**
   * Maneja el cambio de orden. Actualiza el estado y recarga los productos.
   */
  onSortChanged(sortValue: string): void {
    this.selectedSort = sortValue;

    // 1. Resetear la paginación a la página 1.
    if (this.currentPage() !== 1) {
      this.currentPage.set(1);
    }

    // 2. Forzar la recarga de productos con el nuevo orden.
    this.fetchProducts();

    // Nota: Igual que en onFiltersChanged, eliminamos la navegación para forzar la reactividad.
  }
}
