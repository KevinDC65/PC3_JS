// TODO #15: alerta reutilizable (props: tipo, mensaje, onClose, autocierre con useEffect).
function AlertMessage({ tipo = 'info', mensaje }) {
  if (!mensaje) return null
  return (
    <div className={`alert alert-${tipo}`} role="alert">
      {mensaje}
    </div>
  )
}

export default AlertMessage
