# Dashboard Data Science - Frontend

Este es el frontend para el Dashboard de Ciencia de Datos, construido con **Next.js** y **React**. Visualiza métricas de variables, completitud de datos y estadísticas generales del proyecto "Centenarios".

## Tecnologías Principales

-   **Next.js 14+:** Framework de React para producción (App Router).
-   **React Query (TanStack Query):** Gestión de estado asíncrono y caché de datos.
-   **Tailwind CSS:** Framework de utilidades para estilos.
-   **Recharts:** Librería de gráficos para visualización de datos.
-   **Lucide React:** Iconos vectoriales.
-   **Shadcn UI:** Componentes de interfaz reutilizables.

## Estructura del Proyecto

```
data-science-dashboard/
├── app/
│   ├── page.tsx             # Página principal (Dashboard) with tabs logic
│   ├── layout.tsx           # Layout principal de la aplicación
│   └── globals.css          # Estilos globales y configuración de Tailwind
├── components/
│   ├── ui/                  # Componentes base (Botones, Inputs, etc.)
│   ├── variable-inspector.tsx   # Inspector de variables (Lista/Detalle)
│   ├── completeness-bar-chart.tsx # Gráfica de completitud
│   ├── stats-cards.tsx      # Tarjetas de estadísticas globales
│   └── ...                  # Otros componentes de visualización
├── lib/
│   ├── api.ts               # Cliente API y definiciones de tipos (Interfaces)
│   ├── utils.ts             # Utilidades generales (cn, etc.)
│   └── dataframe-data.ts    # Datos de muestra/mock
└── public/                  # Archivos estáticos
```

## Configuración y Ejecución

### 1. Instalar dependencias

Asegúrate de estar en la carpeta del proyecto y tener Node.js instalado.

```bash
npm install
# o si usas pnpm
pnpm install
```

### 2. Ejecutar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

> **Nota:** Para que el dashboard funcione correctamente en "Modo API", el backend (api_python) debe estar ejecutándose en el puerto 8000.

## Características Principales

-   **Modo Híbrido:** Soporta visualización de datos estáticos (cliente) o dinámicos desde la API.
-   **Scroll Infinito:** Implementado en el listado de variables y gráficas para manejar grandes volúmenes de datos.
-   **Filtrado en Servidor:** Las búsquedas y filtros se procesan en el backend para optimizar el rendimiento.
-   **Diseño Responsivo:** Adaptado para diferentes tamaños de pantalla.
