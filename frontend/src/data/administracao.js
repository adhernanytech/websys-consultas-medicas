import { registarAccaoAdmin } from "./auditoriaAdmin"

/* src/data/administracao.js */


import {
  obterEspecialidadePorId,
} from "./especialidades"

import {
  guardarUsuarios,
  obterUsuarios,
  obterUsuarioAutenticado,
  usuarioIsAdmin,
  criarUsuario,
} from "./usuarios"

import {
  guardarMedicos,
  obterMedicos,
} from "./medicos"

import { obterPacientes } from "./paciente"

import { obterDisponibilidades } from "./disponibilidades"

import { obterConsultas } from "./consultas"

function exigirAdministrador() {
  const usuario = obterUsuarioAutenticado()

  if (!usuario || !usuarioIsAdmin(usuario)) {
    throw new Error(
      "Não tem autorização para executar esta operação."
    )
  }

  if (usuario.ativo === false) {
    throw new Error(
      "A conta administrativa está desactivada."
    )
  }

  return usuario
}

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function obterTipo(usuario) {
  return String(usuario?.role || usuario?.tipo || "")
    .trim()
    .toLowerCase();
}

function validarDadosConta({ nome, email, senha }) {
  if (!nome || nome.trim().length < 3) {
    throw new Error(
      "O nome deve ter pelo menos 3 caracteres."
    );
  }

  if (!emailValido(email)) {
    throw new Error("Indique um endereço de email válido.");
  }

  if (!senha || senha.length < 8) {
    throw new Error(
      "A palavra-passe deve ter pelo menos 8 caracteres."
    );
  }
}

function verificarEmailDisponivel(email) {
  const existe = obterUsuarios().some(
    (usuario) =>
      normalizarEmail(usuario.email) === email
  );

  if (existe) {
    throw new Error(
      "Já existe uma conta registada com este email."
    );
  }
}

/**
 * Indica se já existe uma conta administrativa.
 * Considera também contas desactivadas.
 */
export function existeAdministrador() {
  return obterUsuarios().some((usuario) =>
    ["admin", "administrador"].includes(
      obterTipo(usuario)
    )
  );
}

/**
 * Configura a primeira conta administrativa.
 * Só funciona se ainda não existir qualquer administrador.
 */
export function configurarPrimeiroAdministrador(dados) {
  if (existeAdministrador()) {
    throw new Error(
      "Já existe uma conta administrativa."
    );
  }

  const nome = String(dados?.nome || "").trim();
  const email = normalizarEmail(dados?.email);
  const senha = String(dados?.senha || "");

  validarDadosConta({ nome, email, senha });
  verificarEmailDisponivel(email);

  return criarUsuario({
    nome,
    email,
    senha,
    tipo: "admin",
    role: "admin",
    ativo: true,
    criadoEm: new Date().toISOString(),
  });
}


function gerarIdMedico(medicos) {
  const ids = medicos
    .map((medico) => Number(medico.id))
    .filter(
      (id) =>
        Number.isSafeInteger(id) &&
        id > 0
    )

  return ids.length
    ? Math.max(...ids) + 1
    : 1
}

/**
 * Lista os médicos juntamente com o estado
 * da respectiva conta de acesso.
 */
export function listarEstadoContasMedicas() {
  exigirAdministrador()

  const medicos = obterMedicos()
  const usuarios = obterUsuarios()

  return medicos.map((medico) => {
    const usuario =
      medico.usuarioId != null
        ? usuarios.find(
            (item) =>
              String(item.id) ===
              String(medico.usuarioId)
          )
        : null

    return {
      ...medico,

      temConta: Boolean(usuario),

      usuarioId:
        usuario?.id ??
        medico.usuarioId ??
        null,

      contaEmail:
        usuario?.email ||
        "",

      contaNome:
        usuario?.nome ||
        "",

      contaAtiva:
        usuario
          ? usuario.ativo !== false
          : false,

      contaTipo:
        usuario
          ? obterTipo(usuario)
          : null,
    }
  })
}

/**
 * Obtém um resumo geral da área administrativa.
 */
