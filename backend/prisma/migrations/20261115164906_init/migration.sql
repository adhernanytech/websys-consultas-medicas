-- CreateTable
CREATE TABLE "usuarios" (
    "id" BIGSERIAL NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "deve_alterar_senha" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "telefone" VARCHAR(30),
    "data_nascimento" DATE,
    "sexo" VARCHAR(20),
    "endereco" VARCHAR(255),
    "numero_documento" VARCHAR(80),
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "especialidades" (
    "id" BIGSERIAL NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicos" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "especialidade_id" BIGINT NOT NULL,
    "sexo" VARCHAR(20),
    "biografia" TEXT,
    "experiencia" VARCHAR(100),
    "telefone" VARCHAR(30),
    "numero_ordem" VARCHAR(100),
    "fotografia_url" TEXT,
    "valor_consulta" DECIMAL(12,2),
    "duracao_consulta" INTEGER NOT NULL DEFAULT 30,
    "perfil_aprovado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "medicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilidades" (
    "id" BIGSERIAL NOT NULL,
    "medico_id" BIGINT NOT NULL,
    "data" DATE NOT NULL,
    "hora_inicio" TIME(6) NOT NULL,
    "hora_fim" TIME(6) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'disponivel',
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "disponibilidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultas" (
    "id" BIGSERIAL NOT NULL,
    "paciente_id" BIGINT NOT NULL,
    "medico_id" BIGINT NOT NULL,
    "disponibilidade_id" BIGINT NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pendente',
    "motivo" TEXT,
    "observacoes" TEXT,
    "motivo_cancelamento" TEXT,
    "cancelada_em" TIMESTAMPTZ(6),
    "confirmada_em" TIMESTAMPTZ(6),
    "concluida_em" TIMESTAMPTZ(6),
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "consultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registos_clinicos" (
    "id" BIGSERIAL NOT NULL,
    "consulta_id" BIGINT NOT NULL,
    "queixa_principal" TEXT,
    "observacoes" TEXT,
    "diagnostico" TEXT,
    "tratamento" TEXT,
    "prescricao" TEXT,
    "notas" TEXT,
    "recomendacoes" TEXT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "registos_clinicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_redefinicao_senha" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expira_em" TIMESTAMPTZ(6) NOT NULL,
    "utilizado_em" TIMESTAMPTZ(6),
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_redefinicao_senha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "titulo" VARCHAR(180) NOT NULL,
    "mensagem" TEXT NOT NULL,
    "tipo" VARCHAR(40) NOT NULL DEFAULT 'geral',
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "lida_em" TIMESTAMPTZ(6),
    "consulta_id" BIGINT,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registos_auditoria" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT,
    "accao" VARCHAR(120) NOT NULL,
    "entidade" VARCHAR(100),
    "entidade_id" VARCHAR(100),
    "descricao" TEXT,
    "endereco_ip" VARCHAR(45),
    "user_agent" TEXT,
    "detalhes" JSONB,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registos_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes_sistema" (
    "id" BIGSERIAL NOT NULL,
    "chave" VARCHAR(120) NOT NULL,
    "valor" JSONB NOT NULL,
    "descricao" TEXT,
    "actualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "configuracoes_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_usuarios_email" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_usuarios_tipo_ativo" ON "usuarios"("tipo", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "uq_pacientes_usuario" ON "pacientes"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_especialidades_nome" ON "especialidades"("nome");

-- CreateIndex
CREATE INDEX "idx_especialidades_ativo_nome" ON "especialidades"("ativo", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "uq_medicos_usuario" ON "medicos"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_medicos_especialidade" ON "medicos"("especialidade_id");

-- CreateIndex
CREATE INDEX "idx_medicos_perfil_aprovado" ON "medicos"("perfil_aprovado");

-- CreateIndex
CREATE INDEX "idx_disponibilidades_medico_data" ON "disponibilidades"("medico_id", "data");

-- CreateIndex
CREATE INDEX "idx_disponibilidades_data_estado" ON "disponibilidades"("data", "estado");

-- CreateIndex
CREATE INDEX "idx_consultas_paciente_data" ON "consultas"("paciente_id", "criado_em" DESC);

-- CreateIndex
CREATE INDEX "idx_consultas_medico_estado" ON "consultas"("medico_id", "estado");

-- CreateIndex
CREATE INDEX "idx_consultas_disponibilidade_estado" ON "consultas"("disponibilidade_id", "estado");

-- CreateIndex
CREATE INDEX "idx_consultas_estado_data" ON "consultas"("estado", "criado_em");

-- CreateIndex
CREATE UNIQUE INDEX "uq_registos_clinicos_consulta" ON "registos_clinicos"("consulta_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tokens_redefinicao_hash" ON "tokens_redefinicao_senha"("token_hash");

-- CreateIndex
CREATE INDEX "idx_tokens_redefinicao_usuario_expira" ON "tokens_redefinicao_senha"("usuario_id", "expira_em");

-- CreateIndex
CREATE INDEX "idx_notificacoes_usuario_lida" ON "notificacoes"("usuario_id", "lida", "criado_em" DESC);

-- CreateIndex
CREATE INDEX "idx_notificacoes_consulta" ON "notificacoes"("consulta_id");

-- CreateIndex
CREATE INDEX "idx_auditoria_usuario_data" ON "registos_auditoria"("usuario_id", "criado_em" DESC);

-- CreateIndex
CREATE INDEX "idx_auditoria_accao_data" ON "registos_auditoria"("accao", "criado_em" DESC);

-- CreateIndex
CREATE INDEX "idx_auditoria_entidade" ON "registos_auditoria"("entidade", "entidade_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_configuracoes_chave" ON "configuracoes_sistema"("chave");

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_especialidade_id_fkey" FOREIGN KEY ("especialidade_id") REFERENCES "especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidades" ADD CONSTRAINT "disponibilidades_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_disponibilidade_id_fkey" FOREIGN KEY ("disponibilidade_id") REFERENCES "disponibilidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registos_clinicos" ADD CONSTRAINT "registos_clinicos_consulta_id_fkey" FOREIGN KEY ("consulta_id") REFERENCES "consultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_redefinicao_senha" ADD CONSTRAINT "tokens_redefinicao_senha_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registos_auditoria" ADD CONSTRAINT "registos_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
