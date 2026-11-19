# AGENTS.md — Guía técnica rápida

Resumen técnico de todo el proyecto en un solo archivo. Léelo completo antes de tocar código. La misma información está ampliada en README, PROYECTO, ESTRUCTURA, CONTRIBUTING y SPRINTS.

## Qué es este proyecto

**TextilApp**: práctica universitaria (UTP, PC3) de una app React para **registrar e inventariar prendas textiles**. CRUD de prendas contra una API falsa (json-server). Lo desarrollan **5 personas en paralelo**, cada una con un rol y archivos propios. Es un proyecto académico: se valora que se vean claramente los conceptos pedidos (rutas, formulario controlado, props, validaciones, `useState`, `useEffect`, `useRef`, `useContext`, custom hook de `localStorage`, servicio REST con Axios, `Loading...`, mensajes de éxito/error). **Claridad > ingenio.**

## Stack (no cambiar)

- React 19 + Vite 8 · JavaScript (**no TypeScript**) · archivos `.jsx`
- react-router-dom 7 (`BrowserRouter` en `main.jsx`, `<Routes>` en `App.jsx`)
- Bootstrap 5.3 (CSS + JS bundle) + Bootstrap Icons (`<i className="bi bi-..." />`)
- Axios · json-server **0.17.4** (puerto 3001) · oxlint · Prettier
- Node ≥ 20.19

No instales otras librerías (ni de UI, ni de estado, ni de formularios, ni de testing) sin que la issue lo pida.

## Comandos

```bash
npm install          # dependencias
npm run dev:all      # API (3001) + frontend (5173)
npm run server       # solo json-server
npm run dev          # solo Vite
npm run lint         # oxlint — debe quedar sin errores
npm run format       # Prettier sobre src/
npm run format:check # lo que corre la CI
npm run build        # debe compilar
```

## Mapa de archivos

| Archivo | Rol | Notas |
|---|---|---|
| `src/main.jsx` | — | Importa Bootstrap, envuelve en `BrowserRouter` y `AppProvider`. Rara vez se toca. |
| `src/App.jsx` | Dev 1 | Layout y rutas: `/`, `/registro`, `/registro/:id`, `/lista`, `*` |
| `src/components/Header.jsx` | Dev 1 | Título de la app |
| `src/components/Navbar.jsx` | Dev 2 | `NavLink` + tema + usuario |
| `src/components/Footer.jsx` | Dev 2 | |
| `src/components/Loading.jsx` | Dev 5 | Ya implementado: `<Loading texto="Loading..." />` |
| `src/components/AlertMessage.jsx` | Dev 4 | `<AlertMessage tipo="success|danger|warning|info" mensaje onClose />` |
| `src/components/PrendaForm.jsx` | Dev 3 | Form reutilizable: `prendaInicial`, `onSubmit`, `textoBoton`, `cargando` |
| `src/pages/Home.jsx` | Dev 2 | Resumen del inventario |
| `src/pages/Registro.jsx` | Dev 3 | Crear y editar (`/registro/:id`) |
| `src/pages/Lista.jsx` | Dev 5 | Tabla, eliminar, filtros |
| `src/pages/NotFound.jsx` | Dev 1 | 404 |
| `src/context/AppContext.jsx` | Dev 4 | `AppProvider`, `useAppContext()` |
| `src/hooks/useLocalStorage.js` | Dev 4 | `[valor, setValor] = useLocalStorage(clave, inicial)` |
| `src/services/apiService.js` | Dev 5 | Único punto de acceso HTTP |
| `db.json` | Dev 5 | Datos de prueba, colección `prendas` |

Otros módulos: `src/constants/prendas.js` (listas y constantes), `src/utils/validarPrenda.js` (`validarPrenda`, `normalizarPrenda`), `src/utils/formato.js` (`formatearPrecio`, `formatearFecha`, `hoyISO`), `src/components/Modal.jsx` (base de modales), `ConfirmModal.jsx` y `LoginModal.jsx`. Si dejas trabajo pendiente, márcalo con `// TODO #n` referenciando su issue.

## Modelo de datos `Prenda`

```js
{
  id: '1',                  // string, lo genera json-server (no lo envíes al crear)
  codigo: 'POL-001',        // obligatorio, único, /^[A-Z]{3}-\d{3}$/
  nombre: 'Polo básico',    // obligatorio, 3–60 caracteres
  tipo: 'Polo',             // Polo | Camisa | Pantalón | Casaca | Vestido | Polera | Short
  tela: 'Algodón pima',     // Algodón pima | Algodón | Poliéster | Denim | Lino | Lana | Drill
  talla: 'M',               // XS | S | M | L | XL | XXL
  color: 'Blanco',          // obligatorio
  precio: 39.9,             // number > 0 (convertir desde el input con Number())
  stock: 25,                // entero >= 0
  fechaRegistro: '2026-11-18' // YYYY-MM-DD, se asigna al crear
}
```

