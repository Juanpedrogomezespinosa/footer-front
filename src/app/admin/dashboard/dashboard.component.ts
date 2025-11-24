import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Observable } from "rxjs";
import {
  AdminOrdersResponse,
  AdminUser,
  DashboardStats,
  SalesGraph,
} from "../../core/models/admin.types";
import { AdminService } from "../../core/services/admin.service";
import { BaseChartDirective } from "ng2-charts";
import {
  Chart,
  registerables,
  ChartConfiguration,
  ChartOptions,
  TooltipItem,
} from "chart.js";
import { ModalService } from "../../core/services/modal.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
})
export class DashboardComponent implements OnInit {
  stats$!: Observable<DashboardStats>;
  recentUsers$!: Observable<AdminUser[]>;
  recentOrders$!: Observable<AdminOrdersResponse>;
  salesGraphData$!: Observable<SalesGraph>;
  public lineChartData!: ChartConfiguration<"line">["data"];
  public lineChartOptions!: ChartOptions<"line">;

  constructor(
    private adminService: AdminService,
    private modalService: ModalService
  ) {
    Chart.register(...registerables);

    // Inicializar propiedades aquí
    this.lineChartData = {
      labels: [],
      datasets: [
        {
          data: [],
          label: "Ventas",
          fill: true,
          backgroundColor: "rgba(249, 115, 6, 0.2)",
          borderColor: "#f97306",
          tension: 0.4,
          pointBackgroundColor: "#f97306",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#f97306",
        },
      ],
    };
    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#6c757d" },
        },
        y: {
          grid: { color: "#dee2e6" },
          ticks: {
            color: "#6c757d",
            callback: function (value: string | number) {
              if (typeof value === "number") {
                return "€" + value.toLocaleString("es-ES");
              }
              return value;
            },
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#212529",
          titleFont: { size: 14 },
          bodyFont: { size: 12 },
          callbacks: {
            label: function (context: TooltipItem<"line">) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                }).format(context.parsed.y);
              }
              return label;
            },
          },
        },
      },
    };
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.stats$ = this.adminService.getDashboardStats();
    this.recentUsers$ = this.adminService.getUsers();
    this.recentOrders$ = this.adminService.getOrders(1, 10); // Solo la primera página

    this.salesGraphData$ = this.adminService.getSalesGraph();
    this.salesGraphData$.subscribe((salesGraph) => {
      this.lineChartData = {
        labels: salesGraph.graphData.labels,
        datasets: [
          {
            ...this.lineChartData.datasets[0],
            data: salesGraph.graphData.data,
          },
        ],
      };
    });
  }

  formatPercentage(percentage: number): string {
    const sign = percentage > 0 ? "+" : "";
    const formattedPerc = percentage === -100 ? -100 : percentage.toFixed(1);
    return `${sign}${formattedPerc}%`;
  }

  /**
   * Abre el modal para crear un producto.
   */
  openProductModal(): void {
    this.modalService.openProductModal();
  }

  /**
   * Abre el modal para ver los detalles de un pedido.
   */
  openOrderDetailsModal(orderId: number): void {
    this.modalService.openOrderDetailsModal(orderId);
  }
}
