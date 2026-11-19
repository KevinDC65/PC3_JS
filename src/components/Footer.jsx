// El año se calcula una vez al cargar la app.
const anio = new Date().getFullYear()

function Footer() {
  return (
    <footer className="tx-footer">
      <p className="m-0">
        <span className="fw-semibold text-body">TextilApp</span> · Universidad Tecnológica del Perú
        · © {anio}
      </p>
      <a
        href="https://github.com/KevinDC65/PC3_JS"
        target="_blank"
        rel="noreferrer"
        className="tx-footer-enlace"
      >
        <i className="bi bi-github" aria-hidden="true" />
        Repositorio en GitHub
      </a>
    </footer>
  )
}

export default Footer
