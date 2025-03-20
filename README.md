# NIFYA - Notificaciones Inteligentes con IA

![NIFYA](https://ik.imagekit.io/appraisily/NYFIA/logo.png)

NIFYA es una plataforma moderna que utiliza inteligencia artificial para proporcionar notificaciones personalizadas sobre información relevante del BOE, mercado inmobiliario y más.

## 🌟 Características Principales

### 📰 Vigilancia del BOE
- Monitorización automática de publicaciones oficiales
- Filtrado inteligente basado en tus intereses
- Notificaciones inmediatas sobre subvenciones, oposiciones y oportunidades
- Múltiples prompts por suscripción (hasta 3)
- Frecuencia de notificaciones configurable (inmediata o diaria)

### 🏠 Alertas Inmobiliarias
- Seguimiento de Idealista y Fotocasa
- Filtros personalizados por precio, ubicación y características
- Alertas en tiempo real sobre nuevas propiedades
- Soporte para múltiples búsquedas simultáneas
- Notificaciones personalizables por frecuencia

### 🧠 IA Adaptativa
- Sistema de aprendizaje que mejora con el uso
- Refinamiento automático de criterios de búsqueda
- Reducción de falsos positivos
- Personalización por usuario
- Análisis de patrones de interés

## 💡 Funcionalidades Detalladas

### 🔐 Autenticación y Seguridad
- Sistema de registro y login
- Protección de rutas para usuarios autenticados
- Gestión de sesiones
- Cierre de sesión en todos los dispositivos
- Cambio de contraseña
- Integración con Google OAuth

### 📊 Panel de Control
- Vista general de todas las suscripciones activas
- Estadísticas de alertas recibidas
- Actividad reciente
- Acceso rápido a funciones principales
- Métricas de rendimiento

### ✨ Gestión de Suscripciones
- Catálogo de tipos de suscripción
- Creación de suscripciones personalizadas
- Hasta 3 prompts por suscripción
- Activación/desactivación de suscripciones
- Eliminación de suscripciones
- Plantillas predefinidas

### 🔧 Configuración y Preferencias
- Tema claro/oscuro
- Configuración de notificaciones por email
- Selección de idioma (Español, English, Català)
- Gestión de email de notificaciones
- Preferencias de seguridad
- Personalización del perfil

### 📱 Diseño Responsivo
- Interfaz adaptativa para todos los dispositivos
- Navegación optimizada para móvil
- Diseño moderno y minimalista
- Transiciones y animaciones suaves
- Feedback visual interactivo

## 🛠️ Stack Tecnológico

### Frontend
- React 18 con TypeScript
- Vite para desarrollo y construcción
- React Router para navegación
- TailwindCSS para estilos
- Lucide Icons para iconografía

### Diseño y UX
- Sistema de diseño personalizado
- Tema claro/oscuro
- Componentes reutilizables
- Diseño responsive
- Animaciones y transiciones

### Seguridad
- Autenticación JWT
- Refresh tokens
- Protección de rutas
- Validación de formularios
- Sanitización de datos

### API y Backend
- API RESTful
- Endpoints versionados
- Manejo de errores estandarizado
- Rate limiting
- Caché de respuestas

## 📂 Estructura del Proyecto

```
frontend/
├── src/                        # Código fuente
│   ├── components/             # Componentes reutilizables
│   │   ├── ui/                 # Componentes de interfaz base
│   │   ├── notifications/      # Componentes relacionados con notificaciones
│   │   └── settings/           # Componentes de configuración
│   ├── pages/                  # Páginas de la aplicación
│   │   ├── Auth.tsx            # Página de autenticación
│   │   ├── Dashboard.tsx       # Panel principal
│   │   ├── Landing.tsx         # Página de inicio (no autenticada)
│   │   ├── Notifications.tsx   # Página de notificaciones
│   │   ├── Settings.tsx        # Página de configuración
│   │   ├── Subscriptions.tsx   # Página de suscripciones
│   │   └── ...                 # Otras páginas
│   ├── contexts/               # Contextos de React
│   ├── lib/                    # Utilidades y funciones auxiliares
│   ├── App.tsx                 # Componente principal y enrutamiento
│   ├── main.tsx                # Punto de entrada de la aplicación
│   └── index.css               # Estilos globales
├── public/                     # Archivos estáticos
├── dist/                       # Directorio de compilación (generado)
├── .env                        # Variables de entorno
├── index.html                  # HTML principal
├── package.json                # Dependencias y scripts
├── tsconfig.json               # Configuración de TypeScript
└── vite.config.ts              # Configuración de Vite
```

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- npm 9+
- Navegador moderno con soporte para ES2020+

### Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/nifya.git
```

2. Instala las dependencias:
```bash
cd nifya
npm install
```

3. Configura las variables de entorno:
Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_AUTH_URL=https://authentication-service.example.com
VITE_BACKEND_URL=https://backend.example.com
VITE_SUBSCRIPTION_WORKER=https://subscription-worker.example.com
VITE_ENV=development
VITE_ENABLE_LOGGING=true
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción
- `npm run lint` - Ejecuta el linter

## 🔄 Integración con Microservicios

La aplicación frontend se integra con varios microservicios del ecosistema NIFYA:

### Servicio de Autenticación
- Endpoint base: `VITE_AUTH_URL`
- Gestiona:
  - Registro de usuarios
  - Inicio de sesión
  - Autenticación OAuth con Google
  - Gestión de tokens
  - Recuperación de contraseñas

### Backend API (Orchestration Service)
- Endpoint base: `VITE_BACKEND_URL`
- Proporciona:
  - Gestión de suscripciones
  - Consulta de notificaciones
  - Configuración de perfil de usuario
  - Plantillas de suscripción
  - Estado de procesamiento

### Subscription Worker
- Endpoint base: `VITE_SUBSCRIPTION_WORKER`
- Se utiliza para:
  - Verificación del estado de las suscripciones
  - Diagnósticos de procesamiento

## 🔒 Autenticación y Seguridad

### Flujo de Autenticación
1. El usuario se autentica a través del servicio de autenticación
2. Se recibe un JWT token y se almacena en localStorage
3. Cada solicitud a la API incluye el token en la cabecera de autorización
4. Los tokens caducados se refrescan automáticamente
5. Las rutas protegidas redirigen a los usuarios no autenticados

### Cabeceras de API
```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'X-User-ID': userId,
  'Content-Type': 'application/json'
};
```

### Protección de Rutas
El componente `ProtectedRoute` asegura que solo los usuarios autenticados puedan acceder a rutas como:
- `/dashboard`
- `/subscriptions`
- `/notifications`
- `/settings`

## 🎨 Personalización

### Temas
El sistema de temas está implementado usando variables CSS y Tailwind:
- Modo claro/oscuro automático
- Colores personalizables
- Bordes y sombras consistentes
- Espaciado y tipografía unificados

### Componentes
Los componentes principales incluyen:
- Layout de dashboard
- Tarjetas de suscripción
- Formularios interactivos
- Modales y diálogos
- Componentes de navegación

## 📱 Responsive Design

La aplicación está completamente optimizada para diferentes tamaños de pantalla:
- Mobile first
- Breakpoints personalizados
- Layouts adaptativos
- Navegación responsiva
- Optimización de rendimiento

## 🚀 Despliegue

### Preparación para Producción

1. Actualiza las variables de entorno para producción en `.env.production`:
```
VITE_AUTH_URL=https://authentication-service-production.example.com
VITE_BACKEND_URL=https://backend-production.example.com
VITE_SUBSCRIPTION_WORKER=https://subscription-worker-production.example.com
VITE_ENV=production
VITE_ENABLE_LOGGING=false
```

2. Construye la aplicación:
```bash
npm run build
```

3. Previsualiza la versión de producción:
```bash
npm run preview
```

### Despliegue en Netlify

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno en la configuración del sitio
3. Especifica el comando de construcción como `npm run build`
4. Establece el directorio de publicación como `dist`
5. Configura redirecciones para SPA:

Crea un archivo `_redirects` o `netlify.toml`:
```
/*  /index.html  200
```

### Optimizaciones de Producción

- Code-splitting para carga más rápida
- Assets comprimidos y minificados
- Caché de respuestas HTTP
- Lazy-loading de componentes
- Precarga de rutas frecuentes

## 📊 Analítica y Monitorización

### Logging del Cliente
- Entorno de desarrollo: logs detallados en consola
- Entorno de producción: logs críticos enviados al backend
- Agrupación de errores para diagnóstico
- Captura de excepciones no controladas

### Monitorización de Rendimiento
- Métricas de tiempo de carga
- Análisis de rendering
- Seguimiento de interacciones de usuario
- Diagnóstico de problemas de red

## 🐞 Depuración y Resolución de Problemas

### Problemas Comunes

#### Problemas de Autenticación
- Verifica que las URLs de los servicios sean correctas
- Comprueba el almacenamiento local para tokens
- Asegúrate de que el token no haya expirado
- Revisa los logs del cliente para errores HTTP 401/403

#### Problemas de Carga de Datos
- Verifica la conexión de red
- Asegúrate de que las APIs estén disponibles
- Revisa las cabeceras de las solicitudes
- Comprueba si hay limitaciones de rate-limiting

#### Problemas de UI/UX
- Prueba en diferentes navegadores
- Verifica la compatibilidad con dispositivos móviles
- Revisa las versiones de las dependencias
- Comprueba si hay conflictos de CSS

## 🧪 Testing

### Testing Manual
1. Verifica el flujo de autenticación
2. Prueba la creación, edición y eliminación de suscripciones
3. Comprueba la visualización y gestión de notificaciones
4. Verifica la navegación y cambios de ruta
5. Prueba con diferentes tamaños de pantalla

### Testing Automatizado
```bash
# Ejecutar tests unitarios
npm run test:unit

# Ejecutar tests de integración
npm run test:integration

# Ejecutar todos los tests
npm run test
```

## 🔄 Workflow de Desarrollo

### Estándares de Código
- Utiliza ESLint para el linting
- Sigue las prácticas de TypeScript
- Mantén los componentes pequeños y reutilizables
- Documenta las funciones y componentes complejos
- Utiliza nombres descriptivos para variables y funciones

### Proceso de Contribución
1. Crea una rama para tu funcionalidad (`feature/nueva-funcionalidad`)
2. Desarrolla y prueba tu código
3. Asegúrate de que pasa los linters y tests
4. Crea un Pull Request con una descripción detallada
5. Solicita revisión de código
6. Implementa los cambios solicitados
7. Fusiona con la rama principal tras la aprobación

## 📋 Versiones y Actualizaciones

### v1.0.0 (Marzo 2025)
- Lanzamiento inicial
- Funcionalidades básicas de notificaciones y suscripciones
- Integración con servicios de backend
- Soporte para autenticación JWT

### v0.9.0 (Febrero 2025)
- Versión beta con funcionalidades principales
- Interfaz de usuario mejorada
- Soporte para múltiples idiomas
- Optimizaciones de rendimiento

## 📧 Contacto y Soporte

Para preguntas, sugerencias o problemas:
- Email: soporte@nifya.com
- GitHub: [Reportar un problema](https://github.com/tu-usuario/nifya/issues)

## 🤝 Agradecimientos

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

Desarrollado con ❤️ por el equipo de NIFYA

## 🧰 Development

### Standard Development Mode
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Hybrid Development Mode
The hybrid development mode allows you to run the frontend locally while connecting to production backend services. This is useful for testing frontend changes against real data.

```bash
# Run frontend with connections to production services
npm run hybrid
# Or for WSL environments:
npm run hybrid:wsl
```

### Environment Configuration
The application supports different environment configurations:

1. **Local Development** (.env.local)
   - Local frontend with local backend services
   - Full debugging enabled
   - All services running on localhost

2. **Hybrid Development** (created by hybrid-dev.sh)
   - Local frontend with production backend services
   - Enhanced debugging and logging
   - Uses proxy configuration for API requests

3. **Production** (.env.production)
   - Production build for deployment
   - Optimized for performance
   - Minimal logging and debugging

### Debugging Tools

The application includes built-in debugging tools accessible at `/debug` in development mode. This provides:

- API connectivity testing
- Environment variable inspection
- Data comparison between standard and enhanced hooks
- System diagnostics
- Network request monitoring

To access the debug page:
1. Start the app in development mode (`npm run dev` or `npm run hybrid`)
2. Navigate to `http://localhost:5173/debug` (or your configured port)

## 🏗️ Building for Production

### Local Production Build
```bash
npm run build
```

### Netlify Deployment Build
```bash
npm run build:netlify
```

### Local Preview of Production Build
```bash
npm run preview
```

## 🚀 Netlify Deployment Notes

If you encounter build issues on Netlify:

1. The project is configured to use the `build:netlify` script which bypasses certain checks
2. Environment variables are set in the `netlify.toml` file and Netlify UI
3. All redirects are configured to point to index.html for SPA routing
4. Set `NODE_ENV=production` for the optimal production build

## 🔍 Troubleshooting

### Common Build Issues

- **JSX Transformation Errors**: Ensure `NODE_ENV=development` is set for development builds
- **ESLint Errors**: The build may show linting errors but should still complete if using the Netlify build command
- **TypeScript Errors**: Make sure to address any TypeScript errors before deploying
- **Environment Variables**: If your app requires specific environment variables, add them to the `[build.environment]` section in `netlify.toml`

### API Connection Issues

- **CORS Errors**: Check that the API endpoints support cross-origin requests from your frontend
- **Authentication Failures**: Verify that tokens are being correctly stored and sent with requests
- **Network Errors**: Use the debug page to test API connectivity and inspect request/response details

### Development Environment Setup

1. For local backend development:
   ```
   VITE_AUTH_URL=http://localhost:4000
   VITE_BACKEND_URL=http://localhost:3000
   VITE_SUBSCRIPTION_WORKER=http://localhost:5000
   NODE_ENV=development
   ```

2. For production backend with local frontend:
   ```
   VITE_AUTH_URL=https://authentication-service-415554190254.us-central1.run.app
   VITE_BACKEND_URL=https://backend-415554190254.us-central1.run.app
   VITE_USE_NETLIFY_REDIRECTS=false
   NODE_ENV=development
   VITE_ENV=development
   ```

## 📁 Project Structure

- `src/components` - Reusable UI components
- `src/components/ui` - Base UI components (buttons, cards, etc.)
- `src/contexts` - React contexts for state management
- `src/hooks` - Custom React hooks for shared logic
- `src/lib` - Utility functions and API services
- `src/pages` - Page components and routes
- `src/services` - Service layer for API interactions