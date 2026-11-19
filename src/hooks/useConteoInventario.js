import { useEffect, useState } from 'react'
import { getAll } from '../services/apiService.js'
import { EVENTO_INVENTARIO, esStockBajo } from '../utils/inventario.js'

/**
 * Cuenta prendas y prendas con stock bajo para la barra lateral. Vuelve a consultar la
 * API cuando una página avisa que el inventario cambió (registro, edición o eliminación).
 * Si la API no responde, devuelve `null` en los conteos y la barra simplemente los oculta.
 *
 * @param {number} stockMinimo
 * @returns {{ total: number|null, stockBajo: number|null }}
 */
export function useConteoInventario(stockMinimo) {
  const [conteo, setConteo] = useState({ total: null, stockBajo: null })

  useEffect(() => {
    let activo = true
    function consultar() {
      getAll()
        .then((prendas) => {
          if (!activo) return
          setConteo({
            total: prendas.length,
            stockBajo: prendas.filter((prenda) => esStockBajo(prenda, stockMinimo)).length,
          })
        })
        .catch(() => {
          if (activo) setConteo({ total: null, stockBajo: null })
        })
    }
    consultar()
    window.addEventListener(EVENTO_INVENTARIO, consultar)
    return () => {
      activo = false
      window.removeEventListener(EVENTO_INVENTARIO, consultar)
    }
  }, [stockMinimo])

  return conteo
}
