// Classe base para todos os modelos
export default abstract class ModeloBase {
  // Obrigatório todos os documentos terem esse método
  // Deve retornar os dados em formato de objeto para salvar no banco
  abstract obterDados(): Record<string, unknown>;
}
