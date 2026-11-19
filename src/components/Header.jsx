import { Link, useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'
import { useShell } from '../hooks/useShell.js'
import Marca from './Marca.jsx'
import { Tecla } from './Tecla.jsx'

/** Migas de pan de la ruta actual (el primer nivel siempre es el título de la app). */
function migasDe(pathname) {
  if (pathname === '/') return [{ texto: 'Inicio' }]
  if (pathname === '/lista') return [{ texto: 'Lista de prendas' }]
  if (pathname === '/registro') {
    return [{ texto: 'Lista', ruta: '/lista' }, { texto: 'Registrar prenda' }]
  }
  if (pathname.startsWith('/registro/')) {
    return [{ texto: 'Lista', ruta: '/lista' }, { texto: 'Editar prenda' }]
  }
  return [{ texto: 'Página no encontrada' }]
}

/**
 * Encabezado con el título de la aplicación (requisito de la práctica): "TextilApp" como
 * <h1>, la página actual en migas de pan y las acciones globales (buscar con Ctrl+K,
 * atajos y, en móvil, el tema).
 */
function Header() {
  const { pathname } = useLocation()
  const { tema, alternarTema } = useAppContext()
  const { abrir } = useShell()
  const migas = migasDe(pathname)
  const esOscuro = tema === 'dark'

  return (
    <header className="tx-header">
      <div className="tx-header-titulo">
        <span className="tx-header-marca" aria-hidden="true">
          <Marca />
        </span>
        <h1 className="tx-titulo-app">
          <Link to="/" className="tx-titulo-app-enlace">
            TextilApp
          </Link>
        </h1>
        <nav aria-label="Ruta de navegación" className="tx-migas">
          <ol>
            {migas.map((miga, indice) => (
              <li key={miga.texto} aria-current={indice === migas.length - 1 ? 'page' : undefined}>
                <i className="bi bi-chevron-right tx-migas-separador" aria-hidden="true" />
                {miga.ruta ? <Link to={miga.ruta}>{miga.texto}</Link> : <span>{miga.texto}</span>}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="tx-header-acciones">
        <button type="button" className="tx-buscador" onClick={() => abrir('paleta')}>
          <i className="bi bi-search" aria-hidden="true" />
          <span className="tx-buscador-texto">Buscar prendas o acciones</span>
          <Tecla mod className="tx-buscador-tecla">
            K
          </Tecla>
        </button>
        <button
          type="button"
          className="btn tx-boton-icono d-lg-none"
          onClick={alternarTema}
          aria-label={esOscuro ? 'Activar tema claro' : 'Activar tema oscuro'}
        >
          <i className={`bi ${esOscuro ? 'bi-sun' : 'bi-moon-stars'}`} aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

export default Header
