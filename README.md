---
### 2. README para el FRONTEND (`footer-front`)

Este README se centra en la experiencia de usuario, el diseño y Angular.

```markdown
# 👟 Footer - Tienda Online (Frontend)
---

## 🎨 Características y Diseño

- **Diseño Responsive:** Adaptado perfectamente a Móvil, Tablet y Escritorio gracias a **Tailwind CSS**.
- **Navegación Fluida:** SPA (Single Page Application) para una experiencia sin recargas.
- **Gestión de Estado:** Servicios reactivos con RxJS para carrito y autenticación.
- **Componentes Reutilizables:** Arquitectura modular (Cards, Modales, Tablas, Toasts).

---

## 🛠️ Stack Tecnológico

- **Framework:** Angular 17+
- **Estilos:** Tailwind CSS + SCSS
- **Conexión API:** HttpClient + Interceptores
- **Seguridad:** Guards (AuthGuard, AdminGuard) y JWT Handling
- **Despliegue:** Vercel

---

## ✨ Funcionalidades del Cliente

### 🛍️ Experiencia de Compra

- Catálogo de productos con filtros dinámicos (Categoría, Precio, Talla).
- Buscador en tiempo real.
- Detalle de producto con selección de variantes y galería de imágenes.
- Carrito de compras persistente.

### 👤 Área de Usuario

- Login y Registro (incluyendo Google Auth).
- Historial de pedidos con estados en tiempo real.
- Gestión de perfil y direcciones de envío.
- Posibilidad de cancelar pedidos pendientes.

### 🛡️ Área de Administración (Panel Dashboard)

- Gestión completa de productos (Crear, Editar, Eliminar).
- Visualización de usuarios registrados.
- Gráficos de ventas y estadísticas (Próximamente).

---

## 🚀 Instalación y Desarrollo

1.  **Clonar el repositorio:**

    ```bash
    git clone [https://github.com/Juanpedrogomezespinosa/footer-front.git](https://github.com/Juanpedrogomezespinosa/footer-front.git)
    cd footer-front
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

3.  **Configurar Entorno:**
    El proyecto ya incluye la configuración para desarrollo y producción en `src/environments/`.

    - **Local:** Apunta a `http://localhost:3000`
    - **Prod:** Apunta a `https://footer-back.onrender.com`

4.  **Ejecutar servidor de desarrollo:**
    ```bash
    ng serve
    ```
    Abre tu navegador en `http://localhost:4200/`.

---

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura modular escalable:

```bash
src/app/
├── auth/           # Módulos de Login y Registro
├── core/           # Servicios Singleton, Guards e Interceptores
├── shared/         # Componentes UI reutilizables (Navbar, Footer, Cards)
├── pages/          # Vistas principales (Home, About, FAQ)
├── products/       # Lógica de catálogo y detalle
├── cart/           # Gestión del carrito
├── checkout/       # Proceso de pago
├── admin/          # Panel de administración (Lazy Loaded)
└── profile/        # Área personal del usuario

✒️ Autor
Juan Pedro Gómez Espinosa - GitHub


---

### ¿Cómo ponerlos?

1.  Ve a tu proyecto **backend** en VS Code, abre el archivo `README.md`, borra todo lo que haya y pega el contenido del **Bloque 1**.
2.  Ve a tu proyecto **frontend**, abre `README.md`, borra todo y pega el contenido del **Bloque 2**.
3.  Haz un `git add`, `git commit` y `git push` en ambos.

¡Verás qué cambio dan tus repositorios en GitHub! Parecerán proyectos de una empresa real. 🚀
```
