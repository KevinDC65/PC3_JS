import { muestraDeColor, esColorClaro } from '../utils/colores.js'
import { slugTela } from '../utils/inventario.js'

/**
 * Muestra de tela: el color de la prenda con la textura de su tela dibujada en CSS
 * (sarga del denim, trama del lino, punto de la lana...). Es decorativa: el color y la
 * tela siempre se escriben también como texto junto a ella.
 *
 * @param {object} props
 * @param {string} props.color Nombre del color en español.
 * @param {string} [props.tela] Una de TELAS.
 * @param {'punto'|'chip'|'panel'} [props.forma] Tamaño y forma de la muestra.
 */
function MuestraTela({ color, tela, forma = 'punto', className = '', children }) {
  const { hex } = muestraDeColor(color)
  return (
    <span
      className={`tx-muestra tx-muestra-${forma} tx-tela-${tela ? slugTela(tela) : 'lisa'} ${className}`}
      style={{ '--muestra': hex }}
      data-claro={esColorClaro(hex)}
      aria-hidden={children ? undefined : 'true'}
    >
      {children}
    </span>
  )
}

export default MuestraTela
