// src/app/products/components/products-list/products-list.component.ts
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
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { ProductsFiltersComponent } from "../../../shared/components/filters/products-filters.component";
import {
  ProductService,
  Product,
  ProductApiResponse,
} from "app/core/services/product.service";
import { ActivatedRoute, Router } from "@angular/router";
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
  public isMobileMenuOpen: Signal<boolean>;

  @ViewChild("filterButton") filterButton!: ElementRef;
  private footerObserver: IntersectionObserver | null = null;
  private readonly buttonBottomMargin = 24;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private uiStateService: UiStateService,
    private renderer: Renderer2
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
  totalItems = signal(0);
  listTitle = signal("Todos los productos");

  readonly itemsPerPage = 18;
  selectedFilters: Record<string, string | string[]> = {};
  selectedSort: string = "";
  showFilters = false;

  public sortOptions = [
    { value: "", label: "Más Relevante" },
    { value: "price_asc", label: "Precio: Menor a Mayor" },
    { value: "price_desc", label: "Precio: Mayor a Menor" },
    { value: "rating_desc", label: "Mejor Valorados" },
  ];

  public pageNumbers: Signal<number[]> = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [];
    if (current > 3) {
      pages.push(1);
      if (current > 4) pages.push(-1); // -1 representa "..."
    }

    for (let i = -2; i <= 2; i++) {
      const page = current + i;
      if (page > 0 && page <= total) {
        if (!pages.includes(page)) {
          pages.push(page);
        }
      }
    }

    if (current < total - 2) {
      if (current < total - 3) pages.push(-1); // -1 representa "..."
      pages.push(total);
    }
    return pages.filter((p, i) => p !== -1 || pages[i - 1] !== -1);
  });

  ngOnInit(): void {
    combineLatest({
      params: this.route.paramMap,
      queryParams: this.route.queryParamMap,
    }).subscribe(({ params, queryParams }) => {
      this.currentCategory = params.get("categoryName");
      this.currentSearchTerm = queryParams.get("name");
      const pageFromUrl = parseInt(queryParams.get("page") || "1", 10);

      this.updateListTitle();

      if (this.currentPage() !== pageFromUrl) {
        this.currentPage.set(pageFromUrl);
      }

      this.fetchProducts();
    });
  }

  ngAfterViewInit(): void {
    const footer = document.querySelector("app-footer");
    const buttonEl = this.filterButton?.nativeElement;
    if (!footer || !buttonEl) {
      console.warn("No se encontró el footer o el botón de filtro.");
      return;
    }
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: Array.from({ length: 101 }, (_, i) => i / 100),
    };
    this.footerObserver = new IntersectionObserver(([entry]) => {
      if (!entry.rootBounds) return;
      const isIntersectingAtBottom =
        entry.isIntersecting &&
        entry.boundingClientRect.top < entry.rootBounds.height;
      if (isIntersectingAtBottom) {
        const overlap = entry.rootBounds.height - entry.boundingClientRect.top;
        const newBottom = overlap + this.buttonBottomMargin;
        const maxBottom =
          entry.boundingClientRect.height + this.buttonBottomMargin;
        this.renderer.setStyle(
          buttonEl,
          "bottom",
          `${Math.min(newBottom, maxBottom)}px`
        );
      } else {
        this.renderer.setStyle(
          buttonEl,
          "bottom",
          `${this.buttonBottomMargin}px`
        );
      }
    }, options);
    this.footerObserver.observe(footer);
  }

  ngOnDestroy(): void {
    if (this.footerObserver) {
      this.footerObserver.disconnect();
    }
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  private updateListTitle(): void {
    if (this.currentSearchTerm) {
      this.listTitle.set(`Resultados para "${this.currentSearchTerm}"`);
    } else if (this.currentCategory) {
      const cleanTitle =
        this.currentCategory.charAt(0).toUpperCase() +
        this.currentCategory.slice(1);
      this.listTitle.set(cleanTitle);
    } else {
      this.listTitle.set("Todos los productos");
    }
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
          // --- CORRECCIÓN: Mapeo completo para cumplir la interfaz Product ---
          const mappedProducts: Product[] = response.products.map(
            (product: ProductApiResponse) => ({
              id: product.id,
              name: product.name,
              price: Number(product.price),
              oldPrice:
                Number(product.price) < 80
                  ? Number(product.price) + 20
                  : undefined,
              image: product.image,
              brand: product.brand,
              category: product.category,
              rating: product.averageRating ?? 0,
              ratingCount: product.ratingCount ?? 0,
              description: product.description || "",
              color: product.color || "",
              material: product.material || null,
              gender: product.gender || "unisex",

              // --- CAMPOS AÑADIDOS PARA EVITAR ERROR TS2322 ---
              // Inicializamos estos campos como vacíos porque en el listado
              // no necesitamos el detalle de variantes, pero el tipo lo exige.
              availableColors: [],
              imagesByColor: {},
              variantsByColor: {},
              siblings: [],
              // -----------------------------------------------
            })
          );

          this.products.set(mappedProducts);
          this.totalPages.set(response.totalPages);
          this.totalItems.set(response.totalItems);
        },
        error: (error) => {
          console.error("Error al cargar los productos:", error);
          this.products.set([]);
          this.totalItems.set(0);
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
      document
        .querySelector("#product-list-header")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }

  goToNextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  goToPreviousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  onFiltersChanged(filters: Record<string, string | string[]>): void {
    this.selectedFilters = filters;
    if (this.currentPage() !== 1) {
      this.currentPage.set(1);
    }
    this.fetchProducts();
  }

  onSortChanged(event: Event): void {
    const sortValue = (event.target as HTMLSelectElement).value;
    this.selectedSort = sortValue;
    if (this.currentPage() !== 1) {
      this.currentPage.set(1);
    }
    this.fetchProducts();
  }
}
