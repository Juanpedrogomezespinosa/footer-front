import { Routes } from "@angular/router";
import { AuthPageComponent } from "./components/auth-page/auth-page.component";
import { RegisterComponent } from "./components/register/register.component";

export const authRoutes: Routes = [
  { path: "login", component: AuthPageComponent },
  { path: "register", component: RegisterComponent },
];
