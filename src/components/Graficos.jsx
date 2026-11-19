import { tinteDeTipo } from '../utils/inventario.js'

/**
 * Franja tejida: la composición del stock por tipo de prenda dibujada como una franja de
 * awayu (manta andina), un segmento por tipo con el ancho proporcional a sus unidades y
 * teñido con un tinte natural. Debajo, la leyenda con cifras legibles.
 *
 * @param {{ porTipo: {clave: string, unidades: number, prendas: number}[], total: number }} props
 */
export function FranjaTejida({ porTipo, total }) {
  const conUnidades = porTipo.filter((fila) => fila.unidades > 0)
  const descripcion = conUnidades.map((fila) => `${fila.clave}: ${fila.unidades}`).join(', ')
  const porcentaje = (unidades) => (total > 0 ? Math.round((unidades / total) * 100) : 0)

  return (
    <figure className="tx-franja mb-0">
      <div
        className="tx-franja-tejido"
        role="img"
        aria-label={`Unidades por tipo de prenda. ${descripcion || 'Sin unidades en stock'}.`}
      >
        {conUnidades.length === 0 ? (
          <span className="tx-franja-vacia" />
        ) : (
          conUnidades.map((fila) => (
            <span
              key={fila.clave}
              className="tx-franja-segmento"
              data-tinte={tinteDeTipo(fila.clave)}
              style={{ flexGrow: fila.unidades }}
              title={`${fila.clave}: ${fila.unidades} unidades`}
            />
          ))
        )}
      </div>
      <figcaption>
        <ul className="tx-leyenda">
          {porTipo.map((fila) => (
            <li key={fila.clave} data-vacio={fila.unidades === 0}>
              <span className="tx-leyenda-tinte" data-tinte={tinteDeTipo(fila.clave)} />
              <span className="tx-leyenda-nombre">{fila.clave}</span>
              <span className="tx-leyenda-valor">
                {fila.unidades}
                <span className="tx-leyenda-pct"> · {porcentaje(fila.unidades)}%</span>
              </span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  )
}

/**
 * Barras verticales de unidades por talla (XS a XXL), en orden de talla.
 * @param {{ porTalla: {clave: string, unidades: number}[] }} props
 */
export function BarrasTallas({ porTalla }) {
  const maximo = Math.max(1, ...porTalla.map((fila) => fila.unidades))
  const descripcion = porTalla.map((fila) => `${fila.clave}: ${fila.unidades}`).join(', ')

  return (
    <div className="tx-barras" role="img" aria-label={`Unidades por talla. ${descripcion}.`}>
      {porTalla.map((fila) => (
        <div key={fila.clave} className="tx-barras-columna">
          <span className="tx-barras-valor">{fila.unidades}</span>
          <span className="tx-barras-pista">
            <span
              className="tx-barras-relleno"
              style={{ '--alto': `${(fila.unidades / maximo) * 100}%` }}
            />
          </span>
          <span className="tx-barras-talla">{fila.clave}</span>
        </div>
      ))}
    </div>
  )
}
