# Sistema de diseño de TextilApp

Documento del sistema visual implementado en `src/index.css` y `src/styles/*.css`. Describe lo que está construido; si cambias un token, actualiza también esta guía.

## Idea

**Tintes naturales andinos y franjas de awayu.** El inventario se lee como un tejido: la composición del stock por tipo es una franja tejida (como las listas de una manta andina) y los tintes naturales son la paleta de datos. La app es una herramienta de trabajo (modo *Operate*): la navegación, los controles y las tablas son los estándar; el mundo textil aporta solo paleta, tipografía, densidad y un gesto propio.

- **Gesto propio:** la franja tejida de Inicio (unidades por tipo) y la *lista de awayu* (franjas finas con rombos) bajo la marca y bajo la cifra principal.
- **Detalles del oficio:** muestras de tela con la textura de cada tela dibujada en CSS, borde dentado de tijera de picos en las tarjetas, talla como etiqueta tejida, código de modelo con letra de etiqueta.

## Color

Tokens `--tx-*` definidos para claro (`:root`) y oscuro (`[data-bs-theme='dark']`). Bootstrap toma estos valores por sus variables `--bs-*`.

| Rol | Claro | Oscuro | Uso |
|---|---|---|---|
| `--tx-fondo` | `#f4f4f1` | `#0e1020` | Lienzo (algodón crudo frío / noche añil) |
| `--tx-superficie` | `#ffffff` | `#161a2e` | Paneles, tablas, tarjetas, modales |
| `--tx-superficie-2` | `#eeeee9` | `#1d2238` | Superficie hundida: cabecera de tabla, pies de modal |
| `--tx-texto` | `#171a2e` | `#e8e9f1` | Tinta principal |
| `--tx-texto-suave` | `#545870` | `#a7abc2` | Texto secundario |
| `--tx-texto-tenue` | `#666a80` | `#9095af` | Ayudas, metadatos (AA sobre fondo y superficie) |
| `--tx-anil` | `#263a8c` | `#9aabf2` | Acción principal, enlaces, foco, selección |
| `--tx-cochinilla` | `#a3173f` | `#e2678a` | Marca (sello, 404) |
| `--tx-riel` | `#131a3a` | `#0a0c18` | Barra lateral |
| `--tx-riel-acento` | `#e9b84a` | `#e9b84a` | Ícono activo y foco dentro de la barra lateral |
| `--tx-peligro` | `#b42318` | `#f08a7e` | Eliminar, errores |
| `--tx-aviso` / `-texto` / `-suave` | `#c98a12` / `#7a4f00` / `#fbefd0` | `#e9b949` / `#f0cd7c` / `#2e2510` | Stock bajo |
| `--tx-exito` | `#2d6a3e` | `#74c28b` | Validación correcta, confirmaciones |

**Tintes (serie de datos), uno por tipo de prenda en el orden de `TIPOS`:** añil `#2e4596`, cochinilla `#a8204a`, q'olle `#d49b1f`, chilca `#5d7f35`, nogal `#7b4a2a`, molle `#d9707f`, tara `#3b3a3f` (versiones más claras en oscuro). Se asignan con `data-tinte` y `tinteDeTipo()` (`src/utils/inventario.js`).

Reglas: el añil es la única acción; el ámbar solo marca stock bajo; el rojo solo errores y eliminar. La cifra principal de Inicio (valor del inventario) es la única superficie teñida de añil.

## Tipografía

**Archivo** (Google Fonts, variable con ejes `wdth` 62–125 y `wght` 100–900), una sola familia.

| Elemento | Tamaño | Peso | Ancho (`wdth`) |
|---|---|---|---|
| Título de página (`.tx-titulo-pagina`) | 2.375rem (1.875rem en móvil) | 760 | 80 |
| Cifra principal (`.tx-cifra-xl`) | 3rem | 680 | 76 |
| Cifras (`.tx-cifra`) | 2.125rem | 680 | 76 |
| Título de panel / sección | 1.0625–1.125rem | 700 | 88 |
| Cuerpo | 0.9375rem, interlineado 1.55 | 400 | 100 |
| Etiquetas de formulario | 0.875rem | 600 | 100 |
| Código de modelo (`.tx-codigo`) | 0.8125rem, `letter-spacing: .06em` | 600 | 82 |

Números con `tabular-nums` en tablas, precios y contadores. Los inputs usan 1rem para evitar el zoom de iOS.

## Forma y espacio

- Radios: 0.25rem (etiquetas de talla), 0.5rem (botones, inputs, chips), 0.75rem (paneles y tarjetas), 0.875rem (modales, paleta).
- Paneles con borde de 1px `--tx-borde`, sin sombra; las sombras (`--tx-sombra-1/2/3`) quedan para capas flotantes y el hover de tarjetas.
- Márgenes de página: `clamp(1rem, 3.2vw, 2.75rem)`; ancho máximo 90rem.
- Objetivos táctiles de 44 px en móvil (`pointer: coarse`).

