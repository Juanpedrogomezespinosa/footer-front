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
    const value = inputElement.value;

    // 1. Clonar el array existente para el filtro específico (inmutabilidad).
    let currentValues = [...(this.selectedFilters[key] || [])];

    if (inputElement.checked) {
      // Agregar valor si está marcado
      if (!currentValues.includes(value)) {
        currentValues.push(value);
      }
    } else {
      // Remover valor creando un nuevo array filtrado
      currentValues = currentValues.filter((v: string) => v !== value);
    }

    // 2. CREAR UN NUEVO OBJETO para selectedFilters (inmutabilidad en el nivel raíz).
    // Esto es CRUCIAL para que Angular detecte el cambio de la propiedad [checked]
    this.selectedFilters = {
      ...this.selectedFilters,
      [key]: currentValues,
    };

    // 3. Emitimos una COPIA SUPERFICIAL del objeto de filtros para garantizar la reactividad en el componente padre.
    this.filtersChanged.emit({ ...this.selectedFilters });
  }

  // Maneja el cambio del select de orden
  public onSortChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.sortChanged.emit(selectElement.value);
  }

  // Función de rastreo (trackBy) para el *ngFor en las opciones.
  // Necesario para que Angular sepa qué elementos del DOM debe reevaluar.
  public trackByFn(index: number, option: string): string {
    return option; // Usamos el valor de la opción como clave única
  }

  // Método para resetear todos los filtros seleccionados
  public resetFilters(): void {
    // Creamos un nuevo objeto de filtros vacío
    this.selectedFilters = {
      brand: [],
      gender: [],
      season: [],
      material: [],
      color: [],
    };
    // Emitimos una COPIA SUPERFICIAL del estado vacío.
    this.filtersChanged.emit({ ...this.selectedFilters });
  }
}
