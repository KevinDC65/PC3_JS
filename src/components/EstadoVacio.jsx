/**
 * Estado vacío ilustrado: inventario sin prendas, búsqueda sin resultados o error.
 * La ilustración es un dibujo de línea (SVG propio) que hereda el color del texto.
 *
 * @param {object} props
 * @param {'percha'|'lupa'|'hilo'} props.ilustracion
 * @param {string} props.titulo
 * @param {React.ReactNode} props.children Texto de ayuda.
 * @param {React.ReactNode} [props.acciones]
 */
function EstadoVacio({ ilustracion = 'percha', titulo, children, acciones, nivelTitulo = 3 }) {
  const Titulo = `h${nivelTitulo}`
  return (
    <div className="tx-vacio">
      <svg
        className="tx-vacio-ilustracion"
        viewBox="0 0 160 120"
        aria-hidden="true"
        focusable="false"
      >
        {ILUSTRACIONES[ilustracion]}
      </svg>
      <Titulo className="tx-vacio-titulo">{titulo}</Titulo>
      <div className="tx-vacio-texto">{children}</div>
      {acciones && <div className="tx-vacio-acciones">{acciones}</div>}
    </div>
  )
}

const ILUSTRACIONES = {
  percha: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M80 30c0-6 5-10 10-10s9 4 9 9c0 6-6 8-11 12l-8 6" />
      <path d="M80 47 24 86c-4 3-2 8 3 8h106c5 0 7-5 3-8L80 47Z" />
      <path className="tx-vacio-acento" d="M30 104h100" strokeDasharray="4 6" />
    </g>
  ),
  lupa: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="22" y="22" width="76" height="62" rx="4" />
      <path
        className="tx-vacio-acento"
        d="M22 38h76M22 54h76M22 70h76M38 22v62M54 22v62M70 22v62M86 22v62"
        strokeWidth="1.2"
      />
      <circle cx="104" cy="74" r="22" fill="var(--bs-body-bg)" />
      <path d="m120 90 18 18" strokeWidth="4" />
    </g>
  ),
  hilo: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M40 30h36M40 90h36M44 30v60M72 30v60" />
      <path
        className="tx-vacio-acento"
        d="M44 42h28M44 52h28M44 62h28M44 72h28M44 82h28"
        strokeWidth="1.6"
      />
      <path d="M72 62c18 0 18 30 38 30s16-34 34-30" strokeDasharray="5 6" />
    </g>
  ),
}

export default EstadoVacio
