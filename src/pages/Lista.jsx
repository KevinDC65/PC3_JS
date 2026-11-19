import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import AlertMessage from '../components/AlertMessage.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import DetallePrenda from '../components/DetallePrenda.jsx'
import Drawer from '../components/Drawer.jsx'
import Esqueleto from '../components/Esqueleto.jsx'
import EstadoVacio from '../components/EstadoVacio.jsx'
import Loading from '../components/Loading.jsx'
import MuestraTela from '../components/MuestraTela.jsx'
import TablaPrendas from '../components/TablaPrendas.jsx'
import TarjetaPrenda from '../components/TarjetaPrenda.jsx'
import { Tecla } from '../components/Tecla.jsx'
import { TALLAS, TELAS, TIPOS } from '../constants/prendas.js'
import { useAppContext } from '../context/AppContext.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { useToast } from '../hooks/useToast.js'
import { getAll, remove } from '../services/apiService.js'
import {
  CAMPOS_ORDEN,
  avisarCambioInventario,
  filtrarPrendas,
  ordenarPrendas,
} from '../utils/inventario.js'

const ORDENES = [
  { valor: 'nombre-asc', texto: 'Nombre (A–Z)' },
  { valor: 'nombre-desc', texto: 'Nombre (Z–A)' },
  { valor: 'precio-asc', texto: 'Precio: menor a mayor' },
  { valor: 'precio-desc', texto: 'Precio: mayor a menor' },
  { valor: 'stock-asc', texto: 'Stock: menor a mayor' },
  { valor: 'stock-desc', texto: 'Stock: mayor a menor' },
  { valor: 'fechaRegistro-desc', texto: 'Más recientes primero' },
  { valor: 'codigo-asc', texto: 'Código' },
]
const ORDEN_INICIAL = 'nombre-asc'

/** Valida un parámetro de la URL contra una lista; si no es válido, se ignora. */
const valorPermitido = (valor, permitidos) => (permitidos.includes(valor) ? valor : '')

/** Lee los filtros desde los parámetros de la URL. */
function leerFiltros(parametros, minimo) {
  return {
    texto: parametros.get('q') ?? '',
    tipo: valorPermitido(parametros.get('tipo'), TIPOS),
    talla: valorPermitido(parametros.get('talla'), TALLAS),
    tela: valorPermitido(parametros.get('tela'), TELAS),
    soloStockBajo: parametros.get('stock') === 'bajo',
    minimo,
  }
}

function ordenValido(valor) {
  const [campo, direccion] = String(valor ?? '').split('-')
  return CAMPOS_ORDEN.includes(campo) && ['asc', 'desc'].includes(direccion)
    ? `${campo}-${direccion}`
    : ORDEN_INICIAL
}

