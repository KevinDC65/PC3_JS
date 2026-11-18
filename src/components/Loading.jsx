// Indicador de carga reutilizable. Usado por Lista (#16) y Home (#11).
function Loading({ texto = 'Loading...' }) {
  return (
    <div className="d-flex align-items-center gap-2 py-4" role="status">
      <div className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{texto}</span>
    </div>
  )
}

export default Loading
