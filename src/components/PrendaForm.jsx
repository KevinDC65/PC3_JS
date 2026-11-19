import { useEffect, useRef, useState } from 'react'
import { PRENDA_VACIA, STOCK_MINIMO, TALLAS, TELAS, TIPOS } from '../constants/prendas.js'
import { SUGERENCIAS_COLOR } from '../utils/colores.js'
import { slugTela } from '../utils/inventario.js'
import { validarPrenda } from '../utils/validarPrenda.js'
import AlertMessage from './AlertMessage.jsx'
import MuestraTela from './MuestraTela.jsx'
import TarjetaPrenda from './TarjetaPrenda.jsx'
import { Tecla } from './Tecla.jsx'

/** Orden de los campos en pantalla: define cuál es el "primer campo inválido". */
const ORDEN_CAMPOS = ['codigo', 'nombre', 'tipo', 'tela', 'talla', 'color', 'precio', 'stock']

/** Prefijo de código sugerido para cada tipo (POL-001, CAM-001...). */
const PREFIJOS = {
  Polo: 'POL',
  Camisa: 'CAM',
  Pantalón: 'PAN',
  Casaca: 'CAS',
  Vestido: 'VES',
  Polera: 'PLR',
  Short: 'SHO',
}

/** Colores frecuentes que se ofrecen como atajo bajo el campo Color. */
const COLORES_RAPIDOS = [
  'Blanco',
  'Negro',
  'Azul marino',
  'Gris jaspeado',
  'Beige',
  'Celeste',
  'Guinda',
  'Verde olivo',
]

/** Convierte una prenda (de la API o un borrador) en valores de texto para los inputs. */
function aValoresFormulario(prenda) {
  const valores = { ...PRENDA_VACIA }
  for (const campo of ORDEN_CAMPOS) {
    const valor = prenda?.[campo]
    valores[campo] = valor === undefined || valor === null ? '' : String(valor)
  }
  return valores
}

/** Siguiente código libre para un tipo, a partir de los códigos ya registrados. */
function sugerirCodigo(tipo, codigosExistentes) {
  const prefijo = PREFIJOS[tipo]
  if (!prefijo) return ''
  const usados = new Set(codigosExistentes.map((codigo) => String(codigo).toUpperCase()))
  for (let numero = 1; numero < 1000; numero += 1) {
    const codigo = `${prefijo}-${String(numero).padStart(3, '0')}`
    if (!usados.has(codigo)) return codigo
  }
  return ''
}

/**
 * Formulario controlado de prenda, reutilizable para registrar y editar.
 * La página que lo usa decide qué hacer con los datos: se comunica solo por props.
 *
 * @param {object} props
 * @param {object} [props.prendaInicial] Valores con los que se rellena el formulario.
 * @param {(prenda: object) => Promise<boolean>|boolean} props.onSubmit Recibe los datos válidos;
 *   si devuelve `true`, el formulario se limpia.
 * @param {string} [props.textoBoton] Texto del botón principal.
 * @param {boolean} [props.cargando] Deshabilita el formulario y muestra un spinner.
 * @param {string[]} [props.codigosExistentes] Códigos ya usados (para validar unicidad).
 * @param {() => void} [props.onCancel] Si se pasa, muestra el botón "Cancelar".
 * @param {(valores: object) => void} [props.onCambio] Avisa cada cambio (ej. para guardar un borrador).
 */
