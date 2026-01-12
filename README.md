# 🌴 Mi Viaje a San Andrés

Aplicación web móvil para planificar y gestionar tu viaje a San Andrés, Colombia. Diseñada con una estética tropical moderna y optimizada para dispositivos móviles.

![San Andrés](https://img.shields.io/badge/Destino-San%20Andr%C3%A9s-00a0e6)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## ✨ Características

- 📅 **Itinerario**: Planifica tus actividades día a día con horarios y ubicaciones
- 💰 **Presupuesto**: Controla tus gastos por categorías con visualización de progreso
- 📍 **Lugares**: Lista de lugares imperdibles con sistema de check de visitados
- 🎒 **Equipaje**: Checklist completo con sugerencias de items por categoría
- 🎨 **Diseño Tropical**: Interfaz hermosa con colores del Caribe
- 📱 **Móvil-First**: Optimizado para verse como una app móvil nativa
- 🌐 **PWA**: Instálala en tu celular como una app
- ☁️ **En la nube**: Tus datos sincronizados con Supabase

## 🚀 Instalación

### Requisitos previos

- Node.js 18 o superior
- npm o yarn
- Cuenta en Supabase (gratis)
- Cuenta en Vercel (gratis)
- Cuenta en GitHub (gratis)

### 1. Clonar el repositorio

\`\`\`bash
git clone https://github.com/tu-usuario/viaje-san-andres.git
cd viaje-san-andres
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install
# o
yarn install
\`\`\`

### 3. Configurar Supabase

#### a) Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se complete la configuración

#### b) Crear las tablas

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Copia todo el contenido del archivo `supabase-setup.sql`
3. Pega el código en el editor SQL
4. Ejecuta el script (botón "Run")

#### c) Obtener las credenciales

1. Ve a **Settings** > **API**
2. Copia:
   - **Project URL** (URL del proyecto)
   - **anon public** (clave pública)

### 4. Configurar variables de entorno

\`\`\`bash
# Copia el archivo de ejemplo
cp .env.local.example .env.local
\`\`\`

Edita `.env.local` y agrega tus credenciales de Supabase:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica-aqui
\`\`\`

### 5. Ejecutar en desarrollo

\`\`\`bash
npm run dev
# o
yarn dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📦 Despliegue en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. **Sube tu código a GitHub**:
   \`\`\`bash
   git init
   git add .
   git commit -m "Primer commit: App de viaje a San Andrés"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/viaje-san-andres.git
   git push -u origin main
   \`\`\`

2. **Conecta con Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con tu cuenta de GitHub
   - Click en "New Project"
   - Importa tu repositorio `viaje-san-andres`
   - Vercel detectará automáticamente que es Next.js

3. **Configura las variables de entorno**:
   - En la página de configuración del proyecto
   - Ve a "Environment Variables"
   - Agrega:
     - `NEXT_PUBLIC_SUPABASE_URL`: tu URL de Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: tu clave pública

4. **Despliega**:
   - Click en "Deploy"
   - Espera a que termine (2-3 minutos)
   - ¡Tu app estará en vivo! 🎉

### Opción 2: Desde la terminal

\`\`\`bash
# Instala Vercel CLI
npm i -g vercel

# Inicia sesión
vercel login

# Despliega
vercel
\`\`\`

Sigue las instrucciones y agrega las variables de entorno cuando te las pida.

## 📱 Instalar como PWA

### En Android (Chrome):

1. Abre la app en Chrome
2. Toca el menú (⋮)
3. Selecciona "Agregar a pantalla de inicio"
4. ¡Listo! Ahora tienes un ícono en tu celular

### En iOS (Safari):

1. Abre la app en Safari
2. Toca el botón de compartir (□↑)
3. Selecciona "Agregar a pantalla de inicio"
4. ¡Listo!

## 🎨 Personalización

### Cambiar colores

Edita `tailwind.config.js`:

\`\`\`javascript
colors: {
  caribbean: {
    500: '#00a0e6', // Color principal del Caribe
    // ... más tonos
  },
  coral: {
    500: '#ff6439', // Color coral
    // ... más tonos
  }
}
\`\`\`

### Cambiar fecha del viaje

Edita `app/page.tsx`, línea del contador:

\`\`\`javascript
new Date('2025-07-01') // Cambia esta fecha
\`\`\`

### Cambiar presupuesto total

Edita `app/presupuesto/page.tsx`:

\`\`\`javascript
const [presupuestoTotal] = useState(3000000) // Cambia el monto
\`\`\`

## 🛠️ Estructura del proyecto

\`\`\`
viaje-san-andres/
├── app/                    # Páginas de Next.js
│   ├── page.tsx           # Página principal
│   ├── itinerario/        # Página de itinerario
│   ├── presupuesto/       # Página de presupuesto
│   ├── lugares/           # Página de lugares
│   ├── equipaje/          # Página de equipaje
│   └── globals.css        # Estilos globales
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades
│   └── supabase.ts       # Cliente de Supabase
├── public/               # Archivos estáticos
│   └── manifest.json     # Configuración PWA
├── supabase-setup.sql    # Script de base de datos
└── package.json          # Dependencias
\`\`\`

## 🔧 Tecnologías

- **Framework**: [Next.js 14](https://nextjs.org/) (React)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Base de datos**: [Supabase](https://supabase.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Despliegue**: [Vercel](https://vercel.com/)
- **Lenguaje**: TypeScript

## 📝 Scripts disponibles

\`\`\`bash
npm run dev      # Ejecutar en desarrollo
npm run build    # Construir para producción
npm start        # Ejecutar en producción
npm run lint     # Revisar código
\`\`\`

## 🐛 Solución de problemas

### Error: "Failed to fetch"

- Verifica que las variables de entorno estén correctamente configuradas
- Revisa que las tablas en Supabase estén creadas
- Confirma que las políticas RLS estén habilitadas

### Los datos no se guardan

- Revisa la consola del navegador (F12)
- Verifica la conexión a internet
- Confirma que el SQL de Supabase se ejecutó correctamente

### La app no se ve bien en móvil

- Limpia el caché del navegador
- Verifica que el viewport esté configurado
- Prueba en modo incógnito

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:

1. Haz fork del proyecto
2. Crea una rama para tu función (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: alguna característica'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la [Licencia MIT](LICENSE).

## ✨ Créditos

Desarrollado con ❤️ para hacer tu viaje a San Andrés inolvidable.

## 📞 Soporte

Si tienes preguntas o problemas:

- Abre un [Issue](https://github.com/tu-usuario/viaje-san-andres/issues)
- Envía un correo a: tu-email@ejemplo.com

---

**¡Disfruta tu viaje a San Andrés! 🌴☀️🏖️**
