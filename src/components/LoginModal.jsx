import { useId, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext.jsx'
import Modal from './Modal.jsx'

// Inicio de sesión simulado: solo pide un nombre y lo guarda en el contexto global.
function LoginModal({ abierto, onCerrar }) {
  const { login } = useAppContext()
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const idFormulario = useId()

  function cerrar() {
    setNombre('')
    setError('')
    onCerrar()
  }

  function manejarEnvio(evento) {
    evento.preventDefault()
    if (!login(nombre)) {
      setError('Escribe tu nombre para ingresar.')
      inputRef.current?.focus()
      return
    }
    cerrar()
  }

  const pie = (
    <>
      <button type="button" className="btn btn-outline-secondary" onClick={cerrar}>
        Cancelar
      </button>
      <button type="submit" form={idFormulario} className="btn btn-primary">
        Ingresar
      </button>
    </>
  )

  return (
    <Modal
      abierto={abierto}
      onCerrar={cerrar}
      titulo="Ingresar a TextilApp"
      pie={pie}
      tamano="sm"
      enfoqueInicialRef={inputRef}
    >
      <form id={idFormulario} onSubmit={manejarEnvio} noValidate>
        <label htmlFor={`${idFormulario}-nombre`} className="form-label">
          Tu nombre
        </label>
        <input
          ref={inputRef}
          id={`${idFormulario}-nombre`}
          type="text"
          className={`form-control ${error ? 'is-invalid' : ''}`}
          value={nombre}
          onChange={(evento) => {
            setNombre(evento.target.value)
            if (error) setError('')
          }}
          placeholder="Ej. Kevin"
          autoComplete="given-name"
          maxLength={40}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${idFormulario}-error` : undefined}
        />
        {error && (
          <div id={`${idFormulario}-error`} className="invalid-feedback">
            {error}
          </div>
        )}
        <p className="form-text mb-0 mt-2">Sesión simulada: no se pide contraseña.</p>
      </form>
    </Modal>
  )
}

export default LoginModal
