import { Routes } from "@angular/router";
import { AuthGuard } from "./core/guards/auth.guard";
import { AdminGuard } from "./core/guards/admin.guard";

export const routes: Routes = [
  {
    path: "home",
    loadComponent: () =>
      import("./home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "products",
    loadChildren: () =>
      import("./products/products.module").then((m) => m.ProductsModule),
  },
  {
    path: "login",
    loadComponent: () =>
      import("./auth/components/login/login.component").then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./auth/components/login/login.component").then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: "forgot-password",
    loadComponent: () =>
      import("./auth/forgot-password/forgot-password.component").then(
        (m) => m.ForgotPasswordComponent
      ),
    title: "Recuperar Contraseña",
  },
  {
    path: "reset-password/:token",
    loadComponent: () =>
      import("./auth/reset-password/reset-password.component").then(
        (m) => m.ResetPasswordComponent
      ),
    title: "Restablecer Contraseña",
  },
  {
    path: "auth/callback",
    loadComponent: () =>
      import("./auth/auth-callback/auth-callback.component").then(
        (m) => m.AuthCallbackComponent
      ),
    title: "Autenticando...",
  },
  {
    path: "profile",
    loadComponent: () =>
      import("./profile/profile.component").then((m) => m.ProfileComponent),
    canActivate: [AuthGuard],
    title: "Mi Perfil",
    children: [
      {
        path: "",
        loadComponent: () =>
          import(
            "./profile/components/profile-details/profile-details.component"
          ).then((m) => m.ProfileDetailsComponent),
        title: "Mis Datos",
      },
      {
        path: "orders",
        loadComponent: () =>
          import(
            "./profile/components/order-history/order-history.component"
          ).then((m) => m.OrderHistoryComponent),
        title: "Historial de Pedidos",
      },
      {
        path: "addresses",
        loadComponent: () =>
          import(
            "./profile/components/profile-addresses/profile-addresses.component"
          ).then((m) => m.ProfileAddressesComponent),
        title: "Mis Direcciones",
      },
    ],
  },
  {
    path: "admin",
    loadChildren: () =>
      import("./admin/admin.module").then((m) => m.AdminModule),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: "cart",
    loadComponent: () =>
      import("./cart/cart.component").then((m) => m.CartComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "confirmation/:orderId",
    loadComponent: () =>
      import("./confirmation/confirmation.component").then(
        (m) => m.ConfirmationComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "contact",
    loadComponent: () =>
      import("./contact/contact.component").then((m) => m.ContactComponent),
    title: "Contacto",
  },
  {
    path: "about",
    loadComponent: () =>
      import("./pages/about/about.component").then((m) => m.AboutComponent),
    title: "Sobre Nosotros",
  },
  {
    path: "shipping",
    loadComponent: () =>
      import("./pages/shipping/shipping.component").then(
        (m) => m.ShippingComponent
      ),
    title: "Envíos y Devoluciones",
  },
  {
    path: "faq",
    loadComponent: () =>
      import("./pages/faq/faq.component").then((m) => m.FaqComponent),
    title: "Preguntas Frecuentes",
  },
  {
    path: "legal-notice",
    loadComponent: () =>
      import("./pages/legal-notice/legal-notice.component").then(
        (m) => m.LegalNoticeComponent
      ),
    title: "Aviso Legal",
  },
  {
    path: "privacy",
    loadComponent: () =>
      import("./pages/privacy/privacy.component").then(
        (m) => m.PrivacyComponent
      ),
    title: "Política de Privacidad",
  },
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "**",
    loadComponent: () =>
      import("./error-pages/not-found/not-found.component").then(
        (m) => m.NotFoundComponent
      ),
    title: "404 - Página no encontrada",
  },
];
