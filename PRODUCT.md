# Product

## Platform

web

## Users

- **Encargado de inventario de una empresa textil peruana pequeña o mediana** (taller o tienda de confección). Registra prendas nuevas al llegar de producción, revisa qué modelos se están agotando y corrige datos (precio, stock, talla) durante la jornada. Trabaja en escritorio en la oficina o el almacén y consulta desde el celular cuando está en piso.
- **Docente del curso** (UTP, PC3) que evalúa la práctica: recorre las rutas, prueba el CRUD y busca en la interfaz y en el código los conceptos pedidos (rutas, formulario controlado, props, validaciones, hooks, contexto, custom hook, servicio REST, `Loading...`, mensajes de confirmación y error).

## Product Purpose

TextilApp registra e inventaría prendas textiles: alta, listado, edición y eliminación contra una API REST simulada (json-server). Éxito = saber en segundos cuántas prendas y unidades hay, qué hay que reponer y cuánto vale el inventario, y registrar o corregir una prenda sin errores de captura.

## Positioning

Inventario hecho para el oficio textil, no un CRUD genérico: cada prenda se describe con el vocabulario del taller (tipo, tela, talla, color, código de modelo `AAA-000`) y la interfaz lo hace visible (tela, color y talla se leen de un vistazo).

## Operating Context

- Uso diario y repetitivo: buscar por código o nombre, filtrar por tipo/talla/tela, registrar varias prendas seguidas.
- Datos en soles (S/), fechas en español, stock bajo = menos de 10 unidades.
- Sin backend real ni autenticación real: el inicio de sesión es simulado (solo un nombre).

## Capabilities and Constraints

- Rutas obligatorias: `/`, `/registro`, `/registro/:id`, `/lista`, `*` (404).
- Stack fijo: React 19 + Vite, react-router-dom 7, Bootstrap 5.3 + Bootstrap Icons, Axios, json-server 0.17. Sin librerías nuevas, sin TypeScript ni Tailwind.
- `apiService.js` es el único acceso HTTP (getAll, getById, add, update, remove).
- Modelo `Prenda`: codigo, nombre, tipo (7), tela (7), talla (XS–XXL), color (texto libre), precio > 0, stock entero ≥ 0, fechaRegistro.
- Requisitos visibles de la práctica: `Header.jsx` con el título de la app, `Navbar.jsx` con `Link`/`NavLink`, `Loading` con el texto "Loading...", `AlertMessage` para confirmaciones y errores, formulario controlado con `is-invalid`/`is-valid`.
- Interfaz, variables y comentarios en español.

## Brand Commitments

- Nombre: **TextilApp**. Institución: Universidad Tecnológica del Perú.
- Sin menciones a herramientas de generación en ningún archivo ni texto.

## Evidence on Hand

- `db.json`: 12 prendas de prueba realistas (polos, camisas, jeans, casacas, vestido, poleras, short).
- No hay fotografías de producto, logotipo propio ni testimonios; no se deben inventar.

## Product Principles

1. Claridad antes que ingenio: cada concepto evaluado debe poder señalarse en pantalla.
2. El oficio a la vista: tela, color y talla son información, no decoración.
3. Rápido para el uso repetido: teclado, búsqueda y filtros compartibles por URL.
4. Nunca perder trabajo: borrador persistido, aviso de cambios sin guardar, confirmación antes de eliminar.

## Accessibility & Inclusion

Contraste AA en claro y oscuro, foco visible, navegación completa por teclado, `prefers-reduced-motion` respetado, objetivos táctiles de 44 px en móvil.
