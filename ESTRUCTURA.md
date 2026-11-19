# Estructura del proyecto

```text
PC3_JS/
├── .github/
│   ├── ISSUE_TEMPLATE/        Plantillas de issues (tarea, bug)
│   ├── workflows/ci.yml       CI: lint + formato + build en cada PR
│   └── pull_request_template.md
├── docs/
│   ├── capturas/              Capturas de pantalla para la entrega (#24)
│   ├── informe/informe.html   Fuente editable del informe (#25)
│   ├── TextilApp_PC3.pdf      Informe de entrega (#25)
│   └── ENTREGA.md             Guía del PDF final (#25)
├── public/                    Archivos estáticos (favicon)
├── src/
│   ├── components/            Piezas reutilizables, sin lógica de página
│   │   ├── Header.jsx         Cabecera: título de la app, migas y buscador Ctrl+K (#1)
│   │   ├── Navbar.jsx         Barra lateral y barra inferior móvil con NavLink (#3, #17, #20)
│   │   ├── Footer.jsx         Pie de página (#4)
│   │   ├── Marca.jsx          Sello y nombre de la marca
│   │   ├── Loading.jsx        Indicador "Loading..."
│   │   ├── Esqueleto.jsx      Esqueletos de carga
│   │   ├── AlertMessage.jsx   Alertas de éxito/error; también dentro de los toasts (#15)
│   │   ├── PrendaForm.jsx     Formulario controlado reutilizable vía props (#5, #12, #13, #18)
│   │   ├── TarjetaPrenda.jsx  Tarjeta de la galería y vista previa del formulario
│   │   ├── MuestraTela.jsx    Muestra de color con textura según la tela
│   │   ├── TablaPrendas.jsx   Tabla ordenable con selección múltiple (#16, #22)
│   │   ├── DetallePrenda.jsx  Contenido del panel lateral de detalle (#21)
│   │   ├── Drawer.jsx         Panel lateral accesible
│   │   ├── Modal.jsx          Base de modales: portal, Esc, foco y bloqueo de scroll
│   │   ├── ConfirmModal.jsx   Confirmación de eliminación (#21)
│   │   ├── LoginModal.jsx     Inicio de sesión simulado (#20)
│   │   ├── PaletaComandos.jsx Paleta de comandos (Ctrl+K)
│   │   ├── AyudaAtajos.jsx    Ayuda de atajos de teclado (?)
│   │   ├── Tecla.jsx          Representación de una tecla
│   │   ├── Graficos.jsx       Franja por tipo y barras por talla (Inicio)
│   │   └── EstadoVacio.jsx    Estados vacío y sin resultados
│   ├── pages/                 Una por ruta
│   │   ├── Home.jsx           "/"            (#11)
│   │   ├── Registro.jsx       "/registro" y "/registro/:id" (#5, #12, #13, #18, #19)
│   │   ├── Lista.jsx          "/lista"       tabla/galería, filtros en la URL (#16, #21, #22)
│   │   └── NotFound.jsx       "*"            (#9)
│   ├── context/
│   │   ├── AppContext.jsx     Estado global: usuario, tema, configuración (#6)
│   │   ├── ShellProvider.jsx  Paneles abiertos y navegación protegida
│   │   ├── ToastProvider.jsx  Notificaciones tipo toast
│   │   └── contextos.js       Definición de los contextos del shell y los toasts
│   ├── hooks/
│   │   ├── useLocalStorage.js Custom hook de persistencia (#14)
│   │   ├── useShell.js        Acceso al estado del shell
│   │   ├── useToast.js        Mostrar toasts
│   │   ├── useCapaModal.js    Foco atrapado, Esc y bloqueo de scroll en capas
│   │   ├── useAtajosTeclado.js Atajos globales (N, /, G+I/L/R, ?)
│   │   ├── useConteoInventario.js Contadores de la barra lateral
│   │   └── useGuardiaCambios.js Aviso al salir con cambios sin guardar
│   ├── services/
│   │   └── apiService.js      Único lugar que habla con la API (#8)
│   ├── constants/
│   │   └── prendas.js         Tipos, telas, tallas, prenda vacía y stock mínimo (#5)
│   ├── utils/
│   │   ├── validarPrenda.js   Validación y normalización de prendas (#12)
│   │   ├── formato.js         Formato de precios y fechas
│   │   ├── colores.js         Nombres de color en español → muestra de color
│   │   └── inventario.js      Resumen, filtros y orden del inventario
│   ├── styles/                base, shell, capas, telas y vistas (importados desde index.css)
│   ├── App.jsx                Shell de la app + definición de rutas
│   ├── main.jsx               Punto de entrada: Bootstrap, Router y proveedores
│   └── index.css              Tokens de diseño claro/oscuro (#2)
├── db.json                    "Base de datos" de json-server (#7)
├── .env.example               VITE_API_URL
├── package.json               Dependencias y scripts
└── *.md                       Documentación (README, PROYECTO, PRODUCT, DESIGN, ESTRUCTURA, CONTRIBUTING, SPRINTS, AGENTS)
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
