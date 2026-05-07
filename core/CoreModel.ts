// Classe base para todos os modelos
// Força cada modelo a implementar um método que retorna os dados como objeto
export default abstract class ModeloBase {
  // Deve retornar os dados em formato de objeto para salvar no banco
  abstract obterDados(): Record<string, unknown>;
}
