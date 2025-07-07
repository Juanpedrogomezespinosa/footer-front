frontend/
│
├── angular/ # (¿uso no especificado?)
├── node_modules/ # Dependencias (no editar)
├── public/
│ └── favicon.ico
│
├── src/
│ └── app/
│ ├── admin/ # Módulo administración
│ │ ├── components/ # CRUD productos, usuarios
│ │ ├── services/ # Servicios admin
│ │ └── admin.routes.ts ✅
│
│ ├── auth/ # Módulo autenticación
│ │ ├── components/ # Login, Registro, etc.
│ │ ├── services/ # Servicios Auth
│ │ └── auth.routes.ts ✅
│
│ ├── cart/ # Módulo carrito
│ │ ├── components/ # Vista carrito, resumen
│ │ ├── services/ # Servicios carrito
│ │ └── cart.routes.ts ✅
│
│ ├── checkout/ # Módulo checkout
│ │ ├── components/ # Formularios pago, resumen compra
│ │ ├── services/ # Servicios Stripe, pagos
│ │ └── checkout.routes.ts ✅
│
│ ├── core/ # Servicios singleton, guards, interceptors
│ │ ├── guards/
│ │ ├── interceptors/
│ │ └── services/
│
│ ├── orders/ # Módulo pedidos
│ │ ├── components/ # Historial y detalles pedidos
│ │ ├── services/ # Servicios pedidos
│ │ └── orders.routes.ts ✅
│
│ ├── products/ # Módulo productos
│ │ ├── components/
│ │ │ └── products-list/
│ │ │ ├── products-list.component.ts
│ │ │ ├── products-list.component.html
│ │ │ ├── products-list.component.scss
│ │ ├── services/
│ │ │ └── products.service.ts
│ │ └── products.module.ts
│ │ └── products.routes.ts
│
│ ├── shared/ # Componentes y pipes reutilizables
│ │ ├── components/
│ │ │ ├── navbar/
│ │ │ │ ├── navbar.component.ts
│ │ │ │ ├── navbar.component.html
│ │ │ │ ├── navbar.component.scss
│ │ │ │ └── navbar.component.spec.ts
│ │ │ └── product-card/
│ │ │ ├── product-card.component.ts
│ │ │ ├── product-card.component.html
│ │ │ ├── product-card.component.scss
│ │ │ └── product-card.component.spec.ts
│ │ ├── pipes/ # (vacío por ahora)
│
│ ├── app.component.ts
│ ├── app.routes.ts ✅ # 🔁 Rutas principales (standalone)
│ └── main.ts # Actualizado para standalone
│
├── .env
├── .gitignore
├── angular.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json
