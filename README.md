# BK2HGF — MVP PWA

App docente de procedimientos para becados de Medicina de Urgencia.

## Incluye
- Next.js + React + Tailwind
- PWA instalable
- Login con Supabase
- Registro de procedimientos
- Validación docente
- Dashboard
- Historial individual
- Esquema SQL Supabase en `supabase/schema.sql`

## Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Luego abrir: http://localhost:3000

## Configurar Supabase

1. Crear proyecto en Supabase.
2. Ir a SQL Editor.
3. Pegar y ejecutar `supabase/schema.sql`.
4. Crear usuarios en Authentication.
5. Agregar cada usuario en tabla `usuarios` con el mismo `id` generado por Supabase Auth.
6. Copiar URL y anon key a `.env.local`.

## Despliegue recomendado

- Subir repositorio a GitHub.
- Conectar con Vercel.
- Agregar variables de entorno.
- Deploy.

## Instalar como app

- iPhone: abrir link en Safari → Compartir → Agregar a pantalla de inicio.
- Android: abrir link en Chrome → Instalar app.

## Privacidad

No registrar nombre completo, RUT, teléfono, dirección ni número de ficha de pacientes. El MVP está diseñado para usar solo iniciales y contexto docente.
