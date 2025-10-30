import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class UiStateService {
  /**
   * Un signal que rastrea si el menú móvil está abierto o cerrado.
   */
  public isMobileMenuOpen = signal(false);
}
