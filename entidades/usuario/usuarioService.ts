import UsuarioModelo from "../../models/usuario.ts";
import RepositorioUsuario from "./usuarioRepository.ts";

// Serviço para lógica de negócio dos usuários
export default class ServicoUsuario {
  private readonly repositorio: RepositorioUsuario;

  constructor(repositorio: RepositorioUsuario) {
    this.repositorio = repositorio;
  }

  // Listar todos os usuários
  async listar(): Promise<UsuarioModelo[]> {
    return this.repositorio.obterTodos();
  }

  // Obter um usuário pelo ID
  async obterPorId(usuarioId: string): Promise<UsuarioModelo> {
    const usuario = await this.repositorio.obterPorId(usuarioId);
    if (!usuario) {
      const erro = new Error("Usuário não encontrado") as any;
      erro.code = 400;
      throw erro;
    }
    return usuario;
  }

  // Criar um novo usuário
  async criar(usuario: UsuarioModelo): Promise<UsuarioModelo> {
    // Verificar se o email já existe
    const usuarioExistenteEmail = await this.repositorio.obterPorEmail(
      usuario.obterEmail(),
    );
    if (usuarioExistenteEmail) {
      const erro = new Error(`Já existe um usuário com o email "${usuario.obterEmail()}".`) as any;
      erro.code = 409;
      erro.data = { id: usuarioExistenteEmail.obterID() };
      throw erro;
    }

    // Verificar se o CPF já existe
    const usuarioExistenteCPF = await this.repositorio.obterPorCPF(
      usuario.obterCPF(),
    );
    if (usuarioExistenteCPF) {
      const erro = new Error(`Já existe um usuário com o CPF "${usuario.obterCPF()}".`) as any;
      erro.code = 409;
      erro.data = { id: usuarioExistenteCPF.obterID() };
      throw erro;
    }

    // Criar o usuário
    const usuarioCriado = await this.repositorio.criar(usuario);
    if (!usuarioCriado) {
      const erro = new Error("Falha ao criar usuário") as any;
      erro.code = 500;
      throw erro;
    }
    return usuarioCriado;
  }

  // Deletar um usuário
  async deletar(usuarioId: string): Promise<UsuarioModelo> {
    const usuarioDeletado = await this.repositorio.deletarPorId(usuarioId);
    if (!usuarioDeletado) {
      const erro = new Error("Usuário não encontrado") as any;
      erro.code = 400;
      throw erro;
    }
    return usuarioDeletado;
  }
}
