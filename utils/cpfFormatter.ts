export function formatarCPF(cpf: unknown): string {
  const valor = String(cpf ?? "");
  // Já formatado corretamente
  if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(valor)) return valor;
  // Apenas dígitos 
  if (/^\d{11}$/.test(valor)) {
    return `${valor.slice(0, 3)}.${valor.slice(3, 6)}.${valor.slice(6, 9)}-${valor.slice(9)}`;
  }
  return valor;
}