Stock bajo = `stock < 10`. Las listas de opciones (tipos, telas, tallas) deben definirse **una sola vez** en `src/constants/prendas.js` (créalo si no existe) y reutilizarse.

## Contrato de `apiService.js`

```js
getAll()            // GET    /prendas      -> Promise<Prenda[]>
getById(id)         // GET    /prendas/:id  -> Promise<Prenda>
add(prenda)         // POST   /prendas      -> Promise<Prenda>
update(id, prenda)  // PUT    /prendas/:id  -> Promise<Prenda>
remove(id)          // DELETE /prendas/:id  -> Promise<void>
```

- Usa una instancia `axios.create({ baseURL: API_URL })` con `API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'`.
- Devuelve `response.data`, no la respuesta completa.
- Ante error, lanza `new Error('<mensaje en español>')` (p. ej. "No se pudo conectar con el servidor. ¿Está corriendo `npm run server`?").
- Componentes y páginas **nunca** importan `axios` ni usan `fetch`.

## Patrones esperados (para que el docente los vea)

```jsx
// Carga con loading y error
const [prendas, setPrendas] = useState([])
const [cargando, setCargando] = useState(true)
const [error, setError] = useState('')
useEffect(() => {
  getAll()
    .then(setPrendas)
    .catch((e) => setError(e.message))
    .finally(() => setCargando(false))
}, [])
```

- Formulario **controlado**: un objeto en `useState` + `onChange` genérico con `name`.
- Validación: objeto `errores`; clases `is-invalid` / `is-valid` y `<div className="invalid-feedback">`.
- `useRef` para enfocar el primer campo al montar y el primer campo inválido al enviar.
- `useContext` vía `useAppContext()`; el contexto expone `usuario`, `login`, `logout`, `tema`, `alternarTema`, `config`.
- Tema: atributo `data-bs-theme` en `<html>` (soporte nativo de Bootstrap 5.3).

## Reglas duras

1. **Mantente en el alcance de la issue.** No refactorices ni “mejores” archivos de otros roles. Si es imprescindible, cambio mínimo y explícalo en el PR.
2. No uses CRA, TypeScript, Tailwind, Redux, React Hook Form, styled-components ni similares.
3. No edites `db.json` salvo en la issue #7 o si la issue lo pide.
4. Textos de UI, nombres de variables y commits **en español**. Componentes en `PascalCase`.
5. Solo componentes funcionales. Clases de Bootstrap antes que CSS propio.
6. No dejes `console.log`. No dejes código comentado.
7. No hagas push a `main`. Trabaja en `feature/<n>-descripcion` y abre PR con `Closes #<n>`.
8. No subas `.env`, `node_modules`, `dist` ni archivos de configuración personal de tu editor o herramientas; solo código y documentación del proyecto.
9. Si una dependencia de tu issue no está lista, usa un mock local con `// TODO #n` en vez de implementar la issue ajena.
10. **Autoría solo del equipo.** Los commits y PRs llevan como autor únicamente al integrante. Prohibido añadir trailers `Co-authored-by:`, firmas como "Generated with…" o cualquier mención a herramientas en commits, PRs, issues, comentarios del código o documentación. La CI rechaza los PRs que los contengan.

## Definition of Done

- Criterios de aceptación de la issue cumplidos.
- `npm run lint`, `npm run format:check` y `npm run build` sin errores.
- Probado con `npm run dev:all` en el navegador: sin errores en consola, se ve bien a 375 px y en escritorio.
- `// TODO #n` de la issue eliminado; fila marcada `[x]` en `SPRINTS.md`.
- Commit con formato `feat(ámbito): descripción`.

## Cómo verificar rápido

1. `npm run dev:all`
2. Abrir http://localhost:3001/prendas → JSON con prendas.
3. Abrir http://localhost:5173 → navegar Inicio / Registro / Lista y una ruta inexistente.
4. Para CRUD: crear una prenda, verla en la lista, editarla, eliminarla; revisar que `db.json` cambie.

## Documentos relacionados

[PROYECTO.md](PROYECTO.md) · [ESTRUCTURA.md](ESTRUCTURA.md) · [CONTRIBUTING.md](CONTRIBUTING.md) · [SPRINTS.md](SPRINTS.md)
