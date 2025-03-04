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

### ⚙️ Configuración y Preferencias
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

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- npm 9+
- Navegador moderno con soporte para ES2020+

### Instalación

1. Clona el repositorio:
\`\`\`bash
git clone https://github.com/tu-usuario/nifya.git
\`\`\`

2. Instala las dependencias:
\`\`\`bash
cd nifya
npm install
\`\`\`

3. Configura las variables de entorno:
Crea un archivo \`.env\` en la raíz del proyecto:
\`\`\`env
VITE_AUTH_URL=https://authentication-service.example.com
VITE_BACKEND_URL=https://backend.example.com
\`\`\`

4. Inicia el servidor de desarrollo:
\`\`\`bash
npm run dev
\`\`\`

## 📦 Scripts Disponibles

- \`npm run dev\` - Inicia el servidor de desarrollo
- \`npm run build\` - Construye la aplicación para producción
- \`npm run preview\` - Previsualiza la versión de producción
- \`npm run lint\` - Ejecuta el linter

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

## 🔧 Configuración Avanzada

### Endpoints de la API
La aplicación se comunica con dos servicios principales:
- Servicio de Autenticación: \`VITE_AUTH_URL\`
- Servicio Backend: \`VITE_BACKEND_URL\`

### Rutas Protegidas
Las siguientes rutas requieren autenticación:
- \`/dashboard\`
- \`/subscriptions\`
- \`/settings\`

### Manejo de Sesión
- Los tokens JWT se almacenan en localStorage
- Refresh automático de tokens
- Cierre de sesión en caso de token inválido
- Persistencia de preferencias de usuario

## 📈 Monitorización y Logs

### Logs del Cliente
- Grupos de logs organizados por funcionalidad
- Información detallada de errores
- Tracking de eventos de usuario
- Métricas de rendimiento

### Depuración
- Modo de desarrollo con logs detallados
- Herramientas de depuración de React
- Validación de tipos TypeScript
- ESLint para control de calidad

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

### Guía de Contribución
- Sigue el estilo de código existente
- Añade tests para nuevas funcionalidades
- Actualiza la documentación
- Verifica que el linter pase
- Asegúrate de que los tipos TypeScript sean correctos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo \`LICENSE\` para más detalles.

## 📞 Contacto

- Website: [nifya.com](https://nifya.com)
- Twitter: [@nifya](https://twitter.com/nifya)
- GitHub: [@nifya](https://github.com/nifya)

## 🙏 Agradecimientos

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

Desarrollado con ❤️ por el equipo de NIFYA

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Building for Production

For local production builds:
```bash
npm run build
```

For Netlify deployment:
```bash
npm run build:netlify
```

## Netlify Deployment Notes

If you encounter build issues on Netlify:

1. The project is configured to use the `build:netlify` script which bypasses certain checks
2. Environment variables are set in the `netlify.toml` file
3. All redirects are configured to point to index.html for SPA routing

## Common Issues

- **ESLint Errors**: The build may show linting errors but should still complete if using the Netlify build command
- **TypeScript Errors**: Make sure to address any TypeScript errors before deploying
- **Environment Variables**: If your app requires specific environment variables, add them to the `[build.environment]` section in `netlify.toml`

## Project Structure

- `src/components` - Reusable components
- `src/contexts` - React contexts for state management
- `src/lib` - Utility functions and API services
- `src/pages` - Page components