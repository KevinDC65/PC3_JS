import { PATRON_CODIGO, TALLAS, TELAS, TIPOS } from '../constants/prendas.js'

const esVacio = (valor) => valor === undefined || valor === null || String(valor).trim() === ''

const texto = (valor) => String(valor ?? '').trim()

/**
 * Valida una prenda según las reglas del modelo. Función pura: no modifica la prenda.
 * Acepta precio y stock como texto (valor de un input) o como número.
 *
 * @param {object} prenda Datos del formulario.
 * @param {{ codigosExistentes?: string[] }} [opciones] Códigos ya registrados.
 *   En modo edición, excluye el código de la propia prenda.
 * @returns {Record<string, string>} Solo los campos con error; objeto vacío = válido.
 */
export function validarPrenda(prenda, { codigosExistentes = [] } = {}) {
  const datos = prenda ?? {}
  const errores = {}

  const codigo = texto(datos.codigo)
  if (!codigo) {
    errores.codigo = 'El código es obligatorio.'
  } else if (!PATRON_CODIGO.test(codigo)) {
    errores.codigo = 'Formato: 3 letras mayúsculas, guion y 3 números (ej. POL-001).'
  } else if (codigosExistentes.some((existente) => texto(existente).toUpperCase() === codigo)) {
    errores.codigo = `El código ${codigo} ya está registrado.`
  }

  const nombre = texto(datos.nombre)
  if (!nombre) {
    errores.nombre = 'El nombre es obligatorio.'
  } else if (nombre.length < 3 || nombre.length > 60) {
    errores.nombre = 'El nombre debe tener entre 3 y 60 caracteres.'
  }

  const catalogos = [
    ['tipo', TIPOS, 'Selecciona un tipo de prenda.', 'El tipo seleccionado no es válido.'],
    ['tela', TELAS, 'Selecciona una tela.', 'La tela seleccionada no es válida.'],
    ['talla', TALLAS, 'Selecciona una talla.', 'La talla seleccionada no es válida.'],
  ]
  for (const [campo, opciones, mensajeVacio, mensajeInvalido] of catalogos) {
    const valor = texto(datos[campo])
    if (!valor) {
      errores[campo] = mensajeVacio
    } else if (!opciones.includes(valor)) {
      errores[campo] = mensajeInvalido
    }
  }

  const color = texto(datos.color)
  if (!color) {
    errores.color = 'El color es obligatorio.'
  } else if (color.length < 2 || color.length > 30) {
    errores.color = 'El color debe tener entre 2 y 30 caracteres.'
  }

  if (esVacio(datos.precio)) {
    errores.precio = 'El precio es obligatorio.'
  } else {
    const precio = Number(datos.precio)
    if (!Number.isFinite(precio)) {
      errores.precio = 'Ingresa un precio válido (usa punto decimal, ej. 39.90).'
    } else if (precio <= 0) {
      errores.precio = 'El precio debe ser mayor que 0.'
    } else if (Math.round(precio * 100) / 100 !== precio) {
      errores.precio = 'El precio admite como máximo 2 decimales.'
    }
  }

  if (esVacio(datos.stock)) {
    errores.stock = 'El stock es obligatorio.'
  } else {
    const stock = Number(datos.stock)
    if (!Number.isInteger(stock)) {
      errores.stock = 'El stock debe ser un número entero.'
    } else if (stock < 0) {
      errores.stock = 'El stock no puede ser negativo.'
    }
  }

  return errores
}

/**
 * Limpia los datos antes de enviarlos a la API: recorta textos, pasa el código a
 * mayúsculas y convierte precio y stock a número. Conserva el resto de campos
 * (por ejemplo `id` o `fechaRegistro`).
 *
 * @param {object} prenda
 * @returns {object} Nueva prenda normalizada.
 */
export function normalizarPrenda(prenda) {
  const datos = prenda ?? {}
  return {
    ...datos,
    codigo: texto(datos.codigo).toUpperCase(),
    nombre: texto(datos.nombre),
    tipo: texto(datos.tipo),
    tela: texto(datos.tela),
    talla: texto(datos.talla),
    color: texto(datos.color),
    precio: Number(datos.precio),
    stock: Number(datos.stock),
  }
}
