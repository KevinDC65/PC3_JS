import { useEffect, useRef } from 'react'
import { formatearPrecio } from '../utils/formato.js'
import { esStockBajo } from '../utils/inventario.js'
import MuestraTela from './MuestraTela.jsx'

const COLUMNAS = [
  { campo: 'codigo', texto: 'Código', clase: 'd-none d-md-table-cell' },
  { campo: 'nombre', texto: 'Prenda', clase: '' },
  { campo: 'tipo', texto: 'Tipo', clase: 'd-none d-xl-table-cell' },
  { campo: 'tela', texto: 'Tela', clase: 'd-none d-xl-table-cell' },
  { campo: 'talla', texto: 'Talla', clase: 'd-none d-sm-table-cell text-center' },
  { campo: 'precio', texto: 'Precio', clase: 'd-none d-md-table-cell text-end' },
  { campo: 'stock', texto: 'Stock', clase: 'text-end' },
]

/** Elementos dentro de la fila que no deben abrir el detalle al hacer clic. */
const INTERACTIVOS = 'button, a, input, label'

/**
 * Tabla densa de prendas: encabezados que ordenan al hacer clic, selección múltiple con
 * casillas y acciones por fila (ver, editar, eliminar). En pantallas angostas se ocultan
 * columnas secundarias y sus datos pasan a la línea bajo el nombre; tocar la fila abre
 * el detalle.
 */
function TablaPrendas({
  prendas,
  minimo,
  orden,
  onOrdenar,
  seleccion,
  onSeleccionar,
  onSeleccionarTodas,
  onAbrir,
  onEditar,
  onEliminar,
}) {
  const todasRef = useRef(null)
  const [campoOrden, direccion] = orden.split('-')
  const seleccionadas = prendas.filter((prenda) => seleccion.has(prenda.id)).length
  const todas = prendas.length > 0 && seleccionadas === prendas.length

  // El estado "indeterminado" de una casilla solo se puede asignar desde el DOM.
  useEffect(() => {
    if (todasRef.current) todasRef.current.indeterminate = seleccionadas > 0 && !todas
  }, [seleccionadas, todas])

  return (
    <div className="tx-tabla">
      <table className="table table-hover align-middle mb-0">
        <caption className="visually-hidden">
          Prendas del inventario. Los encabezados con botón ordenan la tabla.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="tx-col-check">
              <input
                ref={todasRef}
                type="checkbox"
                className="form-check-input"
                checked={todas}
                onChange={() => onSeleccionarTodas(!todas)}
                aria-label={
                  todas ? 'Quitar la selección de todas' : 'Seleccionar todas las visibles'
                }
              />
            </th>
            {COLUMNAS.map((columna) => {
              const activa = campoOrden === columna.campo
              return (
                <th
                  key={columna.campo}
                  scope="col"
                  className={columna.clase}
                  aria-sort={
                    activa ? (direccion === 'desc' ? 'descending' : 'ascending') : undefined
                  }
                >
                  <button
                    type="button"
                    className="tx-orden"
                    data-activa={activa}
                    onClick={() => onOrdenar(columna.campo)}
                  >
                    {columna.texto}
                    <i
                      className={`bi ${activa ? (direccion === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-down-up'}`}
                      aria-hidden="true"
                    />
                  </button>
                </th>
              )
            })}
            <th scope="col" className="text-end">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {prendas.map((prenda) => {
            const seleccionada = seleccion.has(prenda.id)
            const bajo = esStockBajo(prenda, minimo)
            const agotada = Number(prenda.stock) === 0
            return (
              <tr
                key={prenda.id}
                data-seleccionada={seleccionada}
                onClick={(evento) => {
                  if (!evento.target.closest(INTERACTIVOS)) onAbrir(prenda)
                }}
              >
                <td className="tx-col-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={seleccionada}
                    onChange={() => onSeleccionar(prenda.id)}
                    aria-label={`Seleccionar ${prenda.codigo} · ${prenda.nombre}`}
                  />
                </td>
                <td className="tx-codigo d-none d-md-table-cell text-nowrap">{prenda.codigo}</td>
                <td className="tx-col-prenda">
                  <div className="d-flex align-items-center gap-3 min-w-0">
                    <MuestraTela color={prenda.color} tela={prenda.tela} forma="chip" />
                    <div className="min-w-0">
                      <button
                        type="button"
                        className="tx-fila-nombre"
                        onClick={() => onAbrir(prenda)}
                      >
                        {prenda.nombre}
                      </button>
                      <span className="tx-fila-meta">
                        <span className="d-md-none">
                          <span className="tx-codigo">{prenda.codigo}</span> · Talla {prenda.talla}{' '}
                          · {formatearPrecio(prenda.precio)}
                        </span>
                        <span className="d-none d-md-inline">
                          <span className="d-xl-none">
                            {prenda.tipo} · {prenda.tela} ·{' '}
                          </span>
                          {prenda.color}
                        </span>
                      </span>
                    </div>
                  </div>
                </td>
                <td className="d-none d-xl-table-cell">{prenda.tipo}</td>
                <td className="d-none d-xl-table-cell text-nowrap">{prenda.tela}</td>
                <td className="d-none d-sm-table-cell text-center">
                  <span className="tx-talla">{prenda.talla}</span>
                </td>
                <td className="d-none d-md-table-cell text-end text-nowrap tx-cifras-tabla">
                  {formatearPrecio(prenda.precio)}
                </td>
                <td className="text-end text-nowrap">
                  <span
                    className={`tx-stock ${agotada ? 'tx-stock-agotado' : bajo ? 'tx-stock-bajo' : ''}`}
                  >
                    {prenda.stock}
                    {bajo && <span className="visually-hidden"> (stock bajo)</span>}
                  </span>
                </td>
                <td className="text-end text-nowrap tx-col-acciones">
                  <div className="tx-acciones-fila d-none d-md-inline-flex">
                    <button
                      type="button"
                      className="btn btn-sm tx-boton-fila"
                      onClick={() => onAbrir(prenda)}
                      aria-label={`Ver detalle de ${prenda.codigo}`}
                      title="Ver detalle"
                    >
                      <i className="bi bi-layout-sidebar-inset-reverse" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm tx-boton-fila"
                      onClick={() => onEditar(prenda)}
                      aria-label={`Editar ${prenda.codigo}`}
                      title="Editar"
                    >
                      <i className="bi bi-pencil" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm tx-boton-fila tx-boton-fila-peligro"
                      onClick={() => onEliminar(prenda)}
                      aria-label={`Eliminar ${prenda.codigo}`}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash3" aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn tx-boton-fila d-md-none"
                    onClick={() => onAbrir(prenda)}
                    aria-label={`Abrir ${prenda.codigo}`}
                  >
                    <i className="bi bi-chevron-right" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TablaPrendas
