/**
 * Sello de TextilApp: un rombo escalonado de pallay (motivo de los tejidos andinos)
 * en hilo crudo sobre fondo cochinilla. SVG propio, decorativo.
 */
function Marca({ className = '' }) {
  return (
    <svg
      className={`tx-sello ${className}`}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="7" className="tx-sello-fondo" />
      <path
        className="tx-sello-hilo"
        d="M16 5.5 26.5 16 16 26.5 5.5 16Z M16 10.5 21.5 16 16 21.5 10.5 16Z"
        fill="none"
        strokeWidth="2.2"
        strokeLinejoin="miter"
      />
      <rect x="14.6" y="14.6" width="2.8" height="2.8" className="tx-sello-centro" />
    </svg>
  )
}

export default Marca