export function obterResumoAdministrativo() {
  exigirAdministrador()

  const usuarios =
    obterUsuarios()

  const pacientes =
    obterPacientes()

  const medicos =
    obterMedicos()

  const consultas =
    obterConsultas()

  const disponibilidades =
    obterDisponibilidades()

  const administradores =
    usuarios.filter(
      (usuario) =>
        obterTipo(usuario) ===
          "admin" &&
        usuario.ativo !== false
    )

  const medicosActivos =
    medicos.filter(
      (medico) =>
        medico.ativo !== false
    )

  const pacientesActivos =
    pacientes.filter(
      (paciente) =>
        paciente.ativo !== false
    )

  const consultasActivas =
    consultas.filter(
      (consulta) =>
        consulta.estado !==
        "Cancelada"
    )

  const hoje =
    new Date()

  const ano =
    hoje.getFullYear()

  const mes =
    String(
      hoje.getMonth() + 1
    ).padStart(2, "0")

  const dia =
    String(
      hoje.getDate()
    ).padStart(2, "0")

  const dataHoje =
    `${ano}-${mes}-${dia}`

  const consultasHoje =
    consultas.filter(
      (consulta) =>
        consulta.data ===
          dataHoje &&
        consulta.estado !==
          "Cancelada"
    )

  const consultasAgendadas =
    consultas.filter(
      (consulta) =>
        consulta.estado ===
        "Agendada"
    )

  const consultasConfirmadas =
    consultas.filter(
      (consulta) =>
        consulta.estado ===
        "Confirmada"
    )

  const consultasRealizadas =
    consultas.filter(
      (consulta) =>
        consulta.estado ===
        "Realizada"
    )

  const consultasCanceladas =
    consultas.filter(
      (consulta) =>
        consulta.estado ===
        "Cancelada"
    )

  const medicosComConta =
    medicos.filter(
      (medico) =>
        medico.usuarioId != null
    )

  const medicosSemConta =
    medicos.filter(
      (medico) =>
        medico.usuarioId == null
    )

  const disponibilidadesLivres =
    disponibilidades.filter(
      (item) =>
        item.estado ===
        "Disponível"
    )

  const registosClinicos =
    (() => {
      try {
        const dados =
          JSON.parse(
            localStorage.getItem(
              "registosClinicos"
            )
          )

        return Array.isArray(dados)
          ? dados
          : []
      } catch {
        return []
      }
    })()

      return {
    totalPacientes: pacientes.length,
    pacientesActivos: pacientesActivos.length,

    totalMedicos: medicos.length,
    medicosActivos: medicosActivos.length,

    totalConsultas: consultas.length,
    consultasActivas: consultasActivas.length,
    consultasHoje: consultasHoje.length,
    consultasAgendadas: consultasAgendadas.length,
    consultasConfirmadas: consultasConfirmadas.length,
    consultasRealizadas: consultasRealizadas.length,
    consultasCanceladas: consultasCanceladas.length,

    totalDisponibilidades: disponibilidades.length,
    disponibilidadesLivres: disponibilidadesLivres.length,

    totalRegistosClinicos: registosClinicos.length,
    totalAdministradores: administradores.length,

    medicosComConta: medicosComConta.length,
    medicosSemConta: medicosSemConta.length,
  };

}

  
function gerarSenhaInicial() {
  const caracteres =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"

  let parteAleatoria = ""

  for (let i = 0; i < 8; i++) {
    parteAleatoria += caracteres[
      Math.floor(Math.random() * caracteres.length)
    ]
  }

  return `Med!${parteAleatoria}9`
}

/**
 * Cria uma nova conta e um novo perfil médico.
 * A conta começa desactivada e exige mudança de senha.
 */
