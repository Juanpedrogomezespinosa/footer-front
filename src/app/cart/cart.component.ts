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
import { OrderService } from "../core/services/order.service";
import { UserService, UserAddress } from "../core/services/user.service";
import { ToastService } from "../core/services/toast.service";
import { HttpErrorResponse } from "@angular/common/http";
import { FormsModule } from "@angular/forms";

type ShippingMethod = "standard" | "express";

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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

  public selectedShipping: WritableSignal<ShippingMethod> = signal("standard");

  // --- MÉTODO IMPORTANTE PARA EL PRECIO ---
  public getItemPrice(item: CartItem): number {
    // Prioridad: Precio de variante > Precio de producto
    if (item.variant && item.variant.price) {
      return Number(item.variant.price);
    }
    return Number(item.product.price);
  }

  // 1. TOTAL PRODUCTOS (Usando getItemPrice)
  public productsTotal: Signal<number> = computed(() => {
    return this.cartItems().reduce((sum, item) => {
      return sum + this.getItemPrice(item) * item.quantity;
    }, 0);
  });

  // 2. BASE IMPONIBLE
  public subtotal: Signal<number> = computed(() => {
    return this.productsTotal() / 1.21;
  });

  // 3. IVA
  public taxes: Signal<number> = computed(() => {
    return this.productsTotal() - this.subtotal();
  });

  // --- COSTO ENVÍO ---
  public shippingCost: Signal<number> = computed(() => {
    const method = this.selectedShipping();
    const totalProducts = this.productsTotal();

    if (method === "express") {
      return 7.95;
    } else {
      return totalProducts >= 50 ? 0 : 4.95;
    }
  });

  // 4. GRAN TOTAL
  public total: Signal<number> = computed(() => {
    return this.productsTotal() + this.shippingCost();
  });

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
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

  onCheckout(): void {
    const addressId = this.selectedAddressId();
    if (!addressId) {
      this.toastService.showError(
        "Por favor, selecciona una dirección de envío."
      );
      return;
    }

    const selectedAddress = this.addresses().find((a) => a.id === addressId);
    if (!selectedAddress?.phone) {
      this.toastService.showError(
        "La dirección seleccionada no tiene teléfono. Por favor, edítala o selecciona otra."
      );
      return;
    }

    this.isLoading.set(true);

    this.orderService.createOrder(addressId).subscribe({
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

  getProductImage(imageName: string | undefined | null): string {
    if (imageName) {
      return `http://localhost:3000${imageName}`;
    }
    return `https://placehold.co/400x400/eeeeee/aaaaaa?text=Producto`;
  }
}
