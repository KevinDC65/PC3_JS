import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'
import LoginModal from './LoginModal.jsx'

const ENLACES = [
  { ruta: '/', texto: 'Inicio', icono: 'bi-house', exacto: true },
  { ruta: '/registro', texto: 'Registro', icono: 'bi-plus-square' },
  { ruta: '/lista', texto: 'Lista', icono: 'bi-card-list' },
]

function Navbar() {
  const { usuario, logout, tema, alternarTema } = useAppContext()
  // El colapso del menú móvil se controla con estado de React (sin el JS de Bootstrap).
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [loginAbierto, setLoginAbierto] = useState(false)

  const cerrarMenu = () => setMenuAbierto(false)
  const esOscuro = tema === 'dark'

  return (
    <nav className="navbar navbar-expand-lg sticky-top py-0 textil-navbar" aria-label="Principal">
      <div className="container">
        <button
          type="button"
          className="navbar-toggler border-0 px-0 fw-medium textil-toggler"
          aria-controls="menu-principal"
          aria-expanded={menuAbierto}
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          <i className={`bi ${menuAbierto ? 'bi-x-lg' : 'bi-list'} fs-4`} aria-hidden="true" />
          <span className="fs-6">Menú</span>
        </button>

        <div className="d-flex align-items-center gap-2 py-2 ms-auto order-lg-last">
          <button
            type="button"
            className="btn btn-outline-secondary textil-boton-icono"
            onClick={alternarTema}
            aria-label={esOscuro ? 'Activar tema claro' : 'Activar tema oscuro'}
            title={esOscuro ? 'Tema claro' : 'Tema oscuro'}
          >
            <i className={`bi ${esOscuro ? 'bi-sun' : 'bi-moon-stars'}`} aria-hidden="true" />
          </button>

          {usuario ? (
            <>
              <span className="d-inline-flex align-items-center gap-2 ms-1">
                <span className="textil-avatar" aria-hidden="true">
                  {usuario.nombre.charAt(0).toUpperCase()}
                </span>
                <span
                  className="fw-medium text-truncate d-none d-sm-inline"
                  style={{ maxWidth: '10rem' }}
                >
                  {usuario.nombre}
                </span>
              </span>
              <button
                type="button"
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
                style={{ minHeight: '2.5rem' }}
                onClick={logout}
                aria-label={`Cerrar sesión de ${usuario.nombre}`}
              >
                <i className="bi bi-box-arrow-right" aria-hidden="true" />
                <span>Salir</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary d-inline-flex align-items-center gap-2"
              style={{ minHeight: '2.5rem' }}
              onClick={() => {
                cerrarMenu()
                setLoginAbierto(true)
              }}
            >
              <i className="bi bi-person" aria-hidden="true" />
              Ingresar
            </button>
          )}
        </div>

        <div
          className={`collapse navbar-collapse ${menuAbierto ? 'show' : ''}`}
          id="menu-principal"
        >
          <ul className="navbar-nav gap-lg-1 py-2 py-lg-0">
            {ENLACES.map((enlace) => (
              <li className="nav-item" key={enlace.ruta}>
                <NavLink
                  to={enlace.ruta}
                  end={enlace.exacto}
                  className="nav-link"
                  onClick={cerrarMenu}
                >
                  <i className={`bi ${enlace.icono}`} aria-hidden="true" />
                  {enlace.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <LoginModal abierto={loginAbierto} onCerrar={() => setLoginAbierto(false)} />
    </nav>
  )
}

export default Navbar
