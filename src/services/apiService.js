import axios from 'axios'
import { hoyISO } from '../utils/formato.js'

// Único punto de acceso HTTP de la aplicación. Las páginas importan estas funciones
// y nunca usan axios ni fetch directamente.

/** URL base de json-server (configurable con VITE_API_URL en .env). */
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const RECURSO = '/prendas'

const MENSAJE_SIN_CONEXION =
  'No se pudo conectar con el servidor. Verifica que la API esté en ejecución (npm run server).'

const api = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/**
 * Convierte un error de Axios en un Error con mensaje en español para mostrar en la interfaz.
 * El error original se conserva en `cause` para depurar.
 * @param {unknown} error Error capturado.
 * @param {string} accion Verbo de la operación (ej. "listar las prendas").
 * @throws {Error} Siempre.
 */
function traducirError(error, accion) {
  const respuesta = error?.response
  if (respuesta) {
    if (respuesta.status === 404) {
      const mensaje = accion.endsWith('la prenda')
        ? 'La prenda no existe o fue eliminada.'
        : 'No se encontró el recurso de prendas en el servidor. Revisa la URL de la API.'
      throw new Error(mensaje, { cause: error })
    }
    throw new Error(`Error al ${accion} (código ${respuesta.status}).`, { cause: error })
  }
  const codigosDeRed = ['ECONNABORTED', 'ETIMEDOUT', 'ERR_NETWORK']
  if (error?.request || codigosDeRed.includes(error?.code)) {
    throw new Error(MENSAJE_SIN_CONEXION, { cause: error })
  }
  throw new Error(`Error al ${accion} (código ${error?.code ?? 'desconocido'}).`, {
    cause: error,
  })
}

/** Ejecuta una petición y devuelve solo `response.data`, traduciendo los errores. */
async function solicitar(accion, peticion) {
  try {
    const respuesta = await peticion()
    return respuesta.data
  } catch (error) {
    traducirError(error, accion)
  }
}

/** Ruta de una prenda concreta. Evita que un id vacío termine pidiendo la colección completa. */
function rutaPrenda(id) {
  if (id === undefined || id === null || String(id).trim() === '') {
    throw new Error('Identificador de prenda no válido.')
  }
  return `${RECURSO}/${encodeURIComponent(String(id).trim())}`
}

/** Copia de la prenda sin `id` (el id lo decide json-server o la URL). */
function sinId(prenda) {
  const datos = { ...prenda }
  delete datos.id
  return datos
}

/**
 * Obtiene todas las prendas.
 * @returns {Promise<object[]>}
 */
export function getAll() {
  return solicitar('listar las prendas', () => api.get(RECURSO))
}

/**
 * Obtiene una prenda por su id.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getById(id) {
  const ruta = rutaPrenda(id)
  return solicitar('obtener la prenda', () => api.get(ruta))
}

/**
 * Registra una prenda nueva. No envía `id` y asigna `fechaRegistro` de hoy si no viene.
 * @param {object} prenda Datos ya validados y normalizados.
 * @returns {Promise<object>} Prenda creada (con su `id`).
 */
export function add(prenda) {
  const datos = sinId(prenda)
  datos.fechaRegistro = datos.fechaRegistro || hoyISO()
  return solicitar('registrar la prenda', () => api.post(RECURSO, datos))
}

/**
 * Reemplaza una prenda (PUT). Si no se envía `fechaRegistro`, conserva la registrada.
 * @param {string} id
 * @param {object} prenda Datos completos ya validados y normalizados.
 * @returns {Promise<object>} Prenda actualizada.
 */
export async function update(id, prenda) {
  const ruta = rutaPrenda(id)
  const datos = sinId(prenda)
  if (!datos.fechaRegistro) {
    const actual = await getById(id)
    datos.fechaRegistro = actual.fechaRegistro
  }
  return solicitar('actualizar la prenda', () => api.put(ruta, datos))
}

/**
 * Elimina una prenda.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function remove(id) {
  const ruta = rutaPrenda(id)
  await solicitar('eliminar la prenda', () => api.delete(ruta))
}
