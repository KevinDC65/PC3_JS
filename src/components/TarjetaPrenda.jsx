import { formatearPrecio } from '../utils/formato.js'
import MuestraTela from './MuestraTela.jsx'

/**
 * Tarjeta de prenda tipo muestrario: arriba la muestra de tela con su color, talla en
 * etiqueta tejida y borde dentado de tijera de picos; abajo código, nombre, datos,
 * precio y stock. La usan la galería de Lista, Inicio y la vista previa del formulario.
 *
 * @param {object} props
 * @param {object} props.prenda Puede venir incompleta (vista previa del formulario).
 * @param {number} props.minimo Stock mínimo para marcar "stock bajo".
 * @param {() => void} [props.onAbrir] Si se pasa, el nombre es un botón que abre el detalle.
 * @param {boolean} [props.seleccionable] Muestra la casilla de selección múltiple.
 * @param {boolean} [props.seleccionada]
 * @param {() => void} [props.onSeleccionar]
 * @param {'normal'|'compacta'} [props.variante]
 * @param {number} [props.indice] Posición, para escalonar la animación de entrada.
 */
function TarjetaPrenda({
  prenda,
  minimo,
  onAbrir,
  seleccionable = false,
  seleccionada = false,
  onSeleccionar,
  variante = 'normal',
  indice = 0,
  vistaPrevia = false,
}) {
  const stockTexto = prenda.stock === '' || prenda.stock === undefined ? null : Number(prenda.stock)
  const stockValido = Number.isInteger(stockTexto) && stockTexto >= 0
  const stockBajo = stockValido && stockTexto < minimo
  const agotada = stockValido && stockTexto === 0
  const nombre = prenda.nombre || 'Nombre de la prenda'
  const detalle = [prenda.tipo, prenda.tela].filter(Boolean).join(' · ') || 'Tipo · Tela'

  return (
    <article
      className={`tx-tarjeta tx-tarjeta-${variante}`}
      data-seleccionada={seleccionada}
      data-interactiva={Boolean(onAbrir)}
      data-vacia={vistaPrevia && !prenda.nombre}
      style={{ '--i': Math.min(indice, 12) }}
    >
      <MuestraTela
        color={prenda.color}
        tela={prenda.tela}
        forma="panel"
        className="tx-tarjeta-tela"
      >
        <span className="tx-tarjeta-talla" aria-hidden="true">
          {prenda.talla || '—'}
        </span>
        {(stockBajo || agotada) && (
          <span className="tx-tarjeta-sello" aria-hidden="true">
            {agotada ? 'Agotada' : 'Reponer'}
          </span>
        )}
      </MuestraTela>

      {seleccionable && (
        <label className="tx-tarjeta-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={seleccionada}
            onChange={onSeleccionar}
          />
          <span className="visually-hidden">Seleccionar {prenda.codigo}</span>
        </label>
      )}

      <div className="tx-tarjeta-cuerpo">
        <p className="tx-codigo mb-1">{prenda.codigo || 'AAA-000'}</p>
        <h3 className="tx-tarjeta-nombre">
          {onAbrir ? (
            <button type="button" className="tx-tarjeta-abrir" onClick={onAbrir}>
              {nombre}
            </button>
          ) : (
            nombre
          )}
        </h3>
        {variante === 'normal' && (
          <p className="tx-tarjeta-meta">
            {detalle}
            <span className="visually-hidden">
              {' '}
              · Talla {prenda.talla || 'sin definir'} · Color {prenda.color || 'sin definir'}
            </span>
            {prenda.color && <span aria-hidden="true"> · {prenda.color}</span>}
          </p>
        )}
        <div className="tx-tarjeta-pie">
          <span className="tx-precio">{formatearPrecio(prenda.precio)}</span>
          <span
            className={`tx-stock ${agotada ? 'tx-stock-agotado' : stockBajo ? 'tx-stock-bajo' : ''}`}
          >
            {stockValido ? `${stockTexto} unid.` : '— unid.'}
            {stockBajo && <span className="visually-hidden"> (stock bajo)</span>}
          </span>
        </div>
      </div>
    </article>
  )
}

export default TarjetaPrenda
