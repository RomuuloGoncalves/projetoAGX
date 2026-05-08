// Blacklist de tokens JWT (em memória).

const blacklist = new Set<string>();

export function adicionarNaBlacklist(token: string): void {
  blacklist.add(token);
}

export function estaNaBlacklist(token: string): boolean {
  return blacklist.has(token);
}
