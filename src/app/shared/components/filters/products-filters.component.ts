// src/app/shared/components/filters/products-filters.component.ts
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

  // Estado interno de filtros seleccionados
  public selectedFilters: Record<string, string[]> = {
    brand: [],
    gender: [],
    season: [],
    material: [],
    color: [],
  };

  // Lista de filtros actualizada con tu estrategia de negocio
  public filters: Array<{
    key: string;
    label: string;
    options: string[];
  }> = [
    {
      key: "material",
      label: "Material",
      options: ["Algodón", "Sintético", "Tela", "Cuero", "Lana", "Woven"],
    },
    {
      key: "gender",
      label: "Género",
      options: ["Unisex", "Hombre", "Mujer"],
    },
    {
      key: "brand",
      label: "Marca",
      options: [
        "Adidas",
        "Nike",
        "Jordan",
        "New Era",
        "Puma",
        "Under Armour",
        "Asics",
        "Fila",
        "Converse",
        "New Balance",
      ],
    },
    {
      key: "color",
      label: "Color",
      options: [
        "Negro",
        "Blanco",
        "Azul",
        "Amarillo",
        "Rojo",
        "Verde",
        "Morado",
      ],
    },
    {
      key: "season",
      label: "Temporada",
      options: ["N/A", "Verano", "Invierno"],
    },
  ];

  // Maneja los cambios de los checkboxes de los filtros
  public onFilterChange(key: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    // Copiamos el array actual para mantener la inmutabilidad
    let currentValues = [...(this.selectedFilters[key] || [])];

    if (inputElement.checked) {
      if (!currentValues.includes(value)) {
        currentValues.push(value);
      }
    } else {
      currentValues = currentValues.filter((v: string) => v !== value);
    }

    // Actualizamos el estado y emitimos
    this.selectedFilters = {
      ...this.selectedFilters,
      [key]: currentValues,
    };

    this.filtersChanged.emit({ ...this.selectedFilters });
  }

  // Función de rastreo (trackBy) para optimizar el renderizado del DOM
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
