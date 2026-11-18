import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Registro from './pages/Registro.jsx'
import Lista from './pages/Lista.jsx'
import NotFound from './pages/NotFound.jsx'

// Layout principal: Header → Navbar → contenido de la ruta → Footer (pegado abajo con min-vh-100).
function App() {
  const { pathname } = useLocation()

  // Al cambiar de página se vuelve al inicio, como en una navegación normal.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="d-flex flex-column min-vh-100">
      <a
        href="#contenido"
        className="visually-hidden-focusable btn btn-primary position-absolute top-0 start-0 m-2 z-3"
      >
        Saltar al contenido
      </a>
      <Header />
      <Navbar />
      <main id="contenido" className="container flex-grow-1 py-4 py-lg-5" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/registro/:id" element={<Registro />} />
          <Route path="/lista" element={<Lista />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
