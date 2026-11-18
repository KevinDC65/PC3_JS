// El año se calcula una vez al cargar la app.
const anio = new Date().getFullYear()

function Footer() {
  return (
    <footer className="textil-footer">
      <div className="container py-3 d-flex flex-column flex-md-row gap-1 gap-md-3 justify-content-between align-items-md-center small text-body-secondary">
        <p className="m-0">
          <span className="fw-semibold text-body">TextilApp</span> · Universidad Tecnológica del
          Perú · © {anio}
        </p>
        <a
          href="https://github.com/KevinDC65/PC3_JS"
          target="_blank"
          rel="noreferrer"
          className="d-inline-flex align-items-center gap-2 py-2 link-body-emphasis link-underline-opacity-25 link-underline-opacity-100-hover link-offset-2"
        >
          <i className="bi bi-github" aria-hidden="true" />
          Repositorio en GitHub
        </a>
      </div>
    </footer>
  )
}

export default Footer
