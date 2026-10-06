# miLDC · Prototipo Gestión de Cupos

Prototipo navegable de **Logística > Cupos > Gestión de cupos** del portal MiLDC.
Sirve para probar flujos, detectar errores y validar con usuarios antes de pasar a desarrollo.

## Correr en local
```
pnpm install
pnpm dev
```

## Publicar en Vercel
Importar el repo en Vercel. Framework: Vite (se detecta solo). Build: `pnpm build`. Output: `dist`.

## Contenido
- `src/App.tsx`: toda la pantalla (Generar cupos, Solicitar cupos, modales, validaciones y datos de ejemplo).
- `standalone/gestion-de-cupos.html`: versión de un solo archivo, sin build.

## Reglas implementadas
- Solicitar cupos: **Por contrato** (bloquea la bolsa de programas) o **Por programas** (bloquea la columna por contrato).
- Un contrato no puede pedir más de lo pendiente por cupear, ni pedir si hay disponible en Libre o en su combinación.
- Por programas solo vale una combinación que exista en algún contrato. Máximo 400 cupos sin contrato.
- Lo solicitado pasa a En gestión; el administrador aprueba o rechaza y lo aprobado descuenta Disponible (simulado).
- Devolución de cupos disponibles: modal con selección por día y por programa.
