# 🚀 Guía Rápida de Inicio

## Pasos mínimos para tener tu app funcionando

### 1️⃣ Configurar Supabase (5 minutos)

1. **Crear cuenta**: Ve a [supabase.com](https://supabase.com) y regístrate
2. **Nuevo proyecto**: Click en "New Project"
   - Nombre: "viaje-san-andres"
   - Password: elige una contraseña segura
   - Region: South America (São Paulo) - la más cercana
   - Click "Create new project"
3. **Esperar**: El proyecto tarda 1-2 minutos en crearse

### 2️⃣ Crear las tablas (2 minutos)

1. En tu proyecto de Supabase, ve al menú lateral → **SQL Editor**
2. Click en "New query"
3. Abre el archivo `supabase-setup.sql` de este proyecto
4. Copia TODO el contenido y pégalo en el editor
5. Click en el botón verde **"RUN"** (esquina inferior derecha)
6. Deberías ver el mensaje "Success. No rows returned"

### 3️⃣ Obtener credenciales (1 minuto)

1. Ve al menú lateral → **Settings** (⚙️)
2. Click en **API**
3. Copia estos dos valores:
   - **Project URL**: algo como `https://abcdefgh.supabase.co`
   - **anon public**: una clave larga que empieza con `eyJ...`

### 4️⃣ Configurar el proyecto local (3 minutos)

\`\`\`bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de variables de entorno
cp .env.local.example .env.local

# 3. Editar .env.local con tus credenciales
# Abre .env.local en tu editor y pega:
# NEXT_PUBLIC_SUPABASE_URL=tu-url-aqui
# NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-aqui

# 4. Ejecutar
npm run dev
\`\`\`

¡Listo! Abre http://localhost:3000 en tu navegador 🎉

### 5️⃣ Subir a GitHub (2 minutos)

\`\`\`bash
# Si aún no has inicializado git:
git init
git add .
git commit -m "App de viaje a San Andrés"

# Crea un repositorio en GitHub (github.com/new)
# Luego conecta tu código:
git remote add origin https://github.com/TU-USUARIO/viaje-san-andres.git
git branch -M main
git push -u origin main
\`\`\`

### 6️⃣ Desplegar en Vercel (3 minutos)

1. Ve a [vercel.com](https://vercel.com)
2. Click "Sign Up" → Continúa con GitHub
3. Click "New Project"
4. Busca tu repositorio `viaje-san-andres` → Import
5. En "Environment Variables" agrega:
   - Name: `NEXT_PUBLIC_SUPABASE_URL` → Value: tu URL de Supabase
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Value: tu clave de Supabase
6. Click "Deploy"
7. Espera 2-3 minutos...
8. **¡Tu app está en vivo!** 🚀

Vercel te dará una URL como: `https://viaje-san-andres.vercel.app`

---

## ✅ Checklist de verificación

- [ ] Proyecto creado en Supabase
- [ ] Tablas creadas (ejecutaste el SQL)
- [ ] Credenciales copiadas
- [ ] Archivo .env.local creado y configurado
- [ ] `npm install` ejecutado
- [ ] `npm run dev` funciona
- [ ] Puedes ver la app en localhost:3000
- [ ] Puedes agregar items (prueba el itinerario)
- [ ] Código subido a GitHub
- [ ] Proyecto desplegado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] App funciona en la URL de Vercel

---

## 🆘 Ayuda rápida

**¿No se guardan los datos?**
- Revisa que las variables de entorno estén correctas
- Confirma que las tablas se crearon en Supabase

**¿Error al instalar?**
- Asegúrate de tener Node.js 18 o superior
- Intenta: `rm -rf node_modules && npm install`

**¿No aparece en Vercel?**
- Verifica que el repositorio sea público en GitHub
- Intenta desconectar y reconectar GitHub en Vercel

---

**Tiempo total estimado: ~15 minutos** ⏱️

¡Disfruta tu app! 🌴
