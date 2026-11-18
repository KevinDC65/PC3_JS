import { Link } from 'react-router-dom'

// TODO #3: navbar de Bootstrap responsive con NavLink (enlace activo resaltado).
// TODO #17: botón de tema claro/oscuro.
// TODO #20: mostrar el usuario autenticado desde AppContext.
function Navbar() {
  return (
    <nav className="container py-2">
      <Link to="/">Inicio</Link> | <Link to="/registro">Registro</Link> |{' '}
      <Link to="/lista">Lista</Link>
    </nav>
  )
}

export default Navbar
