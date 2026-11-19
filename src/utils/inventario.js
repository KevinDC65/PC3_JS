import { TALLAS, TELAS, TIPOS } from '../constants/prendas.js'

// Cálculos sobre la lista de prendas compartidos por Inicio, Lista, la barra lateral y la
// paleta de comandos. Funciones puras: no llaman a la API ni modifican las prendas.

/** Tintes naturales andinos usados como serie de datos (uno por tipo de prenda). */
export const TINTES = Object.freeze([
  'anil',
  'cochinilla',
  'qolle',
  'chilca',
  'nogal',
  'molle',
  'tara',
])

/** Tinte asignado a cada tipo, en el orden de TIPOS. */
export const tinteDeTipo = (tipo) => TINTES[Math.max(0, TIPOS.indexOf(tipo)) % TINTES.length]

/** Clase CSS de la textura de cada tela. */
const SLUG_TELA = {
  'Algodón pima': 'pima',
  Algodón: 'algodon',
  Poliéster: 'poliester',
  Denim: 'denim',
  Lino: 'lino',
  Lana: 'lana',
  Drill: 'drill',
}

export const slugTela = (tela) => SLUG_TELA[tela] ?? 'algodon'

/** Minúsculas y sin tildes, para que "pantalon" encuentre "Pantalón". */
export const normalizarTexto = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

export const esStockBajo = (prenda, minimo) => Number(prenda?.stock) < minimo

/**
 * Resume el inventario para el panel de inicio y la barra lateral.
 * @param {object[]} prendas
 * @param {number} minimo Stock mínimo (config.stockMinimo).
 */
export function resumirInventario(prendas, minimo) {
  const lista = Array.isArray(prendas) ? prendas : []
  const numero = (valor) => (Number.isFinite(Number(valor)) ? Number(valor) : 0)
  const unidades = lista.reduce((total, prenda) => total + numero(prenda.stock), 0)
  const valor = lista.reduce(
    (total, prenda) => total + numero(prenda.precio) * numero(prenda.stock),
    0,
  )
  const conStockBajo = lista
    .filter((prenda) => esStockBajo(prenda, minimo))
    .sort((a, b) => numero(a.stock) - numero(b.stock))

  const unidadesPor = (campo, valores) =>
    valores.map((clave) => ({
      clave,
      prendas: lista.filter((prenda) => prenda[campo] === clave).length,
      unidades: lista
        .filter((prenda) => prenda[campo] === clave)
        .reduce((total, prenda) => total + numero(prenda.stock), 0),
    }))

  const recientes = [...lista]
    .sort((a, b) => String(b.fechaRegistro).localeCompare(String(a.fechaRegistro)))
    .slice(0, 4)

  return {
    prendas: lista.length,
    unidades,
    valor,
    conStockBajo,
    porTipo: unidadesPor('tipo', TIPOS),
    porTalla: unidadesPor('talla', TALLAS),
    porTela: unidadesPor('tela', TELAS),
    recientes,
  }
}

/** Campos por los que se puede ordenar la lista. */
export const CAMPOS_ORDEN = Object.freeze([
  'codigo',
  'nombre',
  'tipo',
  'tela',
  'talla',
  'precio',
  'stock',
  'fechaRegistro',
])

/** Ordena una copia de las prendas. `orden` tiene la forma "campo-asc" o "campo-desc". */
export function ordenarPrendas(prendas, orden) {
  const [campo, direccion] = String(orden).split('-')
  const factor = direccion === 'desc' ? -1 : 1
  const comparar = (a, b) => {
    if (campo === 'precio' || campo === 'stock') return Number(a[campo]) - Number(b[campo])
    if (campo === 'talla') return TALLAS.indexOf(a.talla) - TALLAS.indexOf(b.talla)
    return String(a[campo] ?? '').localeCompare(String(b[campo] ?? ''), 'es', { numeric: true })
  }
  return [...prendas].sort((a, b) => comparar(a, b) * factor || comparar(a, b))
}

/** Filtra por texto (código o nombre) y por tipo, talla, tela y stock bajo. */
export function filtrarPrendas(prendas, { texto, tipo, talla, tela, soloStockBajo, minimo }) {
  const termino = normalizarTexto(String(texto ?? '').trim())
  return prendas.filter(
    (prenda) =>
      (!termino ||
        normalizarTexto(prenda.codigo).includes(termino) ||
        normalizarTexto(prenda.nombre).includes(termino)) &&
      (!tipo || prenda.tipo === tipo) &&
      (!talla || prenda.talla === talla) &&
      (!tela || prenda.tela === tela) &&
      (!soloStockBajo || esStockBajo(prenda, minimo)),
  )
}

/** Evento de ventana que avisa a la barra lateral que el inventario cambió. */
export const EVENTO_INVENTARIO = 'textilapp:inventario-cambio'

export function avisarCambioInventario() {
  window.dispatchEvent(new Event(EVENTO_INVENTARIO))
}
