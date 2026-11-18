# Sprints y seguimiento

Cada desarrollador marca su avance aquí **en el mismo PR** que cierra la issue (cambia `[ ]` por `[x]`).
Escribe tu usuario de GitHub en la tabla del equipo la primera vez.

**Estados:** `[ ]` pendiente · `[~]` en progreso (opcional) · `[x]` fusionado en `main`

## Equipo

| Rol | GitHub | Área | Etiqueta |
|---|---|---|---|
| Dev 1 | @_por-asignar_ | Setup, layout, calidad e integración | `rol:setup` |
| Dev 2 | @_por-asignar_ | Navegación, Home, tema y capturas | `rol:ui-navegacion` |
| Dev 3 | @_por-asignar_ | Formulario de registro, validaciones y edición | `rol:formulario` |
| Dev 4 | @_por-asignar_ | Estado global, hooks, alertas y PDF | `rol:estado-hooks` |
| Dev 5 | @_por-asignar_ | Servicios REST y listado | `rol:rest-lista` |

## Calendario

| Sprint | Fechas | Objetivo |
|---|---|---|
| Sprint 0 | 18/11 | ✅ Esqueleto Vite, rutas, estructura, docs, CI, issues |
| Sprint 1 | 19/11 – 23/11 | Base visual, formulario controlado, contexto y API lista |
| Sprint 2 | 24/11 – 28/11 | Validaciones, hooks, listado con REST y Home |
| Sprint 3 | 29/11 – 03/12 | Edición, tema, login simulado, filtros y pulido |
| Entrega | 04/12 – 05/12 | Integración, capturas y PDF |

---

## Sprint 1 · 19/11 – 23/11

> Meta: cada rol deja su pieza base lista para que el Sprint 2 pueda conectarse.

| Estado | Issue | Dev | Tarea |
|---|---|---|---|
| [x] | #1 | Dev 1 | Layout principal: Header con título y estructura en `App.jsx` |
| [x] | #2 | Dev 1 | Estilos globales y paleta textil |
| [x] | #3 | Dev 2 | Navbar Bootstrap con `NavLink` y menú responsive |
| [x] | #4 | Dev 2 | Footer del sitio |
| [x] | #5 | Dev 3 | Formulario controlado en `Registro.jsx` |
| [x] | #6 | Dev 4 | Contexto global `AppContext` |
| [x] | #7 | Dev 5 | `db.json` con datos de prueba |
| [x] | #8 | Dev 5 | `services/apiService.js` (getAll, getById, add, update, remove) |

## Sprint 2 · 24/11 – 28/11

> Meta: la app ya lista prendas reales desde la API y el formulario valida.

| Estado | Issue | Dev | Tarea |
|---|---|---|---|
| [x] | #9 | Dev 1 | Página `NotFound` (404) |
| [x] | #10 | Dev 1 | Verificar CI y README de instalación |
| [x] | #11 | Dev 2 | Home con resumen del inventario |
| [x] | #12 | Dev 3 | Validaciones: alertas y estilos condicionales |
| [x] | #13 | Dev 3 | `useRef`: foco automático en el formulario |
| [x] | #14 | Dev 4 | Custom hook `useLocalStorage` y persistencia |
| [x] | #15 | Dev 4 | Componente `AlertMessage` reutilizable |
| [x] | #16 | Dev 5 | `Lista.jsx`: tabla, `Loading...` y botón Eliminar |

## Sprint 3 · 29/11 – 03/12

> Meta: CRUD completo (crear y editar desde el formulario) y experiencia pulida.

| Estado | Issue | Dev | Tarea |
|---|---|---|---|
| [x] | #17 | Dev 2 | Botón de tema claro/oscuro con `useContext` |
| [x] | #18 | Dev 3 | Extraer `PrendaForm` reutilizable vía `props` |
| [x] | #19 | Dev 3 | Guardar y editar: `add()` y `update()` desde Registro |
| [x] | #20 | Dev 4 | Login simulado y usuario en la Navbar |
| [x] | #21 | Dev 5 | Modal de detalle y de confirmación de eliminación |
| [x] | #22 | Dev 5 | Filtro, búsqueda y orden en la Lista |

## Entrega · 04/12 – 05/12

| Estado | Issue | Dev | Tarea |
|---|---|---|---|
| [x] | #23 | Dev 1 | Integración final y pruebas cruzadas |
| [x] | #24 | Dev 2 | Capturas de pantalla |
| [x] | #25 | Dev 4 | Documento PDF de entrega |

---

## Dependencias entre issues

```text
#8 apiService ──▶ #11 Home, #16 Lista, #19 Guardar/editar, #21 Modal
#7 db.json    ──▶ #11, #16 (datos para probar)
#6 Contexto   ──▶ #14 persistencia, #17 tema, #20 login
#5 Formulario ──▶ #12 ──▶ #13 ──▶ #18 ──▶ #19
#15 Alertas   ──▶ #19, #21 (mientras tanto: <div className="alert ..."> directo)
#1 Layout     ──▶ #3, #4 (encajan en el layout)
Todo          ──▶ #23 ──▶ #24 ──▶ #25
```

Si tu dependencia no está lista, **no te bloquees**: usa datos falsos o un mock local y deja un `// TODO #n` para conectarlo.

## Responsables por archivo

| Archivo | Dueño |
|---|---|
| `src/App.jsx`, `src/components/Header.jsx`, `src/index.css`, `src/pages/NotFound.jsx`, `.github/`, `README.md` | Dev 1 |
| `src/components/Navbar.jsx`, `src/components/Footer.jsx`, `src/pages/Home.jsx`, `docs/capturas/` | Dev 2 |
| `src/pages/Registro.jsx`, `src/components/PrendaForm.jsx` | Dev 3 |
| `src/context/AppContext.jsx`, `src/hooks/useLocalStorage.js`, `src/components/AlertMessage.jsx`, `docs/ENTREGA.md` + PDF | Dev 4 |
| `src/services/apiService.js`, `db.json`, `src/pages/Lista.jsx`, `src/components/Loading.jsx` | Dev 5 |
| `SPRINTS.md` | Todos (solo su propia fila) |

## Ritual mínimo

- **Daily (mensaje en el grupo, 2 min):** ¿qué hice ayer? ¿qué haré hoy? ¿algo me bloquea?
- **Cierre de sprint:** todos los PRs del sprint fusionados; lo que no llegó pasa al siguiente sprint (cambia el milestone de la issue).
- **Retro (3 líneas al final de cada sprint):**

### Retro Sprint 1
- Bien:
- Mejorar:
- Acción:

### Retro Sprint 2
- Bien:
- Mejorar:
- Acción:

### Retro Sprint 3
- Bien:
- Mejorar:
- Acción:
