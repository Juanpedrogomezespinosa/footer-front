frontend/
│
├── angular/
├── node_modules/ # Dependencias instaladas (NO editar)
├── public/
│ └── favicon.ico
│
├── src/
│ └── app/
│ ├── admin/ # Módulo administración
│ │ ├── admin-routing.module.ts
│ │ ├── admin.module.ts
│ │ ├── components/ # CRUD productos, usuarios
│ │ └── services/ # Servicios admin
│ │
│ ├── auth/ # Módulo autenticación
│ │ ├── auth-routing.module.ts
│ │ ├── auth.module.ts
│ │ ├── components/ # Login, Registro, etc.
│ │ └── services/ # Servicios Auth (auth.service.ts)
│ │
│ ├── cart/ # Módulo carrito
│ │ ├── cart-routing.module.ts
│ │ ├── cart.module.ts
│ │ ├── components/ # Vista carrito, resumen
│ │ └── services/ # Servicios carrito
│ │
│ ├── checkout/ # Módulo checkout
│ │ ├── checkout-routing.module.ts
│ │ ├── checkout.module.ts
│ │ ├── components/ # Formularios pago, resumen compra
│ │ └── services/ # Servicios Stripe, pagos
│ │
│ ├── core/ # Servicios singleton, guards, interceptors
│ │ ├── guards/ # Guards (AuthGuard, AdminGuard, etc)
│ │ ├── interceptors/ # Interceptores HTTP (JWT interceptor, etc)
│ │ ├── services/ # Servicios core (AuthService, ProductService, etc)
│ │ └── core.module.ts
│ │
│ ├── orders/ # Módulo pedidos
│ │ ├── orders-routing.module.ts
│ │ ├── orders.module.ts
│ │ ├── components/ # Historial y detalles pedidos
│ │ └── services/ # Servicios pedidos
│ │
│ ├── products/ # Módulo productos
│ │ ├── products-routing.module.ts
│ │ ├── products.module.ts
│ │ ├── components/ # Listados, detalles, filtros
│ │ └── services/ # Servicios productos
│ │
│ ├── shared/ # Componentes, pipes y directivas reutilizables
│ │ ├── components/
│ │ │ ├── navbar/ # Componente Navbar
│ │ │ └── product-card/
│ │ ├── pipes/ # Pipes reutilizables
│ │ └── shared.module.ts
│ │
│ ├── app-routing.module.ts # Rutas principales de la app
│ ├── app.component.ts
│ └── app.module.ts
│
├── .env # Variables de entorno
├── .gitignore # Archivos ignorados por git
├── angular.json # Configuración Angular CLI
├── package-lock.json # Versión fija de dependencias
├── package.json # Dependencias y scripts
├── README.md # Documentación inicial
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json
