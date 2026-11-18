// TODO #14: custom hook de persistencia en localStorage.
// Contrato: const [valor, setValor] = useLocalStorage(clave, valorInicial)
// Debe tolerar JSON inválido y localStorage no disponible (try/catch).
export function useLocalStorage(clave, valorInicial) {
  void clave
  return [valorInicial, () => {}]
}
