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
import { OrderService, OrderItemInput } from "../core/services/order.service"; // <-- 1. IMPORTAR OrderService
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

  public subtotal: Signal<number> = computed(() => {
    return this.cartItems().reduce((sum, item) => {
      return sum + Number(item.Product.price) * item.quantity;
    }, 0);
  });

  public taxes: Signal<number> = computed(() => this.subtotal() * 0.21);
  public total: Signal<number> = computed(() => this.subtotal() + this.taxes());

  constructor(
    private cartService: CartService,
    private orderService: OrderService, // <-- 2. INYECTAR OrderService
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log("CartComponent re-inicializado.");
    this.loadCart();
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

  /**
   * --- 👇 LÓGICA DE CHECKOUT CORREGIDA ---
   * Procesa el pago y redirige a Stripe
   */
  onCheckout(): void {
    this.isLoading.set(true);

    // 1. Mapea los items del carrito al formato que tu backend espera
    const itemsToOrder: OrderItemInput[] = this.cartItems().map((item) => ({
      productId: item.productId,
      productName: item.Product.name,
      quantity: item.quantity,
      price: Number(item.Product.price),
    }));

    // 2. Llama al OrderService (no al CartService)
    this.orderService.createOrder(itemsToOrder).subscribe({
      next: (response) => {
        // 3. ¡Éxito! Redirige a la URL de pago de Stripe
        // El navegador abandonará tu app y se irá a Stripe
        window.location.href = response.checkoutUrl;
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error en el checkout:", err);
        this.error.set(err.error?.message || "Error al procesar el pago.");
        this.isLoading.set(false);
      },
    });
  }
  // --- FIN DE LA LÓGICA CORREGIDA ---

  getProductImage(imageName: string | undefined | null): string {
    if (imageName) {
      return `http://localhost:3000/uploads/${imageName}`;
    }
    return `https://placehold.co/400x400/eeeeee/aaaaaa?text=Producto`;
  }
}
