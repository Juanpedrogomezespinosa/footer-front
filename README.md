footer-front/
├── angular/ # Otra carpeta que no es parte del build (posiblemente error o carpeta auxiliar)
├── node_modules/ # Generada por npm
├── public/ # No utilizada por Angular por defecto
├── src/
│ ├── app/
│ │ ├── admin/
│ │ │ └── admin.module.ts
│ │ ├── auth/
│ │ │ └── auth.module.ts
│ │ ├── cart/
│ │ │ └── cart.module.ts
│ │ ├── checkout/
│ │ │ └── checkout.module.ts
│ │ ├── core/
│ │ │ ├── guards/
│ │ │ ├── interceptors/
│ │ │ ├── services/
│ │ │ │ ├── product.service.spec.ts
│ │ │ │ └── product.service.ts
│ │ │ └── core.module.ts
│ │ ├── orders/
│ │ │ └── orders.module.ts
│ │ ├── products/
│ │ │ ├── components/
│ │ │ │ └── product-list/
│ │ │ │ └── products-list.component.html
│ │ │ │ └── products-list.component.scss
│ │ │ │ └── products-list.component.ts
│ │ │ ├── products.module.ts
│ │ │ └── products.routes.ts
│ │ ├── shared/
│ │ │ ├── components/
│ │ │ │ ├── footer/
│ │ │ │ │ ├── footer.component.html
│ │ │ │ │ ├── footer.component.scss
│ │ │ │ │ ├── footer.component.spec.ts
│ │ │ │ │ └── footer.component.ts
│ │ │ │ ├── navbar/
│ │ │ │ │ ├── navbar.component.html
│ │ │ │ │ ├── navbar.component.scss
│ │ │ │ │ ├── navbar.component.spec.ts
│ │ │ │ │ └── navbar.component.ts
│ │ │ │ └── product-card/
│ │ │ │ ├── product-card.component.html
│ │ │ │ ├── product-card.component.scss
│ │ │ │ ├── product-card.component.spec.ts
│ │ │ │ └── product-card.component.ts
│ │ │ ├── pipes/
│ │ │ └── shared.module.ts
│ │ ├── app.component.html
│ │ ├── app.component.scss
│ │ ├── app.component.spec.ts
│ │ ├── app.component.ts
│ │ └── app.routes.ts
│ ├── assets/
│ │ ├── icons/
│ │ │ ├── agregar-carrito.png
│ │ │ ├── carrito.png
│ │ │ ├── eliminar-carrito.png
│ │ │ ├── login.png
│ │ │ ├── logout.png
│ │ │ ├── lupa.png
│ │ │ ├── menu.png
│ │ │ └── perfil.png
│ │ │ └── star-empty.svg
│ │ │ └── star-full.svg
│ │ │ └── star-half.svg
│ │ ├── products/ # Vacía actualmente
│ │ ├── logo-blanco.png
│ │ └── logo-negro.png
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

Tareas por orden:

| Nº  | Tarea                                                                             | Estado             |
| --- | --------------------------------------------------------------------------------- | ------------------ |
| 1   | Corregir `footer.component.ts` para que sea `standalone`                          | 🔧 Vamos a hacerlo |
| 2   | Corregir los imports innecesarios no usados en templates                          | 🔧 Vamos a hacerlo |
| 3   | Crear o corregir el sistema de rutas principal (dado que eliminaste `.routes.ts`) | 🔧 Vamos a hacerlo |
| 4   | Conectar correctamente `main.ts` con las rutas                                    | 🔧 Vamos a hacerlo |
| 5   | Hacer fetch de productos desde API en vez de usar array mock                      | 🔜 Próximo paso    |
| 6   | Crear endpoints según necesidades                                                 | 🔜 Próximo paso    |