function PrendaForm({
  prendaInicial = PRENDA_VACIA,
  onSubmit,
  textoBoton = 'Guardar prenda',
  cargando = false,
  codigosExistentes = [],
  onCancel,
  onCambio,
}) {
  const [valores, setValores] = useState(() => aValoresFormulario(prendaInicial))
  const [errores, setErrores] = useState({})
  const [tocados, setTocados] = useState({})
  const [intentoEnvio, setIntentoEnvio] = useState(false)

  // useRef guarda referencias a elementos del DOM sin provocar renders:
  // codigoRef enfoca "Código" al montar y tras limpiar/guardar; formRef permite
  // enfocar el primer campo inválido por su atributo name al enviar con errores
  // y enviar el formulario con Ctrl+S.
  const codigoRef = useRef(null)
  const formRef = useRef(null)
  // Marca pendiente: el foco se mueve cuando el formulario ya no está deshabilitado.
  const enfocarCodigoRef = useRef(false)

  useEffect(() => {
    codigoRef.current?.focus()
  }, [])

  useEffect(() => {
    if (enfocarCodigoRef.current && !cargando) {
      enfocarCodigoRef.current = false
      codigoRef.current?.focus()
    }
  })

  // Ctrl+S (⌘S en macOS) guarda el formulario desde cualquier campo.
  useEffect(() => {
    function manejarTecla(evento) {
      if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 's') {
        evento.preventDefault()
        formRef.current?.requestSubmit()
      }
    }
    window.addEventListener('keydown', manejarTecla)
    return () => window.removeEventListener('keydown', manejarTecla)
  }, [])

  // Si la página cambia la prenda inicial (ej. termina de cargar en modo edición), se rellena.
  // Se ajusta el estado durante el render, como recomienda React, en lugar de usar un efecto.
  const [prendaPrevia, setPrendaPrevia] = useState(prendaInicial)
  if (prendaInicial !== prendaPrevia) {
    setPrendaPrevia(prendaInicial)
    setValores(aValoresFormulario(prendaInicial))
    setErrores({})
    setTocados({})
    setIntentoEnvio(false)
  }

  const validar = (datos) => validarPrenda(datos, { codigosExistentes })

  /** Cambia un campo y revalida si ya se mostró su estado. */
  function cambiarCampo(name, value) {
    const nuevos = { ...valores, [name]: name === 'codigo' ? value.toUpperCase() : value }
    setValores(nuevos)
    onCambio?.(nuevos)
    if (tocados[name] || intentoEnvio) setErrores(validar(nuevos))
  }

  // onChange genérico: sirve para todos los campos gracias a su atributo name.
  function manejarCambio(evento) {
    const { name, value } = evento.target
    cambiarCampo(name, value)
  }

  function manejarBlur(evento) {
    const { name } = evento.target
    setTocados((anteriores) => ({ ...anteriores, [name]: true }))
    setErrores(validar(valores))
  }

  function marcarYCambiar(name, value) {
    setTocados((anteriores) => ({ ...anteriores, [name]: true }))
    const nuevos = { ...valores, [name]: value }
    setValores(nuevos)
    onCambio?.(nuevos)
    setErrores(validar(nuevos))
  }

  function ajustarStock(delta) {
    const actual = Number.parseInt(valores.stock, 10)
    const base = Number.isFinite(actual) ? actual : 0
    marcarYCambiar('stock', String(Math.max(0, base + delta)))
  }

  function limpiar() {
    setValores({ ...PRENDA_VACIA })
    setErrores({})
    setTocados({})
    setIntentoEnvio(false)
    onCambio?.({ ...PRENDA_VACIA })
    enfocarCodigoRef.current = true
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    if (cargando) return
    const encontrados = validar(valores)
    setErrores(encontrados)
    setIntentoEnvio(true)

    const primerInvalido = ORDEN_CAMPOS.find((campo) => encontrados[campo])
    if (primerInvalido) {
      const elemento = formRef.current?.elements.namedItem(primerInvalido)
      // Los grupos de opciones (tipo, tela, talla) devuelven una lista de radios.
      const destino = elemento instanceof RadioNodeList ? elemento[0] : elemento
      destino?.focus()
      return
    }

    const exito = await onSubmit?.({ ...valores })
    if (exito === true) limpiar()
  }

  // Evita que el blur del último campo muestre un error, desplace el botón y se pierda el clic.
  const evitarBlurPrevio = (evento) => evento.preventDefault()

  const mostrar = (campo) => Boolean(tocados[campo] || intentoEnvio)
  const clase = (campo) => {
    if (!mostrar(campo)) return ''
    return errores[campo] ? 'is-invalid' : 'is-valid'
  }
  const describir = (campo, ayuda) =>
    [ayuda, mostrar(campo) && errores[campo] ? `prenda-${campo}-error` : null]
      .filter(Boolean)
      .join(' ') || undefined
  const propsCampo = (campo, ayuda) => ({
    id: `prenda-${campo}`,
    name: campo,
    value: valores[campo],
    onChange: manejarCambio,
    onBlur: manejarBlur,
    'aria-invalid': mostrar(campo) && Boolean(errores[campo]),
    'aria-describedby': describir(campo, ayuda),
  })
  const error = (campo, enBloque = false) =>
    mostrar(campo) && errores[campo] ? (
      <div id={`prenda-${campo}-error`} className={`invalid-feedback ${enBloque ? 'd-block' : ''}`}>
        {errores[campo]}
      </div>
    ) : null

  /** Grupo de opciones tipo "chip" (radios con aspecto de botón). */
  const grupoOpciones = (
    campo,
    etiqueta,
    opciones,
    { conTela = false, segmentado = false } = {},
  ) => (
    <fieldset
      className={`tx-grupo ${mostrar(campo) && errores[campo] ? 'tx-grupo-invalido' : ''}`}
      aria-describedby={describir(campo)}
    >
      <legend className="form-label">{etiqueta}</legend>
      <div className={segmentado ? 'tx-tallas' : 'tx-opciones'}>
        {opciones.map((opcion) => {
          const id = `prenda-${campo}-${opcion.normalize('NFD').replace(/[^\w]/g, '')}`
          return (
            <span key={opcion} className="tx-opcion">
              <input
                type="radio"
                className={`btn-check ${clase(campo)}`}
                id={id}
                name={campo}
                value={opcion}
                checked={valores[campo] === opcion}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                aria-invalid={mostrar(campo) && Boolean(errores[campo])}
              />
              <label htmlFor={id} className={segmentado ? 'tx-talla-opcion' : 'tx-chip-opcion'}>
                {conTela && (
                  <span className={`tx-mini-tela tx-tela-${slugTela(opcion)}`} aria-hidden="true" />
                )}
                {opcion}
              </label>
            </span>
          )
        })}
      </div>
      {error(campo, true)}
    </fieldset>
  )

  const cantidadErrores = Object.keys(errores).length
  const mensajeErrores =
    intentoEnvio && cantidadErrores > 0
      ? `Revisa el formulario: ${cantidadErrores === 1 ? 'hay 1 campo' : `hay ${cantidadErrores} campos`} por corregir.`
      : ''

  const codigoSugerido =
    !valores.codigo && valores.tipo ? sugerirCodigo(valores.tipo, codigosExistentes) : ''

  return (
    <form ref={formRef} onSubmit={manejarEnvio} noValidate className="tx-formulario">
      <AlertMessage tipo="danger" mensaje={mensajeErrores} />

      <div className="tx-formulario-rejilla">
        <fieldset disabled={cargando} className="tx-formulario-campos">
          <legend className="visually-hidden">Datos de la prenda</legend>

          <section className="tx-seccion" aria-labelledby="seccion-identificacion">
            <h3 id="seccion-identificacion" className="tx-seccion-titulo">
              Identificación
            </h3>
            <div className="row g-3">
              <div className="col-sm-5">
                <label htmlFor="prenda-codigo" className="form-label">
                  Código
                </label>
                <input
                  ref={codigoRef}
                  type="text"
                  className={`form-control tx-input-codigo ${clase('codigo')}`}
                  placeholder="POL-001"
                  maxLength={7}
                  autoComplete="off"
                  spellCheck={false}
                  {...propsCampo('codigo', 'prenda-codigo-ayuda')}
                />
                {error('codigo')}
                <div id="prenda-codigo-ayuda" className="form-text">
                  {codigoSugerido ? (
                    <>
                      Libre para {valores.tipo}:{' '}
                      <button
                        type="button"
                        className="tx-enlace-boton"
                        onClick={() => marcarYCambiar('codigo', codigoSugerido)}
                      >
                        usar {codigoSugerido}
                      </button>
                    </>
                  ) : (
                    '3 letras, guion y 3 números.'
                  )}
                </div>
              </div>
              <div className="col-sm-7">
                <label htmlFor="prenda-nombre" className="form-label">
                  Nombre
                </label>
                <input
                  type="text"
                  className={`form-control ${clase('nombre')}`}
                  placeholder="Polo básico cuello redondo"
                  maxLength={60}
                  autoComplete="off"
                  {...propsCampo('nombre', 'prenda-nombre-ayuda')}
                />
                {error('nombre')}
                <div id="prenda-nombre-ayuda" className="form-text d-flex justify-content-between">
                  <span>Entre 3 y 60 caracteres.</span>
                  <span className="tx-cifras-tabla" aria-hidden="true">
                    {valores.nombre.trim().length}/60
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="tx-seccion" aria-labelledby="seccion-clasificacion">
            <h3 id="seccion-clasificacion" className="tx-seccion-titulo">
              Clasificación
            </h3>
            <div className="d-grid gap-4">
              {grupoOpciones('tipo', 'Tipo', TIPOS)}
              {grupoOpciones('tela', 'Tela', TELAS, { conTela: true })}
              {grupoOpciones('talla', 'Talla', TALLAS, { segmentado: true })}
            </div>
          </section>

          <section className="tx-seccion" aria-labelledby="seccion-color">
            <h3 id="seccion-color" className="tx-seccion-titulo">
              Color
            </h3>
            <label htmlFor="prenda-color" className="form-label">
              Nombre del color
            </label>
            <div className="input-group has-validation">
              <span className="input-group-text tx-color-muestra">
                <MuestraTela color={valores.color} tela={valores.tela} forma="chip" />
              </span>
              <input
                type="text"
                className={`form-control ${clase('color')}`}
                placeholder="Azul marino"
                maxLength={30}
                autoComplete="off"
                list="sugerencias-color"
                {...propsCampo('color', 'prenda-color-ayuda')}
              />
              {error('color')}
            </div>
            <datalist id="sugerencias-color">
              {SUGERENCIAS_COLOR.map((color) => (
                <option key={color} value={color} />
              ))}
            </datalist>
            <p id="prenda-color-ayuda" className="form-text mb-2">
              Escribe el color como lo nombran en el taller; la muestra se actualiza al escribir.
            </p>
            <div className="tx-colores-rapidos" role="group" aria-label="Colores frecuentes">
              {COLORES_RAPIDOS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="tx-color-rapido"
                  aria-pressed={valores.color === color}
                  onClick={() => marcarYCambiar('color', color)}
                >
                  <MuestraTela color={color} forma="punto" />
                  {color}
                </button>
              ))}
            </div>
          </section>

          <section className="tx-seccion" aria-labelledby="seccion-precio">
            <h3 id="seccion-precio" className="tx-seccion-titulo">
              Precio y stock
            </h3>
            <div className="row g-3">
              <div className="col-sm-6">
                <label htmlFor="prenda-precio" className="form-label">
                  Precio de venta
                </label>
                <div className="input-group has-validation">
                  <span className="input-group-text tx-prefijo">S/</span>
                  <input
                    type="text"
                    className={`form-control tx-cifras-tabla ${clase('precio')}`}
                    placeholder="39.90"
                    inputMode="decimal"
                    autoComplete="off"
                    {...propsCampo('precio')}
                  />
                  {error('precio')}
                </div>
              </div>
              <div className="col-sm-6">
                <label htmlFor="prenda-stock" className="form-label">
                  Stock
                </label>
                <div className="input-group has-validation tx-stepper">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => ajustarStock(-1)}
                    disabled={cargando || !(Number.parseInt(valores.stock, 10) > 0)}
                    aria-label="Restar una unidad"
                  >
                    <i className="bi bi-dash-lg" aria-hidden="true" />
                  </button>
                  <input
                    type="number"
                    className={`form-control text-center tx-cifras-tabla ${clase('stock')}`}
                    placeholder="25"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    {...propsCampo('stock', 'prenda-stock-ayuda')}
                  />
                  <button
                    type="button"
                    className="btn"
                    onClick={() => ajustarStock(1)}
                    disabled={cargando}
                    aria-label="Sumar una unidad"
                  >
                    <i className="bi bi-plus-lg" aria-hidden="true" />
                  </button>
                  {error('stock')}
                </div>
                <div id="prenda-stock-ayuda" className="form-text">
                  Unidades disponibles. Menos de {STOCK_MINIMO} se marca como stock bajo.
                </div>
              </div>
            </div>
          </section>
        </fieldset>

        <aside className="tx-vista-previa" aria-label="Vista previa en la galería">
          <p className="tx-vista-previa-titulo" aria-hidden="true">
            Así se verá en la galería
          </p>
          <div aria-hidden="true">
            <TarjetaPrenda prenda={valores} minimo={STOCK_MINIMO} vistaPrevia />
          </div>
        </aside>
      </div>

      <div className="tx-formulario-acciones">
        <button
          type="submit"
          onMouseDown={evitarBlurPrevio}
          className="btn btn-primary tx-boton-guardar"
          disabled={cargando}
          aria-keyshortcuts="Control+S"
        >
          {cargando ? (
            <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          ) : (
            <i className="bi bi-check2" aria-hidden="true" />
          )}
          <span>{cargando ? 'Guardando...' : textoBoton}</span>
          {!cargando && (
            <Tecla mod className="tx-tecla-en-boton d-none d-md-inline-flex">
              S
            </Tecla>
          )}
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
          onMouseDown={evitarBlurPrevio}
          onClick={limpiar}
          disabled={cargando}
        >
          <i className="bi bi-eraser" aria-hidden="true" />
          Limpiar
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn-link link-secondary ms-md-auto"
            onClick={onCancel}
            disabled={cargando}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default PrendaForm
