import { Component, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-products-filters",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./products-filters.component.html",
  styleUrls: [],
})
export class ProductsFiltersComponent {
  // Emite el objeto con los filtros seleccionados: { key: [values] }
  @Output()
  public filtersChanged: EventEmitter<Record<string, string[]>> =
    new EventEmitter<Record<string, string[]>>();

  // Emite el valor de orden seleccionado: cadena (por ejemplo "price_asc")
  @Output()
  public sortChanged: EventEmitter<string> = new EventEmitter<string>();

  // Estado interno de filtros seleccionados
  public selectedFilters: Record<string, string[]> = {
    brand: [],
    gender: [],
    season: [],
    material: [],
    color: [],
  };

  // Lista de filtros y opciones (puedes cargarla externamente si lo prefieres)
  public filters: Array<{
    key: string;
    label: string;
    options: string[];
  }> = [
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

  // Maneja los cambios de los checkboxes de los filtros
  public onFilterChange(key: string, event: Event): void {
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
        (value: string) => value !== inputElement.value
      );
    }

    // Emitimos la estructura actualizada de filtros
    this.filtersChanged.emit({ ...this.selectedFilters });
  }

  // Maneja el cambio del select de orden
  public onSortChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.sortChanged.emit(selectElement.value);
  }
}
