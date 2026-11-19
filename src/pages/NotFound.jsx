import { Link, useLocation } from 'react-router-dom'

function NotFound() {
  const { pathname } = useLocation()

  return (
    <section className="text-center mx-auto py-4 py-md-5" style={{ maxWidth: '34rem' }}>
      <div className="d-inline-flex align-items-center gap-3 mb-4" aria-hidden="true">
        <span className="textil-404">404</span>
        <i className="bi bi-signpost-split fs-1 text-body-secondary" />
      </div>
      <h2 className="mb-3">Página no encontrada</h2>
      <p className="text-body-secondary mb-4">
        La dirección <code className="text-break">{pathname}</code> no existe en TextilApp. Revisa
        el enlace o vuelve al inicio para seguir trabajando con el inventario.
      </p>
      <div className="d-flex flex-wrap justify-content-center gap-2">
        <Link to="/" className="btn btn-primary d-inline-flex align-items-center gap-2">
          <i className="bi bi-house" aria-hidden="true" />
          Volver al inicio
        </Link>
        <Link to="/lista" className="btn btn-outline-secondary">
          Ver lista de prendas
        </Link>
      </div>
    </section>
  )
}

export default NotFound
