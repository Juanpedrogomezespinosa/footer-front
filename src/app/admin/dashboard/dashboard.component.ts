// src/app/admin/dashboard/dashboard.component.ts
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
import { BaseChartDirective } from "ng2-charts"; // 1. ¡CAMBIO IMPORTANTE! No es NgChartsModule
import {
  Chart,
  registerables,
  ChartConfiguration,
  ChartOptions,
  TooltipItem,
} from "chart.js"; // 2. Importar TooltipItem

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  standalone: true,
  imports: [CommonModule, BaseChartDirective], // 3. ¡CAMBIO IMPORTANTE! Importar la directiva
})
export class DashboardComponent implements OnInit {
  // Observables para datos
  stats$!: Observable<DashboardStats>;
  recentUsers$!: Observable<AdminUser[]>;
  recentOrders$!: Observable<AdminOrdersResponse>;
  salesGraphData$!: Observable<SalesGraph>; // Observable para los datos crudos

  // --- Configuración de la Gráfica ---
  public lineChartData: ChartConfiguration<"line">["data"] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: "Ventas",
        fill: true,
        backgroundColor: "rgba(249, 115, 6, 0.2)", // Naranja de tu paleta (primary)
        borderColor: "#f97306", // Naranja sólido
        tension: 0.4, // Suaviza la curva
        pointBackgroundColor: "#f97306",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#f97306",
      },
    ],
  };

  public lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false, // Para que ocupe el div
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6c757d" }, // text-light-secondary
      },
      y: {
        grid: { color: "#dee2e6" }, // border-light
        ticks: {
          color: "#6c757d",
          // 4. AÑADIMOS TIPOS a 'value'
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
      legend: { display: false }, // Ocultamos la leyenda
      tooltip: {
        backgroundColor: "#212529",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        callbacks: {
          // 5. AÑADIMOS TIPO a 'context'
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
  // ------------------------------------

  constructor(private adminService: AdminService) {
    // Registrar todos los componentes de Chart.js
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.stats$ = this.adminService.getDashboardStats();
    this.recentUsers$ = this.adminService.getUsers();
    this.recentOrders$ = this.adminService.getOrders(1, 10);

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

  // Función para formatear el % y añadir un signo
  formatPercentage(percentage: number): string {
    const sign = percentage > 0 ? "+" : "";
    const formattedPerc = percentage === -100 ? -100 : percentage.toFixed(1);
    return `${sign}${formattedPerc}%`;
  }
}
