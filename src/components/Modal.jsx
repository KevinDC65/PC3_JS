import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Duración de la animación de salida definida en index.css (textil-salida-modal).
const DURACION_SALIDA = 160

/**
 * Base de los modales de la app. Se abre y cierra con estado de React (prop `abierto`),
 * sin el JavaScript de Bootstrap. Cierra con Esc, botón o clic en el fondo; mantiene
 * el foco dentro mientras está abierto y lo devuelve al elemento que lo abrió.
 * Se dibuja con un portal en <body> para que ningún contenedor (ej. la navbar fija) lo recorte.
 */
function Modal({
  abierto,
  onCerrar,
  titulo,
  children,
  pie,
  tamano,
  bloquearCierre = false,
  enfoqueInicialRef,
}) {
  const [montado, setMontado] = useState(abierto)
  const contenidoRef = useRef(null)
  const pulsadoFueraRef = useRef(false)
  const cierreRef = useRef({ onCerrar, bloquearCierre })
  const idTitulo = useId()

  // Al abrir se monta de inmediato; al cerrar se espera a que termine la animación de salida.
  if (abierto && !montado) setMontado(true)
  const saliendo = montado && !abierto

  useEffect(() => {
    cierreRef.current = { onCerrar, bloquearCierre }
  })

  useEffect(() => {
    if (!saliendo) return undefined
    const temporizador = setTimeout(() => setMontado(false), DURACION_SALIDA)
    return () => clearTimeout(temporizador)
  }, [saliendo])

  useEffect(() => {
    if (!abierto) return undefined
    const enfocadoAntes = document.activeElement
    const destino = enfoqueInicialRef?.current ?? contenidoRef.current?.querySelector(ENFOCABLES)
    destino?.focus()

    const overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function manejarTecla(evento) {
      if (evento.key === 'Escape') {
        const { onCerrar: cerrar, bloquearCierre: bloqueado } = cierreRef.current
        if (!bloqueado) cerrar()
        return
      }
      if (evento.key !== 'Tab' || !contenidoRef.current) return
      const enfocables = [...contenidoRef.current.querySelectorAll(ENFOCABLES)]
      if (enfocables.length === 0) return
      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]
      const dentro = contenidoRef.current.contains(document.activeElement)
      if (evento.shiftKey && (document.activeElement === primero || !dentro)) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && (document.activeElement === ultimo || !dentro)) {
        evento.preventDefault()
        primero.focus()
      }
    }

    document.addEventListener('keydown', manejarTecla)
    return () => {
      document.removeEventListener('keydown', manejarTecla)
      document.body.style.overflow = overflowPrevio
      if (enfocadoAntes instanceof HTMLElement && document.contains(enfocadoAntes)) {
        enfocadoAntes.focus()
      }
    }
  }, [abierto, enfoqueInicialRef])

  if (!montado) return null

  function manejarPulsacion(evento) {
    pulsadoFueraRef.current = !contenidoRef.current?.contains(evento.target)
  }

  function manejarClicFondo(evento) {
    const fuera = !contenidoRef.current?.contains(evento.target)
    if (fuera && pulsadoFueraRef.current && !bloquearCierre && !saliendo) onCerrar()
    pulsadoFueraRef.current = false
  }

  return createPortal(
    <>
      <div className="modal-backdrop show textil-modal-fondo" data-saliendo={saliendo} />
      <div
        className="modal d-block textil-modal"
        data-saliendo={saliendo}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        onMouseDown={manejarPulsacion}
        onClick={manejarClicFondo}
      >
        <div className={`modal-dialog modal-dialog-centered ${tamano ? `modal-${tamano}` : ''}`}>
          <div className="modal-content" ref={contenidoRef}>
            <div className="modal-header">
              <h2 className="modal-title h4" id={idTitulo}>
                {titulo}
              </h2>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={onCerrar}
                disabled={bloquearCierre}
              />
            </div>
            <div className="modal-body">{children}</div>
            {pie && <div className="modal-footer">{pie}</div>}
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}

export default Modal
