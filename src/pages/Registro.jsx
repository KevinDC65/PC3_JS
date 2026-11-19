import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AlertMessage from '../components/AlertMessage.jsx'
import Loading from '../components/Loading.jsx'
import PrendaForm from '../components/PrendaForm.jsx'
import { PRENDA_VACIA } from '../constants/prendas.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { add, getAll, getById, update } from '../services/apiService.js'
import { formatearFecha } from '../utils/formato.js'
import { normalizarPrenda } from '../utils/validarPrenda.js'

/** Indica si el borrador guardado tiene al menos un campo escrito. */
const tieneDatos = (prenda) => Object.values(prenda ?? {}).some((valor) => String(valor).trim())

function EncabezadoRegistro({ titulo, children }) {
  return (
    <header className="textil-encabezado-pagina">
      <div>
        <h2>{titulo}</h2>
        <p className="text-body-secondary mb-0">{children}</p>
      </div>
      <Link
        to="/lista"
        className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
      >
        <i className="bi bi-card-list" aria-hidden="true" />
        Ver lista
      </Link>
    </header>
  )
}

/** "/registro": alta de una prenda nueva, con borrador persistido en localStorage. */
function NuevaPrenda() {
  const [codigos, setCodigos] = useState([])
  const [aviso, setAviso] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [borrador, setBorrador] = useLocalStorage('textilapp:borrador-prenda', PRENDA_VACIA)
  // Se lee una sola vez: si el formulario recibiera el borrador en cada tecla, se rellenaría sin fin.
  const [borradorInicial, setBorradorInicial] = useState(borrador)

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
      setAviso({
        tipo: 'success',
        texto: `Prenda ${creada.codigo} · ${creada.nombre} registrada correctamente.`,
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
    <section>
      <EncabezadoRegistro titulo="Registrar prenda">
        Todos los campos son obligatorios. El código identifica la prenda en el inventario.
      </EncabezadoRegistro>

      <AlertMessage
        tipo={aviso?.tipo}
        mensaje={aviso?.texto}
        onClose={() => setAviso(null)}
        autoCerrar={aviso?.tipo === 'success' ? 8000 : undefined}
      >
        {aviso?.tipo === 'success' && (
          <>
            {' '}
            <Link to="/lista" className="alert-link">
              Ver en la lista
            </Link>
          </>
        )}
      </AlertMessage>

      {tieneDatos(borradorInicial) && (
        <div className="d-flex flex-wrap align-items-center gap-2 small text-body-secondary mb-3">
          <i className="bi bi-clock-history" aria-hidden="true" />
          Se recuperó un borrador sin guardar.
          <button
            type="button"
            className="btn btn-link btn-sm p-0 align-baseline"
            onClick={descartarBorrador}
          >
            Descartar borrador
          </button>
        </div>
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
  const [prenda, setPrenda] = useState(null)
  const [codigos, setCodigos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)
  const [intento, setIntento] = useState(0)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState('')

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

  async function guardar(valores) {
    setGuardando(true)
    setAviso('')
    try {
      const actualizada = await update(id, normalizarPrenda({ ...prenda, ...valores }))
      navigate('/lista', {
        state: {
          mensaje: `Prenda ${actualizada.codigo} · ${actualizada.nombre} actualizada correctamente.`,
        },
      })
      return false
    } catch (error) {
      setAviso(error.message)
      setGuardando(false)
      return false
    }
  }

  if (cargando) {
    return (
      <section>
        <EncabezadoRegistro titulo="Editar prenda">
          Cargando los datos de la prenda.
        </EncabezadoRegistro>
        <Loading />
      </section>
    )
  }

  if (errorCarga) {
    return (
      <section>
        <EncabezadoRegistro titulo="Editar prenda">
          No se pudo abrir la prenda solicitada.
        </EncabezadoRegistro>
        <AlertMessage
          tipo={errorCarga.noExiste ? 'warning' : 'danger'}
          mensaje={errorCarga.mensaje}
        >
          <div className="d-flex flex-wrap gap-2 mt-3">
            {!errorCarga.noExiste && (
              <button type="button" className="btn btn-sm btn-danger" onClick={reintentar}>
                Reintentar
              </button>
            )}
            <Link to="/lista" className="btn btn-sm btn-outline-secondary">
              Volver a la lista
            </Link>
          </div>
        </AlertMessage>
      </section>
    )
  }

  return (
    <section>
      <EncabezadoRegistro titulo="Editar prenda">
        Modificando <span className="textil-codigo">{prenda.codigo}</span>, registrada el{' '}
        {formatearFecha(prenda.fechaRegistro)}.
      </EncabezadoRegistro>

      <AlertMessage tipo="danger" mensaje={aviso} onClose={() => setAviso('')} />

      <PrendaForm
        prendaInicial={prenda}
        onSubmit={guardar}
        textoBoton="Guardar cambios"
        cargando={guardando}
        codigosExistentes={codigos}
        onCancel={() => navigate('/lista')}
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
