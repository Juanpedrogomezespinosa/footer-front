// src/app/cart/cart.component.ts
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
// --- ¡CAMBIO AQUÍ! ---
// Ya no necesitamos OrderItemInput
import { OrderService } from "../core/services/order.service";
// --------------------
import { UserService, UserAddress } from "../core/services/user.service";
import { ToastService } from "../core/services/toast.service";
import { ProductApiResponse } from "../core/services/product.service";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./cart.component.html",
  styleUrls: [],
})
export class CartComponent implements OnInit {
  public cartItems: WritableSignal<CartItem[]> = signal([]);
  public isLoading = signal(true);
  public error: WritableSignal<string | null> = signal(null);

  public addresses = signal<UserAddress[]>([]);
  public isLoadingAddresses = signal(true);
  public selectedAddressId = signal<number | null>(null);

  public subtotal: Signal<number> = computed(() => {
    return this.cartItems().reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);
  });

  public taxes: Signal<number> = computed(() => this.subtotal() * 0.21);
  public total: Signal<number> = computed(() => this.subtotal() + this.taxes());

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    console.log("CartComponent re-inicializado.");
    this.loadCart();
    this.loadAddresses();
  }

  loadCart(): void {
    this.isLoading.set(true);
    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems.set(items);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error al cargar el carrito:", err);
        this.error.set("No se pudo cargar tu carrito. Inténtalo de nuevo.");
        this.isLoading.set(false);
      },
    });
  }

  loadAddresses(): void {
    this.isLoadingAddresses.set(true);
    this.userService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
        const defaultAddress = addresses.find((addr) => addr.isDefault);
        if (defaultAddress) {
          this.selectedAddressId.set(defaultAddress.id);
        }
        this.isLoadingAddresses.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error al cargar direcciones:", err);
        this.toastService.showError("No se pudieron cargar tus direcciones.");
        this.isLoadingAddresses.set(false);
      },
    });
  }

  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      this.removeItem(item.id);
      return;
    }
    this.cartItems.update((items) =>
      items.map((i) => (i.id === item.id ? { ...i, quantity: newQuantity } : i))
    );
    this.cartService.updateItemQuantity(item.id, newQuantity).subscribe({
      error: (err: HttpErrorResponse) => {
        console.error("Error al actualizar cantidad:", err);
        this.loadCart();
      },
    });
  }

  removeItem(itemId: number): void {
    this.cartItems.update((items) => items.filter((i) => i.id !== itemId));
    this.cartService.removeItem(itemId).subscribe({
      error: (err: HttpErrorResponse) => {
        console.error("Error al eliminar item:", err);
        this.loadCart();
      },
    });
  }

  onSelectAddress(addressId: number): void {
    this.selectedAddressId.set(addressId);
  }

  /**
   * --- ¡¡¡FUNCIÓN 'onCheckout' CORREGIDA!!! ---
   */
  onCheckout(): void {
    if (!this.selectedAddressId()) {
      this.toastService.showError(
        "Por favor, selecciona una dirección de envío."
      );
      return;
    }

    this.isLoading.set(true);

    // --- ¡BLOQUE ELIMINADO! ---
    // Ya no creamos el array 'itemsToOrder' en el frontend.
    // const itemsToOrder: OrderItemInput[] = ...

    // --- ¡LLAMADA CORREGIDA! ---
    // Simplemente llamamos al servicio con el ID de la dirección.
    this.orderService.createOrder(this.selectedAddressId()!).subscribe({
      next: (response) => {
        // Redirigimos a Stripe
        window.location.href = response.checkoutUrl;
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error en el checkout:", err);
        this.error.set(err.error?.message || "Error al procesar el pago.");
        this.isLoading.set(false);
      },
    });
  }

  getProductImage(imageName: string | undefined | null): string {
    if (imageName) {
      return `http://localhost:3000${imageName}`;
    }
    return `https://placehold.co/400x400/eeeeee/aaaaaa?text=Producto`;
  }
}
