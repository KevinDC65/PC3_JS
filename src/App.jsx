import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Registro from './pages/Registro.jsx'
import Lista from './pages/Lista.jsx'
import NotFound from './pages/NotFound.jsx'

// TODO #1: completar el layout principal (Header + Navbar + contenido + Footer).
function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <Navbar />
      <main className="container flex-grow-1 py-4">
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
