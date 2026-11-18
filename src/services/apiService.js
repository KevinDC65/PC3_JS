// TODO #8: operaciones REST contra json-server con Axios.
// Contrato (todas devuelven una Promise con los datos o lanzan Error con mensaje en español):
//   getAll()            -> GET    /prendas        -> Prenda[]
//   getById(id)         -> GET    /prendas/:id    -> Prenda
//   add(prenda)         -> POST   /prendas        -> Prenda creada
//   update(id, prenda)  -> PUT    /prendas/:id    -> Prenda actualizada
//   remove(id)          -> DELETE /prendas/:id    -> void
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const noImplementado = () => Promise.reject(new Error('apiService aún no implementado (#8)'))

export const getAll = noImplementado
export const getById = noImplementado
export const add = noImplementado
export const update = noImplementado
export const remove = noImplementado
