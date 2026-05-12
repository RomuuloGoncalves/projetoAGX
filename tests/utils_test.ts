import { assertEquals } from "@std/assert";
import { formatarCPF } from "../utils/cpfFormatter.ts";

Deno.test("Utils - cpfFormatter", async (t) => {
  await t.step("Deve retornar string vazia se valor for vazio ou undefined", () => {
    assertEquals(formatarCPF(""), "");
    assertEquals(formatarCPF(undefined), "");
  });

  await t.step("Deve retornar o próprio valor se já estiver formatado", () => {
    assertEquals(formatarCPF("123.456.789-00"), "123.456.789-00");
  });

  await t.step("Deve formatar corretamente um CPF de 11 dígitos", () => {
    assertEquals(formatarCPF("12345678900"), "123.456.789-00");
  });

  await t.step("Deve retornar o próprio valor para CPFs inválidos ou fora do padrão", () => {
    assertEquals(formatarCPF("12345"), "12345");
    assertEquals(formatarCPF("123.456.789-000"), "123.456.789-000");
  });
});
