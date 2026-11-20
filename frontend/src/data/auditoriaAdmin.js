import { auditoriaAPI } from "../services/api"

function registar(acao, entidade, descricao) {
  auditoriaAPI.registar({
    accao: String(acao || "Acção de utilizador").slice(0, 120),
    entidade: String(entidade || "interface").slice(0, 100),
    descricao: String(descricao || "").slice(0, 2000),
  }).catch((error) => {
    console.error("Não foi possível registar a actividade no servidor.", error)
  })
}

export function registarAccaoAdmin(acao, entidade = "sistema", detalhes = "") {
  registar(acao, entidade, detalhes)
}

export function registarAccaoUtilizador(acao, entidade = "interface", detalhes = "") {
  registar(acao, entidade, detalhes)
}
