# mi-timer

Aplicación de cuentas regresivas personalizadas hecha con Astro.

Cada usuario puede crear sus propios timers (con fecha de inicio y de finalización), personalizar cada tarjeta con su color y tamaño, y ver el progreso en vivo.

## Funcionalidades

- **Creación de cuenta / inicio de sesión** guardado en el `localStorage` del navegador (email + contraseña, con hash SHA-256).
- **Mis timers**: grilla de tarjetas con cuenta regresiva y barra de progreso en vivo.
- **Configuración por timer**: nombre, fechas, color (predefinido o personalizado) y tamaño (compacto / mediano / grande), con vista previa en vivo.
- Persistencia de las cuentas y de los timers en el `localStorage` del navegador, asociados a tu cuenta.

> Nota: al ser una app estática sin servidor, los datos viven solo en el navegador de cada usuario (perfil, cuenta y revisión). No se sincronizan entre dispositivos, y borrar los datos del navegador elimina las cuentas y timers locales.

## Requisitos

- Node.js >= 22.12.0

## Desarrollo

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview
```

## Despliegue (GitHub Pages)

El proyecto está configurado para desplegar en GitHub Pages bajo el subdirectorio `/mi-timer` (ver `astro.config.mjs`). Subí los cambios a `main` y el flujo de trabajo que uses para Pages compilará el sitio.

## Notas

- Las contraseñas se guardan con hash (`crypto.subtle` SHA-256 con salt único por cuenta). Aun así, **no es un sistema seguro para producción real**: cualquier usuario con acceso a la consola del navegador puede leer los datos. Sirve para uso personal/demostrativo.
- Las rutas internas usan el prefijo `/mi-timer/` acorde al `base` configurado.