const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const formatoSoles = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Da formato de moneda peruana a un número.
 * @param {number|string} n Monto en soles.
 * @returns {string} Ej. `formatearPrecio(39.9)` → "S/ 39.90". Si no es un número, "S/ —".
 */
export function formatearPrecio(n) {
  const monto = Number(n)
  if (n === null || n === '' || !Number.isFinite(monto)) return 'S/ —'
  return `S/ ${formatoSoles.format(monto)}`
}

/**
 * Convierte una fecha `YYYY-MM-DD` a texto corto en español sin usar `Date`,
 * para evitar desfases por zona horaria.
 * @param {string} fechaISO Ej. "2026-11-18".
 * @returns {string} Ej. "18 nov 2026". Devuelve el texto original si no tiene el formato esperado.
 */
export function formatearFecha(fechaISO) {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(fechaISO ?? '').trim())
  if (!coincidencia) return fechaISO ?? ''
  const [, anio, mes, dia] = coincidencia
  const nombreMes = MESES[Number(mes) - 1]
  if (!nombreMes || Number(dia) < 1 || Number(dia) > 31) return fechaISO
  return `${Number(dia)} ${nombreMes} ${anio}`
}

/**
 * Fecha local (no UTC) en formato `YYYY-MM-DD`.
 * @param {Date} [fecha] Por defecto, hoy.
 * @returns {string}
 */
export function hoyISO(fecha = new Date()) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}
