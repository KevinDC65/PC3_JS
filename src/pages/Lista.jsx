import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AlertMessage from '../components/AlertMessage.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import Loading from '../components/Loading.jsx'
import { TALLAS, TIPOS } from '../constants/prendas.js'
import { useAppContext } from '../context/AppContext.jsx'
import { getAll, remove } from '../services/apiService.js'
import { formatearFecha, formatearPrecio } from '../utils/formato.js'

const ORDENES = [
  { valor: 'nombre-asc', texto: 'Nombre (A–Z)' },
  { valor: 'nombre-desc', texto: 'Nombre (Z–A)' },
  { valor: 'precio-asc', texto: 'Precio: menor a mayor' },
  { valor: 'precio-desc', texto: 'Precio: mayor a menor' },
  { valor: 'stock-asc', texto: 'Stock: menor a mayor' },
  { valor: 'stock-desc', texto: 'Stock: mayor a menor' },
]
const ORDEN_INICIAL = 'nombre-asc'

/** Minúsculas y sin tildes, para que "pantalon" encuentre "Pantalón". */
const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

function Lista() {
  const { config } = useAppContext()
  const location = useLocation()
  const navigate = useNavigate()

  const [prendas, setPrendas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)

  // Mensaje que llega desde Registro al guardar una edición (location.state).
  const [aviso, setAviso] = useState(() =>
    location.state?.mensaje ? { tipo: 'success', texto: location.state.mensaje } : null,
  )

  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroTalla, setFiltroTalla] = useState('')
  const [orden, setOrden] = useState(ORDEN_INICIAL)

  const [detalle, setDetalle] = useState(null)
  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const [aEliminar, setAEliminar] = useState(null)
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  // Una vez leído, se limpia el state del historial para que el mensaje no reaparezca al recargar.
  useEffect(() => {
    if (location.state?.mensaje) navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

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

  const prendasVisibles = useMemo(() => {
    const termino = normalizar(busqueda.trim())
    const filtradas = prendas.filter(
      (prenda) =>
        (!termino ||
          normalizar(prenda.codigo).includes(termino) ||
          normalizar(prenda.nombre).includes(termino)) &&
        (!filtroTipo || prenda.tipo === filtroTipo) &&
        (!filtroTalla || prenda.talla === filtroTalla),
    )
    const [campo, direccion] = orden.split('-')
    const factor = direccion === 'desc' ? -1 : 1
    return [...filtradas].sort((a, b) =>
      campo === 'nombre'
        ? a.nombre.localeCompare(b.nombre, 'es') * factor
        : (Number(a[campo]) - Number(b[campo])) * factor,
    )
  }, [prendas, busqueda, filtroTipo, filtroTalla, orden])

  const hayFiltros = Boolean(busqueda || filtroTipo || filtroTalla || orden !== ORDEN_INICIAL)
  const stockBajo = (prenda) => Number(prenda.stock) < config.stockMinimo

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroTipo('')
    setFiltroTalla('')
    setOrden(ORDEN_INICIAL)
  }

  function verDetalle(prenda) {
    setDetalle(prenda)
    setDetalleAbierto(true)
  }

  function pedirEliminacion(prenda) {
    setAEliminar(prenda)
    setConfirmacionAbierta(true)
  }

  async function confirmarEliminacion() {
    const prenda = aEliminar
    setEliminando(true)
    try {
      await remove(prenda.id)
      setPrendas((anteriores) => anteriores.filter((otra) => otra.id !== prenda.id))
      setAviso({
        tipo: 'success',
        texto: `Se eliminó la prenda ${prenda.codigo} · ${prenda.nombre}.`,
      })
    } catch (e) {
      setAviso({ tipo: 'danger', texto: e.message })
    } finally {
      setEliminando(false)
      setConfirmacionAbierta(false)
      // El aviso aparece arriba de la tabla: se lleva la vista hasta él tras cerrar el modal.
      const sinAnimacion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      setTimeout(() => window.scrollTo({ top: 0, behavior: sinAnimacion ? 'auto' : 'smooth' }), 160)
    }
  }

  const acciones = (prenda, conTexto = false) =>
    [
      {
        clave: 'ver',
        icono: 'bi-eye',
        texto: 'Ver',
        etiqueta: `Ver detalle de ${prenda.codigo}`,
        clase: 'btn-outline-secondary',
        onClick: () => verDetalle(prenda),
      },
      {
        clave: 'editar',
        icono: 'bi-pencil',
        texto: 'Editar',
        etiqueta: `Editar ${prenda.codigo}`,
        clase: 'btn-outline-secondary',
        onClick: () => navigate(`/registro/${prenda.id}`),
      },
      {
        clave: 'eliminar',
        icono: 'bi-trash3',
        texto: 'Eliminar',
        etiqueta: `Eliminar ${prenda.codigo}`,
        clase: 'btn-outline-danger',
        onClick: () => pedirEliminacion(prenda),
      },
    ].map((accion) => (
      <button
        key={accion.clave}
        type="button"
        className={`btn ${conTexto ? 'flex-fill' : 'btn-sm'} ${accion.clase} d-inline-flex align-items-center justify-content-center gap-2`}
        onClick={accion.onClick}
        aria-label={conTexto ? undefined : accion.etiqueta}
        title={conTexto ? undefined : accion.texto}
      >
        <i className={`bi ${accion.icono}`} aria-hidden="true" />
        {conTexto && accion.texto}
      </button>
    ))

  const insigniaStockBajo = (
    <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
      Stock bajo
    </span>
  )

  const unidades = prendas.reduce((total, prenda) => total + Number(prenda.stock || 0), 0)

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

    if (prendas.length === 0) {
      return (
        <div className="textil-vacio">
          <i className="bi bi-box-seam" aria-hidden="true" />
          <h3 className="h5 mt-3">Aún no hay prendas registradas</h3>
          <p className="text-body-secondary mb-4">
            Registra la primera prenda para empezar a controlar el inventario.
          </p>
          <Link to="/registro" className="btn btn-primary">
            Registrar prenda
          </Link>
        </div>
      )
    }

    return (
      <>
        <div className="textil-filtros mb-3">
          <div className="row g-2 g-md-3 align-items-end">
            <div className="col-12 col-lg-4">
              <label htmlFor="filtro-busqueda" className="form-label small">
                Buscar
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search" aria-hidden="true" />
                </span>
                <input
                  id="filtro-busqueda"
                  type="search"
                  className="form-control"
                  placeholder="Código o nombre"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <label htmlFor="filtro-tipo" className="form-label small">
                Tipo
              </label>
              <select
                id="filtro-tipo"
                className="form-select"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Todos</option>
                {TIPOS.map((tipo) => (
                  <option key={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <label htmlFor="filtro-talla" className="form-label small">
                Talla
              </label>
              <select
                id="filtro-talla"
                className="form-select"
                value={filtroTalla}
                onChange={(e) => setFiltroTalla(e.target.value)}
              >
                <option value="">Todas</option>
                {TALLAS.map((talla) => (
                  <option key={talla}>{talla}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4 col-lg-2">
              <label htmlFor="filtro-orden" className="form-label small">
                Ordenar por
              </label>
              <select
                id="filtro-orden"
                className="form-select"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
              >
                {ORDENES.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.texto}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-lg-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-100 d-inline-flex align-items-center justify-content-center gap-2"
                onClick={limpiarFiltros}
                disabled={!hayFiltros}
              >
                <i className="bi bi-x-circle" aria-hidden="true" />
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        <p className="small text-body-secondary mb-3" aria-live="polite">
          Mostrando <strong className="text-body">{prendasVisibles.length}</strong> de{' '}
          {prendas.length} prendas
        </p>

        {prendasVisibles.length === 0 ? (
          <div className="textil-vacio">
            <i className="bi bi-funnel" aria-hidden="true" />
            <h3 className="h5 mt-3">Ninguna prenda coincide con los filtros</h3>
            <p className="text-body-secondary mb-4">
              Prueba con otro código o nombre, o quita algún filtro.
            </p>
            <button type="button" className="btn btn-outline-primary" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div className="textil-tabla d-none d-lg-block">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <caption className="visually-hidden">
                    Prendas registradas en el inventario
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Código</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">Tipo</th>
                      <th scope="col">Tela</th>
                      <th scope="col">Talla</th>
                      <th scope="col">Color</th>
                      <th scope="col" className="text-end">
                        Precio
                      </th>
                      <th scope="col" className="text-end">
                        Stock
                      </th>
                      <th scope="col" className="text-end">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {prendasVisibles.map((prenda) => (
                      <tr key={prenda.id}>
                        <td className="textil-codigo text-nowrap">{prenda.codigo}</td>
                        <td className="fw-medium">{prenda.nombre}</td>
                        <td>{prenda.tipo}</td>
                        <td className="text-nowrap">{prenda.tela}</td>
                        <td>{prenda.talla}</td>
                        <td>{prenda.color}</td>
                        <td className="text-end text-nowrap">{formatearPrecio(prenda.precio)}</td>
                        <td className="text-end text-nowrap">
                          {stockBajo(prenda) && <span className="me-2">{insigniaStockBajo}</span>}
                          {prenda.stock}
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-1">{acciones(prenda)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <ul className="list-unstyled row row-cols-1 row-cols-md-2 g-3 d-lg-none mb-0">
              {prendasVisibles.map((prenda) => (
                <li key={prenda.id} className="col">
                  <article className="card h-100">
                    <div className="card-body d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <span className="textil-codigo text-body-secondary">{prenda.codigo}</span>
                        {stockBajo(prenda) && insigniaStockBajo}
                      </div>
                      <h3 className="h6 fw-semibold mb-0">{prenda.nombre}</h3>
                      <p className="small text-body-secondary mb-0">
                        {prenda.tipo} · {prenda.tela} · Talla {prenda.talla} · {prenda.color}
                      </p>
                      <div className="d-flex justify-content-between align-items-baseline mt-1">
                        <span className="textil-cifra fs-4">{formatearPrecio(prenda.precio)}</span>
                        <span className="small">
                          <strong>{prenda.stock}</strong> unid.
                        </span>
                      </div>
                      <div className="d-flex gap-2 mt-auto pt-2">{acciones(prenda, true)}</div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </>
        )}
      </>
    )
  }

  return (
    <section>
      <header className="textil-encabezado-pagina">
        <div>
          <h2>Lista de prendas</h2>
          <p className="text-body-secondary mb-0">
            {cargando || error
              ? 'Inventario completo de prendas registradas.'
              : `${prendas.length} prendas · ${unidades} unidades en stock.`}
          </p>
        </div>
        <Link to="/registro" className="btn btn-primary d-inline-flex align-items-center gap-2">
          <i className="bi bi-plus-lg" aria-hidden="true" />
          Registrar prenda
        </Link>
      </header>

      <AlertMessage
        tipo={aviso?.tipo}
        mensaje={aviso?.texto}
        onClose={() => setAviso(null)}
        autoCerrar={aviso?.tipo === 'success' ? 6000 : undefined}
      />

      {contenido()}

      <ConfirmModal
        abierto={detalleAbierto}
        titulo={detalle?.nombre ?? 'Detalle de la prenda'}
        textoConfirmar="Editar prenda"
        iconoConfirmar="bi-pencil"
        textoCancelar="Cerrar"
        onConfirm={() => navigate(`/registro/${detalle.id}`)}
        onCancel={() => setDetalleAbierto(false)}
      >
        {detalle && (
          <>
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="textil-codigo text-body-secondary">{detalle.codigo}</span>
              {stockBajo(detalle) && insigniaStockBajo}
            </div>
            <dl className="row mb-0 small">
              <dt className="col-5 fw-normal text-body-secondary">Tipo</dt>
              <dd className="col-7">{detalle.tipo}</dd>
              <dt className="col-5 fw-normal text-body-secondary">Tela</dt>
              <dd className="col-7">{detalle.tela}</dd>
              <dt className="col-5 fw-normal text-body-secondary">Talla</dt>
              <dd className="col-7">{detalle.talla}</dd>
              <dt className="col-5 fw-normal text-body-secondary">Color</dt>
              <dd className="col-7">{detalle.color}</dd>
              <dt className="col-5 fw-normal text-body-secondary">Precio</dt>
              <dd className="col-7 textil-cifras">{formatearPrecio(detalle.precio)}</dd>
              <dt className="col-5 fw-normal text-body-secondary">Stock</dt>
              <dd className="col-7 textil-cifras">{detalle.stock} unidades</dd>
              <dt className="col-5 fw-normal text-body-secondary">Valor en stock</dt>
              <dd className="col-7 textil-cifras">
                {formatearPrecio(Number(detalle.precio) * Number(detalle.stock))}
              </dd>
              <dt className="col-5 fw-normal text-body-secondary">Registrada</dt>
              <dd className="col-7 mb-0">{formatearFecha(detalle.fechaRegistro)}</dd>
            </dl>
          </>
        )}
      </ConfirmModal>

      <ConfirmModal
        abierto={confirmacionAbierta}
        titulo="Eliminar prenda"
        textoConfirmar="Eliminar"
        iconoConfirmar="bi-trash3"
        varianteConfirmar="danger"
        cargando={eliminando}
        onConfirm={confirmarEliminacion}
        onCancel={() => setConfirmacionAbierta(false)}
      >
        {aEliminar && (
          <>
            <p className="mb-2">¿Seguro que deseas eliminar esta prenda del inventario?</p>
            <p className="mb-2 p-3 rounded bg-body-tertiary border">
              <span className="textil-codigo d-block text-body-secondary">{aEliminar.codigo}</span>
              <strong>{aEliminar.nombre}</strong>
            </p>
            <p className="small text-body-secondary mb-0">Esta acción no se puede deshacer.</p>
          </>
        )}
      </ConfirmModal>
    </section>
  )
}

export default Lista