function Lista() {
  const { config } = useAppContext()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [parametros, setParametros] = useSearchParams()

  const [prendas, setPrendas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)

  const [vista, setVista] = useLocalStorage('textilapp:vista-lista', 'tabla')
  const [seleccion, setSeleccion] = useState(() => new Set())
  const [eliminacion, setEliminacion] = useState({ abierta: false, prendas: [] })
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminacion, setErrorEliminacion] = useState('')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const busquedaRef = useRef(null)

  // Los filtros viven en la URL (?q=&tipo=&talla=&tela=&stock=bajo&orden=&prenda=)
  // para que una vista filtrada se pueda compartir o guardar como marcador.
  const filtros = leerFiltros(parametros, config.stockMinimo)

  // El texto de búsqueda se guarda también en estado local: la lista se filtra al instante
  // mientras se escribe y la URL (?q=) se actualiza un momento después.
  const [textoBusqueda, setTextoBusqueda] = useState(filtros.texto)
  const escritoRef = useRef(filtros.texto)
  const temporizadorRef = useRef(null)

  useEffect(() => {
    if (filtros.texto !== escritoRef.current) {
      escritoRef.current = filtros.texto
      setTextoBusqueda(filtros.texto)
    }
  }, [filtros.texto])

  useEffect(() => () => clearTimeout(temporizadorRef.current), [])

  function buscar(texto) {
    setTextoBusqueda(texto)
    escritoRef.current = texto
    clearTimeout(temporizadorRef.current)
    temporizadorRef.current = setTimeout(() => cambiarParametros({ q: texto }), 250)
  }
  const orden = ordenValido(parametros.get('orden'))
  const idDetalle = parametros.get('prenda')
  const vistaActual = vista === 'galeria' ? 'galeria' : 'tabla'

  function cambiarParametros(cambios) {
    setParametros(
      (anteriores) => {
        const nuevos = new URLSearchParams(anteriores)
        for (const [clave, valor] of Object.entries(cambios)) {
          if (valor === '' || valor === null || valor === undefined || valor === false) {
            nuevos.delete(clave)
          } else {
            nuevos.set(clave, valor)
          }
        }
        return nuevos
      },
      { replace: true },
    )
  }

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

  // El atajo "/" desde otra página llega con esta marca para enfocar la búsqueda.
  useEffect(() => {
    if (!cargando && location.state?.enfocarBusqueda) {
      busquedaRef.current?.focus()
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
    }
  }, [cargando, location, navigate])

  const prendasVisibles = useMemo(
    () =>
      ordenarPrendas(
        filtrarPrendas(prendas, {
          ...leerFiltros(parametros, config.stockMinimo),
          texto: textoBusqueda,
        }),
        ordenValido(parametros.get('orden')),
      ),
    [prendas, parametros, config.stockMinimo, textoBusqueda],
  )

  const detalle = idDetalle ? prendas.find((prenda) => String(prenda.id) === idDetalle) : null
  const seleccionadas = prendasVisibles.filter((prenda) => seleccion.has(prenda.id))
  const hayFiltros = Boolean(
    textoBusqueda || filtros.tipo || filtros.talla || filtros.tela || filtros.soloStockBajo,
  )
  const cantidadFiltros = [filtros.tipo, filtros.talla, filtros.tela, filtros.soloStockBajo].filter(
    Boolean,
  ).length
  const unidades = prendas.reduce((total, prenda) => total + Number(prenda.stock || 0), 0)

  function limpiarFiltros() {
    buscar('')
    cambiarParametros({ q: '', tipo: '', talla: '', tela: '', stock: '' })
  }

  function ordenarPor(campo) {
    const [campoActual, direccion] = orden.split('-')
    const nueva = campoActual === campo && direccion === 'asc' ? 'desc' : 'asc'
    cambiarParametros({ orden: `${campo}-${nueva}` === ORDEN_INICIAL ? '' : `${campo}-${nueva}` })
  }

  function alternarSeleccion(id) {
    setSeleccion((anterior) => {
      const nueva = new Set(anterior)
      if (nueva.has(id)) nueva.delete(id)
      else nueva.add(id)
      return nueva
    })
  }

  function seleccionarTodas(marcar) {
    setSeleccion((anterior) => {
      const nueva = new Set(anterior)
      for (const prenda of prendasVisibles) {
        if (marcar) nueva.add(prenda.id)
        else nueva.delete(prenda.id)
      }
      return nueva
    })
  }

  const abrirDetalle = (prenda) => cambiarParametros({ prenda: prenda.id })
  const cerrarDetalle = () => cambiarParametros({ prenda: '' })
  const editar = (prenda) => navigate(`/registro/${prenda.id}`)
  const pedirEliminacion = (lista) => {
    setErrorEliminacion('')
    setEliminacion({ abierta: true, prendas: lista })
  }

  async function confirmarEliminacion() {
    const lista = eliminacion.prendas
    setEliminando(true)
    const eliminadas = []
    const fallidas = []
    // Una petición DELETE por prenda (apiService.remove), en orden.
    for (const prenda of lista) {
      try {
        await remove(prenda.id)
        eliminadas.push(prenda)
      } catch (e) {
        fallidas.push({ prenda, mensaje: e.message })
      }
    }
    const idsEliminados = new Set(eliminadas.map((prenda) => prenda.id))
    setPrendas((anteriores) => anteriores.filter((prenda) => !idsEliminados.has(prenda.id)))
    setSeleccion((anterior) => new Set([...anterior].filter((id) => !idsEliminados.has(id))))
    setEliminando(false)
    setEliminacion((actual) => ({ ...actual, abierta: false }))
    if (detalle && idsEliminados.has(detalle.id)) cerrarDetalle()

    if (eliminadas.length === 1) {
      toast.exito(`Se eliminó la prenda ${eliminadas[0].codigo} · ${eliminadas[0].nombre}.`)
    } else if (eliminadas.length > 1) {
      toast.exito(`Se eliminaron ${eliminadas.length} prendas del inventario.`)
    }
    if (fallidas.length > 0) {
      const codigos = fallidas.map(({ prenda }) => prenda.codigo).join(', ')
      setErrorEliminacion(`No se pudo eliminar ${codigos}. ${fallidas[0].mensaje}`)
    }
    if (eliminadas.length > 0) avisarCambioInventario()
  }

  function contenido() {
    if (cargando) {
      return (
        <>
          <Loading />
          <div className="tx-tabla tx-tabla-esqueleto" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((fila) => (
              <div key={fila} className="tx-fila-esqueleto">
                <Esqueleto ancho="1rem" alto="1rem" />
                <Esqueleto ancho="2.25rem" alto="2.25rem" />
                <Esqueleto ancho={`${40 + ((fila * 13) % 30)}%`} alto="0.875rem" />
                <Esqueleto ancho="3rem" alto="0.875rem" className="ms-auto" />
              </div>
            ))}
          </div>
        </>
      )
    }

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
        <EstadoVacio
          ilustracion="percha"
          titulo="Aún no hay prendas registradas"
          acciones={
            <Link to="/registro" className="btn btn-primary">
              Registrar la primera prenda
            </Link>
          }
        >
          Registra la primera prenda para empezar a controlar el stock, los precios y lo que hay que
          reponer.
        </EstadoVacio>
      )
    }

    return (
      <>
        <div className="tx-barra-filtros" role="search" aria-label="Filtrar prendas">
          <div className="tx-campo-busqueda">
            <label htmlFor="filtro-busqueda" className="visually-hidden">
              Buscar por código o nombre
            </label>
            <i className="bi bi-search" aria-hidden="true" />
            <input
              ref={busquedaRef}
              id="filtro-busqueda"
              type="search"
              className="form-control"
              placeholder="Buscar prenda"
              value={textoBusqueda}
              onChange={(evento) => buscar(evento.target.value)}
              onKeyDown={(evento) => {
                if (evento.key === 'Escape' && textoBusqueda) {
                  evento.preventDefault()
                  buscar('')
                }
              }}
              autoComplete="off"
            />
            <Tecla className="tx-campo-busqueda-tecla">/</Tecla>
          </div>

          <button
            type="button"
            className="tx-boton-filtros"
            aria-expanded={filtrosAbiertos}
            aria-controls="filtros-lista"
            onClick={() => setFiltrosAbiertos((abiertos) => !abiertos)}
          >
            <i className="bi bi-sliders2" aria-hidden="true" />
            <span className="visually-hidden">Filtros y orden</span>
            {cantidadFiltros > 0 && (
              <span className="tx-boton-filtros-cuenta">{cantidadFiltros}</span>
            )}
          </button>

          <div className="tx-filtros-plegables" id="filtros-lista" data-abierto={filtrosAbiertos}>
            <div className="tx-filtros-selects">
              {[
                { clave: 'tipo', etiqueta: 'Tipo', opciones: TIPOS, todos: 'Todos los tipos' },
                { clave: 'talla', etiqueta: 'Talla', opciones: TALLAS, todos: 'Todas las tallas' },
                { clave: 'tela', etiqueta: 'Tela', opciones: TELAS, todos: 'Todas las telas' },
              ].map((filtro) => (
                <div
                  key={filtro.clave}
                  className="tx-filtro"
                  data-activo={Boolean(filtros[filtro.clave])}
                >
                  <label htmlFor={`filtro-${filtro.clave}`} className="visually-hidden">
                    {filtro.etiqueta}
                  </label>
                  <select
                    id={`filtro-${filtro.clave}`}
                    className="form-select"
                    value={filtros[filtro.clave]}
                    onChange={(evento) =>
                      cambiarParametros({ [filtro.clave]: evento.target.value })
                    }
                  >
                    <option value="">{filtro.todos}</option>
                    {filtro.opciones.map((opcion) => (
                      <option key={opcion} value={opcion}>
                        {opcion}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <button
                type="button"
                className="tx-chip"
                aria-pressed={filtros.soloStockBajo}
                onClick={() => cambiarParametros({ stock: filtros.soloStockBajo ? '' : 'bajo' })}
              >
                <i className="bi bi-exclamation-triangle" aria-hidden="true" />
                Stock bajo
              </button>
            </div>

            <label htmlFor="filtro-orden" className="visually-hidden">
              Ordenar por
            </label>
            <select
              id="filtro-orden"
              className="form-select tx-select-orden"
              value={orden}
              onChange={(evento) =>
                cambiarParametros({
                  orden: evento.target.value === ORDEN_INICIAL ? '' : evento.target.value,
                })
              }
            >
              {ORDENES.some((opcion) => opcion.valor === orden) ? null : (
                <option value={orden}>Orden de la tabla</option>
              )}
              {ORDENES.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.texto}
                </option>
              ))}
            </select>
          </div>

          <div className="tx-segmentado" role="group" aria-label="Vista de la lista">
            {[
              { valor: 'tabla', texto: 'Tabla', icono: 'bi-list-ul' },
              { valor: 'galeria', texto: 'Galería', icono: 'bi-grid-3x2-gap' },
            ].map((opcion) => (
              <button
                key={opcion.valor}
                type="button"
                aria-pressed={vistaActual === opcion.valor}
                onClick={() => setVista(opcion.valor)}
                title={`Vista ${opcion.texto.toLowerCase()}`}
              >
                <i className={`bi ${opcion.icono}`} aria-hidden="true" />
                <span>{opcion.texto}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="tx-resultado">
          <p className="mb-0" aria-live="polite">
            Mostrando <strong>{prendasVisibles.length}</strong> de {prendas.length}{' '}
            {prendas.length === 1 ? 'prenda' : 'prendas'}
          </p>
          {hayFiltros && (
            <ul className="tx-filtros-activos" aria-label="Filtros activos">
              {textoBusqueda && (
                <FiltroActivo texto={`«${textoBusqueda}»`} onQuitar={() => buscar('')} />
              )}
              {filtros.tipo && (
                <FiltroActivo
                  texto={filtros.tipo}
                  onQuitar={() => cambiarParametros({ tipo: '' })}
                />
              )}
              {filtros.talla && (
                <FiltroActivo
                  texto={`Talla ${filtros.talla}`}
                  onQuitar={() => cambiarParametros({ talla: '' })}
                />
              )}
              {filtros.tela && (
                <FiltroActivo
                  texto={filtros.tela}
                  onQuitar={() => cambiarParametros({ tela: '' })}
                />
              )}
              {filtros.soloStockBajo && (
                <FiltroActivo
                  texto="Stock bajo"
                  onQuitar={() => cambiarParametros({ stock: '' })}
                />
              )}
              <li>
                <button type="button" className="tx-enlace-boton" onClick={limpiarFiltros}>
                  Limpiar filtros
                </button>
              </li>
            </ul>
          )}
        </div>

        <AlertMessage
          tipo="danger"
          mensaje={errorEliminacion}
          onClose={() => setErrorEliminacion('')}
        />

        {prendasVisibles.length === 0 ? (
          <EstadoVacio
            ilustracion="lupa"
            titulo="Ninguna prenda coincide"
            acciones={
              <button type="button" className="btn btn-outline-primary" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            }
          >
            Prueba con otro código o nombre, o quita algún filtro. La búsqueda ignora tildes y
            mayúsculas: «pantalon» encuentra «Pantalón».
          </EstadoVacio>
        ) : vistaActual === 'tabla' ? (
          <TablaPrendas
            prendas={prendasVisibles}
            minimo={config.stockMinimo}
            orden={orden}
            onOrdenar={ordenarPor}
            seleccion={seleccion}
            onSeleccionar={alternarSeleccion}
            onSeleccionarTodas={seleccionarTodas}
            onAbrir={abrirDetalle}
            onEditar={editar}
            onEliminar={(prenda) => pedirEliminacion([prenda])}
          />
        ) : (
          <ul className="tx-galeria">
            {prendasVisibles.map((prenda, indice) => (
              <li key={prenda.id}>
                <TarjetaPrenda
                  prenda={prenda}
                  minimo={config.stockMinimo}
                  indice={indice}
                  onAbrir={() => abrirDetalle(prenda)}
                  seleccionable
                  seleccionada={seleccion.has(prenda.id)}
                  onSeleccionar={() => alternarSeleccion(prenda.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </>
    )
  }

  return (
    <section className="tx-lista" aria-labelledby="titulo-lista">
      <header className="tx-cabecera-pagina">
        <div>
          <h2 id="titulo-lista" className="tx-titulo-pagina">
            Lista de prendas
          </h2>
          <p className="tx-bajada">
            {cargando || error
              ? 'Inventario completo de prendas registradas.'
              : `${prendas.length} ${prendas.length === 1 ? 'prenda' : 'prendas'} · ${unidades.toLocaleString('es-PE')} unidades en stock.`}
          </p>
        </div>
        <div className="tx-cabecera-acciones">
          <Link to="/registro" className="btn btn-primary d-inline-flex align-items-center gap-2">
            <i className="bi bi-plus-lg" aria-hidden="true" />
            Registrar prenda
          </Link>
        </div>
      </header>

      {contenido()}

      {seleccionadas.length > 0 && (
        <div className="tx-barra-lote" role="region" aria-label="Acciones de la selección">
          <span className="tx-barra-lote-cuenta">
            <strong>{seleccionadas.length}</strong>{' '}
            {seleccionadas.length === 1 ? 'seleccionada' : 'seleccionadas'}
          </span>
          <button
            type="button"
            className="btn btn-sm tx-barra-lote-secundario"
            onClick={() => seleccionarTodas(false)}
          >
            Quitar selección
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger d-inline-flex align-items-center gap-2"
            onClick={() => pedirEliminacion(seleccionadas)}
          >
            <i className="bi bi-trash3" aria-hidden="true" />
            Eliminar
          </button>
        </div>
      )}

      <Drawer
        abierto={Boolean(detalle)}
        onCerrar={cerrarDetalle}
        titulo={detalle?.nombre ?? 'Detalle de la prenda'}
        pie={
          detalle && (
            <>
              <button
                type="button"
                className="btn btn-outline-danger d-inline-flex align-items-center gap-2"
                onClick={() => pedirEliminacion([detalle])}
              >
                <i className="bi bi-trash3" aria-hidden="true" />
                Eliminar
              </button>
              <Link
                to={`/registro/${detalle.id}`}
                className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 flex-grow-1"
              >
                <i className="bi bi-pencil" aria-hidden="true" />
                Editar prenda
              </Link>
            </>
          )
        }
      >
        {detalle && <DetallePrenda prenda={detalle} minimo={config.stockMinimo} />}
      </Drawer>

      <ConfirmModal
        abierto={eliminacion.abierta}
        titulo={
          eliminacion.prendas.length > 1
            ? `Eliminar ${eliminacion.prendas.length} prendas`
            : 'Eliminar prenda'
        }
        textoConfirmar={eliminacion.prendas.length > 1 ? 'Eliminar todas' : 'Eliminar'}
        iconoConfirmar="bi-trash3"
        varianteConfirmar="danger"
        textoCargando="Eliminando..."
        cargando={eliminando}
        onConfirm={confirmarEliminacion}
        onCancel={() => setEliminacion((actual) => ({ ...actual, abierta: false }))}
      >
        <p className="mb-3">
          {eliminacion.prendas.length > 1
            ? '¿Seguro que deseas eliminar estas prendas del inventario?'
            : '¿Seguro que deseas eliminar esta prenda del inventario?'}
        </p>
        <ul className="tx-lista-eliminar">
          {eliminacion.prendas.map((prenda) => (
            <li key={prenda.id}>
              <MuestraTela color={prenda.color} tela={prenda.tela} forma="chip" />
              <span className="min-w-0">
                <span className="tx-codigo d-block">{prenda.codigo}</span>
                <strong className="d-block text-truncate">{prenda.nombre}</strong>
              </span>
            </li>
          ))}
        </ul>
        <p className="small text-body-secondary mb-0 mt-3">
          <i className="bi bi-exclamation-circle me-1" aria-hidden="true" />
          Esta acción no se puede deshacer.
        </p>
      </ConfirmModal>
    </section>
  )
}

function FiltroActivo({ texto, onQuitar }) {
  return (
    <li>
      <button type="button" className="tx-filtro-activo" onClick={onQuitar}>
        {texto}
        <i className="bi bi-x" aria-hidden="true" />
        <span className="visually-hidden">(quitar filtro)</span>
      </button>
    </li>
  )
}

export default Lista
