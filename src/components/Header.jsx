import { Link } from 'react-router-dom'

// Encabezado con el título de la aplicación (requisito de la práctica).
function Header() {
  return (
    <header className="textil-header">
      <div className="container py-3 d-flex align-items-center gap-3">
        <span className="textil-marca" aria-hidden="true">
          <i className="bi bi-scissors" />
        </span>
        <div>
          <h1 className="textil-titulo-app m-0">
            <Link to="/" className="text-reset text-decoration-none">
              TextilApp
            </Link>
          </h1>
          <p className="m-0 small text-body-secondary">Inventario de prendas textiles</p>
        </div>
      </div>
    </header>
  )
}

export default Header
