# Barco Manager

Aplicación privada PWA para gestionar el día a día de un barco. Construida con Next.js, Supabase y Tailwind CSS.

## Stack

- **Next.js 15** con App Router y TypeScript
- **Supabase** — Auth, PostgreSQL, Storage
- **Tailwind CSS** — diseño mobile-first
- **Vercel** — despliegue

## Requisitos previos

- Node.js 18 o superior
- Una cuenta en [Supabase](https://supabase.com) (gratuita)
- Una cuenta en [Vercel](https://vercel.com) (gratuita)

---

## 1. Clonar y configurar el proyecto

```bash
git clone https://github.com/tu-usuario/barco-manager.git
cd barco-manager
npm install
```

Crea tu archivo de entorno:

```bash
cp .env.example .env.local
```

---

## 2. Configurar Supabase

### 2.1 Crear proyecto

1. Ve a [app.supabase.com](https://app.supabase.com) y crea un nuevo proyecto.
2. Anota la **URL del proyecto** y la **anon key** (en Settings → API).

### 2.2 Ejecutar migraciones

En el **SQL Editor** de Supabase, ejecuta los siguientes archivos en orden:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`

### 2.3 Crear el primer usuario (admin)

1. En Supabase → Authentication → Users → Invite user (o Add user).
2. Escribe el email y contraseña del primer administrador.
3. Una vez creado, copia su UUID.

### 2.4 Crear el barco y asignar el admin

En el SQL Editor de Supabase:

```sql
-- Inserta el barco
INSERT INTO public.boats (name, registration, home_port, engine_hours)
VALUES ('Nombre de tu barco', 'TU-MATRICULA', 'Puerto base', 0);

-- Obtén el ID del barco recién creado
SELECT id FROM public.boats ORDER BY created_at DESC LIMIT 1;

-- Asigna el admin al barco (reemplaza los UUIDs)
INSERT INTO public.boat_members (boat_id, user_id, role)
VALUES ('UUID-DEL-BARCO', 'UUID-DEL-USUARIO', 'admin');
```

### 2.5 Añadir más usuarios

Para cada usuario adicional:
1. Crea el usuario en Supabase Auth.
2. Añádelo a `boat_members` con el rol adecuado (`admin`, `editor` o `viewer`).

---

## 3. Variables de entorno

Edita `.env.local` con los valores de tu proyecto Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 4. Ejecutar en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Serás redirigido al login.

---

## 5. Desplegar en Vercel

### 5.1 Subir el código a GitHub

```bash
git init
git add .
git commit -m "feat: barco manager v1"
git remote add origin https://github.com/tu-usuario/barco-manager.git
git push -u origin main
```

### 5.2 Importar en Vercel

1. Ve a [vercel.com/new](https://vercel.com/new) e importa el repositorio de GitHub.
2. Framework: **Next.js** (se detecta automáticamente).
3. En **Environment Variables**, añade:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJxxx...` |
| `NEXT_PUBLIC_SITE_URL` | `https://tu-app.vercel.app` |

4. Haz clic en **Deploy**.

> Cada `git push` a `main` despliega automáticamente.

### 5.3 Configurar redirección en Supabase

En Supabase → Authentication → URL Configuration:
- **Site URL**: `https://tu-app.vercel.app`
- **Redirect URLs**: añade `https://tu-app.vercel.app/**`

### 5.4 Dominio personalizado (opcional)

En Vercel → Project → Settings → Domains, añade tu dominio.
Actualiza **Site URL** en Supabase con el dominio definitivo.

---

## 6. Configurar Supabase Storage

### 6.1 Ejecutar la migración de adjuntos

En el SQL Editor de Supabase ejecuta:

```
supabase/migrations/003_attachments_storage.sql
```

Esto crea:
- La tabla `attachments` con RLS.
- El bucket privado `boat-files` (límite 10 MB por archivo).
- Las políticas de acceso: miembros leen, editores suben, solo admin borra.

### 6.2 Verificar el bucket

En Supabase → Storage → Buckets deberías ver **boat-files** con `Public: false`.

### 6.3 Tipos de archivo permitidos

`image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/heic`, `application/pdf`,
Word, Excel y texto plano. Tamaño máximo: **10 MB**.

---

## 7. PWA — Instalar en móvil

La app es instalable como PWA:

- **Android (Chrome)**: aparece el banner "Añadir a pantalla de inicio" automáticamente.
- **iOS (Safari)**: pulsa el botón Compartir → "Añadir a pantalla de inicio".
- **Desktop (Chrome/Edge)**: icono de instalación en la barra de direcciones.

Funciona offline mostrando una página de aviso cuando no hay conexión.

---

## 8. Datos de ejemplo (opcional)

El archivo `supabase/seed.sql` contiene datos de ejemplo. Ajusta los UUIDs de usuario y ejecuta en el SQL Editor tras crear el barco y el usuario admin.

---

## 9. Roles y permisos

| Acción | Admin | Editor | Viewer |
|--------|-------|--------|--------|
| Ver datos | ✅ | ✅ | ✅ |
| Crear/editar registros | ✅ | ✅ | ❌ |
| Borrar registros | ✅ | ❌ | ❌ |
| Gestionar miembros | ✅ | ❌ | ❌ |

---

## Módulos disponibles

| Módulo | Estado |
|--------|--------|
| Login / Auth | ✅ Fase 1 |
| Dashboard | ✅ Fase 1 |
| Datos del barco | ✅ Fase 1 |
| Mantenimiento | ✅ Fase 2 |
| Reparaciones | ✅ Fase 2 |
| Gastos | ✅ Fase 3 |
| Repostajes | ✅ Fase 3 |
| Bitácora de salidas | ✅ Fase 3 |
| Log de pesca | ✅ Fase 3 |
| Documentos | ✅ Fase 5 |
| Adjuntos (fotos/PDFs) | ✅ Fase 5 |
| PWA instalable | ✅ Fase 5 |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (dashboard)/        # Rutas protegidas con layout móvil
│   │   ├── layout.tsx
│   │   ├── page.tsx        # Dashboard
│   │   ├── barco/
│   │   ├── mantenimiento/
│   │   ├── reparaciones/
│   │   ├── gastos/
│   │   ├── repostajes/
│   │   ├── bitacora/
│   │   ├── pesca/
│   │   └── documentos/
│   ├── login/              # Página de login pública
│   └── auth/signout/       # Route handler para logout
├── components/
│   ├── layout/             # TopBar, BottomNav
│   └── ui/                 # Card, Badge, EmptyState
├── lib/
│   ├── supabase/           # client.ts (browser), server.ts (SSR)
│   └── utils.ts
├── proxy.ts                 # Protección de rutas (Next.js 16)
└── types/index.ts          # Tipos TypeScript globales

supabase/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   └── 003_attachments_storage.sql
└── seed.sql
```
