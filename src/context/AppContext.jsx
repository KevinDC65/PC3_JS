import { createContext, useContext } from 'react'

// TODO #6: estado global compartido (usuario autenticado, tema, configuración).
// TODO #14: persistir tema/usuario con useLocalStorage.
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const value = {}
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAppContext() {
  return useContext(AppContext)
}
