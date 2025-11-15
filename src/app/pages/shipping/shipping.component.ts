import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms"; // Para el input de 'Rastrear'

@Component({
  selector: "app-shipping",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // Añadir FormsModule
  templateUrl: "./shipping.component.html",
  styleUrls: [],
})
export class ShippingComponent {
  trackingNumber: string = "";

  trackOrder() {
    // Lógica futura para rastrear pedido
    console.log("Rastreando pedido:", this.trackingNumber);
    // Aquí llamarías a un servicio, por ejemplo:
    // this.orderService.track(this.trackingNumber).subscribe(...)
  }
}
