import { Component, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-products-filters",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./products-filters.component.html",
  styleUrls: ["./products-filters.component.scss"],
})
export class ProductsFiltersComponent {
  @Output() filtersChanged = new EventEmitter<Record<string, string[]>>();
  @Output() sortChanged = new EventEmitter<string>();

  selectedFilters: Record<string, string[]> = {
    brand: [],
    gender: [],
    season: [],
    material: [],
    color: [],
  };

  filters = [
    {
      key: "material",
      label: "Material",
      options: ["Algodón", "Lana", "Cuero", "Sintético"],
    },
    {
      key: "gender",
      label: "Género",
      options: ["Hombre", "Mujer", "Unisex"],
    },
    {
      key: "brand",
      label: "Marca",
      options: ["Nike", "Adidas", "Puma", "Reebok"],
    },
    {
      key: "color",
      label: "Color",
      options: ["Rojo", "Azul", "Verde", "Negro", "Blanco"],
    },
    {
      key: "season",
      label: "Temporada",
      options: ["Verano", "Invierno", "Primavera", "Otoño"],
    },
  ];

  onFilterChange(key: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    if (!this.selectedFilters[key]) {
      this.selectedFilters[key] = [];
    }

    if (inputElement.checked) {
      if (!this.selectedFilters[key].includes(inputElement.value)) {
        this.selectedFilters[key].push(inputElement.value);
      }
    } else {
      this.selectedFilters[key] = this.selectedFilters[key].filter(
        (value) => value !== inputElement.value
      );
    }

    this.filtersChanged.emit(this.selectedFilters);
  }

  onSortChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.sortChanged.emit(selectElement.value);
  }
}
