import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AlertMessage from '../components/AlertMessage.jsx'
import Loading from '../components/Loading.jsx'
import { TIPOS } from '../constants/prendas.js'
import { useAppContext } from '../context/AppContext.jsx'
import { getAll } from '../services/apiService.js'
import { formatearFecha, formatearPrecio, hoyISO } from '../utils/formato.js'

function Home() {
  const { usuario, config } = useAppContext()
  const [prendas, setPrendas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)

  function reintentar() {
    setCargando(true)
    setError('')
    setIntento((n) => n + 1)
  }

  useEffect(() => {
    let activo = true
    getAll()
      .then((datos) => {
        if (activo) setPrendas(datos)
      })
      .catch((e) => {
        if (activo) setError(e.message)
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [intento])

  const resumen = useMemo(() => {
    const unidades = prendas.reduce((total, prenda) => total + Number(prenda.stock || 0), 0)
    const valor = prendas.reduce(
      (total, prenda) => total + Number(prenda.precio || 0) * Number(prenda.stock || 0),
      0,
    )
    const conStockBajo = prendas
      .filter((prenda) => Number(prenda.stock) < config.stockMinimo)
      .sort((a, b) => a.stock - b.stock)
    const porTipo = TIPOS.map((tipo) => ({
      tipo,
      unidades: prendas
        .filter((prenda) => prenda.tipo === tipo)
        .reduce((total, prenda) => total + Number(prenda.stock || 0), 0),
    })).filter((fila) => fila.unidades > 0)
    const maximoPorTipo = Math.max(1, ...porTipo.map((fila) => fila.unidades))
    return { unidades, valor, conStockBajo, porTipo, maximoPorTipo }
  }, [prendas, config.stockMinimo])

  const saludo = usuario ? `Hola, ${usuario.nombre}` : 'Bienvenido a TextilApp'

  function contenido() {
    if (cargando) return <Loading />

    if (error) {
      return (
        <AlertMessage tipo="danger" mensaje={error}>
          <div className="mt-3">
            <button
              type="button"
              className="btn btn-sm btn-danger d-inline-flex align-items-center gap-2"
              onClick={reintentar}
            >
              <i className="bi bi-arrow-clockwise" aria-hidden="true" />
              Reintentar
            </button>
          </div>
        </AlertMessage>
      )
    }

    const cantidadBajo = resumen.conStockBajo.length

    return (
      <>
        <h3 className="visually-hidden">Resumen del inventario</h3>
        <div className="textil-resumen mb-4">
          <div>
            <p className="small text-body-secondary mb-2">Prendas registradas</p>
            <p className="textil-cifra mb-1">{prendas.length}</p>
            <p className="small text-body-secondary mb-0">modelos en catálogo</p>
          </div>
          <div>
            <p className="small text-body-secondary mb-2">Unidades en stock</p>
            <p className="textil-cifra mb-1">{resumen.unidades.toLocaleString('es-PE')}</p>
            <p className="small text-body-secondary mb-0">sumando todas las tallas</p>
          </div>
          <div>
            <p className="small text-body-secondary mb-2">Con stock bajo</p>
            <p className={`textil-cifra mb-1 ${cantidadBajo > 0 ? 'text-warning-emphasis' : ''}`}>
              {cantidadBajo}
            </p>
            <p className="small text-body-secondary mb-0">menos de {config.stockMinimo} unidades</p>
          </div>
          <div>
            <p className="small text-body-secondary mb-2">Valor del inventario</p>
            <p className="textil-cifra mb-1">{formatearPrecio(resumen.valor)}</p>
            <p className="small text-body-secondary mb-0">precio × stock</p>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-baseline gap-3 mb-3">
                  <h3 className="h5 mb-0">Reponer pronto</h3>
                  <Link to="/lista" className="small link-offset-2">
                    Ver lista completa
                  </Link>
                </div>
                {cantidadBajo === 0 ? (
                  <p className="text-body-secondary mb-0">
                    <i className="bi bi-check-circle me-2 text-success" aria-hidden="true" />
                    Todas las prendas tienen {config.stockMinimo} unidades o más.
                  </p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {resumen.conStockBajo.slice(0, 5).map((prenda) => (
                      <li
                        key={prenda.id}
                        className="list-group-item px-0 d-flex align-items-center justify-content-between gap-3"
                      >
                        <div style={{ minWidth: 0 }}>
                          <Link
                            to={`/registro/${prenda.id}`}
                            className="fw-medium link-body-emphasis text-decoration-none d-block text-truncate"
                          >
                            {prenda.nombre}
                          </Link>
                          <span className="small text-body-secondary">
                            <span className="textil-codigo">{prenda.codigo}</span> · Talla{' '}
                            {prenda.talla}
                          </span>
                        </div>
                        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle flex-shrink-0 textil-cifras">
                          {prenda.stock} unid.
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card h-100">
              <div className="card-body p-4">
                <h3 className="h5 mb-3">Unidades por tipo</h3>
                {resumen.porTipo.length === 0 ? (
                  <p className="text-body-secondary mb-0">Aún no hay unidades en stock.</p>
                ) : (
                  <ul className="list-unstyled mb-0 d-grid gap-3">
                    {resumen.porTipo.map((fila) => (
                      <li key={fila.tipo}>
                        <div className="d-flex justify-content-between small mb-1">
                          <span>{fila.tipo}</span>
                          <span className="textil-cifras text-body-secondary">{fila.unidades}</span>
                        </div>
                        <div className="textil-barra" aria-hidden="true">
                          <span
                            style={{ width: `${(fila.unidades / resumen.maximoPorTipo) * 100}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <section>
      <header className="textil-encabezado-pagina">
        <div>
          <h2>{saludo}</h2>
          <p className="text-body-secondary mb-0">
            Resumen del inventario de prendas al {formatearFecha(hoyISO())}.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/registro" className="btn btn-primary d-inline-flex align-items-center gap-2">
            <i className="bi bi-plus-lg" aria-hidden="true" />
            Registrar prenda
          </Link>
          <Link
            to="/lista"
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
          >
            <i className="bi bi-card-list" aria-hidden="true" />
            Ver lista
          </Link>
        </div>
      </header>

      {contenido()}
    </section>
  )
}

export default Home
