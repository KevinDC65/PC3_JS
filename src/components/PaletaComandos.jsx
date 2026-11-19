import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAppContext } from '../context/AppContext.jsx'
import { useCapaModal } from '../hooks/useCapaModal.js'
import { useShell } from '../hooks/useShell.js'
import { getAll } from '../services/apiService.js'
import { normalizarTexto } from '../utils/inventario.js'
import MuestraTela from './MuestraTela.jsx'
import { Tecla } from './Tecla.jsx'

const MAXIMO_PRENDAS = 8

/**
 * Paleta de comandos (Ctrl+K / ⌘K): navegar, ejecutar acciones y buscar prendas por código
 * o nombre. Accesible como combobox: el foco queda en el campo y las flechas mueven la
 * opción activa (aria-activedescendant). Sin animación de apertura: se usa muchas veces
 * al día y debe sentirse instantánea.
 */
function PaletaComandos() {
  const { panel, cerrar } = useShell()
  const abierta = panel === 'paleta'
  return abierta ? <PanelPaleta onCerrar={cerrar} /> : null
}

function PanelPaleta({ onCerrar }) {
  const { usuario, logout, tema, alternarTema } = useAppContext()
  const { abrir, navegarSeguro } = useShell()
  const [consulta, setConsulta] = useState('')
  const [activo, setActivo] = useState(0)
  const [prendas, setPrendas] = useState(null)
  const [errorPrendas, setErrorPrendas] = useState('')
  const contenedorRef = useRef(null)
  const inputRef = useRef(null)
  const listaRef = useRef(null)
  const id = useId()

  useCapaModal(true, contenedorRef, { onEscape: onCerrar, enfoqueInicialRef: inputRef })

  useEffect(() => {
    let vigente = true
    getAll()
      .then((datos) => {
        if (vigente) setPrendas(datos)
      })
      .catch((error) => {
        if (vigente) setErrorPrendas(error.message)
      })
    return () => {
      vigente = false
    }
  }, [])

  const comandos = useMemo(() => {
    const ir = (ruta) => () => {
      onCerrar()
      navegarSeguro(ruta)
    }
    return [
      {
        id: 'inicio',
        grupo: 'Ir a',
        texto: 'Inicio',
        icono: 'bi-house',
        atajo: 'G I',
        claves: 'panel resumen dashboard',
        ejecutar: ir('/'),
      },
      {
        id: 'lista',
        grupo: 'Ir a',
        texto: 'Lista de prendas',
        icono: 'bi-card-list',
        atajo: 'G L',
        claves: 'inventario tabla galeria',
        ejecutar: ir('/lista'),
      },
      {
        id: 'reponer',
        grupo: 'Ir a',
        texto: 'Prendas por reponer',
        icono: 'bi-exclamation-triangle',
        claves: 'stock bajo agotadas',
        ejecutar: ir('/lista?stock=bajo&orden=stock-asc'),
      },
      {
        id: 'registrar',
        grupo: 'Acciones',
        texto: 'Registrar prenda',
        icono: 'bi-plus-lg',
        atajo: 'N',
        claves: 'nueva agregar crear registro',
        ejecutar: ir('/registro'),
      },
      {
        id: 'tema',
        grupo: 'Acciones',
        texto: tema === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro',
        icono: tema === 'dark' ? 'bi-sun' : 'bi-moon-stars',
        claves: 'tema oscuro claro modo apariencia',
        ejecutar: () => alternarTema(),
      },
      usuario
        ? {
            id: 'sesion',
            grupo: 'Acciones',
            texto: `Cerrar sesión de ${usuario.nombre}`,
            icono: 'bi-box-arrow-right',
            claves: 'salir logout usuario',
            ejecutar: () => {
              logout()
              onCerrar()
            },
          }
        : {
            id: 'sesion',
            grupo: 'Acciones',
            texto: 'Iniciar sesión',
            icono: 'bi-person-circle',
            claves: 'ingresar login usuario',
            ejecutar: () => abrir('login'),
          },
      {
        id: 'atajos',
        grupo: 'Acciones',
        texto: 'Ver atajos de teclado',
        icono: 'bi-keyboard',
        atajo: '?',
        claves: 'ayuda teclas',
        ejecutar: () => abrir('ayuda'),
      },
    ]
  }, [tema, usuario, alternarTema, logout, abrir, onCerrar, navegarSeguro])

  const termino = normalizarTexto(consulta.trim())

  const opciones = useMemo(() => {
    const coincide = (comando) =>
      !termino || normalizarTexto(`${comando.texto} ${comando.claves}`).includes(termino)
    const visibles = comandos.filter(coincide)
    const encontradas = termino
      ? (prendas ?? [])
          .filter(
            (prenda) =>
              normalizarTexto(prenda.codigo).includes(termino) ||
              normalizarTexto(prenda.nombre).includes(termino),
          )
          .slice(0, MAXIMO_PRENDAS)
          .map((prenda) => ({
            id: `prenda-${prenda.id}`,
            grupo: 'Prendas',
            prenda,
            texto: prenda.nombre,
            ejecutar: (editar) => {
              onCerrar()
              navegarSeguro(editar ? `/registro/${prenda.id}` : `/lista?prenda=${prenda.id}`)
            },
          }))
      : []
    return termino ? [...encontradas, ...visibles] : visibles
  }, [comandos, prendas, termino, onCerrar, navegarSeguro])

  const indiceActivo = opciones.length === 0 ? -1 : Math.min(activo, opciones.length - 1)

  useEffect(() => {
    if (indiceActivo < 0) return
    listaRef.current
      ?.querySelector(`[data-indice="${indiceActivo}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [indiceActivo])

  function manejarTecla(evento) {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault()
      if (opciones.length === 0) return
      const paso = evento.key === 'ArrowDown' ? 1 : -1
      setActivo((indiceActivo + paso + opciones.length) % opciones.length)
    } else if (evento.key === 'Home' && opciones.length) {
      evento.preventDefault()
      setActivo(0)
    } else if (evento.key === 'End' && opciones.length) {
      evento.preventDefault()
      setActivo(opciones.length - 1)
    } else if (evento.key === 'Enter') {
      evento.preventDefault()
      const opcion = opciones[indiceActivo]
      if (opcion) opcion.ejecutar(evento.ctrlKey || evento.metaKey || evento.shiftKey)
    }
  }

  const grupos = []
  opciones.forEach((opcion, indice) => {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo?.nombre === opcion.grupo) ultimo.items.push({ opcion, indice })
    else grupos.push({ nombre: opcion.grupo, items: [{ opcion, indice }] })
  })

  const idOpcion = (indice) => `${id}-opcion-${indice}`
  const buscandoPrendas = termino && prendas === null && !errorPrendas

  return createPortal(
    <div
      className="tx-paleta-capa"
      onMouseDown={(evento) => evento.target === evento.currentTarget && onCerrar()}
    >
      <div
        ref={contenedorRef}
        className="tx-paleta"
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
      >
        <div className="tx-paleta-campo">
          <i className="bi bi-search" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-lista`}
            aria-autocomplete="list"
            aria-activedescendant={indiceActivo >= 0 ? idOpcion(indiceActivo) : undefined}
            aria-label="Buscar prendas por código o nombre, o escribir un comando"
            placeholder="Busca POL-001, «jean», o escribe un comando…"
            value={consulta}
            onChange={(evento) => {
              setConsulta(evento.target.value)
              setActivo(0)
            }}
            onKeyDown={manejarTecla}
            autoComplete="off"
            spellCheck={false}
          />
          <Tecla className="tx-paleta-esc">Esc</Tecla>
        </div>

        <ul
          ref={listaRef}
          id={`${id}-lista`}
          role="listbox"
          aria-label="Resultados"
          className="tx-paleta-lista"
        >
          {grupos.map((grupo) => (
            <li key={grupo.nombre} role="presentation">
              <p className="tx-paleta-grupo" aria-hidden="true">
                {grupo.nombre}
              </p>
              <ul role="group" aria-label={grupo.nombre}>
                {grupo.items.map(({ opcion, indice }) => (
                  <li
                    key={opcion.id}
                    id={idOpcion(indice)}
                    role="option"
                    aria-selected={indice === indiceActivo}
                    data-indice={indice}
                    className="tx-paleta-opcion"
                    onMouseMove={() => indice !== indiceActivo && setActivo(indice)}
                    onClick={(evento) => opcion.ejecutar(evento.ctrlKey || evento.metaKey)}
                  >
                    {opcion.prenda ? (
                      <>
                        <MuestraTela
                          color={opcion.prenda.color}
                          tela={opcion.prenda.tela}
                          forma="chip"
                        />
                        <span className="tx-paleta-texto">
                          <span className="tx-codigo">{opcion.prenda.codigo}</span>
                          <span className="text-truncate">{opcion.prenda.nombre}</span>
                        </span>
                        <span className="tx-paleta-meta">
                          Talla {opcion.prenda.talla} · {opcion.prenda.stock} unid.
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="tx-paleta-icono">
                          <i className={`bi ${opcion.icono}`} aria-hidden="true" />
                        </span>
                        <span className="tx-paleta-texto">{opcion.texto}</span>
                        {opcion.atajo && (
                          <span className="tx-paleta-atajo" aria-hidden="true">
                            {opcion.atajo.split(' ').map((tecla) => (
                              <Tecla key={tecla}>{tecla}</Tecla>
                            ))}
                          </span>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <div className="tx-paleta-estado" role="status">
          {buscandoPrendas && 'Buscando prendas…'}
          {termino && errorPrendas && `No se pudieron buscar prendas: ${errorPrendas}`}
          {termino && prendas !== null && opciones.length === 0 && (
            <>Ninguna prenda ni comando coincide con «{consulta.trim()}».</>
          )}
        </div>

        <div className="tx-paleta-pie" aria-hidden="true">
          <span>
            <Tecla>↑</Tecla>
            <Tecla>↓</Tecla> moverse
          </span>
          <span>
            <Tecla>Enter</Tecla> abrir
          </span>
          <span>
            <Tecla mod>Enter</Tecla> editar prenda
          </span>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default PaletaComandos
