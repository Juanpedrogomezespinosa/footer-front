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

  // --- 'sortChanged' ELIMINADO ---

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
    const value = inputElement.value;

    let currentValues = [...(this.selectedFilters[key] || [])];

    if (inputElement.checked) {
      if (!currentValues.includes(value)) {
        currentValues.push(value);
      }
    } else {
      currentValues = currentValues.filter((v: string) => v !== value);
    }

    this.selectedFilters = {
      ...this.selectedFilters,
      [key]: currentValues,
    };

    this.filtersChanged.emit({ ...this.selectedFilters });
  }

  // --- 'onSortChange' ELIMINADO ---

  // Función de rastreo (trackBy)
  public trackByFn(index: number, option: string): string {
    return option;
  }

  // Método para resetear todos los filtros seleccionados
  public resetFilters(): void {
    this.selectedFilters = {
      brand: [],
      gender: [],
      season: [],
      material: [],
      color: [],
    };
    this.filtersChanged.emit({ ...this.selectedFilters });
  }
}
