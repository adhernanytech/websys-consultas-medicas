
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
  obterMedicoDaConta,
  associarContaAMedico,
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
 * Cria um novo perfil médico.
 *
 * Esta operação NÃO cria uma conta de acesso.
 * É utilizada quando o administrador precisa
 * criar um perfil novo sem associá-lo ainda
 * a uma conta.
 */
export function criarPerfilMedico({
  nome,
  especialidade,
  especialidadeId,
  experiencia,
  biografia,
  ativo = true,
}) {
  exigirAdministrador()

  const nomeFinal =
    String(nome || "").trim()

  const especialidadeFinal =
    String(especialidade || "").trim()

  if (!nomeFinal) {
    throw new Error(
      "O nome do médico é obrigatório."
    )
  }

  if (!especialidadeFinal) {
    throw new Error(
      "A especialidade do médico é obrigatória."
    )
  }

  const medicos = obterMedicos()

  const novoMedico = {
    id: gerarIdMedico(medicos),

    usuarioId: null,

    nome: nomeFinal,

    especialidade:
      especialidadeFinal,

    especialidadeId:
      especialidadeId ?? null,

    experiencia:
      String(experiencia || "").trim(),

    biografia:
      String(biografia || "").trim(),

    ativo: Boolean(ativo),
  }

  const actualizados = [
    ...medicos,
    novoMedico,
  ]

  localStorage.setItem(
    "medicos",
    JSON.stringify(actualizados)
  )

  return novoMedico
}

/**
 * Cria a conta de acesso de um médico
 * e associa imediatamente essa conta
 * ao perfil médico seleccionado.
 */
export function criarContaMedica({
  medicoId,
  nome,
  email,
  senha,
}) {
  const administrador =
    exigirAdministrador()

  if (medicoId == null) {
    throw new Error(
      "É necessário seleccionar um perfil médico."
    )
  }

  const medicos = obterMedicos()

  const medico =
    medicos.find(
      (item) =>
        String(item.id) ===
        String(medicoId)
    )

  if (!medico) {
    throw new Error(
      "Perfil médico não encontrado."
    )
  }

  if (medico.usuarioId != null) {
    throw new Error(
      "Este médico já possui uma conta associada."
    )
  }

  const nomeFinal =
    String(nome || "").trim()

  const emailFinal =
    String(email || "")
      .trim()
      .toLowerCase()

  const senhaFinal =
    String(senha || "")

  if (!nomeFinal) {
    throw new Error(
      "O nome é obrigatório."
    )
  }

  if (!emailFinal) {
    throw new Error(
      "O email é obrigatório."
    )
  }

  if (!senhaFinal) {
    throw new Error(
      "A palavra-passe é obrigatória."
    )
  }

  if (senhaFinal.length < 8) {
    throw new Error(
      "A palavra-passe deve ter pelo menos 8 caracteres."
    )
  }

  /*
   * O nome da conta começa com o nome
   * introduzido pelo administrador.
   *
   * O perfil médico continua a ser a
   * referência profissional principal.
   */
  const novoUsuario =
    criarUsuario({
      nome: nomeFinal,
      email: emailFinal,
      senha: senhaFinal,
      tipo: "medico",
      ativo: false,

      criadoPor: administrador.id,

      criadoEm:
        new Date().toISOString(),
    })

  try {
    const medicoActualizado =
      associarContaAMedico(
        medico.id,
        novoUsuario.id
      )

    return {
      usuario: novoUsuario,
      medico: medicoActualizado,
    }
  } catch {
    /*
     * Não removemos a conta aqui porque
     * não existe uma operação de rollback
     * de utilizadores neste momento.
     *
     * A conta fica identificada como
     * "sem perfil" e poderá ser associada
     * posteriormente pelo administrador.
     */
    throw new Error(
      "A conta foi criada, mas não foi possível associá-la ao perfil médico."
    )
  }
}

/**
 * Associa uma conta médica já existente
 * a um perfil médico sem criar uma nova conta.
 *
 * Utilização administrativa excepcional:
 * quando já existe uma conta "medico"
 * sem perfil associado.
 */
export function associarContaMedicaExistente(
  usuarioId,
  medicoId
) {
  exigirAdministrador()

  if (usuarioId == null) {
    throw new Error(
      "É necessário seleccionar uma conta médica."
    )
  }

  if (medicoId == null) {
    throw new Error(
      "É necessário seleccionar um perfil médico."
    )
  }

  const usuario =
    obterUsuarios().find(
      (item) =>
        String(item.id) ===
        String(usuarioId)
    )

  if (!usuario) {
    throw new Error(
      "Conta de utilizador não encontrada."
    )
  }

  if (
    obterTipo(usuario) !==
    "medico"
  ) {
    throw new Error(
      "A conta seleccionada não é uma conta médica."
    )
  }

  if (usuario.ativo === false) {
    throw new Error(
      "Não é possível associar uma conta médica desactivada."
    )
  }

  const perfilExistente =
    obterMedicoDaConta(usuario.id)

  if (perfilExistente) {
    throw new Error(
      "Esta conta já está associada a um perfil médico."
    )
  }

  const medicos = obterMedicos()

  const medico =
    medicos.find(
      (item) =>
        String(item.id) ===
        String(medicoId)
    )

  if (!medico) {
    throw new Error(
      "Perfil médico não encontrado."
    )
  }

  if (medico.usuarioId != null) {
    throw new Error(
      "Este perfil médico já possui uma conta associada."
    )
  }

  return associarContaAMedico(
    medico.id,
    usuario.id
  )
}

/**
 * Remove a associação entre uma conta
 * médica e o respectivo perfil.
 *
 * A conta não é eliminada.
 *
 * O perfil também não é eliminado.
 *
 * Consultas e disponibilidades continuam
 * ligadas ao mesmo medico.id.
 */
export function desassociarContaMedica(
  medicoId
) {
  exigirAdministrador()

  const medicos = obterMedicos()

  const indice =
    medicos.findIndex(
      (medico) =>
        String(medico.id) ===
        String(medicoId)
    )

  if (indice === -1) {
    throw new Error(
      "Perfil médico não encontrado."
    )
  }

  const medico =
    medicos[indice]

  if (medico.usuarioId == null) {
    throw new Error(
      "Este perfil não possui uma conta associada."
    )
  }

  medicos[indice] = {
    ...medico,
    usuarioId: null,
  }

  localStorage.setItem(
    "medicos",
    JSON.stringify(medicos)
  )

  return medicos[indice]
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
      ativo: true,
    }

    guardarMedicos([
      ...medicosAntes,
      novoMedico,
    ])

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


