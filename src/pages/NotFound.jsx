import { Link, useLocation } from 'react-router-dom'
import { Tecla } from '../components/Tecla.jsx'
import { useShell } from '../hooks/useShell.js'

function NotFound() {
  const { pathname } = useLocation()
  const { abrir } = useShell()

  return (
    <section className="tx-404" aria-labelledby="titulo-404">
      <div className="tx-404-etiqueta" aria-hidden="true">
        <span className="tx-404-cifra">404</span>
        <span className="tx-404-talla">Talla única · sin stock</span>
      </div>
      <h2 id="titulo-404" className="tx-titulo-pagina">
        Página no encontrada
      </h2>
      <p className="tx-bajada">
        La dirección <code className="tx-404-ruta">{pathname}</code> no existe en TextilApp. Revisa
        el enlace o sigue desde una de estas opciones.
      </p>
      <div className="tx-404-acciones">
        <Link to="/" className="btn btn-primary d-inline-flex align-items-center gap-2">
          <i className="bi bi-house" aria-hidden="true" />
          Volver al inicio
        </Link>
        <Link to="/lista" className="btn btn-outline-secondary">
          Ver lista de prendas
        </Link>
        <button
          type="button"
          className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
          onClick={() => abrir('paleta')}
        >
          <i className="bi bi-search" aria-hidden="true" />
          Buscar
          <Tecla mod>K</Tecla>
        </button>
      </div>
    </section>
  )
}

export default NotFound
