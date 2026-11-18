# Estructura del proyecto

```text
PC3_JS/
├── .github/
│   ├── ISSUE_TEMPLATE/        Plantillas de issues (tarea, bug)
│   ├── workflows/ci.yml       CI: lint + formato + build en cada PR
│   └── pull_request_template.md
├── docs/
│   ├── capturas/              Capturas de pantalla para la entrega (#24)
│   └── ENTREGA.md             Guía del PDF final (#25)
├── public/                    Archivos estáticos (favicon)
├── src/
│   ├── components/            Piezas reutilizables, sin lógica de página
│   │   ├── Header.jsx         Encabezado con el título de la app (#1)
│   │   ├── Navbar.jsx         Navegación con Link/NavLink (#3, #17, #20)
│   │   ├── Footer.jsx         Pie de página (#4)
│   │   ├── Loading.jsx        Indicador "Loading..." (listo)
│   │   ├── AlertMessage.jsx   Alertas de éxito/error (#15)
│   │   └── PrendaForm.jsx     Formulario de prenda reutilizable vía props (#18)
│   ├── pages/                 Una por ruta
│   │   ├── Home.jsx           "/"            (#11)
│   │   ├── Registro.jsx       "/registro" y "/registro/:id" (#5, #12, #13, #18, #19)
│   │   ├── Lista.jsx          "/lista"       (#16, #21, #22)
│   │   └── NotFound.jsx       "*"            (#9)
│   ├── context/
│   │   └── AppContext.jsx     Estado global: usuario, tema, configuración (#6)
│   ├── hooks/
│   │   └── useLocalStorage.js Custom hook de persistencia (#14)
│   ├── services/
│   │   └── apiService.js      Único lugar que habla con la API (#8)
│   ├── App.jsx                Layout + definición de rutas
│   ├── main.jsx               Punto de entrada: Bootstrap, Router, AppProvider
│   └── index.css              Estilos globales (#2)
├── db.json                    "Base de datos" de json-server (#7)
├── .env.example               VITE_API_URL
├── package.json               Dependencias y scripts
└── *.md                       Documentación (README, PROYECTO, ESTRUCTURA, CONTRIBUTING, SPRINTS, AGENTS)
```

> La práctica nombra los archivos como `App.js`, `Navbar.js`, etc. En Vite los componentes con JSX usan la extensión `.jsx`; el contenido y propósito son los mismos.

## Responsabilidad de cada carpeta

| Carpeta | Puede | No debe |
|---|---|---|
| `components/` | Recibir datos por `props`, emitir eventos (`onSubmit`, `onDelete`) | Llamar a la API directamente |
| `pages/` | Usar hooks, llamar a `apiService`, leer el contexto, componer componentes | Contener estilos complejos repetidos (extraer a componente) |
| `context/` | Guardar estado global compartido | Guardar la lista de prendas (eso vive en las páginas) |
| `hooks/` | Lógica reutilizable con hooks (`useX`) | Renderizar JSX |
| `services/` | Peticiones HTTP con Axios y traducción de errores | Usar hooks o tocar el DOM |

## Flujo de datos

```text
        ┌──────────────┐   useAppContext()   ┌──────────────────────┐
        │  AppContext  │ ──────────────────▶ │ Navbar / páginas     │
        │ usuario/tema │ ◀── useLocalStorage │                      │
        └──────────────┘                     │ Home  Registro  Lista│
                                             └─────────┬────────────┘
                                                       │ getAll/add/update/remove
                                                       ▼
                                             ┌──────────────────────┐
                                             │ services/apiService  │ (Axios)
                                             └─────────┬────────────┘
                                                       │ HTTP
                                                       ▼
                                             ┌──────────────────────┐
                                             │ json-server :3001    │ ◀─ db.json
                                             └──────────────────────┘
```

1. Una página monta → `useEffect` llama a `apiService.getAll()` → muestra `<Loading />` mientras espera.
2. El usuario envía el formulario → la página valida → `apiService.add()` / `update()` → `<AlertMessage />` con éxito o error.
3. Tema y usuario se leen desde `AppContext`, que los persiste con `useLocalStorage`.

## Convenciones de nombres

- Componentes y páginas: `PascalCase.jsx` (`PrendaForm.jsx`).
- Hooks: `useAlgo.js` (`useLocalStorage.js`).
- Funciones y variables: `camelCase` en español (`prendaInicial`, `cargarPrendas`).
- Rutas: minúsculas en español (`/registro`, `/lista`).