## Layout

- **Escritorio (≥ 992 px):** barra lateral añil (`Navbar.jsx`, 15.5rem, contraíble a 4.75rem, estado en `localStorage`) + cabecera fija translúcida (`Header.jsx`: título de la app como `<h1>`, migas, buscador Ctrl+K).
- **Móvil:** cabecera compacta + barra inferior de 5 pestañas (Inicio, Lista, Registro destacado, Buscar, Más) con *safe areas*; "Más" abre una hoja inferior.
- **Inicio:** saludo + bajada con el resumen en una frase, banda de 4 cifras, franja tejida, Reponer pronto + barras por talla, recientes + accesos rápidos.
- **Lista:** barra de filtros (búsqueda, tipo, talla, tela, stock bajo, orden, vista) sincronizada con la URL; tabla densa o galería; panel lateral de detalle; barra flotante de selección.
- **Registro:** secciones en paneles (Identificación, Clasificación, Color, Precio y stock) + vista previa fija a la derecha; en móvil, barra de acciones fija abajo.

## Componentes

| Componente | Archivo | Notas |
|---|---|---|
| Muestra de tela | `MuestraTela.jsx`, `styles/telas.css` | Color desde `utils/colores.js` (mapa de colores en español + tono estable por hash); texturas: sarga (denim, drill), slub (lino), punto (lana), tafetán (algodón, pima), ripstop con brillo (poliéster) |
| Tarjeta de prenda | `TarjetaPrenda.jsx` | Galería, recientes y vista previa del formulario |
| Tabla | `TablaPrendas.jsx` | Encabezados ordenables (`aria-sort`), selección con casilla indeterminada, columnas que se ocultan por ancho |
| Panel lateral | `Drawer.jsx` | Derecha (detalle) o abajo (hoja móvil) |
| Modal | `Modal.jsx`, `ConfirmModal.jsx`, `LoginModal.jsx` | Foco inicial en la opción segura |
| Paleta de comandos | `PaletaComandos.jsx` | Combobox + listbox, sin animación de apertura |
| Toasts | `context/ToastProvider.jsx` | Renderizan `AlertMessage`; pausa al pasar el puntero, enfocar u ocultar la pestaña |
| Alertas en línea | `AlertMessage.jsx` | Errores de carga y validación general |
| Carga | `Loading.jsx` ("Loading...", telar animado), `Esqueleto.jsx` | Lista usa Loading; Inicio usa esqueletos |
| Estados vacíos | `EstadoVacio.jsx` | Ilustraciones SVG de línea: percha, lupa sobre tejido, hilo suelto |
| Gráficos | `Graficos.jsx` | `FranjaTejida` y `BarrasTallas`, CSS puro con `role="img"` y etiqueta descriptiva |

## Movimiento

Curvas: `--tx-ease-out: cubic-bezier(0.23, 1, 0.32, 1)` y `--tx-ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`.

| Qué | Duración | Por qué |
|---|---|---|
| Presión de botones y chips | 140 ms, `scale(0.97)` | Respuesta inmediata |
| Entrada de página | 260 ms, opacidad + 6 px | Continuidad al navegar |
| Franja tejida (Inicio) | 900 ms, `clip-path` de izquierda a derecha, una vez | Momento propio de la vista |
| Barras por talla | 700 ms, `scaleY` desde la base | Lectura del dato |
| Tarjetas de galería | 380 ms, escalonadas 38 ms (máx. 12) | Entrada del muestrario |
| Panel lateral / hoja | 320 ms entrada, 220 ms salida | Relación espacial con su borde |
| Modales | 220 ms entrada, 150 ms salida | |
| Toasts | Transiciones (no keyframes), colapso de altura al salir | Interrumpibles |
| Paleta de comandos | Sin animación | Se usa muchas veces al día |

`prefers-reduced-motion: reduce` deja solo fundidos de opacidad y detiene esqueletos, franja y barras.

## Accesibilidad

Enlace "Saltar al contenido", foco visible en añil (ámbar dentro de la barra lateral), trampas de foco y Esc en todas las capas (pila de capas en `useCapaModal`), `aria-live` en toasts y resultados, `aria-sort` en la tabla, `aria-pressed` en filtros y vistas, `role="switch"` en el tema, contraste AA en claro y oscuro.

## Atajos

`Ctrl/⌘ K` paleta · `?` ayuda · `N` nueva prenda · `/` buscar en la lista · `G` luego `I`/`L`/`R` · `Ctrl/⌘ S` guardar el formulario · `Esc` cerrar.
