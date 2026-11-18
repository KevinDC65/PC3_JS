# Información del proyecto

## Objetivo

Desarrollar una aplicación web con React, Bootstrap y servicios REST que permita **gestionar el inventario de prendas de una empresa textil**: registrar prendas nuevas, listarlas, editarlas y eliminarlas, aplicando rutas, formularios controlados, validaciones, hooks de React, contexto global y persistencia en `localStorage`.

## Alcance

**Incluye**
- 3 páginas principales: **Inicio**, **Registro** y **Lista** (+ página 404).
- CRUD completo de prendas contra json-server (`db.json`).
- Contexto global: usuario autenticado (simulado), tema claro/oscuro y configuración.
- Custom hook `useLocalStorage` para persistir preferencias y borradores.
- Indicador `Loading...` y mensajes de confirmación/error.

**No incluye**
- Backend real, base de datos ni autenticación real (el login es simulado).
- TypeScript, librerías de UI distintas de Bootstrap, ni tests automatizados obligatorios.

## Modelo de datos: `Prenda`

| Campo | Tipo | Regla |
|---|---|---|
| `id` | string | Lo genera json-server |
| `codigo` | string | Obligatorio, único, formato `AAA-000` (ej. `POL-001`) |
| `nombre` | string | Obligatorio, 3–60 caracteres |
| `tipo` | string | Uno de: `Polo`, `Camisa`, `Pantalón`, `Casaca`, `Vestido`, `Polera`, `Short` |
| `tela` | string | Uno de: `Algodón pima`, `Algodón`, `Poliéster`, `Denim`, `Lino`, `Lana`, `Drill` |
| `talla` | string | Uno de: `XS`, `S`, `M`, `L`, `XL`, `XXL` |
| `color` | string | Obligatorio |
| `precio` | number | Mayor que 0 (soles, 2 decimales) |
| `stock` | number | Entero mayor o igual a 0 |
| `fechaRegistro` | string | `YYYY-MM-DD`, se asigna al crear |

Ejemplo:

```json
{
  "id": "1",
  "codigo": "POL-001",
  "nombre": "Polo básico cuello redondo",
  "tipo": "Polo",
  "tela": "Algodón pima",
  "talla": "M",
  "color": "Blanco",
  "precio": 39.9,
  "stock": 25,
  "fechaRegistro": "2026-11-18"
}
```

"Stock bajo" = `stock < 10` (lo usa la Home).

## API REST (json-server)

Base: `http://localhost:3001` (configurable con `VITE_API_URL`).

| Método | Endpoint | Función en `apiService.js` | Descripción |
|---|---|---|---|
| GET | `/prendas` | `getAll()` | Obtener todas las prendas |
| GET | `/prendas/:id` | `getById(id)` | Obtener una prenda (modo edición) |
| POST | `/prendas` | `add(prenda)` | Crear una prenda |
| PUT | `/prendas/:id` | `update(id, prenda)` | Actualizar una prenda |
| DELETE | `/prendas/:id` | `remove(id)` | Eliminar una prenda |

## Trazabilidad: requisitos de la práctica → issues

| Requisito de la práctica | Issue |
|---|---|
| Crear proyecto React, instalar Bootstrap | Sprint 0 (hecho) · #2 |
| `App.js` con encabezado | #1 |
| Componentes de la aplicación | #1, #3, #4, #18 |
| `react-router-dom` con Home, Registro, Lista | Sprint 0 (hecho) · #9 |
| `Navbar.js` con `Link` | #3 |
| Formulario controlado en `Registro.js` | #5 |
| Comunicación con `props` | #15, #18 |
| Validaciones: alertas y estilos condicionales | #12 |
| `useState` / `useEffect` | #5, #11, #16 |
| `useRef` | #13 |
| `useContext` (usuario, configuración, tema) | #6, #17, #20 |
| Custom Hook `localStorage` | #14 |
| `services/apiService.js` con getAll/add/remove/update | #8 |
| Axios para listar y agregar | #16, #19 |
| Botón Eliminar con `DELETE` | #16, #21 |
| Indicador `Loading...` | #16, #11 |
| Mensajes de confirmación/error | #15, #16, #19 |
| `db.json` con datos de prueba | #7 |
| Capturas de pantalla | #24 |
| Documento PDF | #25 |
| Carpeta completa del proyecto | #23 |

## Entregables

1. Repositorio/carpeta completa del proyecto funcionando.
2. `db.json` con datos de prueba.
3. Capturas en `docs/capturas/`.
4. PDF breve (estructura, servicios REST, capturas) en `docs/`.
