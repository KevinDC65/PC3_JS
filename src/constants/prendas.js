// Catálogos y reglas del modelo Prenda. Se definen una sola vez y se reutilizan
// en formularios, filtros y validaciones.

/** Tipos de prenda permitidos. */
export const TIPOS = Object.freeze([
  'Polo',
  'Camisa',
  'Pantalón',
  'Casaca',
  'Vestido',
  'Polera',
  'Short',
])

/** Telas permitidas. */
export const TELAS = Object.freeze([
  'Algodón pima',
  'Algodón',
  'Poliéster',
  'Denim',
  'Lino',
  'Lana',
  'Drill',
])

/** Tallas permitidas, de menor a mayor. */
export const TALLAS = Object.freeze(['XS', 'S', 'M', 'L', 'XL', 'XXL'])

/** Valores iniciales de un formulario de prenda nueva (solo campos editables). */
export const PRENDA_VACIA = Object.freeze({
  codigo: '',
  nombre: '',
  tipo: '',
  tela: '',
  talla: '',
  color: '',
  precio: '',
  stock: '',
})

/** Por debajo de este stock la prenda se considera "stock bajo". */
export const STOCK_MINIMO = 10

/** Formato del código: 3 letras mayúsculas, guion y 3 números (ej. POL-001). */
export const PATRON_CODIGO = /^[A-Z]{3}-\d{3}$/
