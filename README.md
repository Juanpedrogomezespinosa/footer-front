footer-front/
├── angular/ # Otra carpeta que no es parte del build (posiblemente error o carpeta auxiliar)
├── node_modules/ # Generada por npm
├── public/ # No utilizada por Angular por defecto
├── src/
│ ├── app/
│ │ ├── admin/
│ │ │ └── admin.module.ts
│ ├── auth/ # Módulo de autenticación (login, register)
│ │ ├── components/
│ │ │ ├── auth-page/
│ │ │ │ ├── auth-page.component.ts
│ │ │ │ ├── auth-page.component.html
│ │ │ │ └── auth-page.component.scss
│ │ │ ├── login/
│ │ │ │ ├── login.component.ts
│ │ │ │ ├── login.component.html
│ │ │ │ └── login.component.scss
│ │ │ └── register/
│ │ │ ├── register.component.ts
│ │ │ ├── register.component.html
│ │ │ └── register.component.scss
│ │ ├── auth.module.ts
│ │ └── auth.routes.ts
│ ├── cart/ # Módulo del carrito
│ │ ├── cart.component.ts
│ │ ├── cart.component.html
│ │ ├── cart.component.scss
│ │ └── cart.module.ts
│ ├── checkout/ # Módulo de pago
│ │ ├── checkout.component.ts
│ │ ├── checkout.component.html
│ │ ├── checkout.component.scss
│ │ └── checkout.module.ts
│ ├── core/ # Lógica global reutilizable
│ │ ├── guards/
│ │ │ ├── auth.guard.ts
│ │ │ ├── admin.guard.ts
│ │ ├── interceptors/
│ │ │ ├── auth.interceptor.ts
│ │ ├── services/
│ │ │ ├── auth.service.ts
│ │ │ ├── cart.service.ts
│ │ │ ├── order.service.ts
│ │ │ ├── product.service.ts
│ │ │ ├── user.service.ts
│ │ │ └── toast.service.ts
│ │ ├── core.module.ts
│ │ ├── orders/ # Historial de pedidos
│ │ │ ├── orders.component.ts
│ │ │ ├── orders.component.html
│ │ │ ├── orders.component.scss
│ │ │ └── orders.module.ts
│ │ ├── profile/ # Perfil de usuario
│ │ │ ├── profile.component.ts
│ │ │ ├── profile.component.html
│ │ │ ├── profile.component.scss
│ │ │ └── profile.module.ts
│ │ ├── products/
│ │ │ ├── components/
│ │ │ │ └── product-list/
│ │ │ │ └── products-list.component.html
│ │ │ │ └── products-list.component.scss
│ │ │ │ └── products-list.component.ts
│ │ │ │ └── product-detail/
│ │ │ │ └── product-detail.component.html
│ │ │ │ └── product-detail.component.scss
│ │ │ │ └── product-detail.component.ts
│ │ │ ├── products.module.ts
│ │ │ └── products.routes.ts
│ │ ├── error-pages/ # Páginas como 404
│ │ │ ├── not-found/
│ │ │ │ ├── not-found.component.ts
│ │ │ │ ├── not-found.component.html
│ │ │ │ └── not-found.component.scss
│ │ │ └── error-pages.module.ts
│ │ ├── shared/
│ │ │ ├── components/
│ │ │ │ ├── filters/
│ │ │ │ │ ├── products-filters.component.html
│ │ │ │ │ ├── products-filters.component.scss
│ │ │ │ │ ├── products-filters.component.spec.ts
│ │ │ │ │ └── products-filters.component.ts
│ │ │ │ ├── footer/
│ │ │ │ │ ├── footer.component.html
│ │ │ │ │ ├── footer.component.scss
│ │ │ │ │ └── footer.component.ts
│ │ │ │ ├── navbar/
│ │ │ │ │ ├── navbar.component.html
│ │ │ │ │ ├── navbar.component.scss
│ │ │ │ │ └── navbar.component.ts
│ │ │ │ └── product-card/
│ │ │ │ ├── product-card.component.html
│ │ │ │ ├── product-card.component.scss
│ │ │ │ └── product-card.component.ts
│ │ │ │ └── toast/
│ │ │ │ ├── toast.component.html
│ │ │ │ ├── toast.component.scss
│ │ │ │ └── toast.component.ts
│ │ │ ├── pipes/
│ │ │ └── shared.module.ts
│ │ ├── app.component.html
│ │ ├── app.component.scss
│ │ ├── app.component.spec.ts
│ │ ├── app.component.ts
│ │ └── app.routes.ts
│ │ └── app.module.ts
│ │ ├── app-routing.module.ts
│ ├── assets/
│ │ ├── icons/
│ │ │ ├── agregar-carrito.png
│ │ │ ├── agregar-carrito.svg
│ │ │ ├── carrito.png
│ │ │ ├── carrito.svg
│ │ │ ├── eliminar-carrito.png
│ │ │ ├── eliminar-carrito.svg
│ │ │ ├── login.png
│ │ │ ├── login.svg
│ │ │ ├── logout.png
│ │ │ ├── logout.svg
│ │ │ ├── lupa.png
│ │ │ ├── lupa.svg
│ │ │ ├── menu.png
│ │ │ └── perfil.png
│ │ │ └── puntos.svg
│ │ │ └── star-empty.svg
│ │ │ └── star-full.svg
│ │ │ └── star-half.svg
│ │ ├── products/ # Vacía actualmente
│ │ ├── footer-logo.png
│ │ └── logo-negro.png
│ │ └── logo-negro.png
│ │ └── logo-recortado.png
│ ├── index.html
│ ├── main.ts
│ └── styles.scss
├── .env
├── .gitignore
├── angular.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json
└── proxy.conf.json
