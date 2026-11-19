import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AlertMessage from '../components/AlertMessage.jsx'
import Esqueleto from '../components/Esqueleto.jsx'
import EstadoVacio from '../components/EstadoVacio.jsx'
import { BarrasTallas, FranjaTejida } from '../components/Graficos.jsx'
import MuestraTela from '../components/MuestraTela.jsx'
import TarjetaPrenda from '../components/TarjetaPrenda.jsx'
import { Tecla } from '../components/Tecla.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { useShell } from '../hooks/useShell.js'
import { getAll } from '../services/apiService.js'
import { formatearFecha, formatearPrecio, hoyISO } from '../utils/formato.js'
import { resumirInventario } from '../utils/inventario.js'

/** Saludo según la hora local. */
function saludoDelMomento() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const plural = (cantidad, singular, varias) => `${cantidad} ${cantidad === 1 ? singular : varias}`

function Home() {
  const { usuario, config } = useAppContext()
  const { abrir } = useShell()
  const navigate = useNavigate()
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

  const resumen = useMemo(
    () => resumirInventario(prendas, config.stockMinimo),
    [prendas, config.stockMinimo],
  )

  const saludo = usuario ? `${saludoDelMomento()}, ${usuario.nombre}` : saludoDelMomento()
  const porReponer = resumen.conStockBajo.length

  function bajada() {
    if (cargando) return 'Preparando el resumen del inventario…'
    if (error || resumen.prendas === 0)
      return `Resumen del inventario al ${formatearFecha(hoyISO())}.`
    return (
      <>
        Hay <strong>{plural(resumen.unidades, 'unidad', 'unidades')}</strong> en{' '}
        {plural(resumen.prendas, 'modelo', 'modelos')}
        {porReponer > 0 ? (
          <>
            {' '}
            y <strong>{plural(porReponer, 'prenda necesita', 'prendas necesitan')}</strong>{' '}
            reposición.
          </>
        ) : (
          '. Todo el stock está sobre el mínimo.'
        )}
      </>
    )
  }

  function contenido() {
    if (cargando) return <EsqueletoInicio />

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

    if (resumen.prendas === 0) {
      return (
        <EstadoVacio
          ilustracion="percha"
          titulo="El inventario está vacío"
          acciones={
            <Link to="/registro" className="btn btn-primary">
              Registrar la primera prenda
            </Link>
          }
        >
          Cuando registres prendas verás aquí el valor del inventario, lo que hay que reponer y cómo
          se reparte el stock por tipo y talla.
        </EstadoVacio>
      )
    }

    return (
      <>
        <dl className="tx-cifras">
          <div className="tx-cifra-lider">
            <dt>Valor del inventario</dt>
            <dd className="tx-cifra tx-cifra-xl">{formatearPrecio(resumen.valor)}</dd>
            <dd className="tx-cifra-nota">precio × stock de todas las prendas</dd>
          </div>
          <div>
            <dt>Prendas</dt>
            <dd className="tx-cifra">{resumen.prendas}</dd>
            <dd className="tx-cifra-nota">modelos en catálogo</dd>
          </div>
          <div>
            <dt>Unidades</dt>
            <dd className="tx-cifra">{resumen.unidades.toLocaleString('es-PE')}</dd>
            <dd className="tx-cifra-nota">en todas las tallas</dd>
          </div>
          <div data-alerta={porReponer > 0}>
            <dt>Stock bajo</dt>
            <dd className="tx-cifra">{porReponer}</dd>
            <dd className="tx-cifra-nota">
              {porReponer > 0 ? (
                <Link to="/lista?stock=bajo&orden=stock-asc" className="tx-enlace">
                  menos de {config.stockMinimo} unid. · ver
                </Link>
              ) : (
                `todas con ${config.stockMinimo} o más`
              )}
            </dd>
          </div>
        </dl>

        <section className="tx-panel" aria-labelledby="titulo-tipos">
          <div className="tx-panel-cabecera">
            <h3 id="titulo-tipos" className="tx-panel-titulo">
              Unidades por tipo de prenda
            </h3>
            <p className="tx-panel-nota">Cada franja, un tipo; su ancho, sus unidades.</p>
          </div>
          <FranjaTejida porTipo={resumen.porTipo} total={resumen.unidades} />
        </section>

        <div className="tx-rejilla-inicio">
          <section className="tx-panel" aria-labelledby="titulo-reponer">
            <div className="tx-panel-cabecera">
              <h3 id="titulo-reponer" className="tx-panel-titulo">
                Reponer pronto
              </h3>
              <Link to="/lista?stock=bajo&orden=stock-asc" className="tx-enlace small">
                Ver todas
              </Link>
            </div>
            {porReponer === 0 ? (
              <p className="text-body-secondary mb-0">
                <i className="bi bi-check-circle me-2 text-success" aria-hidden="true" />
                Todas las prendas tienen {config.stockMinimo} unidades o más.
              </p>
            ) : (
              <ul className="tx-reponer">
                {resumen.conStockBajo.slice(0, 5).map((prenda) => (
                  <li key={prenda.id}>
                    <MuestraTela color={prenda.color} tela={prenda.tela} forma="chip" />
                    <div className="tx-reponer-texto">
                      <Link to={`/registro/${prenda.id}`} className="tx-reponer-nombre">
                        {prenda.nombre}
                      </Link>
                      <span className="tx-reponer-meta">
                        <span className="tx-codigo">{prenda.codigo}</span> · Talla {prenda.talla}
                      </span>
                    </div>
                    <div className="tx-reponer-stock">
                      <span className="tx-cifras-tabla">
                        {prenda.stock}
                        <span className="text-body-secondary">/{config.stockMinimo}</span>
                      </span>
                      <span className="tx-medidor" aria-hidden="true">
                        <span
                          style={{
                            '--nivel': `${Math.min(1, Number(prenda.stock) / config.stockMinimo) * 100}%`,
                          }}
                        />
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="tx-panel" aria-labelledby="titulo-tallas">
            <div className="tx-panel-cabecera">
              <h3 id="titulo-tallas" className="tx-panel-titulo">
                Unidades por talla
              </h3>
            </div>
            <BarrasTallas porTalla={resumen.porTalla} />
          </section>
        </div>

        <div className="tx-rejilla-inicio tx-rejilla-inicio-b">
          <section aria-labelledby="titulo-recientes">
            <div className="tx-panel-cabecera">
              <h3 id="titulo-recientes" className="tx-panel-titulo">
                Registradas recientemente
              </h3>
              <Link to="/lista?orden=fechaRegistro-desc" className="tx-enlace small">
                Ver por fecha
              </Link>
            </div>
            <ul className="tx-recientes">
              {resumen.recientes.map((prenda, indice) => (
                <li key={prenda.id}>
                  <TarjetaPrenda
                    prenda={prenda}
                    minimo={config.stockMinimo}
                    variante="compacta"
                    indice={indice}
                    onAbrir={() => navigate(`/lista?prenda=${prenda.id}`)}
                  />
                  <p className="tx-recientes-fecha">{formatearFecha(prenda.fechaRegistro)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="titulo-accesos">
            <div className="tx-panel-cabecera">
              <h3 id="titulo-accesos" className="tx-panel-titulo">
                Accesos rápidos
              </h3>
            </div>
            <ul className="tx-accesos">
              <li>
                <Link to="/registro" className="tx-acceso">
                  <i className="bi bi-plus-lg" aria-hidden="true" />
                  <span>Registrar prenda</span>
                  <Tecla>N</Tecla>
                </Link>
              </li>
              <li>
                <button type="button" className="tx-acceso" onClick={() => abrir('paleta')}>
                  <i className="bi bi-search" aria-hidden="true" />
                  <span>Buscar por código o nombre</span>
                  <Tecla mod>K</Tecla>
                </button>
              </li>
              <li>
                <Link to="/lista" className="tx-acceso">
                  <i className="bi bi-grid-3x2-gap" aria-hidden="true" />
                  <span>Ver lista y galería</span>
                  <span className="tx-acceso-teclas">
                    <Tecla>G</Tecla>
                    <Tecla>L</Tecla>
                  </span>
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </>
    )
  }

  return (
    <section className="tx-inicio" aria-labelledby="titulo-inicio">
      <header className="tx-cabecera-pagina">
        <div>
          <h2 id="titulo-inicio" className="tx-titulo-pagina">
            {saludo}
          </h2>
          <p className="tx-bajada">{bajada()}</p>
        </div>
        <div className="tx-cabecera-acciones">
          <Link to="/registro" className="btn btn-primary d-inline-flex align-items-center gap-2">
            <i className="bi bi-plus-lg" aria-hidden="true" />
            Registrar prenda
          </Link>
          <Link
            to="/lista"
            className="btn btn-outline-secondary d-none d-sm-inline-flex align-items-center gap-2"
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

/** Esqueleto con la forma del panel mientras llega la respuesta de la API. */
function EsqueletoInicio() {
  return (
    <div aria-busy="true">
      <p className="visually-hidden" role="status">
        Cargando el resumen del inventario.
      </p>
      <div className="tx-cifras" aria-hidden="true">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className={n === 0 ? 'tx-cifra-lider' : ''}>
            <Esqueleto ancho="45%" alto="0.75rem" />
            <Esqueleto
              ancho={n === 0 ? '80%' : '50%'}
              alto={n === 0 ? '3rem' : '2.25rem'}
              className="mt-3"
            />
            <Esqueleto ancho="60%" alto="0.75rem" className="mt-2" />
          </div>
        ))}
      </div>
      <div className="tx-panel" aria-hidden="true">
        <Esqueleto ancho="30%" alto="1rem" />
        <Esqueleto alto="2.75rem" className="mt-3" />
        <div className="d-flex flex-wrap gap-3 mt-3">
          {[0, 1, 2, 3, 4].map((n) => (
            <Esqueleto key={n} ancho="5.5rem" alto="0.875rem" />
          ))}
        </div>
      </div>
      <div className="tx-rejilla-inicio" aria-hidden="true">
        {[0, 1].map((n) => (
          <div key={n} className="tx-panel">
            <Esqueleto ancho="40%" alto="1rem" />
            {[0, 1, 2, 3].map((fila) => (
              <Esqueleto key={fila} alto="2.25rem" className="mt-3" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
