// Indicador de carga reutilizable. Usado por Lista, Home y Registro (modo edición).
function Loading({ texto = 'Loading...' }) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center gap-3 py-5 text-body-secondary"
      role="status"
      aria-live="polite"
    >
      <div className="spinner-border text-primary" aria-hidden="true" />
      <span className="fw-medium">{texto}</span>
    </div>
  )
}

export default Loading
