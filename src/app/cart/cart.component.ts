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
import { OrderService, OrderItemInput } from "../core/services/order.service";
// --- 1. Imports añadidos ---
import { UserService, UserAddress } from "../core/services/user.service";
import { ToastService } from "../core/services/toast.service";
// --- Fin de Imports añadidos ---
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
  public isLoading = signal(true); // Carga principal
  public error: WritableSignal<string | null> = signal(null);

  // --- 2. Nuevos signals para Direcciones ---
  public addresses = signal<UserAddress[]>([]);
  public isLoadingAddresses = signal(true);
  public selectedAddressId = signal<number | null>(null);
  // --- Fin de nuevos signals ---

  public subtotal: Signal<number> = computed(() => {
    return this.cartItems().reduce((sum, item) => {
      return sum + Number(item.Product.price) * item.quantity;
    }, 0);
  });

  public taxes: Signal<number> = computed(() => this.subtotal() * 0.21);
  public total: Signal<number> = computed(() => this.subtotal() + this.taxes());

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    // --- 3. Inyectar UserService y ToastService ---
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    console.log("CartComponent re-inicializado.");
    this.loadCart();
    this.loadAddresses(); // <-- 4. Cargar direcciones al iniciar
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

  // --- 5. Nueva función para cargar direcciones ---
  loadAddresses(): void {
    this.isLoadingAddresses.set(true);
    this.userService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
        // Autoseleccionar la dirección por defecto si existe
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

  // --- 6. Nueva función para seleccionar dirección ---
  onSelectAddress(addressId: number): void {
    this.selectedAddressId.set(addressId);
  }

  /**
   * --- LÓGICA DE CHECKOUT MODIFICADA ---
   */
  onCheckout(): void {
    // 7. Validación de dirección
    if (!this.selectedAddressId()) {
      this.toastService.showError(
        "Por favor, selecciona una dirección de envío."
      );
      return;
    }

    this.isLoading.set(true);

    const itemsToOrder: OrderItemInput[] = this.cartItems().map((item) => ({
      productId: item.productId,
      productName: item.Product.name,
      quantity: item.quantity,
      price: Number(item.Product.price),
    }));

    // 8. Enviar items Y la dirección seleccionada
    this.orderService
      .createOrder(itemsToOrder, this.selectedAddressId()!)
      .subscribe({
        next: (response) => {
          window.location.href = response.checkoutUrl;
        },
        error: (err: HttpErrorResponse) => {
          console.error("Error en el checkout:", err);
          this.error.set(err.error?.message || "Error al procesar el pago.");
          this.isLoading.set(false);
        },
      });
  }
  // --- FIN DE LA LÓGICA MODIFICADA ---

  getProductImage(imageName: string | undefined | null): string {
    if (imageName) {
      return `http://localhost:3000/uploads/${imageName}`;
    }
    return `https://placehold.co/400x400/eeeeee/aaaaaa?text=Producto`;
  }
}
