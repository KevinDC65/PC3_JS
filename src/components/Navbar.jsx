import { Link, NavLink } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'
import { useConteoInventario } from '../hooks/useConteoInventario.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { useShell } from '../hooks/useShell.js'
import Drawer from './Drawer.jsx'
import Marca from './Marca.jsx'

const ENLACES = [
  { ruta: '/', texto: 'Inicio', icono: 'bi-house', exacto: true, atajo: 'G I' },
  { ruta: '/registro', texto: 'Registro', icono: 'bi-plus-square', atajo: 'N' },
  { ruta: '/lista', texto: 'Lista', icono: 'bi-card-list', atajo: 'G L' },
]

/**
 * Navegación principal con enlaces de React Router (NavLink marca la página activa).
 * - Escritorio (≥ 992 px): barra lateral con marca, enlaces, contadores del inventario,
 *   sesión y tema al pie. Se contrae a solo íconos y el estado se recuerda (useLocalStorage).
 * - Móvil: barra inferior al alcance del pulgar y una hoja "Más" con sesión y tema.
 */
function Navbar() {
  const { usuario, logout, tema, alternarTema, config } = useAppContext()
  const { panel, abrir, cerrar } = useShell()
  const [colapsada, setColapsada] = useLocalStorage('textilapp:barra-colapsada', false)
  const conteo = useConteoInventario(config.stockMinimo)
  const esOscuro = tema === 'dark'

  const contador = (ruta) => {
    if (ruta === '/lista' && conteo.total !== null) return conteo.total
    return null
  }

  return (
    <>
      <div className="tx-riel-columna">
        <aside className="tx-riel" id="barra-lateral" data-colapsada={colapsada}>
          <div className="tx-riel-marca">
            <Link to="/" className="tx-marca" title="TextilApp · Inicio">
              <Marca />
              <span className="tx-riel-texto tx-marca-texto">
                <span className="tx-marca-nombre">TextilApp</span>
                <span className="tx-marca-sub">Inventario textil</span>
              </span>
            </Link>
          </div>
          <span className="tx-awayu" aria-hidden="true" />

          <nav aria-label="Principal">
            <ul className="tx-riel-enlaces">
              {ENLACES.map((enlace) => (
                <li key={enlace.ruta}>
                  <NavLink
                    to={enlace.ruta}
                    end={enlace.exacto}
                    className="tx-riel-enlace"
                    title={colapsada ? enlace.texto : undefined}
                  >
                    <i className={`bi ${enlace.icono}`} aria-hidden="true" />
                    <span className="tx-riel-texto">{enlace.texto}</span>
                    {contador(enlace.ruta) !== null && (
                      <span className="tx-riel-contador tx-riel-texto">
                        {contador(enlace.ruta)}
                        <span className="visually-hidden"> prendas</span>
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {conteo.stockBajo > 0 && (
            <Link
              to="/lista?stock=bajo&orden=stock-asc"
              className="tx-riel-alerta"
              title={`${conteo.stockBajo} prendas con stock bajo`}
            >
              <span className="tx-riel-alerta-punto" aria-hidden="true" />
              <span className="tx-riel-texto">
                <strong>{conteo.stockBajo}</strong> por reponer
              </span>
              <span className="visually-hidden"> (menos de {config.stockMinimo} unidades)</span>
            </Link>
          )}

          <div className="tx-riel-pie">
            {usuario ? (
              <div className="tx-riel-usuario">
                <span className="tx-avatar" aria-hidden="true">
                  {usuario.nombre.charAt(0).toUpperCase()}
                </span>
                <span className="tx-riel-texto tx-riel-usuario-nombre" title={usuario.nombre}>
                  {usuario.nombre}
                </span>
                <button
                  type="button"
                  className="tx-riel-icono tx-riel-salir"
                  onClick={logout}
                  aria-label={`Cerrar sesión de ${usuario.nombre}`}
                  title="Cerrar sesión"
                >
                  <i className="bi bi-box-arrow-right" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="tx-riel-enlace tx-riel-ingresar"
                onClick={() => abrir('login')}
                title={colapsada ? 'Ingresar' : undefined}
              >
                <i className="bi bi-person-circle" aria-hidden="true" />
                <span className="tx-riel-texto">Ingresar</span>
              </button>
            )}

            <div className="tx-riel-herramientas">
              <button
                type="button"
                className="tx-riel-icono"
                onClick={alternarTema}
                aria-label={esOscuro ? 'Activar tema claro' : 'Activar tema oscuro'}
                title={esOscuro ? 'Tema claro' : 'Tema oscuro'}
              >
                <i className={`bi ${esOscuro ? 'bi-sun' : 'bi-moon-stars'}`} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="tx-riel-icono"
                onClick={() => abrir('ayuda')}
                aria-label="Ver atajos de teclado"
                title="Atajos de teclado (?)"
              >
                <i className="bi bi-keyboard" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="tx-riel-icono ms-auto tx-riel-contraer"
                onClick={() => setColapsada((valor) => !valor)}
                aria-expanded={!colapsada}
                aria-controls="barra-lateral"
                aria-label={colapsada ? 'Expandir barra lateral' : 'Contraer barra lateral'}
                title={colapsada ? 'Expandir' : 'Contraer'}
              >
                <i
                  className={`bi ${colapsada ? 'bi-layout-sidebar' : 'bi-layout-sidebar-inset'}`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </aside>
      </div>

      <nav className="tx-tabbar" aria-label="Navegación móvil">
        <NavLink to="/" end className="tx-tab">
          <i className="bi bi-house" aria-hidden="true" />
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/lista" className="tx-tab">
          <i className="bi bi-card-list" aria-hidden="true" />
          <span>Lista</span>
        </NavLink>
        <NavLink to="/registro" className="tx-tab tx-tab-principal">
          <span className="tx-tab-boton">
            <i className="bi bi-plus-lg" aria-hidden="true" />
          </span>
          <span>Registro</span>
        </NavLink>
        <button type="button" className="tx-tab" onClick={() => abrir('paleta')}>
          <i className="bi bi-search" aria-hidden="true" />
          <span>Buscar</span>
        </button>
        <button
          type="button"
          className="tx-tab"
          onClick={() => abrir('mas')}
          aria-expanded={panel === 'mas'}
          aria-haspopup="dialog"
        >
          {usuario ? (
            <span className="tx-avatar tx-avatar-sm" aria-hidden="true">
              {usuario.nombre.charAt(0).toUpperCase()}
            </span>
          ) : (
            <i className="bi bi-three-dots" aria-hidden="true" />
          )}
          <span>Más</span>
        </button>
      </nav>

      <Drawer abierto={panel === 'mas'} onCerrar={cerrar} titulo="Más opciones" lado="abajo">
        <div className="tx-hoja-seccion">
          {usuario ? (
            <div className="d-flex align-items-center gap-3">
              <span className="tx-avatar tx-avatar-lg" aria-hidden="true">
                {usuario.nombre.charAt(0).toUpperCase()}
              </span>
              <div className="flex-grow-1 min-w-0">
                <p className="mb-0 fw-semibold text-truncate">{usuario.nombre}</p>
                <p className="mb-0 small text-body-secondary">Sesión simulada activa</p>
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  logout()
                  cerrar()
                }}
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2"
              onClick={() => abrir('login')}
            >
              <i className="bi bi-person-circle" aria-hidden="true" />
              Ingresar
            </button>
          )}
        </div>
        <ul className="tx-hoja-lista">
          <li>
            <button
              type="button"
              className="tx-hoja-fila"
              role="switch"
              aria-checked={esOscuro}
              onClick={alternarTema}
            >
              <i className="bi bi-moon-stars" aria-hidden="true" />
              <span className="flex-grow-1">Tema oscuro</span>
              <span className="tx-interruptor" aria-hidden="true" />
            </button>
          </li>
          <li>
            <Link to="/lista?stock=bajo&orden=stock-asc" className="tx-hoja-fila" onClick={cerrar}>
              <i className="bi bi-exclamation-triangle" aria-hidden="true" />
              <span className="flex-grow-1">Por reponer</span>
              {conteo.stockBajo !== null && (
                <span className="tx-riel-contador">{conteo.stockBajo}</span>
              )}
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/KevinDC65/PC3_JS"
              target="_blank"
              rel="noreferrer"
              className="tx-hoja-fila"
            >
              <i className="bi bi-github" aria-hidden="true" />
              <span className="flex-grow-1">Repositorio en GitHub</span>
              <i className="bi bi-box-arrow-up-right small" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </Drawer>
    </>
  )
}

export default Navbar
