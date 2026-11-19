import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AlertMessage from '../components/AlertMessage.jsx'
import EstadoVacio from '../components/EstadoVacio.jsx'
import Loading from '../components/Loading.jsx'
import PrendaForm from '../components/PrendaForm.jsx'
import { PRENDA_VACIA } from '../constants/prendas.js'
import { useGuardiaCambios } from '../hooks/useGuardiaCambios.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { useShell } from '../hooks/useShell.js'
import { useToast } from '../hooks/useToast.js'
import { add, getAll, getById, update } from '../services/apiService.js'
import { formatearFecha } from '../utils/formato.js'
import { avisarCambioInventario } from '../utils/inventario.js'
import { normalizarPrenda } from '../utils/validarPrenda.js'

const CAMPOS = Object.keys(PRENDA_VACIA)

/** Indica si el borrador guardado tiene al menos un campo escrito. */
const tieneDatos = (prenda) => Object.values(prenda ?? {}).some((valor) => String(valor).trim())

/** Compara los valores del formulario con la prenda guardada (todo como texto). */
const sonDistintos = (valores, prenda) =>
  CAMPOS.some((campo) => String(valores?.[campo] ?? '') !== String(prenda?.[campo] ?? ''))

function EncabezadoRegistro({ titulo, children }) {
  return (
    <header className="tx-cabecera-pagina">
      <div>
        <h2 id="titulo-registro" className="tx-titulo-pagina">
          {titulo}
        </h2>
        <p className="tx-bajada">{children}</p>
      </div>
      <div className="tx-cabecera-acciones">
        <Link
          to="/lista"
          className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
        >
          <i className="bi bi-card-list" aria-hidden="true" />
          Ver lista
        </Link>
      </div>
    </header>
  )
}

/** "/registro": alta de una prenda nueva, con borrador persistido en localStorage. */
function NuevaPrenda() {
  const navigate = useNavigate()
  const toast = useToast()
  const [codigos, setCodigos] = useState([])
  const [aviso, setAviso] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [borrador, setBorrador] = useLocalStorage('textilapp:borrador-prenda', PRENDA_VACIA)
  // Se lee una sola vez: si el formulario recibiera el borrador en cada tecla, se rellenaría sin fin.
  const [borradorInicial, setBorradorInicial] = useState(borrador)

  useGuardiaCambios(tieneDatos(borrador), 'nuevo')

  useEffect(() => {
    let activo = true
    getAll()
      .then((prendas) => {
        if (activo) setCodigos(prendas.map((prenda) => prenda.codigo))
      })
      .catch((error) => {
        if (activo) setAviso({ tipo: 'warning', texto: error.message })
      })
    return () => {
      activo = false
    }
  }, [])

  async function guardar(prenda) {
    setGuardando(true)
    setAviso(null)
    try {
      const creada = await add(normalizarPrenda(prenda))
      setCodigos((anteriores) => [...anteriores, creada.codigo])
      setBorrador(PRENDA_VACIA)
      avisarCambioInventario()
      toast.exito(`Prenda ${creada.codigo} · ${creada.nombre} registrada correctamente.`, {
        accion: { texto: 'Ver en la lista', onClick: () => navigate(`/lista?prenda=${creada.id}`) },
      })
      return true
    } catch (error) {
      setAviso({ tipo: 'danger', texto: error.message })
      return false
    } finally {
      setGuardando(false)
    }
  }

  function descartarBorrador() {
    setBorrador(PRENDA_VACIA)
    setBorradorInicial(PRENDA_VACIA)
  }

  return (
    <section className="tx-registro" aria-labelledby="titulo-registro">
      <EncabezadoRegistro titulo="Registrar prenda">
        Todos los campos son obligatorios. El código identifica la prenda en el inventario.
      </EncabezadoRegistro>

      <AlertMessage tipo={aviso?.tipo} mensaje={aviso?.texto} onClose={() => setAviso(null)} />

      {tieneDatos(borrador) && (
        <p className="tx-borrador">
          <i className="bi bi-cloud-check" aria-hidden="true" />
          {tieneDatos(borradorInicial)
            ? 'Se recuperó un borrador sin guardar. Los cambios se siguen guardando en este navegador.'
            : 'Borrador guardado en este navegador.'}
          <button type="button" className="tx-enlace-boton" onClick={descartarBorrador}>
            Descartar borrador
          </button>
        </p>
      )}

      <PrendaForm
        prendaInicial={borradorInicial}
        onSubmit={guardar}
        textoBoton="Guardar prenda"
        cargando={guardando}
        codigosExistentes={codigos}
        onCambio={setBorrador}
      />
    </section>
  )
}

