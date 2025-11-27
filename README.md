# AgroSync - Sistema de Gestión de Acopio de Cacao

AgroSync es una aplicación web moderna diseñada para optimizar el proceso de acopio, control de calidad y almacenamiento de Cacao. Construida con React y Node.js, ofrece una solución integral para cooperativas y centros de acopio.

##  Características Principales

###  Gestión de Agricultores
- Registro completo de productores.
- Historial de entregas por agricultor.
- Edición y eliminación de registros.

###  Control de Entregas
- Registro de nuevas entregas de Cacao.
- Asignación automática a terrenos y productores.
- Generación de recibos digitales.

###  Control de Calidad
- Módulo de evaluación de lotes.
- Registro de humedad, impurezas y granos dañados.
- Aprobación o rechazo de lotes en tiempo real.

###  Almacenamiento e Inventario
- Visualización de stock en tiempo real.
- Gestión de ubicaciones en bodega con asignación específica (Rack/Estante).
- Control de capacidad por bodega.

###  Gestión de Pagos
- Registro de pagos asociados a entregas.
- Cálculo automático de montos basado en peso y calidad.
- Historial de transacciones con trazabilidad completa.

###  Reportes y Análisis
- Dashboard interactivo con KPIs clave.
- Gráficos de producción mensual.
- Historial detallado de operaciones.

##  Tecnologías Utilizadas

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts.
- **Backend:** Node.js, Express.
- **Base de Datos:** SQLite (Normalizada a 3NF).
- **Estado:** Context API (Gestión de estado global).

##  Esquema de Base de Datos (3NF)

El sistema utiliza una base de datos SQLite altamente estructurada y normalizada:

- **farmers**: Información personal y de contacto de los agricultores.
- **lands**: Terrenos de cultivo, vinculados a agricultores mediante `farmerId`.
- **warehouses**: Definición de bodegas, tipos y capacidades máximas.
- **deliveries**: Registro central de operaciones.
    - Vinculada a `farmers` (`farmerId`).
    - Vinculada a `warehouses` (`warehouseId`) para control de inventario.
    - Incluye `location_detail` para ubicación física exacta.
- **payments**: Registro financiero.
    - Vinculada estrictamente a `deliveries` (`deliveryId`).
    - El beneficiario (agricultor) se deriva transitivamente de la entrega, eliminando redundancias.
- **prices**: Configuración de precios base según calidad del grano.

## 📡 API Endpoints Principales

### Agricultores
- `GET /api/farmers` - Listar todos los agricultores.
- `POST /api/farmers` - Registrar nuevo agricultor.
- `PUT /api/farmers/:id` - Actualizar datos.
- `DELETE /api/farmers/:id` - Eliminar registro.

### Entregas
- `GET /api/deliveries` - Historial completo (con JOINs a Farmers y Warehouses).
- `POST /api/deliveries` - Registrar recepción.
- `PUT /api/deliveries/:id` - Actualizar estado, calidad o almacenamiento.
- `DELETE /api/deliveries/:id` - Anular entrega.

### Pagos
- `GET /api/payments` - Historial de pagos (con nombre de agricultor derivado).
- `POST /api/payments` - Registrar nuevo pago.
- `DELETE /api/payments/:id` - Revertir pago.

### Bodegas
- `GET /api/warehouses` - Estado actual de bodegas.
- `POST /api/warehouses` - Crear nueva bodega.
- `PUT /api/warehouses/:id` - Modificar capacidad/nombre.
- `DELETE /api/warehouses/:id` - Eliminar bodega.

##  Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

1.  **Clonar el repositorio** (si aplica) o descargar los archivos.

2.  **Instalar dependencias:**
    Abre una terminal en la carpeta del proyecto y ejecuta:
    ```bash
    npm install
    ```

3.  **Iniciar la aplicación:**
    Para correr tanto el Frontend como el Backend simultáneamente:
    ```bash
    npm run dev:full
    ```

4.  **Acceder:**
    Abre tu navegador en `http://localhost:5173`.

##  Estructura del Proyecto

- `/src`: Código fuente del Frontend (React).
    - `/components`: Componentes reutilizables (Layouts, UI).
    - `/pages`: Vistas principales (Dashboard, Agricultores, Pagos, etc.).
    - `/context`: Lógica de estado global (Datos, Notificaciones).
- `/server`: Código del Backend (API y Base de Datos).

##  Principios UX/UI

- **Diseño Limpio:** Interfaz minimalista enfocada en la usabilidad.
- **Feedback Visual:** Notificaciones (Toasts) para todas las acciones importantes.
- **Consistencia:** Paleta de colores y tipografía unificadas.
- **Responsividad:** Funciona perfectamente en móviles y escritorio.

---
Desarrollado para la excelencia en la gestión agrícola.
