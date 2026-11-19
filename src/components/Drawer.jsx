import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCapaModal } from '../hooks/useCapaModal.js'

const DURACION_SALIDA = 220

/**
 * Panel deslizante controlado por estado de React. `lado="derecha"` (detalle de prenda en
 * escritorio) o `lado="abajo"` (hoja inferior en móvil). Comparte con los modales la
 * trampa de foco, el cierre con Esc y el bloqueo del scroll.
 *
 * @param {object} props
 * @param {boolean} props.abierto
 * @param {() => void} props.onCerrar
 * @param {string} props.titulo Título accesible (y visible si `mostrarTitulo`).
 * @param {'derecha'|'abajo'} [props.lado]
 * @param {React.ReactNode} [props.pie] Acciones fijas al pie del panel.
 */
function Drawer({
  abierto,
  onCerrar,
  titulo,
  children,
  pie,
  lado = 'derecha',
  mostrarTitulo = true,
  enfoqueInicialRef,
  className = '',
}) {
  const [montado, setMontado] = useState(abierto)
  const panelRef = useRef(null)
  const idTitulo = useId()

  if (abierto && !montado) setMontado(true)
  const saliendo = montado && !abierto

  useEffect(() => {
    if (!saliendo) return undefined
    const temporizador = setTimeout(() => setMontado(false), DURACION_SALIDA)
    return () => clearTimeout(temporizador)
  }, [saliendo])

  // Sin un destino indicado, el foco va al propio panel (sin anillo visible al abrir con el ratón).
  useCapaModal(abierto, panelRef, {
    onEscape: onCerrar,
    enfoqueInicialRef: enfoqueInicialRef ?? panelRef,
  })

  if (!montado) return null

  return createPortal(
    <div className="tx-drawer-capa" data-lado={lado} data-saliendo={saliendo}>
      <div className="tx-drawer-fondo" onClick={onCerrar} aria-hidden="true" />
      <div
        ref={panelRef}
        className={`tx-drawer ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
      >
        {lado === 'abajo' && <span className="tx-drawer-asa" aria-hidden="true" />}
        <div className={`tx-drawer-cabecera ${mostrarTitulo ? '' : 'tx-drawer-cabecera-oculta'}`}>
          <h2 id={idTitulo} className={mostrarTitulo ? 'tx-drawer-titulo' : 'visually-hidden'}>
            {titulo}
          </h2>
          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar panel"
            onClick={onCerrar}
          />
        </div>
        <div className="tx-drawer-cuerpo">{children}</div>
        {pie && <div className="tx-drawer-pie">{pie}</div>}
      </div>
    </div>,
    document.body,
  )
}

export default Drawer