export function criarMedicoComConta({
  nome,
  email,
  sexo,
  especialidadeId,
  foto,
}) {
  const administrador = exigirAdministrador()

  const nomeFinal = String(nome || "").trim()
  const emailFinal = normalizarEmail(email)
  const sexoFinal = String(sexo || "").trim().toUpperCase()

  if (nomeFinal.length < 3) {
    throw new Error(
      "O nome deve ter pelo menos 3 caracteres."
    )
  }

  if (!emailValido(emailFinal)) {
    throw new Error("Indique um endereço de email válido.")
  }

  if (!["M", "F"].includes(sexoFinal)) {
    throw new Error("Seleccione o sexo M ou F.")
  }

  verificarEmailDisponivel(emailFinal)

  const especialidade = obterEspecialidadePorId(
    especialidadeId
  )

  if (!especialidade || especialidade.ativo === false) {
    throw new Error(
      "Seleccione uma especialidade activa."
    )
  }
  if (typeof foto !== "string" || !foto.startsWith("data:image/") || foto.length > 2800000) {
    throw new Error("A fotografia é obrigatória e deve ser uma imagem válida até 2 MB.")
  }

  const senhaInicial = gerarSenhaInicial()
  const medicosAntes = obterMedicos()
  let novoUsuario = null

  try {
    novoUsuario = criarUsuario({
      nome: nomeFinal,
      email: emailFinal,
      senha: senhaInicial,
      tipo: "medico",
      role: "medico",
      ativo: false,
      deveAlterarSenha: true,
      criadoPor: administrador.id,
      criadoEm: new Date().toISOString(),
    })

    const ids = medicosAntes
      .map((medico) => Number(medico.id))
      .filter((id) => Number.isSafeInteger(id) && id > 0)

    const novoMedico = {
      id: ids.length ? Math.max(...ids) + 1 : 1,
      usuarioId: novoUsuario.id,
      nome: nomeFinal,
      sexo: sexoFinal,
      especialidade: especialidade.nome,
      especialidadeId: especialidade.id,
      experiencia: "",
      biografia: "",
      foto,
      ativo: true,
    }

    guardarMedicos([
      ...medicosAntes,
      novoMedico,
    ])
    registarAccaoAdmin("Conta médica criada", "médico", `${nomeFinal}; especialidade: ${especialidade.nome}; médico ID ${novoMedico.id}; utilizador ID ${novoUsuario.id}`)

    return {
      usuario: novoUsuario,
      medico: novoMedico,
      senhaInicial,
    }
  } catch (error) {
    // Reverte a conta se a gravação do perfil falhar.
    if (novoUsuario) {
      guardarUsuarios(
        obterUsuarios().filter(
          (usuario) =>
            String(usuario.id) !== String(novoUsuario.id)
        )
      ) 
    }

    guardarMedicos(medicosAntes)
    throw error
  }
}




/** Eliminação administrativa definitiva, apenas se não houver histórico associado. */
export function eliminarContaMedica(medicoId) {
  const administrador = exigirAdministrador()
  const medicos = obterMedicos()
  const medico = medicos.find(item => String(item.id) === String(medicoId))
  if (!medico) throw new Error("Médico não encontrado.")
  const consultas = obterConsultas()
  const temConsultas = consultas.some(c => String(c.medicoId ?? c.medico_id ?? c.idMedico ?? "") === String(medico.id))
  let registos = []
  try { registos = JSON.parse(localStorage.getItem("registosClinicos") || "[]") } catch { registos = [] }
  const temRegistos = registos.some(r => String(r.medicoId ?? r.medico_id ?? r.idMedico ?? "") === String(medico.id))
  if (temConsultas || temRegistos) throw new Error("Esta conta já tem consultas ou registos clínicos associados. Por segurança, não pode ser eliminada definitivamente; desactive-a em vez disso.")
  if (medico.usuarioId != null && String(medico.usuarioId) === String(administrador.id)) throw new Error("Não é permitido eliminar a conta administrativa principal.")
  guardarMedicos(medicos.filter(item => String(item.id) !== String(medico.id)))
  if (medico.usuarioId != null) guardarUsuarios(obterUsuarios().filter(u => String(u.id) !== String(medico.usuarioId)))
  const disponibilidades = obterDisponibilidades().filter(d => String(d.medicoId ?? d.medico_id ?? "") !== String(medico.id))
  localStorage.setItem("disponibilidades", JSON.stringify(disponibilidades))
  registarAccaoAdmin("Conta médica eliminada definitivamente", "médico", `${medico.nome} (ID ${medico.id})`)
  return medico
}
