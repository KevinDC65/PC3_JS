// Traduce el nombre de un color escrito en español (texto libre del formulario) a una
// muestra hexadecimal. Si el nombre no está en el mapa, se calcula un tono estable a
// partir del texto, de modo que el mismo nombre siempre produce la misma muestra.

/** Minúsculas, sin tildes y con un solo espacio entre palabras. */
export function normalizarNombreColor(nombre) {
  return String(nombre ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Mapa de colores habituales en confección. Las claves van normalizadas. */
const MAPA_COLORES = {
  blanco: '#f5f4ef',
  'blanco optico': '#fbfbf9',
  'blanco hueso': '#ece5d4',
  hueso: '#e6dcc6',
  crudo: '#e4dac3',
  marfil: '#efe8d6',
  perla: '#dcdad3',
  crema: '#ede0bf',
  vainilla: '#efe2b4',
  beige: '#d8c4a2',
  arena: '#d1bc94',
  avena: '#cfc1a2',
  caqui: '#b3a178',
  kaki: '#b3a178',
  camel: '#b8884f',
  camello: '#b8884f',
  vicuna: '#c29a6b',
  alpaca: '#c9b79a',
  tostado: '#a97b4f',
  canela: '#a5683a',
  tabaco: '#7a5232',
  nogal: '#6a4a33',
  marron: '#6b4428',
  cafe: '#6b4428',
  chocolate: '#4b2e1e',
  tierra: '#8a5a3b',
  ocre: '#c08a2e',
  mostaza: '#c99a2e',
  dorado: '#c7a03d',
  amarillo: '#e6c12f',
  'amarillo patito': '#f2d64b',
  limon: '#d9d84a',
  naranja: '#e0782c',
  anaranjado: '#e0782c',
  mandarina: '#ec8a35',
  durazno: '#f0b48f',
  melon: '#efa77a',
  salmon: '#e89a80',
  coral: '#e8735d',
  terracota: '#b4583a',
  ladrillo: '#9b4a33',
  oxido: '#a04a26',
  rojo: '#c0282d',
  carmin: '#a3173f',
  carmesi: '#a51c30',
  cochinilla: '#a3173f',
  cereza: '#8e1b2c',
  granate: '#7a1f2b',
  guinda: '#6e1a2c',
  vino: '#5e1a26',
  burdeos: '#5f1e2b',
  bordo: '#5f1e2b',
  fucsia: '#c42b7a',
  magenta: '#b0287a',
  rosado: '#e6a1b0',
  rosa: '#e6a1b0',
  'rosa palo': '#e6c2c0',
  'palo rosa': '#e6c2c0',
  'rosa viejo': '#c08a8f',
  lila: '#b8a2cc',
  lavanda: '#b6acd4',
  malva: '#a07f9c',
  morado: '#5b3477',
  violeta: '#6a4c9c',
  purpura: '#5e2c6e',
  berenjena: '#4a2840',
  azul: '#2f55a4',
  'azul marino': '#1e2a4a',
  marino: '#1e2a4a',
  'azul noche': '#18213c',
  'azul indigo': '#2b3a78',
  indigo: '#2b3a78',
  anil: '#263a8c',
  'azul rey': '#2846a8',
  'azul francia': '#2f5fc4',
  'azul electrico': '#2c5be0',
  'azul acero': '#4a6a8a',
  acero: '#4a6a8a',
  'azul deslavado': '#7c9bbf',
  'azul petroleo': '#1d4f5a',
  petroleo: '#1d4f5a',
  denim: '#3d5a80',
  celeste: '#8ec3e6',
  cielo: '#9ccbea',
  turquesa: '#2ba39f',
  'verde agua': '#79c6b4',
  aguamarina: '#6fc6b8',
  menta: '#a6d6bc',
  verde: '#3d7a45',
  'verde olivo': '#6b6b32',
  olivo: '#6b6b32',
  oliva: '#6b6b32',
  'verde militar': '#4b5236',
  militar: '#4b5236',
  'verde botella': '#1f4a33',
  'verde bosque': '#2c4f32',
  esmeralda: '#1f7a55',
  jade: '#3f8f6f',
  'verde limon': '#9dc33b',
  pistacho: '#b5c98a',
  salvia: '#9cab8a',
  musgo: '#5b6b3a',
  gris: '#8a8c90',
  'gris claro': '#c9cacc',
  'gris oscuro': '#4a4c52',
  'gris perla': '#c8c8c4',
  'gris jaspeado': '#9a9b9e',
  jaspeado: '#9a9b9e',
  melange: '#9a9b9e',
  plomo: '#7d8087',
  ceniza: '#b2b1ad',
  humo: '#a4a5a8',
  plata: '#b8bcc2',
  grafito: '#3e4046',
  antracita: '#383a40',
  carbon: '#33343a',
  negro: '#1b1b1e',
}

/** Modificadores que aclaran u oscurecen el color base. */
const MODIFICADORES = {
  claro: 0.38,
  clarito: 0.45,
  pastel: 0.55,
  bebe: 0.5,
  palido: 0.45,
  oscuro: -0.32,
  profundo: -0.25,
  intenso: -0.12,
}

/** Sugerencias para el datalist del formulario (nombre visible con mayúscula inicial). */
export const SUGERENCIAS_COLOR = Object.freeze(
  [
    'Blanco',
    'Blanco hueso',
    'Crudo',
    'Beige',
    'Arena',
    'Caqui',
    'Camel',
    'Mostaza',
    'Amarillo',
    'Naranja',
    'Coral',
    'Terracota',
    'Rojo',
    'Guinda',
    'Vino',
    'Rosado',
    'Palo rosa',
    'Lila',
    'Morado',
    'Celeste',
    'Azul',
    'Azul marino',
    'Azul índigo',
    'Azul deslavado',
    'Azul petróleo',
    'Turquesa',
    'Verde agua',
    'Verde',
    'Verde olivo',
    'Verde militar',
    'Verde botella',
    'Marrón',
    'Chocolate',
    'Gris',
    'Gris jaspeado',
    'Gris oscuro',
    'Plomo',
    'Carbón',
    'Negro',
  ].sort((a, b) => a.localeCompare(b, 'es')),
)

function hexARgb(hex) {
  const limpio = hex.replace('#', '')
  return [0, 2, 4].map((inicio) => parseInt(limpio.slice(inicio, inicio + 2), 16))
}

function rgbAHex([r, g, b]) {
  return `#${[r, g, b]
    .map((canal) =>
      Math.round(Math.min(255, Math.max(0, canal)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

/** Mezcla el color con blanco (cantidad > 0) o con negro (cantidad < 0). */
function ajustarLuz(hex, cantidad) {
  const destino = cantidad > 0 ? 255 : 0
  const peso = Math.abs(cantidad)
  return rgbAHex(hexARgb(hex).map((canal) => canal + (destino - canal) * peso))
}

/** Tono estable a partir del texto (hash FNV-1a): el mismo nombre, el mismo color. */
function colorPorHash(texto) {
  let hash = 2166136261
  for (const caracter of texto) {
    hash ^= caracter.codePointAt(0)
    hash = Math.imul(hash, 16777619)
  }
  const tono = Math.abs(hash) % 360
  const saturacion = 32 + (Math.abs(hash >> 9) % 18)
  const luz = 42 + (Math.abs(hash >> 17) % 18)
  return hslAHex(tono, saturacion, luz)
}

function hslAHex(h, s, l) {
  const sat = s / 100
  const luz = l / 100
  const k = (n) => (n + h / 30) % 12
  const a = sat * Math.min(luz, 1 - luz)
  const canal = (n) => 255 * (luz - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))
  return rgbAHex([canal(0), canal(8), canal(4)])
}

/**
 * Devuelve la muestra de un color escrito en español.
 * @param {string} nombre Ej. "Azul marino", "Verde olivo claro", "Celeste".
 * @returns {{ hex: string, conocido: boolean }} `conocido` es false si se usó el color por hash.
 */
export function muestraDeColor(nombre) {
  const normal = normalizarNombreColor(nombre)
  if (!normal) return { hex: '#d6d5cf', conocido: false }
  if (MAPA_COLORES[normal]) return { hex: MAPA_COLORES[normal], conocido: true }

  const palabras = normal.split(' ')
  const ajuste = palabras.reduce((total, palabra) => total + (MODIFICADORES[palabra] ?? 0), 0)
  const sinModificadores = palabras.filter((palabra) => !(palabra in MODIFICADORES))

  // Se busca la combinación de palabras consecutivas más larga que exista en el mapa.
  for (let largo = sinModificadores.length; largo > 0; largo -= 1) {
    for (let inicio = 0; inicio + largo <= sinModificadores.length; inicio += 1) {
      const clave = sinModificadores.slice(inicio, inicio + largo).join(' ')
      if (MAPA_COLORES[clave]) {
        const base = MAPA_COLORES[clave]
        return { hex: ajuste ? ajustarLuz(base, ajuste) : base, conocido: true }
      }
    }
  }

  return { hex: colorPorHash(normal), conocido: false }
}

/** Luminancia relativa (WCAG) de un color hexadecimal. */
export function luminancia(hex) {
  const [r, g, b] = hexARgb(hex).map((canal) => {
    const c = canal / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Indica si sobre ese color conviene texto oscuro. */
export function esColorClaro(hex) {
  return luminancia(hex) > 0.36
}
