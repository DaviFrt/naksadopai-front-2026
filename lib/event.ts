export const EVENTO = {
  nome: "Na Ksa do Pai",
  edicao: "Céus Abertos 2026",
  tema: "Na Contra Mão do Mundo",
  versiculo: "Romanos 12:2",
  // Ajuste a data/local conforme o oficial do evento
  dataInicio: "2026-09-25T19:00:00-03:00",
  dataLabel: "25 a 27 de Setembro de 2026",
  cidade: "Brejo dos Santos · PB",
  realizacao: "IEAB · NA KSA DO PAI",
} as const

export function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}
