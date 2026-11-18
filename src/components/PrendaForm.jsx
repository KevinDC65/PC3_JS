import { useEffect, useRef, useState } from 'react'
import { PRENDA_VACIA, STOCK_MINIMO, TALLAS, TELAS, TIPOS } from '../constants/prendas.js'
import { formatearPrecio } from '../utils/formato.js'
import { validarPrenda } from '../utils/validarPrenda.js'
import AlertMessage from './AlertMessage.jsx'

/** Orden de los campos en pantalla: define cuál es el "primer campo inválido". */
const ORDEN_CAMPOS = ['codigo', 'nombre', 'tipo', 'tela', 'talla', 'color', 'precio', 'stock']

/** Convierte una prenda (de la API o un borrador) en valores de texto para los inputs. */
function aValoresFormulario(prenda) {
  const valores = { ...PRENDA_VACIA }
  for (const campo of ORDEN_CAMPOS) {
    const valor = prenda?.[campo]
    valores[campo] = valor === undefined || valor === null ? '' : String(valor)
  }
  return valores
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
  // enfocar el primer campo inválido por su atributo name al enviar con errores.
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

  function manejarCambio(evento) {
    const { name, value } = evento.target
    const nuevos = { ...valores, [name]: name === 'codigo' ? value.toUpperCase() : value }
    setValores(nuevos)
    onCambio?.(nuevos)
    if (tocados[name] || intentoEnvio) setErrores(validar(nuevos))
  }

  function manejarBlur(evento) {
    const { name } = evento.target
    setTocados((anteriores) => ({ ...anteriores, [name]: true }))
    setErrores(validar(valores))
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
      formRef.current?.elements.namedItem(primerInvalido)?.focus()
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
  const propsCampo = (campo) => ({
    id: `prenda-${campo}`,
    name: campo,
    value: valores[campo],
    onChange: manejarCambio,
    onBlur: manejarBlur,
    'aria-invalid': mostrar(campo) && Boolean(errores[campo]),
    'aria-describedby': mostrar(campo) && errores[campo] ? `prenda-${campo}-error` : undefined,
  })
  const error = (campo) =>
    mostrar(campo) && errores[campo] ? (
      <div id={`prenda-${campo}-error`} className="invalid-feedback">
        {errores[campo]}
      </div>
    ) : null

  const cantidadErrores = Object.keys(errores).length
  const mensajeErrores =
    intentoEnvio && cantidadErrores > 0
      ? `Revisa el formulario: ${cantidadErrores === 1 ? 'hay 1 campo' : `hay ${cantidadErrores} campos`} por corregir.`
      : ''

  return (
    <form ref={formRef} onSubmit={manejarEnvio} noValidate>
      <AlertMessage tipo="danger" mensaje={mensajeErrores} />

      <div className="row g-4 align-items-start">
        <div className="col-lg-8">
          <fieldset disabled={cargando} className="card">
            <legend className="visually-hidden">Datos de la prenda</legend>

            <div className="card-body p-3 p-md-4">
              <h3 className="h6 text-body-secondary mb-3">Identificación</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="prenda-codigo" className="form-label">
                    Código
                  </label>
                  <input
                    ref={codigoRef}
                    type="text"
                    className={`form-control textil-codigo ${clase('codigo')}`}
                    placeholder="POL-001"
                    maxLength={7}
                    autoComplete="off"
                    spellCheck={false}
                    {...propsCampo('codigo')}
                  />
                  {error('codigo') ?? <div className="form-text">3 letras, guion y 3 números.</div>}
                </div>
                <div className="col-md-6">
                  <label htmlFor="prenda-nombre" className="form-label">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className={`form-control ${clase('nombre')}`}
                    placeholder="Polo básico cuello redondo"
                    maxLength={60}
                    autoComplete="off"
                    {...propsCampo('nombre')}
                  />
                  {error('nombre')}
                </div>
              </div>

              <hr className="my-4" />

              <h3 className="h6 text-body-secondary mb-3">Características</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="prenda-tipo" className="form-label">
                    Tipo
                  </label>
                  <select className={`form-select ${clase('tipo')}`} {...propsCampo('tipo')}>
                    <option value="">Selecciona un tipo</option>
                    {TIPOS.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                  {error('tipo')}
                </div>
                <div className="col-md-6">
                  <label htmlFor="prenda-tela" className="form-label">
                    Tela
                  </label>
                  <select className={`form-select ${clase('tela')}`} {...propsCampo('tela')}>
                    <option value="">Selecciona una tela</option>
                    {TELAS.map((tela) => (
                      <option key={tela} value={tela}>
                        {tela}
                      </option>
                    ))}
                  </select>
                  {error('tela')}
                </div>
                <div className="col-md-6">
                  <label htmlFor="prenda-talla" className="form-label">
                    Talla
                  </label>
                  <select className={`form-select ${clase('talla')}`} {...propsCampo('talla')}>
                    <option value="">Selecciona una talla</option>
                    {TALLAS.map((talla) => (
                      <option key={talla} value={talla}>
                        {talla}
                      </option>
                    ))}
                  </select>
                  {error('talla')}
                </div>
                <div className="col-md-6">
                  <label htmlFor="prenda-color" className="form-label">
                    Color
                  </label>
                  <input
                    type="text"
                    className={`form-control ${clase('color')}`}
                    placeholder="Azul marino"
                    maxLength={30}
                    autoComplete="off"
                    {...propsCampo('color')}
                  />
                  {error('color')}
                </div>
              </div>

              <hr className="my-4" />

              <h3 className="h6 text-body-secondary mb-3">Precio y stock</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="prenda-precio" className="form-label">
                    Precio
                  </label>
                  <div className="input-group has-validation">
                    <span className="input-group-text">S/</span>
                    <input
                      type="number"
                      className={`form-control ${clase('precio')}`}
                      placeholder="39.90"
                      min="0.01"
                      step="0.01"
                      inputMode="decimal"
                      {...propsCampo('precio')}
                    />
                    {error('precio')}
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="prenda-stock" className="form-label">
                    Stock
                  </label>
                  <div className="input-group has-validation">
                    <input
                      type="number"
                      className={`form-control ${clase('stock')}`}
                      placeholder="25"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      {...propsCampo('stock')}
                    />
                    <span className="input-group-text">unidades</span>
                    {error('stock')}
                  </div>
                </div>
              </div>
            </div>
          </fieldset>

          <div className="d-flex flex-wrap gap-2 mt-3">
            <button
              type="submit"
              onMouseDown={evitarBlurPrevio}
              className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 px-4 flex-grow-1 flex-sm-grow-0"
              disabled={cargando}
            >
              {cargando ? (
                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
              ) : (
                <i className="bi bi-check2" aria-hidden="true" />
              )}
              {cargando ? 'Guardando...' : textoBoton}
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
                className="btn btn-link link-secondary ms-sm-auto"
                onClick={onCancel}
                disabled={cargando}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="col-lg-4 d-none d-lg-block sticky-lg-top" style={{ top: '5rem' }}>
          <EtiquetaPrenda valores={valores} />
        </div>
      </div>
    </form>
  )
}

/** Vista previa en forma de etiqueta colgante que se actualiza mientras se escribe. */
function EtiquetaPrenda({ valores }) {
  const stock = valores.stock === '' ? null : Number(valores.stock)
  const stockBajo = Number.isInteger(stock) && stock >= 0 && stock < STOCK_MINIMO
  const detalle = [valores.tipo, valores.tela].filter(Boolean).join(' · ')

  return (
    <aside aria-label="Vista previa de la etiqueta">
      <p className="small text-body-secondary mb-2">Vista previa de la etiqueta</p>
      <div className="textil-etiqueta" aria-hidden="true">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="textil-codigo text-body-secondary">{valores.codigo || 'AAA-000'}</span>
          {valores.talla ? (
            <span className="textil-talla">{valores.talla}</span>
          ) : (
            <span className="textil-talla text-body-secondary border-secondary-subtle">—</span>
          )}
        </div>
        <p
          className={`textil-serif fs-4 lh-sm mb-1 text-break ${valores.nombre ? '' : 'text-body-secondary'}`}
        >
          {valores.nombre || 'Nombre de la prenda'}
        </p>
        <p className="small text-body-secondary mb-0">{detalle || 'Tipo · Tela'}</p>
        <p className="small text-body-secondary mb-4">Color: {valores.color || '—'}</p>
        <div className="d-flex justify-content-between align-items-end pt-3 border-top border-secondary-subtle">
          <span className="textil-cifra fs-2">{formatearPrecio(valores.precio)}</span>
          <span className="small text-end">
            {stock === null || Number.isNaN(stock) ? '— unid.' : `${stock} unid.`}
            {stockBajo && (
              <span className="d-block badge bg-warning-subtle text-warning-emphasis mt-1">
                Stock bajo
              </span>
            )}
          </span>
        </div>
      </div>
    </aside>
  )
}

export default PrendaForm
