import {
  Component,
  OnInit,
  signal,
  computed,
  WritableSignal,
  Signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { CartService, CartItem } from "../core/services/cart.service";
import { ProductApiResponse } from "../core/services/product.service";

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [CommonModule, RouterLink], // RouterLink se usa en el <ng-template #emptyCart>
  templateUrl: "./cart.component.html",
  styleUrls: [],
})
export class CartComponent implements OnInit {
  // --- State Signals ---
  public cartItems: WritableSignal<CartItem[]> = signal([]);
  public isLoading = signal(true);
  // --- Corrección de tipo ---
  public error: WritableSignal<string | null> = signal(null);

  // --- Computed Signals (para el resumen) ---
  public subtotal: Signal<number> = computed(() => {
    return this.cartItems().reduce((sum, item) => {
      // Aseguramos que el precio sea un número
      return sum + Number(item.Product.price) * item.quantity;
    }, 0);
  });

  public taxes: Signal<number> = computed(() => this.subtotal() * 0.21); // 21% IVA

  public total: Signal<number> = computed(() => this.subtotal() + this.taxes());

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    // --- 👇 CAMBIO TRIVIAL (Texto diferente) PARA FORZAR RECOMPILACIÓN ---
    console.log("CartComponent re-inicializado. Forzando recarga de caché.");
    // --- FIN DEL CAMBIO ---
    this.loadCart();
  }

  /**
   * Carga los items del carrito desde el servicio
   */
  loadCart(): void {
    this.isLoading.set(true);
    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems.set(items);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Error al cargar el carrito:", err);
        // Ahora .set() es válido
        this.error.set("No se pudo cargar tu carrito. Inténtalo de nuevo.");
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Actualiza la cantidad de un item.
   * Si la cantidad llega a 0, lo elimina.
   */
  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      this.removeItem(item.id);
      return;
    }

    // Actualización optimista (actualiza el signal local primero)
    this.cartItems.update((items) =>
      items.map((i) => (i.id === item.id ? { ...i, quantity: newQuantity } : i))
    );

    // Llama al backend
    this.cartService.updateItemQuantity(item.id, newQuantity).subscribe({
      error: (err) => {
        // Si falla, revierte el cambio
        console.error("Error al actualizar cantidad:", err);
        this.loadCart(); // Recarga todo el carrito para asegurar consistencia
      },
    });
  }

  /**
   * Elimina un item del carrito.
   */
  removeItem(itemId: number): void {
    // Actualización optimista
    this.cartItems.update((items) => items.filter((i) => i.id !== itemId));

    // Llama al backend
    this.cartService.removeItem(itemId).subscribe({
      error: (err) => {
        console.error("Error al eliminar item:", err);
        this.loadCart(); // Recarga si falla
      },
    });
  }

  /**
   * Procesa el pago y navega a la confirmación
   */
  onCheckout(): void {
    this.isLoading.set(true); // Muestra un spinner
    this.cartService.checkout().subscribe({
      next: (response) => {
        // Asumiendo que tienes una ruta /confirmation/:orderId
        this.router.navigate(["/confirmation", response.order.id]);
      },
      error: (err) => {
        console.error("Error en el checkout:", err);
        // Ahora .set() es válido
        this.error.set(err.error?.message || "Error al procesar el pago.");
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Helper para obtener la URL de la imagen (¡reúsalo!)
   */
  getProductImage(imageName: string | undefined | null): string {
    if (imageName) {
      return `http://localhost:3000/uploads/${imageName}`;
    }
    return `https://placehold.co/400x400/eeeeee/aaaaaa?text=Producto`;
  }
}
