/**
 * Indicador de carga reutilizable con el texto "Loading..." (requisito de la práctica).
 * El dibujo es un pequeño telar: la lanzadera cruza la urdimbre mientras se espera.
 * Lo usan Lista (carga inicial) y Registro (al abrir una prenda para editarla).
 */
function Loading({ texto = 'Loading...', compacto = false }) {
  return (
    <div
      className={`tx-loading ${compacto ? 'tx-loading-compacto' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="tx-telar" aria-hidden="true">
        <span className="tx-telar-urdimbre" />
        <span className="tx-telar-lanzadera" />
      </span>
      <span className="tx-loading-texto">{texto}</span>
    </div>
  )
}

export default Loading
