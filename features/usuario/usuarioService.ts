import throwlhos from "throwlhos";
import UsuarioModelo from "../../models/usuario.ts";
import UsuarioRepository from "./usuarioRepository.ts";
import bcryptjs from "bcryptjs";

export default class UsuarioService {
  private readonly repositorio: UsuarioRepository;

  constructor(repositorio: UsuarioRepository) {
    this.repositorio = repositorio;
  }

  // Listar todos os usuários
  listar(): Promise<UsuarioModelo[]> {
    return this.repositorio.obterTodos();
  }

  // Obter um usuário pelo ID
  async obterPorId(usuarioId: string): Promise<UsuarioModelo> {
    const usuario = await this.repositorio.obterPorId(usuarioId);
    if (!usuario) {
      throw throwlhos.default.err_badRequest("Usuário não encontrado.");
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
      throw throwlhos.default.err_conflict(
        `Já existe um usuário com o email "${usuario.obterEmail()}".`,
        { id: usuarioExistenteEmail.obterID() },
      );
    }

    // Verificar se o CPF já existe
    const usuarioExistenteCPF = await this.repositorio.obterPorCPF(
      usuario.obterCPF(),
    );
    if (usuarioExistenteCPF) {
      throw throwlhos.default.err_conflict(
        `Já existe um usuário com o CPF "${usuario.obterCPF()}".`,
        { id: usuarioExistenteCPF.obterID() },
      );
    }

    // Fazer o hash da senha antes de salvar
    const hash = bcryptjs.hashSync(usuario.obterSenha(), 10);
    usuario.definirSenha(hash);

    // Criar o usuário
    const usuarioCriado = await this.repositorio.criar(usuario);
    if (!usuarioCriado) {
      throw throwlhos.default.err_internalServerError("Falha ao criar usuário.");
    }
    return usuarioCriado;
  }

  // Atualizar um usuário
  async atualizar(usuarioId: string, dados: Partial<Record<string, unknown>>): Promise<UsuarioModelo> {
    if (dados.senha && typeof dados.senha === 'string') {
      dados.senha = bcryptjs.hashSync(dados.senha, 10);
    }
    const usuarioAtualizado = await this.repositorio.atualizarPorId(usuarioId, dados);
    if (!usuarioAtualizado) {
      throw throwlhos.default.err_badRequest("Usuário não encontrado.");
    }
    return usuarioAtualizado;
  }

  // Deletar um usuário
  async deletar(usuarioId: string): Promise<UsuarioModelo> {
    const usuarioDeletado = await this.repositorio.deletarPorId(usuarioId);
    if (!usuarioDeletado) {
      throw throwlhos.default.err_badRequest("Usuário não encontrado.");
    }
    return usuarioDeletado;
  }
}
