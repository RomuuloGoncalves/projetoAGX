import { assertEquals } from "@std/assert";
import Autor from "../models/autor.ts";
import Emprestimo from "../models/emprestimo.ts";
import Livro from "../models/livro.ts";
import Usuario from "../models/usuario.ts";

Deno.test("Models - Autor", async (t) => {
  await t.step("Deve criar, obter e atualizar atributos", () => {
    const autor = new Autor({ id: "1", nome: "Machado", nacionalidade: "BR" });
    
    assertEquals(autor.obterID(), "1");
    assertEquals(autor.obterNome(), "Machado");
    assertEquals(autor.obterNacionalidade(), "BR");

    autor.definirNome("Assis");
    autor.definirNacionalidade("PT");
    
    assertEquals(autor.obterNome(), "Assis");
    assertEquals(autor.obterNacionalidade(), "PT");

    const json = autor.paraJSON();
    assertEquals(json.nome, "Assis");
    assertEquals(json.nacionalidade, "PT");
  });
});

Deno.test("Models - Emprestimo", async (t) => {
  const agora = new Date();
  await t.step("Deve criar, obter e atualizar atributos", () => {
    const emprestimo = new Emprestimo({
      id: "2",
      usuarioId: "u1",
      livroId: "l1",
      dataEmprestimo: agora,
      dataDevolucao: null,
      status: "ativo"
    });

    assertEquals(emprestimo.obterUsuarioId(), "u1");
    assertEquals(emprestimo.obterDataEmprestimo(), agora);
    assertEquals(emprestimo.obterDataDevolucao(), null);
    assertEquals(emprestimo.obterStatus(), "ativo");

    emprestimo.definirDataDevolucao(agora);
    emprestimo.definirStatus("devolvido");

    assertEquals(emprestimo.obterDataDevolucao(), agora);
    assertEquals(emprestimo.obterStatus(), "devolvido");

    const json = emprestimo.paraJSON();
    assertEquals(json.status, "devolvido");
  });
});

Deno.test("Models - Livro", async (t) => {
  await t.step("Deve criar, obter e atualizar atributos", () => {
    const livro = new Livro({
      id: "3",
      autorId: "a1",
      titulo: "T1",
      ano: 2020,
      quantidadeTotal: 5,
      quantidadeDisponivel: 5,
      isbn: 123
    });

    assertEquals(livro.obterAutorId(), "a1");
    assertEquals(livro.obterTitulo(), "T1");
    assertEquals(livro.obterAno(), 2020);
    assertEquals(livro.obterQuantidadeTotal(), 5);

    livro.definirTitulo("T2");
    livro.definirQuantidadeTotal(10);
    livro.definirQuantidadeDisponivel(8);

    assertEquals(livro.obterTitulo(), "T2");
    assertEquals(livro.obterQuantidadeTotal(), 10);
    assertEquals(livro.obterQuantidadeDisponivel(), 8);
  });
});

Deno.test("Models - Usuario", async (t) => {
  const agora = new Date();
  await t.step("Deve criar, obter e atualizar atributos", () => {
    const usuario = new Usuario({
      id: "4",
      nome: "U1",
      email: "u1@email.com",
      senha: "123",
      cpf: "123",
      dataNascimento: agora,
      role: "comum"
    });

    assertEquals(usuario.obterDataNascimento(), agora);

    usuario.definirNome("U2");
    usuario.definirEmail("u2@email.com");
    usuario.definirCPF("456");
    usuario.definirDataNascimento(agora);
    usuario.definirRole("admin");

    assertEquals(usuario.obterNome(), "U2");
    assertEquals(usuario.obterEmail(), "u2@email.com");
    assertEquals(usuario.obterCPF(), "456");
    assertEquals(usuario.obterRole(), "admin");
  });
});
