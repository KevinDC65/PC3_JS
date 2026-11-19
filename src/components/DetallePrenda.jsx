import { formatearFecha, formatearPrecio } from '../utils/formato.js'
import { esStockBajo } from '../utils/inventario.js'
import MuestraTela from './MuestraTela.jsx'

/**
 * Contenido del panel lateral de detalle de una prenda: muestra de tela grande, datos
 * del modelo y nivel de stock frente al mínimo. Las acciones van en el pie del panel.
 */
function DetallePrenda({ prenda, minimo }) {
  const stock = Number(prenda.stock)
  const bajo = esStockBajo(prenda, minimo)
  const valorStock = Number(prenda.precio) * stock

  return (
    <div className="tx-detalle">
      <MuestraTela
        color={prenda.color}
        tela={prenda.tela}
        forma="panel"
        className="tx-detalle-tela"
      >
        <span className="tx-tarjeta-talla" aria-hidden="true">
          {prenda.talla}
        </span>
      </MuestraTela>

      <div className="tx-detalle-encabezado">
        <span className="tx-codigo">{prenda.codigo}</span>
        {stock === 0 ? (
          <span className="badge tx-badge-peligro">Agotada</span>
        ) : (
          bajo && <span className="badge tx-badge-aviso">Stock bajo</span>
        )}
      </div>
      <p className="tx-detalle-precio">{formatearPrecio(prenda.precio)}</p>

      <dl className="tx-detalle-datos">
        <div>
          <dt>Tipo</dt>
          <dd>{prenda.tipo}</dd>
        </div>
        <div>
          <dt>Tela</dt>
          <dd>{prenda.tela}</dd>
        </div>
        <div>
          <dt>Talla</dt>
          <dd>{prenda.talla}</dd>
        </div>
        <div>
          <dt>Color</dt>
          <dd className="d-flex align-items-center gap-2">
            <MuestraTela color={prenda.color} forma="punto" />
            {prenda.color}
          </dd>
        </div>
        <div className="tx-detalle-ancho">
          <dt>Stock</dt>
          <dd>
            <span className="d-flex justify-content-between align-items-baseline gap-2">
              <span>
                <strong className="tx-cifras-tabla">{stock}</strong> unidades
              </span>
              <span className="small text-body-secondary">mínimo {minimo}</span>
            </span>
            <span className="tx-medidor tx-medidor-grande mt-2" data-bajo={bajo} aria-hidden="true">
              <span style={{ '--nivel': `${Math.min(1, stock / (minimo * 3)) * 100}%` }} />
              <span className="tx-medidor-minimo" style={{ '--pos': `${(1 / 3) * 100}%` }} />
            </span>
          </dd>
        </div>
        <div>
          <dt>Valor en stock</dt>
          <dd className="tx-cifras-tabla">{formatearPrecio(valorStock)}</dd>
        </div>
        <div>
          <dt>Registrada</dt>
          <dd>{formatearFecha(prenda.fechaRegistro)}</dd>
        </div>
      </dl>
    </div>
  )
}

export default DetallePrenda