/** "/registro/:id": carga la prenda, permite editarla y vuelve a la lista al guardar. */
function EditarPrenda({ id }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { navegarSeguro } = useShell()
  const [prenda, setPrenda] = useState(null)
  const [valores, setValores] = useState(null)
  const [codigos, setCodigos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)
  const [intento, setIntento] = useState(0)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState('')

  const hayCambios = Boolean(prenda && valores && sonDistintos(valores, prenda)) && !guardando
  useGuardiaCambios(hayCambios, 'edicion')

  useEffect(() => {
    let activo = true
    Promise.all([getById(id), getAll()])
      .then(([encontrada, todas]) => {
        if (!activo) return
        setPrenda(encontrada)
        // En edición, el código propio no cuenta como repetido.
        setCodigos(todas.filter((otra) => otra.id !== encontrada.id).map((otra) => otra.codigo))
      })
      .catch((error) => {
        if (!activo) return
        const noExiste = error.cause?.response?.status === 404
        setErrorCarga({ mensaje: error.message, noExiste })
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [id, intento])

  function reintentar() {
    setCargando(true)
    setErrorCarga(null)
    setIntento((n) => n + 1)
  }

  async function guardar(datos) {
    setGuardando(true)
    setAviso('')
    try {
      const actualizada = await update(id, normalizarPrenda({ ...prenda, ...datos }))
      avisarCambioInventario()
      toast.exito(
        `Prenda ${actualizada.codigo} · ${actualizada.nombre} actualizada correctamente.`,
        {
          accion: {
            texto: 'Ver detalle',
            onClick: () => navigate(`/lista?prenda=${actualizada.id}`),
          },
        },
      )
      navigate('/lista')
      return false
    } catch (error) {
      setAviso(error.message)
      setGuardando(false)
      return false
    }
  }

  if (cargando) {
    return (
      <section className="tx-registro" aria-labelledby="titulo-registro">
        <EncabezadoRegistro titulo="Editar prenda">
          Cargando los datos de la prenda.
        </EncabezadoRegistro>
        <Loading />
      </section>
    )
  }

  if (errorCarga) {
    return (
      <section className="tx-registro" aria-labelledby="titulo-registro">
        <EncabezadoRegistro titulo="Editar prenda">
          No se pudo abrir la prenda solicitada.
        </EncabezadoRegistro>
        <AlertMessage
          tipo={errorCarga.noExiste ? 'warning' : 'danger'}
          mensaje={errorCarga.mensaje}
        />
        <EstadoVacio
          ilustracion="hilo"
          titulo={
            errorCarga.noExiste
              ? 'Esta prenda ya no está en el inventario'
              : 'Sin conexión con la API'
          }
          acciones={
            <>
              {!errorCarga.noExiste && (
                <button type="button" className="btn btn-primary" onClick={reintentar}>
                  Reintentar
                </button>
              )}
              <Link to="/lista" className="btn btn-outline-secondary">
                Volver a la lista
              </Link>
            </>
          }
        >
          {errorCarga.noExiste
            ? 'Puede que alguien la haya eliminado. Búscala en la lista o registra una nueva.'
            : 'Revisa que json-server esté en ejecución y vuelve a intentarlo.'}
        </EstadoVacio>
      </section>
    )
  }

  return (
    <section className="tx-registro" aria-labelledby="titulo-registro">
      <EncabezadoRegistro titulo="Editar prenda">
        Modificando <span className="tx-codigo">{prenda.codigo}</span>, registrada el{' '}
        {formatearFecha(prenda.fechaRegistro)}.
      </EncabezadoRegistro>

      <AlertMessage tipo="danger" mensaje={aviso} onClose={() => setAviso('')} />

      {hayCambios && (
        <p className="tx-borrador tx-borrador-pendiente" role="status">
          <i className="bi bi-pencil-square" aria-hidden="true" />
          Cambios sin guardar.
        </p>
      )}

      <PrendaForm
        prendaInicial={prenda}
        onSubmit={guardar}
        textoBoton="Guardar cambios"
        cargando={guardando}
        codigosExistentes={codigos}
        onCambio={setValores}
        onCancel={() => navegarSeguro('/lista')}
      />
    </section>
  )
}

// Una misma ruta-página para crear y editar: con :id se edita; sin :id se registra.
// La `key` reinicia el estado al pasar de una prenda a otra o de edición a registro.
function Registro() {
  const { id } = useParams()
  return id ? <EditarPrenda key={id} id={id} /> : <NuevaPrenda />
}

export default Registro
