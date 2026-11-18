import { useEffect, useRef } from 'react'

/*
 * Alerta reutilizable de Bootstrap. Ejemplo de uso:
 *
 *   const [aviso, setAviso] = useState(null)
 *   <AlertMessage
 *     tipo="success"
 *     mensaje="Prenda registrada correctamente."
 *     onClose={() => setAviso(null)}
 *     autoCerrar={5000}
 *   />
 *
 * Props: tipo (success | danger | warning | info), mensaje, onClose (muestra el botón
 * de cerrar) y autoCerrar (milisegundos, opcional). Si no hay mensaje, no se renderiza.
 */

const ICONOS = {
  success: 'bi-check-circle-fill',
  danger: 'bi-exclamation-octagon-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill',
}

function AlertMessage({ tipo = 'info', mensaje, onClose, autoCerrar, children, className = '' }) {
  // Se guarda la última versión de onClose para que el temporizador no se reinicie
  // cada vez que el componente padre vuelve a renderizar.
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!mensaje || !autoCerrar) return undefined
    const temporizador = setTimeout(() => onCloseRef.current?.(), autoCerrar)
    return () => clearTimeout(temporizador)
  }, [mensaje, autoCerrar])

  if (!mensaje) return null

  const tipoValido = ICONOS[tipo] ? tipo : 'info'
  const urgente = tipoValido === 'danger' || tipoValido === 'warning'

  return (
    <div
      className={`alert alert-${tipoValido} d-flex align-items-start gap-2 ${onClose ? 'alert-dismissible' : ''} ${className}`}
      role="alert"
      aria-live={urgente ? 'assertive' : 'polite'}
    >
      <i className={`bi ${ICONOS[tipoValido]} flex-shrink-0`} aria-hidden="true" />
      <div className="flex-grow-1">
        {mensaje}
        {children}
      </div>
      {onClose && (
        <button type="button" className="btn-close" aria-label="Cerrar mensaje" onClick={onClose} />
      )}
    </div>
  )
}

export default AlertMessage
