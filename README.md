# 👟 Footer Frontend - Tienda Online SPA

![Angular](https://img.shields.io/badge/Angular-19.x-DD0031?style=for-the-badge&logo=angular&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![RxJS](https://img.shields.io/badge/RxJS-Reactive-B7178C?style=for-the-badge&logo=reactivex&logoColor=white) ![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Footer Frontend** es la interfaz de usuario moderna y reactiva para el ecosistema de comercio electrónico Footer. Desarrollada como una **SPA (Single Page Application)**, ofrece una experiencia de compra fluida, un panel de administración con métricas visuales y un diseño totalmente adaptativo.

🔗 **Demo Desplegada:** [https://tu-url-de-vercel.app](https://tu-url-de-vercel.app)
🔗 **Backend Repo:** [https://github.com/Juanpedrogomezespinosa/footer-back](https://github.com/Juanpedrogomezespinosa/footer-back)

---

## 🛠️ Stack Tecnológico

Basado en la última versión estable del framework:

- **Core:** Angular 19+ (Stand-alone Components)
- **Estilos:** Tailwind CSS 3 + PostCSS
- **Gestión de Estado & Async:** RxJS (Observables, Subjects)
- **Gráficos & Métricas:** Chart.js + ng2-charts
- **Seguridad:** JWT Decode + Angular Guards
- **UI Kit:** Angular CDK (Component Dev Kit)

---

## ✨ Funcionalidades Principales

### 🛍️ Experiencia de Usuario (Cliente)

- **Catálogo Interactivo:** Filtros dinámicos de productos, paginación y búsqueda en tiempo real.
- **Carrito Persistente:** Lógica reactiva que mantiene los productos seleccionados incluso al recargar.
- **Responsive Design:** Diseño "Mobile-First" optimizado para cualquier tamaño de pantalla.
- **Gestión de Perfil:** Edición de datos personales y visualización de historial de pedidos.

### 📊 Panel de Administración (Dashboard)

- **Visualización de Datos:** Gráficos interactivos de ventas y stock usando **Chart.js**.
- **Gestión de Inventario:** CRUD completo de productos con subida de imágenes.
- **Control de Usuarios:** Vista de clientes registrados y roles.

### 🔐 Arquitectura y Seguridad

- **Interceptors:** Manejo automático de tokens JWT en cada petición HTTP.
- **Guards:** Protección de rutas (`AuthGuard`, `AdminGuard`) para prevenir accesos no autorizados.
- **Proxy Config:** Configuración para evitar problemas de CORS durante el desarrollo local.

---

## 🚀 Instalación y Desarrollo Local

Sigue estos pasos para levantar la interfaz en tu máquina:

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
    El proyecto incluye archivos de entorno en `src/environments/`. Asegúrate de que `environment.ts` apunte a tu API local o remota.

    ```typescript
    // src/environments/environment.ts
    export const environment = {
      production: false,
      apiUrl: 'http://localhost:3000/api'
    };
    ```

4.  **Arrancar el servidor de desarrollo:**
    El proyecto usa una configuración de proxy para conectar con el backend localmente:

    ```bash
    npm start
    ```
    *(Este comando ejecuta `ng serve --proxy-config proxy.conf.json`)*.

    Accede a la aplicación en: `http://localhost:4200/`

---

## 📂 Estructura del Proyecto

Arquitectura modular basada en características (Feature-based):

```bash
src/app/
├── core/           # Servicios Singleton, Interceptores, Guards
├── shared/         # Componentes UI reutilizables (Botones, Inputs, Cards)
├── auth/           # Módulos de Login, Registro y Recuperación
├── features/       # Vistas principales
│   ├── products/   # Catálogo y detalle
│   ├── cart/       # Carrito y Checkout
│   └── dashboard/  # Panel Admin con Gráficos
├── layouts/        # Estructuras base (Navbar, Footer, Sidebar)
└── assets/         # Imágenes y recursos estáticos



☁️ Despliegue
El frontend está optimizado para despliegue continuo (CI/CD):

Plataforma: Vercel / Netlify

Build Command: ng build --configuration production

Output Directory: dist/footer-frontend/browser

✒️ Autor
Juan Pedro Gómez Espinosa


Hecho con ❤️, Angular 19 y mucho café ☕
