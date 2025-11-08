// src/app/admin/admin.module.ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ADMIN_ROUTES } from "./admin.routes";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AdminLayoutComponent } from "./admin-layout/admin-layout.component"; // 1. Importar

@NgModule({
  declarations: [
    // DashboardComponent es standalone, así que no va aquí
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ADMIN_ROUTES),
    DashboardComponent, // Importamos el componente standalone
    AdminLayoutComponent, // 2. Importamos el layout standalone
  ],
})
export class AdminModule {}
