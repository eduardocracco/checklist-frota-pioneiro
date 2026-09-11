"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wndajcdtcfsuorvjqtbh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZGFqY2R0Y2ZzdW9ydmpxdGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAwMDgsImV4cCI6MjA5MzE0NjAwOH0.Sybmebm4eDuGJXIDZG6YZitycGu-oEwBBmsgU3Hr_dI";
const DOMINIO_LOGIN_INTERNO = "pioneirobaterias.com.br";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type Perfil = "ADMIN" | "OPERADOR";
type StatusItem = "OK" | "NÃO OK" | "N/A" | "";
type TelaLogin = "ENTRAR" | "CRIAR";
type TurnoCodigo = "T1" | "T2";
type ModuloEquipamento = "FROTA" | "MONOVIA" | "TODOS";
type PeriodicidadeChecklist = "DIARIO" | "SEMANAL" | "MENSAL";
type AdminPagina = "DASHBOARD" | "HOJE" | "EQUIPAMENTOS" | "HISTORICO" | "USUARIOS" | "NA_VALIDACAO" | "CHECKLIST" | "RETIRAR_MODELO" | "PLANO_MESTRE" | "MAPA_52" | "OS_MANUAL" | "PARADAS" | "RELATORIOS" | "CMMS";

type PerfilUsuario = {
  id?: string;
  nome: string;
  usuario: string;
  senha: string;
  perfil: Perfil;
  ativo: boolean;
};

type Equipamento = {
  id?: string;
  tag: string;
  tipo?: string;
  tipo_equipamento: string;
  modulo?: ModuloEquipamento;
  modelo?: string;
  numero_serie?: string;
  local_correto?: string;
  area?: string;
  checklist_obrigatorio: boolean;
  ativo: boolean;
  status_operacional?: "DISPONIVEL" | "EM_OPERACAO" | "EM_MANUTENCAO" | "RESERVA" | "INATIVO";
  tag_substituindo?: string | null;
  supervisor_responsavel?: string;
  email_supervisor?: string;
  whatsapp_supervisor?: string;
  origem?: string;
  periodicidade_checklist?: PeriodicidadeChecklist;
};

type ChecklistItemPadrao = {
  numero: number;
  descricao: string;
  modulo?: ModuloEquipamento;
  ativo?: boolean;
};

type RespostaItem = {
  item_numero: number;
  item_descricao: string;
  status: StatusItem;
  observacao: string;
};

type ChecklistRegistro = {
  id?: string;
  data_checklist: string;
  hora_checklist?: string;
  turno_codigo?: TurnoCodigo;
  turno_nome?: string;
  horario_referencia?: string;
  operador_nome: string;
  operador_user_id?: string | null;
  equipamento_id?: string | null;
  tag: string;
  tipo_equipamento?: string;
  modelo?: string;
  numero_serie?: string;
  local_correto?: string;
  area?: string;
  situacao_equipamento: string;
  resultado_final: "CONFORME" | "COM AVARIA";
  horimetro?: string;
  observacao_geral?: string;
  foto_evidencia_url?: string;
  foto_horimetro_url?: string;
  confirmacao_operador: boolean;
};

type RespostaBanco = {
  id?: string;
  checklist_id: string;
  item_numero: number;
  item_descricao: string;
  status: "OK" | "NÃO OK" | "N/A";
  observacao?: string;
};

type DecisaoNA = {
  id?: string;
  modelo_chave: string;
  modelo_label: string;
  item_numero: number;
  item_descricao: string;
  decisao: "REMOVER" | "MANTER";
};

type ParadaManutencao = {
  id?: string;
  equipamento_id?: string | null;
  tag_original: string;
  data_inicio: string;
  hora_inicio?: string;
  operador_nome: string;
  operador_user_id?: string | null;
  numero_os: string;
  motivo: string;
  afeta_operacao: boolean;
  status: "AGUARDANDO_RESERVA" | "RESERVA_DEFINIDA" | "EM_MANUTENCAO" | "FINALIZADA";
  tag_reserva?: string;
  equipamento_reserva_id?: string | null;
  observacao_admin?: string;
  data_fim?: string | null;
  hora_fim?: string | null;
  horas_parado?: number | null;
};

type OsCmms = {
  id?: string;
  num_os: string;
  tag: string;
  tag_normalizada?: string;
  equipamento_texto?: string;
  equipamento_id?: string | null;
  setor?: string;
  tipo_manut?: string;
  recorrencia?: string;
  dt_progr?: string;
  hr_parada?: string;
  hr_retorno?: string;
  tempo_parada_hrs?: string;
  tempo_parada_min?: string;
  status?: string;
  solicitante?: string;
  executor?: string;
  dt_exec?: string;
  modo_trab?: string;
  codigo_parada?: string;
  desc_codigo_parada?: string;
  descricao?: string;
  parecer?: string;
  turno?: string;
  fluxo_manutencao?: string;
  gpm?: string;
  origem_arquivo?: string;
  importado_por?: string;
  ativo_equipamento?: boolean;
  importado_em?: string;
};

type AgendaManutencao = {
  id?: string;
  tag: string;
  tag_normalizada?: string;
  equipamento_id?: string | null;
  modulo: "FROTA" | "MONOVIA";
  data_programada: string;
  tipo_manutencao: string;
  descricao?: string;
  status: "PROGRAMADO" | "CONCLUIDO" | "CANCELADO";
  criado_por?: string;
  criado_em?: string;
  atualizado_em?: string;
};

type PlanoPreventivo = {
  id?: string;
  tag: string;
  tag_normalizada: string;
  equipamento_id?: string | null;
  modelo_plano: string;
  plano_tipo: "QUINZENAL" | "MENSAL" | "TRIMESTRAL" | "SEMESTRAL";
  checklist_referencia?: string;
  descricao_mapa?: string;
  periodicidade_valor: number;
  periodicidade_unidade: "DIAS" | "MESES";
  base_recalculo: "EXECUCAO" | "PROGRAMADO";
  ultima_execucao?: string | null;
  proxima_data?: string | null;
  ativo: boolean;
  origem?: string;
};

type PlanoPreventivoItem = {
  id?: number;
  modelo_plano: string;
  eqto?: string;
  checklist: string;
  plano_tipo?: string;
  sistema?: string;
  operacao: string;
  codigo?: string;
  qtde?: number | null;
  um?: string;
  troca?: string;
  valor_estimado?: number | null;
};

type ProgramacaoPreventiva = {
  id?: string;
  plano_id: string;
  tag: string;
  tag_normalizada: string;
  plano_tipo: string;
  ano: number;
  semana_iso: number;
  data_programada: string;
  status: "PROGRAMADO" | "EXECUTADO" | "ATRASADO" | "CANCELADO";
  numero_os?: string;
  data_execucao?: string | null;
  executor?: string;
  observacao?: string;
  origem?: string;
};

const itensFallback: ChecklistItemPadrao[] = [
  { numero: 1, descricao: "Estado geral do equipamento / avarias visíveis" },
  { numero: 2, descricao: "Rodas, pneus e rodízios sem desgaste excessivo ou travamento" },
  { numero: 3, descricao: "Garfos/lanças sem trincas, empeno ou deformação" },
  { numero: 4, descricao: "Freio de serviço/estacionamento funcionando" },
  { numero: 5, descricao: "Buzina, sinal sonoro e/ou alarme de ré funcionando" },
  { numero: 6, descricao: "Luzes, giroflex e sinalização visual funcionando" },
  { numero: 7, descricao: "Chave de emergência e comandos de segurança funcionando" },
  { numero: 8, descricao: "Controles de direção, avanço/ré, elevação e descida funcionando" },
  { numero: 9, descricao: "Bateria, conector, cabos e travamento sem dano aparente" },
  { numero: 10, descricao: "Nível/carga da bateria adequado para operação" },
  { numero: 11, descricao: "Vazamentos de óleo hidráulico ou fluido visíveis" },
  { numero: 12, descricao: "Torre/mastro/correntes/roletes sem ruído, folga ou dano aparente" },
  { numero: 13, descricao: "Patolas/protetores/carenagens fixos e sem interferência" },
  { numero: 14, descricao: "Equipamento limpo, identificado e com capacidade legível" },
  { numero: 15, descricao: "Teste funcional sem ruído anormal, falha ou alerta no painel" },
];

const equipamentoVazio: Equipamento = {
  tag: "",
  tipo: "NOVA",
  tipo_equipamento: "",
  modulo: "FROTA",
  modelo: "",
  numero_serie: "",
  local_correto: "",
  area: "",
  checklist_obrigatorio: true,
  ativo: true,
  status_operacional: "DISPONIVEL",
  periodicidade_checklist: "DIARIO",
  origem: "Cadastro manual",
};

const FUSO_HORARIO_APP = "America/Sao_Paulo";

function partesDataHoraBrasil() {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO_HORARIO_APP,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value || "";

  return {
    ano: valor("year"),
    mes: valor("month"),
    dia: valor("day"),
    hora: valor("hour") === "24" ? "00" : valor("hour"),
    minuto: valor("minute"),
    segundo: valor("second"),
  };
}

function hojeISO() {
  const p = partesDataHoraBrasil();
  return `${p.ano}-${p.mes}-${p.dia}`;
}

function horaBrasil() {
  const p = partesDataHoraBrasil();
  return `${p.hora}:${p.minuto}:${p.segundo}`;
}

function turnoAutomatico(): TurnoCodigo {
  // V15: o checklist da frota passa a ser executado uma única vez por período, sem Turno 2.
  return "T1";
}

function nomeTurno(_turno: TurnoCodigo) {
  return "Checklist diário";
}

function horarioReferenciaTurno(_turno: TurnoCodigo) {
  return "Único";
}

function formatarDataBR(dataISO: string) {
  if (!dataISO) return "";
  const [ano, mes, dia] = dataISO.split("-");
  if (!ano || !mes || !dia) return dataISO;
  return `${dia}/${mes}/${ano}`;
}

function escaparHTML(valor: any) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizar(texto: string) {
  return texto
    .toString()
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

function normalizarCabecalho(texto: string) {
  return String(texto || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizarTagOS(tag: string) {
  const base = String(tag || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");

  return base.replace(/^([A-Z]+)0+(\d+)/, "$1$2");
}

function extrairTagDoEquipamentoCmms(equipamento: string) {
  const primeiraParte = String(equipamento || "").split(" - ")[0] || "";
  const match = primeiraParte.match(/[A-Za-z]{2,6}\s*[-]?\s*\d+[A-Za-z]?/);
  return (match ? match[0] : primeiraParte)
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function dataBRParaISO(data: string) {
  const texto = String(data || "").trim();
  const match = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match || match[1] === "00" || match[2] === "00" || match[3] === "0000") return "";
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function osCmmsEstaAberta(os: OsCmms) {
  const status = normalizar(os.status || "");
  if (!status) return true;

  return !(
    status.includes("REALIZ") ||
    status.includes("FINAL") ||
    status.includes("CONCLU") ||
    status.includes("CANCEL") ||
    status.includes("FECH") ||
    status.includes("ENCERR") ||
    status.includes("EXECUT")
  );
}

function osCmmsEhPreventiva(os: OsCmms) {
  return normalizar(os.tipo_manut || "").includes("PREVENT");
}

function osCmmsEhCorretiva(os: OsCmms) {
  return normalizar(os.tipo_manut || "").includes("CORRET");
}

function classificarAlertaCmms(os: OsCmms, hoje = hojeISO()) {
  const dataProgramada = dataBRParaISO(os.dt_progr || "");
  const preventiva = osCmmsEhPreventiva(os);
  const corretiva = osCmmsEhCorretiva(os);

  if (preventiva && dataProgramada && dataProgramada < hoje) {
    return {
      nivel: "CRITICO",
      titulo: "Preventiva atrasada",
      mensagem: "Este equipamento possui preventiva atrasada. Entre em contato com a manutenção para programação.",
    };
  }

  if (preventiva) {
    return {
      nivel: "AVISO",
      titulo: "Preventiva em aberto",
      mensagem: "Este equipamento possui preventiva em aberto/programada no CMMS.",
    };
  }

  if (corretiva) {
    return {
      nivel: "AVISO",
      titulo: "Corretiva em aberto",
      mensagem: "Este equipamento possui OS corretiva aberta no CMMS. Verifique a condição antes de operar.",
    };
  }

  return {
    nivel: "AVISO",
    titulo: "OS em aberto",
    mensagem: "Este equipamento possui ordem de manutenção aberta no CMMS.",
  };
}

function nomeModulo(modulo: ModuloEquipamento) {
  if (modulo === "FROTA") return "Frota";
  if (modulo === "MONOVIA") return "Monovia / Talha";
  return "Todos";
}

function moduloDoEquipamento(e: { modulo?: ModuloEquipamento; tipo_equipamento?: string; modelo?: string; tag?: string }) {
  if (e.modulo === "FROTA" || e.modulo === "MONOVIA") return e.modulo;

  const texto = normalizar(`${e.tag || ""} ${e.tipo_equipamento || ""} ${e.modelo || ""}`);
  if (
    texto.includes("MONOVIA") ||
    texto.includes("TALHA") ||
    texto.includes("PONTE") ||
    texto.includes("GUINCHO") ||
    texto.includes("ELEVACAO")
  ) {
    return "MONOVIA";
  }

  return "FROTA";
}

function agendaManutencaoAtiva(agenda: AgendaManutencao) {
  const status = normalizar(agenda.status || "");
  return !(status.includes("CONCL") || status.includes("CANCEL"));
}

function dataISOParaBR(data: string) {
  const texto = String(data || "").trim();
  const match = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return texto || "Não informada";
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function dataUTC(dataISO: string) {
  const [a, m, d] = String(dataISO || "").slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(a || 1970, (m || 1) - 1, d || 1));
}

function dataISOdeDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function diasEntre(inicio: string, fim: string) {
  return Math.max(0, Math.floor((dataUTC(fim).getTime() - dataUTC(inicio).getTime()) / 86400000));
}

function inicioSemanaISO(dataISO: string) {
  const d = dataUTC(dataISO);
  const dia = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - dia + 1);
  return dataISOdeDate(d);
}

function fimSemanaISO(dataISO: string) {
  const d = dataUTC(inicioSemanaISO(dataISO));
  d.setUTCDate(d.getUTCDate() + 6);
  return dataISOdeDate(d);
}

function numeroSemanaISO(dataISO: string) {
  const d = dataUTC(dataISO);
  const temp = new Date(d.getTime());
  temp.setUTCDate(temp.getUTCDate() + 4 - (temp.getUTCDay() || 7));
  const anoInicio = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const semana = Math.ceil((((temp.getTime() - anoInicio.getTime()) / 86400000) + 1) / 7);
  return { ano: temp.getUTCFullYear(), semana };
}

function semanasNoAnoISO(ano: number) {
  return numeroSemanaISO(`${ano}-12-28`).semana;
}

function textoTempoAberto(dias: number) {
  if (dias <= 0) return "hoje";
  if (dias === 1) return "há 1 dia";
  if (dias < 7) return `há ${dias} dias`;
  const semanas = Math.floor(dias / 7);
  if (semanas === 1) return "há 1 semana";
  if (dias < 30) return `há ${semanas} semanas`;
  const meses = Math.floor(dias / 30);
  return meses === 1 ? "há 1 mês" : `há ${meses} meses`;
}

function periodicidadeChecklistDoEquipamento(e: Equipamento | null): PeriodicidadeChecklist {
  if (!e) return "DIARIO";
  if (e.periodicidade_checklist === "DIARIO" || e.periodicidade_checklist === "SEMANAL" || e.periodicidade_checklist === "MENSAL") {
    return e.periodicidade_checklist;
  }
  return moduloDoEquipamento(e) === "MONOVIA" ? "MENSAL" : "DIARIO";
}

function nomePeriodicidadeChecklist(p: PeriodicidadeChecklist) {
  if (p === "SEMANAL") return "Semanal";
  if (p === "MENSAL") return "Mensal";
  return "Diário";
}

function checklistEstaNoPeriodo(dataChecklist: string, dataReferencia: string, periodicidade: PeriodicidadeChecklist) {
  if (periodicidade === "MENSAL") return dataChecklist.slice(0, 7) === dataReferencia.slice(0, 7);
  if (periodicidade === "SEMANAL") return inicioSemanaISO(dataChecklist) === inicioSemanaISO(dataReferencia);
  return dataChecklist.slice(0, 10) === dataReferencia.slice(0, 10);
}

function descricaoPeriodoChecklist(e: Equipamento | null, dataReferencia: string) {
  const p = periodicidadeChecklistDoEquipamento(e);
  if (p === "MENSAL") return `Inspeção mensal - ${dataReferencia.slice(0, 7)}`;
  if (p === "SEMANAL") return `Inspeção semanal - ${dataISOParaBR(inicioSemanaISO(dataReferencia))} a ${dataISOParaBR(fimSemanaISO(dataReferencia))}`;
  return `Checklist diário - ${dataISOParaBR(dataReferencia)}`;
}

function adicionarPeriodicidade(dataISO: string, valor: number, unidade: "DIAS" | "MESES") {
  const d = dataUTC(dataISO);
  if (unidade === "DIAS") {
    d.setUTCDate(d.getUTCDate() + Number(valor || 0));
  } else {
    const diaOriginal = d.getUTCDate();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + Number(valor || 0));
    const ultimoDia = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    d.setUTCDate(Math.min(diaOriginal, ultimoDia));
  }
  return dataISOdeDate(d);
}
function classificarAlertaAgenda(agenda: AgendaManutencao, hoje = hojeISO()) {
  const tipo = agenda.tipo_manutencao || "Manutenção programada";
  const data = dataISOParaBR(agenda.data_programada);

  if (agenda.data_programada && agenda.data_programada < hoje) {
    return {
      nivel: "CRITICO",
      titulo: `${tipo} atrasada`,
      mensagem: `Este equipamento deveria ter sido levado para manutenção no dia ${data}. Entre em contato com a manutenção para programação.`,
    };
  }

  if (agenda.data_programada === hoje) {
    return {
      nivel: "CRITICO",
      titulo: `${tipo} programada para hoje`,
      mensagem: `Este equipamento deve ser levado para manutenção hoje (${data}). Entre em contato com a manutenção antes de operar.`,
    };
  }

  return {
    nivel: "AVISO",
    titulo: `${tipo} programada`,
    mensagem: `Este equipamento deve ser levado para manutenção no dia ${data}. Será feita ${tipo.toLowerCase()}.`,
  };
}

function parseNumeroBR(valor: string) {
  const texto = String(valor || "").replace(/\./g, "").replace(",", ".");
  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : null;
}

function lerArquivoComoTexto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsText(file, "ISO-8859-1");
  });
}

function extrairLinhasCmmsDoHtml(texto: string) {
  const doc = new DOMParser().parseFromString(texto, "text/html");
  const trs = Array.from(doc.querySelectorAll("tr"));
  const headerIndex = trs.findIndex((tr) => {
    const cells = Array.from(tr.querySelectorAll("td,th")).map((td) => normalizar(td.textContent || ""));
    return cells.includes("NUM.OS") || (cells.includes("NUMOS") && cells.includes("EQUIPAMENTO")) || cells.includes("NUM.OS");
  });

  const indiceCabecalho = headerIndex >= 0 ? headerIndex : trs.findIndex((tr) => normalizar(tr.textContent || "").includes("NUM.OS") && normalizar(tr.textContent || "").includes("EQUIPAMENTO"));
  if (indiceCabecalho < 0) throw new Error("Não encontrei o cabeçalho do relatório. Verifique se o arquivo é o Extrato de Manutenções Amplo do CMMS.");

  const headers = Array.from(trs[indiceCabecalho].querySelectorAll("td,th")).map((td) => normalizarCabecalho(td.textContent || ""));

  return trs.slice(indiceCabecalho + 1)
    .map((tr) => {
      const cells = Array.from(tr.querySelectorAll("td,th")).map((td) => (td.textContent || "").replace(/\s+/g, " ").trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = cells[i] || ""; });
      return row;
    })
    .filter((row) => row.NUM_OS && row.EQUIPAMENTO);
}

function normalizarUsuario(usuario: string) {
  return usuario
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]/g, "");
}

function usuarioParaEmailInterno(usuario: string) {
  return `${normalizarUsuario(usuario)}@${DOMINIO_LOGIN_INTERNO}`;
}

function modeloChave(e: { modelo?: string; tipo_equipamento?: string }) {
  return normalizar(e.modelo || e.tipo_equipamento || "SEM_MODELO");
}

function modeloLabel(e: { modelo?: string; tipo_equipamento?: string }) {
  return e.modelo?.trim() || e.tipo_equipamento?.trim() || "SEM MODELO";
}

function ehEquipamentoEletrico(e: Equipamento | null) {
  if (!e) return false;
  const texto = normalizar(`${e.tipo_equipamento} ${e.modelo || ""}`);
  return texto.includes("ELETR") || texto.includes("RETRATIL") || texto.includes("TRANSPALETEIRA");
}

function montarRespostasPadrao(itens: ChecklistItemPadrao[], removidos: number[] = []) {
  return itens
    .filter((i) => i.ativo !== false && !removidos.includes(i.numero))
    .sort((a, b) => a.numero - b.numero)
    .map((i) => ({
      item_numero: i.numero,
      item_descricao: i.descricao,
      status: "" as StatusItem,
      observacao: "",
    }));
}

function baixarArquivo(nome: string, conteudo: string) {
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

function lerArquivoComoBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function comprimirImagem(file: File, larguraMaxima = 1280, qualidade = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selecione apenas arquivos de imagem."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const escala = Math.min(1, larguraMaxima / img.width);
        const largura = Math.round(img.width * escala);
        const altura = Math.round(img.height * escala);

        const canvas = document.createElement("canvas");
        canvas.width = largura;
        canvas.height = altura;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Não foi possível processar a imagem."));
          return;
        }

        ctx.drawImage(img, 0, 0, largura, altura);

        // Sempre salva em JPEG para reduzir tamanho e evitar fotos enormes do tablet/celular.
        const dataUrl = canvas.toDataURL("image/jpeg", qualidade);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error("Não foi possível ler a foto."));
      img.src = String(reader.result || "");
    };

    reader.onerror = () => reject(new Error("Não foi possível carregar a foto."));
    reader.readAsDataURL(file);
  });
}

function tamanhoDataUrlMB(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] || "";
  return (base64.length * 0.75) / (1024 * 1024);
}

function dataUrlParaBlob(dataUrl: string) {
  const [cabecalho, base64] = dataUrl.split(",");
  const mime = cabecalho.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);

  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }

  return { blob: new Blob([bytes], { type: mime }), mime };
}

function extensaoPorMime(mime: string) {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  return "jpg";
}

async function supabaseRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro Supabase: ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

async function enviarFotoStorage(dataUrl: string, pasta: string, nomeBase: string) {
  if (!dataUrl || dataUrl.startsWith("http")) return dataUrl;

  const { blob, mime } = dataUrlParaBlob(dataUrl);
  const ext = extensaoPorMime(mime);
  const caminho = `${pasta}/${nomeBase}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("checklist-fotos")
    .upload(caminho, blob, { contentType: mime, upsert: true });

  if (error) {
    throw new Error(`Erro ao enviar foto para o Storage: ${error.message}`);
  }

  const { data } = supabase.storage.from("checklist-fotos").getPublicUrl(caminho);
  return data.publicUrl;
}

export default function Home() {
  const [perfilUsuario, setPerfilUsuario] = useState<PerfilUsuario | null>(null);

  const [telaLogin, setTelaLogin] = useState<TelaLogin>("ENTRAR");
  const [loginUsuario, setLoginUsuario] = useState("");
  const [loginSenha, setLoginSenha] = useState("");

  const [cadNome, setCadNome] = useState("");
  const [cadUsuario, setCadUsuario] = useState("");
  const [cadSenha, setCadSenha] = useState("");
  const [cadSenha2, setCadSenha2] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [errosChecklist, setErrosChecklist] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [itensPadrao, setItensPadrao] = useState<ChecklistItemPadrao[]>(itensFallback);
  const [itensConfig, setItensConfig] = useState<ChecklistItemPadrao[]>(itensFallback);
  const [checklists, setChecklists] = useState<ChecklistRegistro[]>([]);
  const [respostasBanco, setRespostasBanco] = useState<RespostaBanco[]>([]);
  const [decisoesNA, setDecisoesNA] = useState<DecisaoNA[]>([]);
  const [paradasManutencao, setParadasManutencao] = useState<ParadaManutencao[]>([]);
  const [osCmms, setOsCmms] = useState<OsCmms[]>([]);
  const [agendaManutencao, setAgendaManutencao] = useState<AgendaManutencao[]>([]);
  const [planosPreventivos, setPlanosPreventivos] = useState<PlanoPreventivo[]>([]);
  const [itensPlanoPreventivo, setItensPlanoPreventivo] = useState<PlanoPreventivoItem[]>([]);
  const [programacoesPreventivas, setProgramacoesPreventivas] = useState<ProgramacaoPreventiva[]>([]);
  const [resultadoImportacaoCMMS, setResultadoImportacaoCMMS] = useState<{
    total: number;
    importadas: number;
    vinculadas: number;
    semVinculo: number;
    arquivo: string;
  } | null>(null);

  const [agendaModulo, setAgendaModulo] = useState<ModuloEquipamento>("FROTA");
  const [agendaTag, setAgendaTag] = useState("");
  const [agendaDataProgramada, setAgendaDataProgramada] = useState(hojeISO());
  const [agendaTipo, setAgendaTipo] = useState("Preventiva");
  const [agendaDescricao, setAgendaDescricao] = useState("");

  const [operador, setOperador] = useState("");
  const [moduloSelecionado, setModuloSelecionado] = useState<ModuloEquipamento>("FROTA");
  const [data, setData] = useState(hojeISO());
  const [turnoSelecionado] = useState<TurnoCodigo>("T1");
  const [area, setArea] = useState("TODAS");
  const [busca, setBusca] = useState("");
  const [tagSelecionada, setTagSelecionada] = useState("");
  const [telaOperador, setTelaOperador] = useState<"LISTA" | "CHECKLIST">("LISTA");

  const [respostas, setRespostas] = useState<RespostaItem[]>(montarRespostasPadrao(itensFallback));
  const [situacaoEquipamento, setSituacaoEquipamento] = useState("EM OPERAÇÃO");
  const [observacaoGeral, setObservacaoGeral] = useState("");
  const [horimetroLeitura, setHorimetroLeitura] = useState("");
  const [confirmacaoOperador, setConfirmacaoOperador] = useState(false);
  const [confirmacaoAlertaManutencao, setConfirmacaoAlertaManutencao] = useState(false);
  const [fotoEvidencia, setFotoEvidencia] = useState("");
  const [fotoHorimetro, setFotoHorimetro] = useState("");

  const [avariaImpedeUso, setAvariaImpedeUso] = useState(false);
  const [numeroOS, setNumeroOS] = useState("");
  const [afetaOperacao, setAfetaOperacao] = useState(false);

  const [equipamentoEdicao, setEquipamentoEdicao] = useState<Equipamento>(equipamentoVazio);
  const [editandoTag, setEditandoTag] = useState("");
  const [buscaCadastro, setBuscaCadastro] = useState("");
  const [filtroAdmin, setFiltroAdmin] = useState<AdminPagina>("DASHBOARD");
  const [dashboardDetalhe, setDashboardDetalhe] = useState<"" | "OK" | "AVARIAS" | "PENDENTES" | "MANUTENCAO" | "PREVENTIVAS" | "NA">("");
  const [historicoTag, setHistoricoTag] = useState("");
  const [planoBusca, setPlanoBusca] = useState("");
  const [planoTipoFiltro, setPlanoTipoFiltro] = useState("TODOS");
  const [planoExpandidoId, setPlanoExpandidoId] = useState("");
  const [mapaAno, setMapaAno] = useState(Number(hojeISO().slice(0,4)));
  const [mapaBusca, setMapaBusca] = useState("");
  const [osPlanoId, setOsPlanoId] = useState("");
  const [osNumero, setOsNumero] = useState("");
  const [osDataExecucao, setOsDataExecucao] = useState(hojeISO());
  const [osExecutor, setOsExecutor] = useState("");
  const [osObservacao, setOsObservacao] = useState("");
  const [tagReservaSelecionada, setTagReservaSelecionada] = useState("");
  const [observacaoAdminParada, setObservacaoAdminParada] = useState("");

  const [itemChecklistNumero, setItemChecklistNumero] = useState("");
  const [itemChecklistDescricao, setItemChecklistDescricao] = useState("");
  const [itemChecklistModulo, setItemChecklistModulo] = useState<ModuloEquipamento>("FROTA");
  const [itemChecklistEditando, setItemChecklistEditando] = useState<number | null>(null);
  const [modeloConfigSelecionado, setModeloConfigSelecionado] = useState("");
  const [usuariosApp, setUsuariosApp] = useState<PerfilUsuario[]>([]);
  const [usuarioAdminNome, setUsuarioAdminNome] = useState("");
  const [usuarioAdminLogin, setUsuarioAdminLogin] = useState("");
  const [usuarioAdminSenha, setUsuarioAdminSenha] = useState("");
  const [usuarioAdminPerfil, setUsuarioAdminPerfil] = useState<Perfil>("OPERADOR");
  const [usuarioAdminAtivo, setUsuarioAdminAtivo] = useState(true);
  const [usuarioAdminEditando, setUsuarioAdminEditando] = useState<string | null>(null);

  const [relatorioDataInicio, setRelatorioDataInicio] = useState(hojeISO());
  const [relatorioDataFim, setRelatorioDataFim] = useState(hojeISO());
  const [relatorioTurno, setRelatorioTurno] = useState<"TODOS" | TurnoCodigo>("TODOS");
  const [relatorioBuscaEquipamento, setRelatorioBuscaEquipamento] = useState("");
  const [relatorioTagsSelecionadas, setRelatorioTagsSelecionadas] = useState<string[]>([]);
  const [relatorioIncluirFotos, setRelatorioIncluirFotos] = useState(false);

  const perfil: Perfil = perfilUsuario?.perfil || "OPERADOR";
  const isAdmin = perfil === "ADMIN";

  useEffect(() => {
    function atualizarMobile() {
      setIsMobile(window.innerWidth <= 820);
    }

    atualizarMobile();
    window.addEventListener("resize", atualizarMobile);
    return () => window.removeEventListener("resize", atualizarMobile);
  }, []);

  useEffect(() => {
    async function iniciarLoginLocal() {
      setCarregando(true);

      try {
        const usuarioSalvo = localStorage.getItem("checklist_usuario_logado");
        if (usuarioSalvo) {
          const usuarios = await supabaseRequest<PerfilUsuario[]>(
            `usuarios_app?select=*&usuario=eq.${encodeURIComponent(usuarioSalvo)}&ativo=eq.true`
          );

          if (usuarios.length) {
            setPerfilUsuario(usuarios[0]);
            setOperador(usuarios[0].nome || "");
            await carregarDados();
          } else {
            localStorage.removeItem("checklist_usuario_logado");
          }
        }
      } catch (err: any) {
        setMensagem(`Erro ao carregar usuário salvo: ${err.message || err}`);
        localStorage.removeItem("checklist_usuario_logado");
      } finally {
        setCarregando(false);
      }
    }

    iniciarLoginLocal();
  }, []);

  async function entrarNoPerfil() {
    setMensagem("");
    setCarregando(true);

    try {
      const usuario = normalizarUsuario(loginUsuario);
      if (!usuario) throw new Error("Informe o usuário.");
      if (!loginSenha) throw new Error("Informe a senha.");

      const usuarios = await supabaseRequest<PerfilUsuario[]>(
        `usuarios_app?select=*&usuario=eq.${encodeURIComponent(usuario)}&ativo=eq.true`
      );

      if (!usuarios.length) throw new Error("Usuário não encontrado ou bloqueado.");

      const usuarioEncontrado = usuarios[0];

      if (usuarioEncontrado.senha !== loginSenha) {
        throw new Error("Senha incorreta.");
      }

      setPerfilUsuario(usuarioEncontrado);
      setOperador(usuarioEncontrado.nome || "");
      localStorage.setItem("checklist_usuario_logado", usuarioEncontrado.usuario);

      await carregarDados();
      setMensagem("");
    } catch (err: any) {
      setMensagem(`Erro no login: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function criarConta() {
    setMensagem("");
    setCarregando(true);

    try {
      const usuario = normalizarUsuario(cadUsuario);
      if (!cadNome.trim()) throw new Error("Informe o nome completo.");
      if (!usuario) throw new Error("Informe um usuário válido. Use apenas letras, números, ponto, hífen ou underline.");
      if (cadSenha.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");
      if (cadSenha !== cadSenha2) throw new Error("As senhas não conferem.");

      const existentes = await supabaseRequest<PerfilUsuario[]>(
        `usuarios_app?select=usuario&usuario=eq.${encodeURIComponent(usuario)}`
      );

      if (existentes.length) throw new Error("Este usuário já existe.");

      await supabaseRequest<PerfilUsuario[]>("usuarios_app", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          nome: cadNome.trim(),
          usuario,
          senha: cadSenha,
          perfil: "OPERADOR",
          ativo: true,
        }),
      });

      setLoginUsuario(usuario);
      setLoginSenha("");
      setCadNome("");
      setCadUsuario("");
      setCadSenha("");
      setCadSenha2("");
      setTelaLogin("ENTRAR");
      setMensagem("Conta criada como OPERADOR. Agora entre com usuário e senha.");
    } catch (err: any) {
      setMensagem(`Erro ao criar conta: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function sair() {
    localStorage.removeItem("checklist_usuario_logado");
    setPerfilUsuario(null);
    setTelaOperador("LISTA");
    setMensagem("");
  }

  async function carregarDados() {
    setMensagem("");

    const [eqs, itens, itensTodos, chks, resps, decs, pars, usersApp, osImportadas, agendaProg, planosPrev, itensPrev, programacoesPrev] = await Promise.all([
      supabaseRequest<Equipamento[]>("equipamentos?select=*&order=tag.asc"),
      supabaseRequest<ChecklistItemPadrao[]>("checklist_itens_padrao?select=numero,descricao,modulo,ativo&ativo=eq.true&order=modulo.asc,numero.asc"),
      supabaseRequest<ChecklistItemPadrao[]>("checklist_itens_padrao?select=numero,descricao,modulo,ativo&order=modulo.asc,numero.asc"),
      supabaseRequest<ChecklistRegistro[]>("checklists?select=*&order=criado_em.desc&limit=5000"),
      supabaseRequest<RespostaBanco[]>("checklist_respostas?select=*&order=item_numero.asc&limit=25000"),
      supabaseRequest<DecisaoNA[]>("decisoes_na?select=*&order=criado_em.desc"),
      supabaseRequest<ParadaManutencao[]>("paradas_manutencao?select=*&status=neq.FINALIZADA&order=criado_em.desc"),
      supabaseRequest<PerfilUsuario[]>("usuarios_app?select=*&order=nome.asc"),
      supabaseRequest<OsCmms[]>("os_cmms?select=*&order=importado_em.desc&limit=5000").catch(() => []),
      supabaseRequest<AgendaManutencao[]>("agenda_manutencao?select=*&order=data_programada.asc&limit=3000").catch(() => []),
      supabaseRequest<PlanoPreventivo[]>("planos_preventivos?select=*&ativo=eq.true&order=tag.asc,plano_tipo.asc&limit=2000").catch(() => []),
      supabaseRequest<PlanoPreventivoItem[]>("plano_preventivo_itens?select=*&order=modelo_plano.asc,checklist.asc,id.asc&limit=5000").catch(() => []),
      supabaseRequest<ProgramacaoPreventiva[]>("programacoes_preventivas?select=*&order=data_programada.asc&limit=5000").catch(() => []),
    ]);

    setEquipamentos(eqs || []);
    setItensPadrao(itens?.length ? itens : itensFallback);
    setItensConfig(itensTodos?.length ? itensTodos : itensFallback);
    setChecklists(chks || []);
    setRespostasBanco(resps || []);
    setDecisoesNA(decs || []);
    setParadasManutencao(pars || []);
    setUsuariosApp(usersApp || []);
    setOsCmms(osImportadas || []);
    setAgendaManutencao(agendaProg || []);
    setPlanosPreventivos(planosPrev || []);
    setItensPlanoPreventivo(itensPrev || []);
    setProgramacoesPreventivas(programacoesPrev || []);
  }

    const areas = useMemo(() => {
    return ["TODAS", ...Array.from(new Set(equipamentos.map((e) => e.area || "LOCAL A DEFINIR"))).sort()];
  }, [equipamentos]);

  const equipamentosFiltrados = useMemo(() => {
    return equipamentos.filter((e) => {
      const passaModulo = moduloSelecionado === "TODOS" || moduloDoEquipamento(e) === moduloSelecionado;
      const passaArea = area === "TODAS" || e.area === area;
      const texto = `${e.tag} ${e.tipo_equipamento} ${e.modelo || ""} ${e.numero_serie || ""} ${e.local_correto || ""} ${e.area || ""}`;
      return passaModulo && passaArea && normalizar(texto).includes(normalizar(busca));
    });
  }, [equipamentos, moduloSelecionado, area, busca]);

  const equipamentosCadastroFiltrados = useMemo(() => {
    const termo = normalizar(buscaCadastro);
    if (!termo) return [];
    return equipamentos
      .filter((e) => normalizar(`${e.tag} ${e.tipo_equipamento} ${e.modelo || ""} ${e.local_correto || ""} ${e.area || ""}`).includes(termo))
      .slice(0, 20);
  }, [equipamentos, buscaCadastro]);

  const equipamentosRelatorioFiltrados = useMemo(() => {
    const termo = normalizar(relatorioBuscaEquipamento);
    return equipamentos
      .filter((e) => e.ativo !== false)
      .filter((e) => {
        if (!termo) return true;
        return normalizar(`${e.tag} ${e.tipo_equipamento} ${e.modelo || ""} ${e.numero_serie || ""} ${e.local_correto || ""} ${e.area || ""}`).includes(termo);
      })
      .sort((a, b) => normalizar(a.tag).localeCompare(normalizar(b.tag)))
      .slice(0, termo ? 60 : 120);
  }, [equipamentos, relatorioBuscaEquipamento]);

  const equipamentoSelecionado = equipamentos.find((e) => e.tag === tagSelecionada) || null;

  const osCmmsAbertas = useMemo(() => osCmms.filter(osCmmsEstaAberta), [osCmms]);

  const tagsComAlertaCmms = useMemo(() => {
    const mapa = new Map<string, number>();
    osCmmsAbertas.forEach((os) => {
      const chave = normalizarTagOS(os.tag);
      if (!chave) return;
      mapa.set(chave, (mapa.get(chave) || 0) + 1);
    });
    return mapa;
  }, [osCmmsAbertas]);

  const agendaManutencaoAtivaLista = useMemo(() => agendaManutencao.filter(agendaManutencaoAtiva), [agendaManutencao]);

  const tagsComAgendaManutencao = useMemo(() => {
    const mapa = new Map<string, number>();
    agendaManutencaoAtivaLista.forEach((ag) => {
      const chave = normalizarTagOS(ag.tag);
      if (!chave) return;
      mapa.set(chave, (mapa.get(chave) || 0) + 1);
    });
    return mapa;
  }, [agendaManutencaoAtivaLista]);

  const alertasManutencaoSelecionado = useMemo(() => {
    if (!equipamentoSelecionado) return [];
    const tagAtual = normalizarTagOS(equipamentoSelecionado.tag);

    return osCmmsAbertas
      .filter((os) => normalizarTagOS(os.tag) === tagAtual)
      .map((os) => ({ os, alerta: classificarAlertaCmms(os) }))
      .sort((a, b) => (a.alerta.nivel === "CRITICO" ? -1 : 1) - (b.alerta.nivel === "CRITICO" ? -1 : 1))
      .slice(0, 5);
  }, [equipamentoSelecionado, osCmmsAbertas]);

  const alertasAgendaSelecionado = useMemo(() => {
    if (!equipamentoSelecionado) return [];
    const tagAtual = normalizarTagOS(equipamentoSelecionado.tag);

    return agendaManutencaoAtivaLista
      .filter((ag) => normalizarTagOS(ag.tag) === tagAtual)
      .map((ag) => ({ agenda: ag, alerta: classificarAlertaAgenda(ag) }))
      .sort((a, b) => (a.alerta.nivel === "CRITICO" ? -1 : 1) - (b.alerta.nivel === "CRITICO" ? -1 : 1))
      .slice(0, 5);
  }, [equipamentoSelecionado, agendaManutencaoAtivaLista]);

  const agendaEquipamentosDisponiveis = useMemo(() => {
    return equipamentos
      .filter((e) => e.ativo !== false)
      .filter((e) => agendaModulo === "TODOS" || moduloDoEquipamento(e) === agendaModulo)
      .sort((a, b) => normalizar(a.tag).localeCompare(normalizar(b.tag)));
  }, [equipamentos, agendaModulo]);

  const agendaAtrasada = useMemo(() => agendaManutencaoAtivaLista.filter((ag) => ag.data_programada && ag.data_programada < hojeISO()), [agendaManutencaoAtivaLista]);
  const agendaHoje = useMemo(() => agendaManutencaoAtivaLista.filter((ag) => ag.data_programada === hojeISO()), [agendaManutencaoAtivaLista]);

  const osCmmsSemVinculo = useMemo(() => osCmms.filter((os) => !os.equipamento_id), [osCmms]);
  const checklistsDoDia = checklists.filter((c) => c.data_checklist === data);

  function checklistDoPeriodo(e: Equipamento, dataReferencia = data) {
    const periodicidade = periodicidadeChecklistDoEquipamento(e);
    return checklists
      .filter((c) => normalizarTagOS(c.tag) === normalizarTagOS(e.tag) && checklistEstaNoPeriodo(c.data_checklist, dataReferencia, periodicidade))
      .sort((a, b) => `${b.data_checklist} ${b.hora_checklist || ""}`.localeCompare(`${a.data_checklist} ${a.hora_checklist || ""}`))[0];
  }

  const equipamentosObrigatorios = equipamentos.filter((e) =>
    e.ativo !== false &&
    e.checklist_obrigatorio !== false &&
    e.status_operacional !== "EM_MANUTENCAO" &&
    (moduloSelecionado === "TODOS" || moduloDoEquipamento(e) === moduloSelecionado)
  );

  const equipamentosComChecklistPeriodo = equipamentosObrigatorios.filter((e) => Boolean(checklistDoPeriodo(e, data)));
  const tagsFeitasTurno = new Set(equipamentosComChecklistPeriodo.map((e) => normalizar(e.tag)));
  const pendentesHoje = equipamentosObrigatorios.filter((e) => !checklistDoPeriodo(e, data));
  const concluidosHoje = equipamentosComChecklistPeriodo.length;
  const checklistsTurnoSelecionado = equipamentosComChecklistPeriodo
    .map((e) => checklistDoPeriodo(e, data))
    .filter(Boolean) as ChecklistRegistro[];
  const comAvariaHoje = checklistsTurnoSelecionado.filter((c) => c.resultado_final === "COM AVARIA");
  const horaAtual = Number(partesDataHoraBrasil().hora);

  // Compatibilidade com histórico antigo: o sistema não cria mais Turno 2.
  const checklistsT1 = checklistsDoDia;
  const checklistsT2: ChecklistRegistro[] = [];
  const pendentesT1 = pendentesHoje;
  const pendentesT2: Equipamento[] = [];
  const avariasT1 = checklistsDoDia.filter((c) => c.resultado_final === "COM AVARIA");
  const avariasT2: ChecklistRegistro[] = [];

  const equipamentosReservaDisponiveis = equipamentos.filter((e) =>
    e.ativo !== false &&
    e.tag !== tagSelecionada &&
    e.status_operacional !== "EM_MANUTENCAO" &&
    e.status_operacional !== "RESERVA"
  );

  const modelosDisponiveis = useMemo(() => {
    const mapa = new Map<string, string>();

    equipamentos.forEach((e) => {
      const chave = modeloChave(e);
      const label = modeloLabel(e);
      if (!mapa.has(chave)) mapa.set(chave, label);
    });

    return Array.from(mapa.entries())
      .map(([chave, label]) => ({ chave, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [equipamentos]);

  const itensRetiradosPorModelo = useMemo(() => {
    return decisoesNA
      .filter((d) => d.decisao === "REMOVER")
      .sort((a, b) => `${a.modelo_label}-${a.item_numero}`.localeCompare(`${b.modelo_label}-${b.item_numero}`));
  }, [decisoesNA]);

  const itemIdsRemovidosModelo = useMemo(() => {
    if (!equipamentoSelecionado) return [];
    const chave = modeloChave(equipamentoSelecionado);
    return decisoesNA.filter((d) => d.modelo_chave === chave && d.decisao === "REMOVER").map((d) => d.item_numero);
  }, [equipamentoSelecionado, decisoesNA]);

  const sugestoesNA = useMemo(() => {
    const mapa = new Map<string, any>();

    checklists.forEach((chk) => {
      const mKey = modeloChave({ modelo: chk.modelo, tipo_equipamento: chk.tipo_equipamento });
      const mLabel = modeloLabel({ modelo: chk.modelo, tipo_equipamento: chk.tipo_equipamento });
      const respostasDoChecklist = respostasBanco.filter((r) => r.checklist_id === chk.id && r.status === "N/A");

      respostasDoChecklist.forEach((resp) => {
        const key = `${mKey}_${resp.item_numero}`;
        const decisao = decisoesNA.find((d) => d.modelo_chave === mKey && d.item_numero === resp.item_numero);

        if (!mapa.has(key)) {
          mapa.set(key, {
            key,
            modeloKey: mKey,
            modeloLabel: mLabel,
            itemNumero: resp.item_numero,
            itemDescricao: resp.item_descricao,
            totalOcorrencias: 0,
            observacoes: [],
            decisao,
          });
        }

        const item = mapa.get(key);
        item.totalOcorrencias += 1;
        item.decisao = decisao;
        if (resp.observacao && !item.observacoes.includes(resp.observacao)) item.observacoes.push(resp.observacao);
      });
    });

    return Array.from(mapa.values()).sort((a, b) => a.modeloLabel.localeCompare(b.modeloLabel));
  }, [checklists, respostasBanco, decisoesNA]);

  const hojeDashboard = hojeISO();
  const equipamentosAtivosDashboard = equipamentos.filter((e) => e.ativo !== false);
  const equipamentosObrigatoriosDashboard = equipamentosAtivosDashboard.filter((e) => e.checklist_obrigatorio !== false && e.status_operacional !== "EM_MANUTENCAO");
  const pendentesChecklistDashboard = equipamentosObrigatoriosDashboard.filter((e) => {
    const periodicidade = periodicidadeChecklistDoEquipamento(e);
    return !checklists.some((c) => normalizarTagOS(c.tag) === normalizarTagOS(e.tag) && checklistEstaNoPeriodo(c.data_checklist, hojeDashboard, periodicidade));
  });

  const ultimoChecklistPorTag = useMemo(() => {
    const mapa = new Map<string, ChecklistRegistro>();
    [...checklists]
      .sort((a, b) => `${a.data_checklist} ${a.hora_checklist || ""}`.localeCompare(`${b.data_checklist} ${b.hora_checklist || ""}`))
      .forEach((c) => mapa.set(normalizarTagOS(c.tag), c));
    return mapa;
  }, [checklists]);

  const checklistsAtualPorTag = useMemo(() => {
    const mapa = new Map<string, ChecklistRegistro>();
    equipamentosAtivosDashboard.forEach((e) => {
      const periodicidade = periodicidadeChecklistDoEquipamento(e);
      const atual = checklists
        .filter((c) => normalizarTagOS(c.tag) === normalizarTagOS(e.tag) && checklistEstaNoPeriodo(c.data_checklist, hojeDashboard, periodicidade))
        .sort((a, b) => `${b.data_checklist} ${b.hora_checklist || ""}`.localeCompare(`${a.data_checklist} ${a.hora_checklist || ""}`))[0];
      if (atual) mapa.set(normalizarTagOS(e.tag), atual);
    });
    return mapa;
  }, [equipamentos, checklists]);

  const maquinasManutencaoDashboard = equipamentosAtivosDashboard.filter((e) => e.status_operacional === "EM_MANUTENCAO" || paradasManutencao.some((p) => normalizarTagOS(p.tag_original) === normalizarTagOS(e.tag)));
  const maquinasAvariaDashboard = equipamentosAtivosDashboard.filter((e) => {
    if (maquinasManutencaoDashboard.some((m) => normalizarTagOS(m.tag) === normalizarTagOS(e.tag))) return false;
    return checklistsAtualPorTag.get(normalizarTagOS(e.tag))?.resultado_final === "COM AVARIA";
  });
  const maquinasOkDashboard = equipamentosAtivosDashboard.filter((e) => {
    if (maquinasManutencaoDashboard.some((m) => normalizarTagOS(m.tag) === normalizarTagOS(e.tag))) return false;
    return checklistsAtualPorTag.get(normalizarTagOS(e.tag))?.resultado_final === "CONFORME";
  });

  const checklistsFeitosHojeDashboard = checklists
    .filter((c) => c.data_checklist === hojeDashboard)
    .sort((a, b) => String(b.hora_checklist || "").localeCompare(String(a.hora_checklist || "")));

  const sugestoesNAPendentes = sugestoesNA.filter((s: any) => !s.decisao);

  const programacoesPreventivasAbertas = programacoesPreventivas.filter((p) => p.status === "PROGRAMADO" || p.status === "ATRASADO");
  const preventivasAtrasadasDashboard = programacoesPreventivasAbertas.filter((p) => p.status === "ATRASADO" || (p.status === "PROGRAMADO" && p.data_programada < hojeDashboard));
  const limiteProximos7 = adicionarPeriodicidade(hojeDashboard, 7, "DIAS");
  const preventivasProximasDashboard = programacoesPreventivasAbertas.filter((p) => p.data_programada >= hojeDashboard && p.data_programada <= limiteProximos7);
  const preventivasExecutadasHoje = programacoesPreventivas.filter((p) => p.status === "EXECUTADO" && p.data_execucao === hojeDashboard);

  const defeitosAbertosDashboard = useMemo(() => {
    const chkPorId = new Map(checklists.filter((c) => c.id).map((c) => [c.id as string, c]));
    const series = new Map<string, Array<{ chk: ChecklistRegistro; resp: RespostaBanco }>>();

    respostasBanco.forEach((resp) => {
      const chk = chkPorId.get(resp.checklist_id);
      if (!chk) return;
      const key = `${normalizarTagOS(chk.tag)}|${resp.item_numero}`;
      if (!series.has(key)) series.set(key, []);
      series.get(key)!.push({ chk, resp });
    });

    const abertos: Array<{
      tag: string; itemNumero: number; itemDescricao: string; observacao: string; operador: string; inicio: string; ultimo: string; dias: number; checklistId?: string;
    }> = [];

    series.forEach((eventos) => {
      eventos.sort((a, b) => `${a.chk.data_checklist} ${a.chk.hora_checklist || ""}`.localeCompare(`${b.chk.data_checklist} ${b.chk.hora_checklist || ""}`));
      const ultimo = eventos[eventos.length - 1];
      if (!ultimo || ultimo.resp.status !== "NÃO OK") return;

      let inicio = ultimo.chk.data_checklist;
      for (let i = eventos.length - 2; i >= 0; i--) {
        const ev = eventos[i];
        if (ev.resp.status === "OK") break;
        if (ev.resp.status === "NÃO OK") inicio = ev.chk.data_checklist;
      }

      abertos.push({
        tag: ultimo.chk.tag,
        itemNumero: ultimo.resp.item_numero,
        itemDescricao: ultimo.resp.item_descricao,
        observacao: ultimo.resp.observacao || "Sem observação",
        operador: ultimo.chk.operador_nome,
        inicio,
        ultimo: ultimo.chk.data_checklist,
        dias: diasEntre(inicio, hojeDashboard),
        checklistId: ultimo.chk.id,
      });
    });

    return abertos.sort((a, b) => b.dias - a.dias || a.tag.localeCompare(b.tag));
  }, [checklists, respostasBanco]);

  const checklistsUltimos7Dias = useMemo(() => {
    const resultado: Array<{ data: string; total: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = dataUTC(hojeDashboard);
      d.setUTCDate(d.getUTCDate() - i);
      const iso = dataISOdeDate(d);
      resultado.push({ data: iso, total: checklists.filter((c) => c.data_checklist === iso).length });
    }
    return resultado;
  }, [checklists]);

  const cargaPreventiva8Semanas = useMemo(() => {
    const inicio = dataUTC(inicioSemanaISO(hojeDashboard));
    const out: Array<{ ano: number; semana: number; label: string; total: number; executado: number }> = [];
    for (let i = 0; i < 8; i++) {
      const d = new Date(inicio.getTime());
      d.setUTCDate(d.getUTCDate() + i * 7);
      const iso = dataISOdeDate(d);
      const sw = numeroSemanaISO(iso);
      const programas = programacoesPreventivas.filter((p) => p.ano === sw.ano && p.semana_iso === sw.semana);
      out.push({ ano: sw.ano, semana: sw.semana, label: `S${String(sw.semana).padStart(2, "0")}`, total: programas.length, executado: programas.filter((p) => p.status === "EXECUTADO").length });
    }
    return out;
  }, [programacoesPreventivas]);

  const planosFiltradosAdmin = useMemo(() => {
    const termo = normalizar(planoBusca);
    return planosPreventivos.filter((p) => {
      if (planoTipoFiltro !== "TODOS" && p.plano_tipo !== planoTipoFiltro) return false;
      if (!termo) return true;
      return normalizar(`${p.tag} ${p.modelo_plano} ${p.plano_tipo} ${p.checklist_referencia || ""}`).includes(termo);
    });
  }, [planosPreventivos, planoBusca, planoTipoFiltro]);

  const mapaPlanosFiltrados = useMemo(() => {
    const termo = normalizar(mapaBusca);
    return planosPreventivos.filter((p) => !termo || normalizar(`${p.tag} ${p.modelo_plano} ${p.plano_tipo}`).includes(termo));
  }, [planosPreventivos, mapaBusca]);

  const planoOsSelecionado = planosPreventivos.find((p) => p.id === osPlanoId) || null;

  const programacaoPorPlanoSemana = useMemo(() => {
    const mapa = new Map<string, ProgramacaoPreventiva>();
    programacoesPreventivas.forEach((p) => mapa.set(`${p.plano_id}|${p.ano}|${p.semana_iso}`, p));
    return mapa;
  }, [programacoesPreventivas]);

  const equipamentoHistorico = equipamentos.find((e) => e.tag === historicoTag) || null;
  const historicoChecklists = checklists
    .filter((c) => normalizarTagOS(c.tag) === normalizarTagOS(historicoTag))
    .sort((a, b) => `${b.data_checklist} ${b.hora_checklist || ""}`.localeCompare(`${a.data_checklist} ${a.hora_checklist || ""}`));
  const historicoProgramacoes = programacoesPreventivas
    .filter((p) => normalizarTagOS(p.tag) === normalizarTagOS(historicoTag))
    .sort((a, b) => b.data_programada.localeCompare(a.data_programada));
  const programacoesExecutadasRecentes = programacoesPreventivas
    .filter((p) => p.status === "EXECUTADO")
    .sort((a, b) => String(b.data_execucao || b.data_programada).localeCompare(String(a.data_execucao || a.data_programada)));

  function itensChecklistPorModulo(modulo: ModuloEquipamento) {
    const moduloReal = modulo === "MONOVIA" ? "MONOVIA" : "FROTA";
    return itensPadrao.filter((i) => (i.modulo || "FROTA") === moduloReal);
  }

  function itensConfigPorModulo(modulo: ModuloEquipamento) {
    const moduloReal = modulo === "MONOVIA" ? "MONOVIA" : "FROTA";
    return itensConfig.filter((i) => (i.modulo || "FROTA") === moduloReal);
  }

  function ehInspecaoMensalModulo(modulo: ModuloEquipamento) {
    return modulo === "MONOVIA";
  }

  function periodoMensal(dataISO: string) {
    return String(dataISO || "").slice(0, 7);
  }

  function nomePeriodoOperacional(modulo: ModuloEquipamento) {
    return ehInspecaoMensalModulo(modulo) ? "Inspeção mensal" : nomeTurno(turnoSelecionado);
  }

  function horarioReferenciaOperacional(modulo: ModuloEquipamento) {
    return ehInspecaoMensalModulo(modulo) ? "Mensal" : horarioReferenciaTurno(turnoSelecionado);
  }

  function resetarChecklist(removidos: number[] = itemIdsRemovidosModelo, equipamentoBase: Equipamento | null = equipamentoSelecionado) {
    const modulo = equipamentoBase ? moduloDoEquipamento(equipamentoBase) : moduloSelecionado;
    setRespostas(montarRespostasPadrao(itensChecklistPorModulo(modulo), removidos));
    setSituacaoEquipamento("EM OPERAÇÃO");
    setObservacaoGeral("");
    setHorimetroLeitura("");
    setConfirmacaoOperador(false);
    setConfirmacaoAlertaManutencao(false);
    setFotoEvidencia("");
    setFotoHorimetro("");
    setAvariaImpedeUso(false);
    setNumeroOS("");
    setAfetaOperacao(false);
  }

  function selecionarEquipamento(tag: string) {
    const equipamento = equipamentos.find((e) => e.tag === tag) || null;
    const removidos = equipamento
      ? decisoesNA.filter((d) => d.modelo_chave === modeloChave(equipamento) && d.decisao === "REMOVER").map((d) => d.item_numero)
      : [];

    setTagSelecionada(tag);
    setTelaOperador("CHECKLIST");
    setMensagem("");
    setConfirmacaoAlertaManutencao(false);

    const moduloEquipamento = equipamento ? moduloDoEquipamento(equipamento) : moduloSelecionado;
    const periodicidadeEquipamento = periodicidadeChecklistDoEquipamento(equipamento);
    const existente = checklists
      .filter((c) => c.tag === tag && checklistEstaNoPeriodo(c.data_checklist, data, periodicidadeEquipamento))
      .sort((a, b) => `${b.data_checklist} ${b.hora_checklist || ""}`.localeCompare(`${a.data_checklist} ${a.hora_checklist || ""}`))[0];

    if (existente?.id) {
      setSituacaoEquipamento(existente.situacao_equipamento || "EM OPERAÇÃO");
      setObservacaoGeral(existente.observacao_geral || "");
      setHorimetroLeitura(existente.horimetro || "");
      setConfirmacaoOperador(existente.confirmacao_operador || false);
      setFotoEvidencia(existente.foto_evidencia_url || "");
      setFotoHorimetro(existente.foto_horimetro_url || "");
      setAvariaImpedeUso(false);
      setNumeroOS("");
      setAfetaOperacao(false);

      const resp = respostasBanco
        .filter((r) => r.checklist_id === existente.id)
        .sort((a, b) => a.item_numero - b.item_numero)
        .map((r) => ({
          item_numero: r.item_numero,
          item_descricao: r.item_descricao,
          status: r.status,
          observacao: r.observacao || "",
        }));

      setRespostas(resp.length ? resp : montarRespostasPadrao(itensChecklistPorModulo(moduloEquipamento), removidos));
    } else {
      resetarChecklist(removidos, equipamento);
    }
  }

  function alterarStatusItem(itemNumero: number, status: StatusItem) {
    setRespostas((atuais) =>
      atuais.map((r) => r.item_numero === itemNumero ? { ...r, status, observacao: status === "OK" ? "" : r.observacao } : r)
    );
  }

  function alterarObservacaoItem(itemNumero: number, observacao: string) {
    setRespostas((atuais) => atuais.map((r) => r.item_numero === itemNumero ? { ...r, observacao } : r));
  }

  async function importarArquivoCMMS(evento: React.ChangeEvent<HTMLInputElement>) {
    const file = evento.target.files?.[0];
    if (!file) return;

    if (!isAdmin) {
      setMensagem("Somente ADMIN pode importar OS do CMMS.");
      evento.target.value = "";
      return;
    }

    try {
      setCarregando(true);
      setMensagem("Lendo arquivo do CMMS...");

      const texto = await lerArquivoComoTexto(file);
      const linhas = extrairLinhasCmmsDoHtml(texto);

      if (!linhas.length) {
        throw new Error("Nenhuma OS encontrada no arquivo.");
      }

      const equipamentosPorTag = new Map(equipamentos.map((e) => [normalizarTagOS(e.tag), e]));
      const payload: OsCmms[] = linhas.map((linha) => {
        const equipamentoTexto = linha.EQUIPAMENTO || "";
        const tag = extrairTagDoEquipamentoCmms(equipamentoTexto);
        const equip = equipamentosPorTag.get(normalizarTagOS(tag));

        return {
          num_os: linha.NUM_OS,
          tag,
          tag_normalizada: normalizarTagOS(tag),
          equipamento_texto: equipamentoTexto,
          equipamento_id: equip?.id || null,
          setor: linha.SETOR || "",
          tipo_manut: linha.TIPO_MANUT || "",
          recorrencia: linha.RECORRENCIA || "",
          dt_progr: linha.DT_PROGR || "",
          hr_parada: linha.HR_PARADA || "",
          hr_retorno: linha.HR_RETORNO || "",
          tempo_parada_hrs: linha.TEMPO_PARADA_HRS || "",
          tempo_parada_min: linha.TEMPO_PARADA_MIN || "",
          status: linha.STATUS || "",
          solicitante: linha.SOLICITANTE || "",
          executor: linha.EXECUTOR || "",
          dt_exec: linha.DT_EXEC || "",
          modo_trab: linha.MODO_TRAB || "",
          codigo_parada: linha.CODIGO_PARADA || "",
          desc_codigo_parada: linha.DESC_CODIGO_PARADA || "",
          descricao: linha.DESCRICAO || "",
          parecer: linha.PARECER || "",
          turno: linha.TURNO || "",
          fluxo_manutencao: linha.FLUXO_MANUTENCAO || "",
          gpm: linha.GPM || "",
          origem_arquivo: file.name,
          importado_por: perfilUsuario?.nome || "ADMIN",
          ativo_equipamento: equip ? equip.ativo !== false : false,
        };
      }).filter((os) => os.num_os && os.tag);

      if (!payload.length) throw new Error("Nenhuma OS válida encontrada para importação.");

      const tamanhoLote = 300;
      for (let i = 0; i < payload.length; i += tamanhoLote) {
        const lote = payload.slice(i, i + tamanhoLote);
        await supabaseRequest<OsCmms[]>("os_cmms?on_conflict=num_os,tag", {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=representation" },
          body: JSON.stringify(lote),
        });
      }

      await carregarDados();

      const vinculadas = payload.filter((os) => os.equipamento_id).length;
      const semVinculo = payload.length - vinculadas;

      setResultadoImportacaoCMMS({
        total: linhas.length,
        importadas: payload.length,
        vinculadas,
        semVinculo,
        arquivo: file.name,
      });

      setMensagem(`Importação concluída: ${payload.length} OS importadas/atualizadas. Vinculadas: ${vinculadas}. Sem vínculo: ${semVinculo}.`);
    } catch (err: any) {
      setMensagem(`Erro ao importar CMMS: ${err.message || err}`);
    } finally {
      setCarregando(false);
      evento.target.value = "";
    }
  }

  async function carregarFoto(evento: React.ChangeEvent<HTMLInputElement>, tipo: "EVIDENCIA" | "HORIMETRO") {
    const file = evento.target.files?.[0];
    if (!file) return;

    setMensagem("");

    try {
      setCarregando(true);

      const fotoComprimida = await comprimirImagem(file, 1280, 0.72);
      const tamanhoMB = tamanhoDataUrlMB(fotoComprimida);

      if (tamanhoMB > 2.5) {
        throw new Error("A foto ainda ficou muito grande. Tente tirar uma foto mais próxima ou com menor resolução.");
      }

      if (tipo === "EVIDENCIA") setFotoEvidencia(fotoComprimida);
      if (tipo === "HORIMETRO") setFotoHorimetro(fotoComprimida);

      setMensagem(`Foto carregada e reduzida automaticamente (${tamanhoMB.toFixed(1)} MB).`);
    } catch (err: any) {
      setMensagem(`Erro ao carregar foto: ${err.message || err}`);
    } finally {
      setCarregando(false);
      evento.target.value = "";
    }
  }

  async function finalizarChecklist() {
    setMensagem("");
    setErrosChecklist([]);

    const erros: string[] = [];

    if (!perfilUsuario) erros.push("Usuário não autenticado. Faça login novamente.");
    if (!operador.trim()) erros.push("Informe o nome completo do operador.");
    if (!equipamentoSelecionado) erros.push("Selecione um equipamento.");

    const itensSemResposta = respostas.filter((r) => !r.status);
    itensSemResposta.forEach((r) => {
      erros.push(`Item ${r.item_numero} - ${r.item_descricao}: falta marcar OK, NÃO OK ou N/A.`);
    });

    const naoOkSemObs = respostas.filter((r) => r.status === "NÃO OK" && !r.observacao.trim());
    naoOkSemObs.forEach((r) => {
      erros.push(`Item ${r.item_numero} - ${r.item_descricao}: marcado NÃO OK, mas sem observação da avaria.`);
    });

    const naSemObs = respostas.filter((r) => r.status === "N/A" && !r.observacao.trim());
    naSemObs.forEach((r) => {
      erros.push(`Item ${r.item_numero} - ${r.item_descricao}: marcado N/A, mas sem justificativa.`);
    });

    if (ehEquipamentoEletrico(equipamentoSelecionado || null) && !horimetroLeitura.trim()) {
      erros.push("Falta informar a leitura/descrição do horímetro.");
    }

    if (ehEquipamentoEletrico(equipamentoSelecionado || null) && !fotoHorimetro) {
      erros.push("Falta enviar/tirar foto do horímetro.");
    }

    const temAvariaNoChecklist = respostas.some((r) => r.status === "NÃO OK");
    if ((temAvariaNoChecklist || avariaImpedeUso || situacaoEquipamento === "EM MANUTENÇÃO") && !fotoEvidencia) {
      erros.push("Existe avaria ou situação de manutenção. Envie/tire uma foto do equipamento ou da avaria.");
    }

    if ((avariaImpedeUso || situacaoEquipamento === "EM MANUTENÇÃO") && !numeroOS.trim()) {
      erros.push("Informe o número da OS para equipamento parado/em manutenção.");
    }

    if ((alertasManutencaoSelecionado.length || alertasAgendaSelecionado.length) && !confirmacaoAlertaManutencao) {
      erros.push("Confirme que está ciente do alerta de manutenção antes de finalizar o checklist.");
    }

    if (!confirmacaoOperador) {
      erros.push("Marque a confirmação final do operador.");
    }

    if (erros.length) {
      setErrosChecklist(erros);
      setMensagem("Não foi possível salvar. Corrija os itens listados abaixo.");
      return;
    }

    const equipamentoAtual = equipamentoSelecionado;
    if (!equipamentoAtual) {
      setMensagem("Selecione um equipamento.");
      return;
    }

    const situacaoAlerta = situacaoEquipamento !== "EM OPERAÇÃO" && situacaoEquipamento !== "PARADO NA ÁREA";
    const resultado = respostas.some((r) => r.status === "NÃO OK") || situacaoAlerta || avariaImpedeUso ? "COM AVARIA" : "CONFORME";
    const periodicidadeAtual = periodicidadeChecklistDoEquipamento(equipamentoAtual);
    const checklistExistentePeriodo = checklists
      .filter((c) => normalizarTagOS(c.tag) === normalizarTagOS(equipamentoAtual.tag) && checklistEstaNoPeriodo(c.data_checklist, data, periodicidadeAtual))
      .sort((a, b) => `${b.data_checklist} ${b.hora_checklist || ""}`.localeCompare(`${a.data_checklist} ${a.hora_checklist || ""}`))[0];
    const dataRegistroChecklist = checklistExistentePeriodo?.data_checklist || data;

    try {
      setCarregando(true);

      const pastaFotos = `${dataRegistroChecklist}/${normalizar(equipamentoAtual.tag)}`;
      const fotoEvidenciaUrl = fotoEvidencia ? await enviarFotoStorage(fotoEvidencia, pastaFotos, "evidencia") : "";
      const fotoHorimetroUrl = fotoHorimetro ? await enviarFotoStorage(fotoHorimetro, pastaFotos, "horimetro") : "";

      const payload: ChecklistRegistro = {
        data_checklist: dataRegistroChecklist,
        operador_nome: operador.trim(),
        operador_user_id: null,
        turno_codigo: "T1",
        turno_nome: descricaoPeriodoChecklist(equipamentoAtual, data),
        horario_referencia: nomePeriodicidadeChecklist(periodicidadeAtual),
        equipamento_id: equipamentoAtual.id || null,
        tag: equipamentoAtual.tag,
        tipo_equipamento: equipamentoAtual.tipo_equipamento,
        modelo: equipamentoAtual.modelo || "",
        numero_serie: equipamentoAtual.numero_serie || "",
        local_correto: equipamentoAtual.local_correto || "",
        area: equipamentoAtual.area || "",
        situacao_equipamento: situacaoEquipamento,
        resultado_final: resultado,
        horimetro: horimetroLeitura,
        observacao_geral: observacaoGeral,
        foto_evidencia_url: fotoEvidenciaUrl,
        foto_horimetro_url: fotoHorimetroUrl,
        confirmacao_operador: true,
      };

      const salvo = await supabaseRequest<ChecklistRegistro[]>("checklists?on_conflict=tag,data_checklist,turno_codigo", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(payload),
      });

      const checklistId = salvo[0]?.id;
      if (!checklistId) throw new Error("Não retornou ID do checklist.");

      await supabaseRequest<null>(`checklist_respostas?checklist_id=eq.${checklistId}`, { method: "DELETE" });

      await supabaseRequest<RespostaBanco[]>("checklist_respostas", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(respostas.map((r) => ({
          checklist_id: checklistId,
          item_numero: r.item_numero,
          item_descricao: r.item_descricao,
          status: r.status,
          observacao: r.observacao,
        }))),
      });

      if (avariaImpedeUso || situacaoEquipamento === "EM MANUTENÇÃO") {
        await supabaseRequest<ParadaManutencao[]>("paradas_manutencao", {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            equipamento_id: equipamentoAtual.id || null,
            tag_original: equipamentoAtual.tag,
            operador_nome: operador.trim(),
            operador_user_id: null,
            numero_os: numeroOS.trim(),
            motivo: observacaoGeral || "Equipamento parado por avaria identificada no checklist.",
            afeta_operacao: afetaOperacao,
            status: afetaOperacao ? "AGUARDANDO_RESERVA" : "EM_MANUTENCAO",
          }),
        });

        await supabaseRequest<Equipamento[]>(`equipamentos?tag=eq.${encodeURIComponent(equipamentoAtual.tag)}`, {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            checklist_obrigatorio: false,
            status_operacional: "EM_MANUTENCAO",
          }),
        });
      }

      await carregarDados();
      setErrosChecklist([]);
      setMensagem(`Checklist da ${equipamentoAtual.tag} finalizado (${nomePeriodicidadeChecklist(periodicidadeAtual)}): ${resultado}.`);
      setTelaOperador("LISTA");
    } catch (err: any) {
      setMensagem(`Erro ao salvar checklist: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function salvarEquipamento() {
    setMensagem("");

    if (!isAdmin) return setMensagem("Somente Admin pode alterar cadastro.");
    if (!equipamentoEdicao.tag.trim()) return setMensagem("Informe a TAG.");
    if (!equipamentoEdicao.tipo_equipamento.trim()) return setMensagem("Informe o tipo de equipamento.");
    if (!equipamentoEdicao.modelo?.trim()) return setMensagem("Informe o modelo.");
    if (!equipamentoEdicao.local_correto?.trim()) return setMensagem("Informe o local.");
    if (!equipamentoEdicao.area?.trim()) return setMensagem("Informe a área.");

    const payload: Equipamento = {
      ...equipamentoEdicao,
      tag: equipamentoEdicao.tag.trim().toUpperCase(),
      tipo: equipamentoEdicao.tipo || "NOVA",
      tipo_equipamento: equipamentoEdicao.tipo_equipamento.trim().toUpperCase(),
      modulo: moduloDoEquipamento(equipamentoEdicao) === "MONOVIA" ? "MONOVIA" : "FROTA",
      modelo: equipamentoEdicao.modelo?.trim().toUpperCase() || "",
      numero_serie: equipamentoEdicao.numero_serie?.trim().toUpperCase() || "",
      local_correto: equipamentoEdicao.local_correto?.trim().toUpperCase() || "",
      area: equipamentoEdicao.area?.trim().toUpperCase() || "",
      checklist_obrigatorio: equipamentoEdicao.checklist_obrigatorio !== false,
      periodicidade_checklist: periodicidadeChecklistDoEquipamento(equipamentoEdicao),
      ativo: equipamentoEdicao.ativo !== false,
      origem: editandoTag ? "Cadastro editado no app" : "Cadastro manual no app",
    };

    try {
      setCarregando(true);
      await supabaseRequest<Equipamento[]>("equipamentos?on_conflict=tag", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(payload),
      });

      await carregarDados();
      setEquipamentoEdicao(equipamentoVazio);
      setEditandoTag("");
      setMensagem(`Cadastro ${payload.tag} salvo.`);
    } catch (err: any) {
      setMensagem(`Erro ao salvar cadastro: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function salvarAgendaManutencao() {
    setMensagem("");

    if (!isAdmin) return setMensagem("Somente Admin pode cadastrar agenda de manutenção.");
    if (!agendaTag) return setMensagem("Selecione um equipamento para a agenda.");
    if (!agendaDataProgramada) return setMensagem("Informe a data programada.");
    if (!agendaTipo.trim()) return setMensagem("Informe o tipo de manutenção.");

    const equipamento = equipamentos.find((e) => e.tag === agendaTag);
    if (!equipamento) return setMensagem("Equipamento não encontrado.");

    const modulo = moduloDoEquipamento(equipamento) === "MONOVIA" ? "MONOVIA" : "FROTA";

    const payload: AgendaManutencao = {
      tag: equipamento.tag,
      tag_normalizada: normalizarTagOS(equipamento.tag),
      equipamento_id: equipamento.id || null,
      modulo,
      data_programada: agendaDataProgramada,
      tipo_manutencao: agendaTipo.trim(),
      descricao: agendaDescricao.trim(),
      status: "PROGRAMADO",
      criado_por: perfilUsuario?.nome || "ADMIN",
    };

    try {
      setCarregando(true);

      await supabaseRequest<AgendaManutencao[]>("agenda_manutencao", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(payload),
      });

      await carregarDados();
      setAgendaDescricao("");
      setMensagem(`Agenda cadastrada para ${equipamento.tag} em ${dataISOParaBR(agendaDataProgramada)}.`);
    } catch (err: any) {
      setMensagem(`Erro ao salvar agenda: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function atualizarStatusAgenda(id: string | undefined, status: "CONCLUIDO" | "CANCELADO" | "PROGRAMADO") {
    if (!id) return;
    if (!isAdmin) return setMensagem("Somente Admin pode alterar agenda.");

    try {
      setCarregando(true);

      await supabaseRequest<AgendaManutencao[]>(`agenda_manutencao?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          atualizado_em: new Date().toISOString(),
        }),
      });

      await carregarDados();
      setMensagem(status === "CONCLUIDO" ? "Agenda marcada como concluída." : status === "CANCELADO" ? "Agenda cancelada." : "Agenda reaberta.");
    } catch (err: any) {
      setMensagem(`Erro ao atualizar agenda: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  function abrirHistoricoEquipamento(tag: string) {
    setHistoricoTag(tag);
    setFiltroAdmin("HISTORICO");
    setDashboardDetalhe("");
  }

  function selecionarPlanoParaOS(plano: PlanoPreventivo) {
    if (!plano.id) return;
    setOsPlanoId(plano.id);
    setOsNumero("");
    setOsDataExecucao(hojeISO());
    setOsExecutor(perfilUsuario?.nome || "");
    setOsObservacao("");
    setFiltroAdmin("OS_MANUAL");
  }

  async function atualizarBaseRecalculoPlano(plano: PlanoPreventivo, base: "EXECUCAO" | "PROGRAMADO") {
    if (!isAdmin || !plano.id) return;
    try {
      setCarregando(true);
      await supabaseRequest<PlanoPreventivo[]>(`planos_preventivos?id=eq.${plano.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ base_recalculo: base, atualizado_em: new Date().toISOString() }),
      });
      await carregarDados();
      setMensagem(`Regra do plano ${plano.tag} - ${plano.plano_tipo} atualizada.`);
    } catch (err: any) {
      setMensagem(`Erro ao alterar regra do plano: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function registrarExecucaoPreventiva() {
    if (!isAdmin) return setMensagem("Somente Admin pode registrar execução de preventiva.");
    const plano = planoOsSelecionado;
    if (!plano?.id) return setMensagem("Selecione um plano de manutenção.");
    if (!osNumero.trim()) return setMensagem("Informe o número da OS.");
    if (!osDataExecucao) return setMensagem("Informe a data de execução.");
    if (!osExecutor.trim()) return setMensagem("Informe quem executou a manutenção.");

    try {
      setCarregando(true);

      const abertas = programacoesPreventivas
        .filter((p) => p.plano_id === plano.id && (p.status === "PROGRAMADO" || p.status === "ATRASADO"))
        .sort((a, b) => a.data_programada.localeCompare(b.data_programada));

      const programacaoAlvo = abertas[0];
      let dataProgramadaBase = programacaoAlvo?.data_programada || osDataExecucao;

      if (programacaoAlvo?.id) {
        await supabaseRequest<ProgramacaoPreventiva[]>(`programacoes_preventivas?id=eq.${programacaoAlvo.id}`, {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            status: "EXECUTADO",
            numero_os: osNumero.trim(),
            data_execucao: osDataExecucao,
            executor: osExecutor.trim(),
            observacao: osObservacao.trim(),
            atualizado_em: new Date().toISOString(),
          }),
        });
      } else {
        const sw = numeroSemanaISO(osDataExecucao);
        await supabaseRequest<ProgramacaoPreventiva[]>("programacoes_preventivas?on_conflict=plano_id,ano,semana_iso", {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=representation" },
          body: JSON.stringify({
            plano_id: plano.id,
            tag: plano.tag,
            tag_normalizada: plano.tag_normalizada,
            plano_tipo: plano.plano_tipo,
            ano: sw.ano,
            semana_iso: sw.semana,
            data_programada: osDataExecucao,
            status: "EXECUTADO",
            numero_os: osNumero.trim(),
            data_execucao: osDataExecucao,
            executor: osExecutor.trim(),
            observacao: osObservacao.trim(),
            origem: "Registro manual no app",
          }),
        });
        dataProgramadaBase = osDataExecucao;
      }

      const baseData = plano.base_recalculo === "PROGRAMADO" ? dataProgramadaBase : osDataExecucao;
      const proxima = adicionarPeriodicidade(baseData, plano.periodicidade_valor, plano.periodicidade_unidade);

      // Ao executar, o calendário futuro daquele plano é recalculado.
      // Os registros já EXECUTADOS permanecem como histórico.
      await supabaseRequest<null>(`programacoes_preventivas?plano_id=eq.${plano.id}&status=eq.PROGRAMADO&data_programada=gt.${encodeURIComponent(dataProgramadaBase)}`, { method: "DELETE" });
      await supabaseRequest<null>(`programacoes_preventivas?plano_id=eq.${plano.id}&status=eq.ATRASADO&data_programada=gt.${encodeURIComponent(dataProgramadaBase)}`, { method: "DELETE" });

      const limiteAno = Number(osDataExecucao.slice(0, 4)) + 1;
      const limite = `${limiteAno}-12-31`;
      const novos: ProgramacaoPreventiva[] = [];
      let proximaIteracao = proxima;
      let seguranca = 0;

      while (proximaIteracao <= limite && seguranca < 80) {
        const sw = numeroSemanaISO(proximaIteracao);
        novos.push({
          plano_id: plano.id,
          tag: plano.tag,
          tag_normalizada: plano.tag_normalizada,
          plano_tipo: plano.plano_tipo,
          ano: sw.ano,
          semana_iso: sw.semana,
          data_programada: proximaIteracao,
          status: "PROGRAMADO",
          origem: "Recalculado automaticamente pelo app",
        });
        proximaIteracao = adicionarPeriodicidade(proximaIteracao, plano.periodicidade_valor, plano.periodicidade_unidade);
        seguranca += 1;
      }

      if (novos.length) {
        await supabaseRequest<ProgramacaoPreventiva[]>("programacoes_preventivas?on_conflict=plano_id,ano,semana_iso", {
          method: "POST",
          headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
          body: JSON.stringify(novos),
        });
      }

      await supabaseRequest<PlanoPreventivo[]>(`planos_preventivos?id=eq.${plano.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          ultima_execucao: osDataExecucao,
          proxima_data: proxima,
          atualizado_em: new Date().toISOString(),
        }),
      });

      await carregarDados();
      setOsNumero("");
      setOsObservacao("");
      setMensagem(`OS ${osNumero.trim()} registrada. Próxima ${plano.plano_tipo.toLowerCase()} de ${plano.tag}: ${dataISOParaBR(proxima)}.`);
    } catch (err: any) {
      setMensagem(`Erro ao registrar execução preventiva: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function decidirNA(s: any, decisao: "REMOVER" | "MANTER") {
    if (!isAdmin) return setMensagem("Somente Admin pode validar N/A.");

    try {
      setCarregando(true);
      await supabaseRequest<DecisaoNA[]>("decisoes_na?on_conflict=modelo_chave,item_numero", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({
          modelo_chave: s.modeloKey,
          modelo_label: s.modeloLabel,
          item_numero: s.itemNumero,
          item_descricao: s.itemDescricao,
          decisao,
        }),
      });

      await carregarDados();
    } catch (err: any) {
      setMensagem(`Erro ao salvar decisão N/A: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function definirReserva(parada: ParadaManutencao) {
    if (!isAdmin) return setMensagem("Somente Admin pode definir reserva.");
    if (!tagReservaSelecionada) return setMensagem("Selecione uma TAG reserva.");

    try {
      setCarregando(true);

      const reserva = equipamentos.find((e) => e.tag === tagReservaSelecionada);
      if (!reserva) throw new Error("Reserva não encontrada.");

      await supabaseRequest<ParadaManutencao[]>(`paradas_manutencao?id=eq.${parada.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          status: "RESERVA_DEFINIDA",
          tag_reserva: reserva.tag,
          equipamento_reserva_id: reserva.id || null,
          observacao_admin: observacaoAdminParada,
        }),
      });

      await supabaseRequest<Equipamento[]>(`equipamentos?tag=eq.${encodeURIComponent(reserva.tag)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          status_operacional: "RESERVA",
          tag_substituindo: parada.tag_original,
        }),
      });

      await carregarDados();
      setTagReservaSelecionada("");
      setObservacaoAdminParada("");
      setMensagem(`Reserva ${reserva.tag} definida para substituir ${parada.tag_original}.`);
    } catch (err: any) {
      setMensagem(`Erro ao definir reserva: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function finalizarParada(parada: ParadaManutencao) {
    if (!isAdmin) return setMensagem("Somente Admin pode finalizar parada.");

    try {
      setCarregando(true);

      const inicio = new Date(`${parada.data_inicio}T${parada.hora_inicio || "00:00:00"}`);
      const agora = new Date();
      const horas = Math.max(0, (agora.getTime() - inicio.getTime()) / 3600000);

      await supabaseRequest<ParadaManutencao[]>(`paradas_manutencao?id=eq.${parada.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          status: "FINALIZADA",
          data_fim: hojeISO(),
          hora_fim: agora.toTimeString().slice(0, 8),
          horas_parado: horas,
          observacao_admin: observacaoAdminParada,
        }),
      });

      await supabaseRequest<Equipamento[]>(`equipamentos?tag=eq.${encodeURIComponent(parada.tag_original)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          checklist_obrigatorio: true,
          status_operacional: "DISPONIVEL",
          tag_substituindo: null,
        }),
      });

      if (parada.tag_reserva) {
        await supabaseRequest<Equipamento[]>(`equipamentos?tag=eq.${encodeURIComponent(parada.tag_reserva)}`, {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            status_operacional: "DISPONIVEL",
            tag_substituindo: null,
          }),
        });
      }

      await carregarDados();
      setObservacaoAdminParada("");
      setMensagem(`Parada da ${parada.tag_original} finalizada. Tempo parado: ${horas.toFixed(1)} h.`);
    } catch (err: any) {
      setMensagem(`Erro ao finalizar parada: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  function limparFormularioItemChecklist() {
    setItemChecklistNumero("");
    setItemChecklistDescricao("");
    setItemChecklistModulo("FROTA");
    setItemChecklistEditando(null);
  }

  function editarItemChecklist(item: ChecklistItemPadrao) {
    setItemChecklistNumero(String(item.numero));
    setItemChecklistDescricao(item.descricao);
    setItemChecklistModulo((item.modulo || "FROTA") as ModuloEquipamento);
    setItemChecklistEditando(item.numero);
    setMensagem("");
  }

  async function salvarItemChecklist() {
    setMensagem("");

    if (!isAdmin) return setMensagem("Somente Admin pode configurar o checklist.");

    const numero = Number(itemChecklistNumero);
    const descricao = itemChecklistDescricao.trim();

    if (!Number.isInteger(numero) || numero <= 0) {
      return setMensagem("Informe um número válido para o item.");
    }

    if (!descricao) {
      return setMensagem("Informe a descrição do item.");
    }

    try {
      setCarregando(true);

      const moduloItem = itemChecklistModulo === "MONOVIA" ? "MONOVIA" : "FROTA";

      await supabaseRequest<ChecklistItemPadrao[]>("checklist_itens_padrao?on_conflict=modulo,numero", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({
          numero,
          descricao,
          modulo: moduloItem,
          ativo: true,
        }),
      });

      await carregarDados();
      limparFormularioItemChecklist();
      setMensagem(`Item ${numero} salvo no checklist.`);
    } catch (err: any) {
      setMensagem(`Erro ao salvar item do checklist: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function alterarAtivoItemChecklist(item: ChecklistItemPadrao, ativo: boolean) {
    setMensagem("");

    if (!isAdmin) return setMensagem("Somente Admin pode configurar o checklist.");

    try {
      setCarregando(true);

      await supabaseRequest<ChecklistItemPadrao[]>(`checklist_itens_padrao?modulo=eq.${encodeURIComponent(item.modulo || "FROTA")}&numero=eq.${item.numero}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ ativo }),
      });

      await carregarDados();
      setMensagem(`Item ${item.numero} ${ativo ? "reativado" : "desativado"}.`);
    } catch (err: any) {
      setMensagem(`Erro ao alterar item do checklist: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function retirarItemPorModelo(item: ChecklistItemPadrao) {
    setMensagem("");

    if (!isAdmin) return setMensagem("Somente Admin pode configurar o checklist.");
    if (!modeloConfigSelecionado) return setMensagem("Selecione o modelo para retirar este item.");

    const modelo = modelosDisponiveis.find((m) => m.chave === modeloConfigSelecionado);
    if (!modelo) return setMensagem("Modelo não encontrado.");

    try {
      setCarregando(true);

      await supabaseRequest<DecisaoNA[]>("decisoes_na?on_conflict=modelo_chave,item_numero", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({
          modelo_chave: modelo.chave,
          modelo_label: modelo.label,
          item_numero: item.numero,
          item_descricao: item.descricao,
          decisao: "REMOVER",
          observacao_admin: "Item retirado manualmente na configuração do checklist.",
        }),
      });

      await carregarDados();
      setMensagem(`Item ${item.numero} retirado para todos os equipamentos do modelo ${modelo.label}.`);
    } catch (err: any) {
      setMensagem(`Erro ao retirar item por modelo: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function reativarItemPorModelo(decisao: DecisaoNA) {
    setMensagem("");

    if (!isAdmin) return setMensagem("Somente Admin pode configurar o checklist.");

    try {
      setCarregando(true);

      await supabaseRequest<DecisaoNA[]>(`decisoes_na?id=eq.${decisao.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          decisao: "MANTER",
          observacao_admin: "Item reativado manualmente na configuração do checklist.",
        }),
      });

      await carregarDados();
      setMensagem(`Item ${decisao.item_numero} reativado para o modelo ${decisao.modelo_label}.`);
    } catch (err: any) {
      setMensagem(`Erro ao reativar item por modelo: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  function limparFormularioUsuarioAdmin() {
    setUsuarioAdminNome("");
    setUsuarioAdminLogin("");
    setUsuarioAdminSenha("");
    setUsuarioAdminPerfil("OPERADOR");
    setUsuarioAdminAtivo(true);
    setUsuarioAdminEditando(null);
  }

  function editarUsuarioApp(u: PerfilUsuario) {
    setUsuarioAdminEditando(u.usuario);
    setUsuarioAdminNome(u.nome);
    setUsuarioAdminLogin(u.usuario);
    // Segurança: o ADMIN não visualiza a senha atual do usuário.
    // Este campo fica vazio e serve apenas para redefinir a senha.
    setUsuarioAdminSenha("");
    setUsuarioAdminPerfil(u.perfil);
    setUsuarioAdminAtivo(u.ativo !== false);
    setMensagem("Senha protegida: para alterar, informe uma nova senha. Para manter a senha atual, deixe o campo em branco.");
  }

  async function salvarUsuarioAppAdmin() {
    setMensagem("");

    if (!isAdmin) return setMensagem("Somente Admin pode alterar usuários.");

    const usuario = normalizarUsuario(usuarioAdminLogin);
    if (!usuarioAdminNome.trim()) return setMensagem("Informe o nome do usuário.");
    if (!usuario) return setMensagem("Informe um usuário válido.");

    const usuarioExistente = usuariosApp.find((u) => u.usuario === usuario);
    const editandoUsuario = Boolean(usuarioAdminEditando || usuarioExistente);

    if (!editandoUsuario && usuarioAdminSenha.length < 6) {
      return setMensagem("Para criar usuário novo, informe uma senha com pelo menos 6 caracteres.");
    }

    if (usuarioAdminSenha && usuarioAdminSenha.length < 6) {
      return setMensagem("A nova senha precisa ter pelo menos 6 caracteres.");
    }

    try {
      setCarregando(true);

      const payloadUsuario: Partial<PerfilUsuario> = {
        nome: usuarioAdminNome.trim(),
        usuario,
        perfil: usuarioAdminPerfil,
        ativo: usuarioAdminAtivo,
      };

      // Segurança: só envia senha quando o ADMIN realmente digitou uma nova senha.
      // Se estiver editando e deixar em branco, a senha atual é mantida no banco.
      if (usuarioAdminSenha) {
        payloadUsuario.senha = usuarioAdminSenha;
      }

      await supabaseRequest<PerfilUsuario[]>("usuarios_app?on_conflict=usuario", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(payloadUsuario),
      });

      await carregarDados();
      limparFormularioUsuarioAdmin();
      setMensagem(`Usuário ${usuario} salvo. A senha permanece protegida e não é exibida ao ADMIN.`);
    } catch (err: any) {
      setMensagem(`Erro ao salvar usuário: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function alternarUsuarioAtivo(u: PerfilUsuario) {
    if (!isAdmin) return setMensagem("Somente Admin pode alterar usuários.");

    try {
      setCarregando(true);

      await supabaseRequest<PerfilUsuario[]>(`usuarios_app?usuario=eq.${encodeURIComponent(u.usuario)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ ativo: !u.ativo }),
      });

      await carregarDados();
      setMensagem(`Usuário ${u.usuario} ${!u.ativo ? "ativado" : "bloqueado"}.`);
    } catch (err: any) {
      setMensagem(`Erro ao alterar usuário: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  function alternarEquipamentoRelatorio(tag: string) {
    setRelatorioTagsSelecionadas((atual) =>
      atual.includes(tag) ? atual.filter((t) => t !== tag) : [...atual, tag]
    );
  }

  function selecionarTodosEquipamentosRelatorio() {
    const tags = equipamentosRelatorioFiltrados.map((e) => e.tag);
    setRelatorioTagsSelecionadas((atual) => Array.from(new Set([...atual, ...tags])));
  }

  function limparSelecaoRelatorio() {
    setRelatorioTagsSelecionadas([]);
  }

  function gerarRelatorioChecklistPDF() {
    if (!isAdmin) return setMensagem("Somente ADMIN pode gerar relatório.");
    if (!relatorioTagsSelecionadas.length) return setMensagem("Selecione pelo menos um equipamento para gerar o relatório.");
    if (!relatorioDataInicio || !relatorioDataFim) return setMensagem("Informe data inicial e data final do relatório.");
    if (relatorioDataInicio > relatorioDataFim) return setMensagem("A data inicial não pode ser maior que a data final.");

    const tagsSelecionadasNormalizadas = new Set(relatorioTagsSelecionadas.map((tag) => normalizar(tag)));
    const checklistsRelatorio = checklists
      .filter((c) => tagsSelecionadasNormalizadas.has(normalizar(c.tag)))
      .filter((c) => c.data_checklist >= relatorioDataInicio && c.data_checklist <= relatorioDataFim)
      .filter((c) => relatorioTurno === "TODOS" || (c.turno_codigo || "T1") === relatorioTurno)
      .sort((a, b) => `${a.tag}-${a.data_checklist}-${a.turno_codigo || "T1"}-${a.hora_checklist || ""}`.localeCompare(`${b.tag}-${b.data_checklist}-${b.turno_codigo || "T1"}-${b.hora_checklist || ""}`));

    if (!checklistsRelatorio.length) return setMensagem("Não foram encontrados checklists para os equipamentos e período selecionados.");

    const equipamentoPorTag = new Map<string, Equipamento>();
    equipamentos.forEach((e) => equipamentoPorTag.set(normalizar(e.tag), e));

    const tagsOrdenadas = [...relatorioTagsSelecionadas].sort((a, b) => normalizar(a).localeCompare(normalizar(b)));
    const emitidoEm = `${formatarDataBR(hojeISO())} ${horaBrasil()}`;
    const turnoTexto = relatorioTurno === "TODOS" ? "Todos" : nomeTurno(relatorioTurno);
    const relatorioDiario = relatorioDataInicio === relatorioDataFim;
    const deveIncluirFotos = relatorioDiario || relatorioIncluirFotos;
    const fotosTexto = deveIncluirFotos ? "Fotos incluídas" : "Links das fotos";
    const classePaginaRelatorio = relatorioDiario && deveIncluirFotos ? "pagina modo-compacto" : "pagina";

    const blocosEquipamentos = tagsOrdenadas.map((tag) => {
      const equipamento = equipamentoPorTag.get(normalizar(tag));
      const checklistsDoEquipamento = checklistsRelatorio.filter((c) => normalizar(c.tag) === normalizar(tag));

      const cabecalhoEquipamento = `
        <section class="equipamento">
          <h2>${escaparHTML(tag)}</h2>
          <div class="dados-maquina">
            <div><span>Tipo</span><strong>${escaparHTML(equipamento?.tipo_equipamento || checklistsDoEquipamento[0]?.tipo_equipamento || "Não informado")}</strong></div>
            <div><span>Modelo</span><strong>${escaparHTML(equipamento?.modelo || checklistsDoEquipamento[0]?.modelo || "Não informado")}</strong></div>
            <div><span>Nº série</span><strong>${escaparHTML(equipamento?.numero_serie || checklistsDoEquipamento[0]?.numero_serie || "Não informado")}</strong></div>
            <div><span>Área/local</span><strong>${escaparHTML(equipamento?.area || checklistsDoEquipamento[0]?.area || "Não informado")} ${equipamento?.local_correto ? "- " + escaparHTML(equipamento.local_correto) : ""}</strong></div>
          </div>
      `;

      if (!checklistsDoEquipamento.length) {
        return `${cabecalhoEquipamento}<p class="sem-dados">Nenhum checklist encontrado no período selecionado.</p></section>`;
      }

      const blocosChecklists = checklistsDoEquipamento.map((chk) => {
        const respostas = respostasBanco
          .filter((r) => r.checklist_id === chk.id)
          .sort((a, b) => a.item_numero - b.item_numero);

        const linhas = respostas.map((r) => `
          <tr>
            <td>${r.item_numero}</td>
            <td>${escaparHTML(r.item_descricao)}</td>
            <td class="status ${r.status === "OK" ? "ok" : r.status === "NÃO OK" ? "nok" : "na"}">${escaparHTML(r.status)}</td>
            <td>${escaparHTML(r.observacao || "")}</td>
          </tr>
        `).join("");

        const fotos = [
          chk.foto_evidencia_url ? { titulo: "Foto do equipamento/avaria", url: chk.foto_evidencia_url } : null,
          chk.foto_horimetro_url ? { titulo: "Foto do horímetro", url: chk.foto_horimetro_url } : null,
        ].filter(Boolean) as { titulo: string; url: string }[];

        const blocoFotos = fotos.length ? `
          <div class="fotos">
            <h4>Fotos</h4>
            <div class="fotos-grid">
              ${deveIncluirFotos
                ? fotos.map((f) => `<div class="foto-card"><span>${escaparHTML(f.titulo)}</span><img src="${escaparHTML(f.url)}" /></div>`).join("")
                : fotos.map((f) => `<div class="link-foto"><strong>${escaparHTML(f.titulo)}:</strong> <a href="${escaparHTML(f.url)}">${escaparHTML(f.url)}</a></div>`).join("")
              }
            </div>
          </div>
        ` : "";

        return `
          <article class="checklist">
            <div class="checklist-topo">
              <div><span>Data</span><strong>${formatarDataBR(chk.data_checklist)}</strong></div>
              <div><span>Turno</span><strong>${escaparHTML(chk.turno_nome || nomeTurno((chk.turno_codigo || "T1") as TurnoCodigo))}</strong></div>
              <div><span>Hora</span><strong>${escaparHTML(chk.hora_checklist || "")}</strong></div>
              <div><span>Operador</span><strong>${escaparHTML(chk.operador_nome)}</strong></div>
              <div><span>Resultado</span><strong>${escaparHTML(chk.resultado_final)}</strong></div>
              <div><span>Horímetro</span><strong>${escaparHTML(chk.horimetro || "Não informado")}</strong></div>
            </div>
            ${chk.observacao_geral ? `<p class="observacao"><strong>Observação geral:</strong> ${escaparHTML(chk.observacao_geral)}</p>` : ""}
            <table>
              <thead>
                <tr>
                  <th style="width: 40px;">Item</th>
                  <th>Verificação</th>
                  <th style="width: 80px;">Status</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>${linhas || `<tr><td colspan="4">Sem itens registrados para este checklist.</td></tr>`}</tbody>
            </table>
            ${blocoFotos}
          </article>
        `;
      }).join("");

      return `${cabecalhoEquipamento}${blocosChecklists}</section>`;
    }).join("");

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Relatório de Checklist de Equipamentos</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #111827;
      margin: 0;
      background: #f3f4f6;
      font-size: 12px;
    }

    .pagina {
      width: 210mm;
      max-width: 210mm;
      margin: 0 auto;
      background: #fff;
      min-height: 100vh;
      padding: 9mm;
    }

    .barra-acoes {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-bottom: 10px;
    }

    .barra-acoes button {
      border: none;
      background: #111;
      color: #FFE600;
      font-weight: 800;
      border-radius: 10px;
      padding: 10px 14px;
      cursor: pointer;
    }

    header {
      border: 1px solid #d1d5db;
      border-top: 6px solid #FFE600;
      border-radius: 12px;
      padding: 8px;
      display: grid;
      grid-template-columns: 145px 1fr;
      gap: 12px;
      align-items: center;
      margin-bottom: 8px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    header img {
      max-width: 135px;
      max-height: 52px;
      object-fit: contain;
      background: #000;
      border-radius: 8px;
      padding: 5px;
    }

    h1 {
      margin: 0 0 6px;
      font-size: 18px;
      line-height: 1.15;
    }

    .meta {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5px;
      font-size: 10px;
      color: #374151;
    }

    .meta div,
    .dados-maquina div,
    .checklist-topo div {
      border: 1px solid #d8dee8;
      border-radius: 7px;
      padding: 5px 6px;
      background: #f9fafb;
      min-height: 0;
    }

    span {
      display: block;
      color: #4b5563;
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: .02em;
      margin-bottom: 1px;
    }

    strong {
      color: #111827;
    }

    .equipamento {
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 8px;
      margin: 8px 0;
      break-inside: auto;
      page-break-inside: auto;
    }

    .equipamento h2 {
      margin: 0 0 6px;
      background: #111;
      color: #FFE600;
      padding: 6px 8px;
      border-radius: 8px;
      font-size: 16px;
      line-height: 1.1;
    }

    .dados-maquina {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 5px;
      margin-bottom: 6px;
    }

    .checklist {
      border-top: 1px solid #e5e7eb;
      padding-top: 6px;
      margin-top: 6px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .checklist-topo {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 5px;
      margin-bottom: 6px;
    }

    .observacao {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 7px;
      padding: 5px;
      margin: 4px 0;
      font-size: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      font-size: 10.2px;
      line-height: 1.25;
      table-layout: fixed;
    }

    th {
      background: #111;
      color: #FFE600;
      text-align: left;
      font-size: 9.8px;
    }

    th, td {
      border: 1px solid #bfc7d5;
      padding: 3.5px 4px;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    th:nth-child(1), td:nth-child(1) { width: 28px; text-align: center; }
    th:nth-child(2), td:nth-child(2) { width: auto; }
    th:nth-child(3), td:nth-child(3) { width: 70px; }
    th:nth-child(4), td:nth-child(4) { width: 165px; }

    .status {
      font-weight: 900;
      text-align: center;
      white-space: nowrap;
      font-size: 10.5px;
    }

    .ok {
      color: #166534;
    }

    .nok {
      color: #991b1b;
    }

    .na {
      color: #475569;
    }

    .fotos {
      margin-top: 8px;
      display: grid;
      gap: 6px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .fotos h4 {
      margin: 0;
      font-size: 12px;
    }

    .fotos-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 7px;
    }

    .foto-card {
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 7px;
      min-height: 175px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .foto-card span {
      font-size: 9px;
      color: #374151;
      font-weight: 700;
    }

    .foto-card img {
      display: block;
      margin: 5px auto 0;
      width: 100%;
      height: 245px;
      max-width: 100%;
      object-fit: contain;
      border-radius: 6px;
      border: 1px solid #d1d5db;
    }

    .link-foto {
      word-break: break-all;
      font-size: 9px;
      padding: 5px;
      border: 1px solid #e5e7eb;
      border-radius: 7px;
    }

    .sem-dados {
      color: #6b7280;
    }

    footer {
      margin-top: 6px;
      color: #6b7280;
      font-size: 9px;
      text-align: center;
    }

    .modo-compacto {
      padding: 7mm;
    }

    .modo-compacto header {
      grid-template-columns: 122px 1fr;
      padding: 7px;
      margin-bottom: 7px;
    }

    .modo-compacto header img {
      max-width: 112px;
      max-height: 42px;
      padding: 4px;
    }

    .modo-compacto h1 {
      font-size: 16px;
      margin-bottom: 4px;
    }

    .modo-compacto .meta {
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;
      font-size: 8.6px;
    }

    .modo-compacto .meta div,
    .modo-compacto .dados-maquina div,
    .modo-compacto .checklist-topo div {
      padding: 3px 4px;
      border-radius: 5px;
    }

    .modo-compacto span {
      font-size: 7.5px;
      margin-bottom: 0;
    }

    .modo-compacto .equipamento {
      padding: 6px;
      margin: 6px 0;
      border-radius: 9px;
    }

    .modo-compacto .equipamento h2 {
      font-size: 14px;
      padding: 5px 7px;
      margin-bottom: 5px;
    }

    .modo-compacto .dados-maquina {
      gap: 4px;
      margin-bottom: 5px;
    }

    .modo-compacto .checklist {
      padding-top: 5px;
      margin-top: 5px;
    }

    .modo-compacto .checklist-topo {
      gap: 4px;
      margin-bottom: 5px;
    }

    .modo-compacto table {
      font-size: 9.4px;
      line-height: 1.18;
      margin-top: 4px;
    }

    .modo-compacto th {
      font-size: 9px;
    }

    .modo-compacto th,
    .modo-compacto td {
      padding: 2.5px 3px;
    }

    .modo-compacto th:nth-child(1), .modo-compacto td:nth-child(1) { width: 26px; }
    .modo-compacto th:nth-child(3), .modo-compacto td:nth-child(3) { width: 64px; }
    .modo-compacto th:nth-child(4), .modo-compacto td:nth-child(4) { width: 145px; }

    .modo-compacto .status {
      font-size: 9.8px;
    }

    .modo-compacto .fotos {
      margin-top: 6px;
      gap: 5px;
    }

    .modo-compacto .foto-card {
      padding: 6px;
      min-height: 225px;
    }

    .modo-compacto .foto-card img {
      width: 100%;
      height: 215px;
      max-width: 100%;
      margin-top: 3px;
      object-fit: contain;
    }

    @page {
      size: A4 portrait;
      margin: 6mm;
    }

    @media print {
      html, body {
        width: 210mm;
        background: #fff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .pagina {
        width: 198mm;
        max-width: 198mm;
        min-height: auto;
        margin: 0;
        padding: 0;
      }

      .barra-acoes {
        display: none;
      }

      a {
        color: #111827;
        text-decoration: none;
      }
    }
  </style>
</head>
<body>
  <div class="${classePaginaRelatorio}">
    <div class="barra-acoes"><button onclick="window.print()">Imprimir / salvar em PDF</button></div>
    <header>
      <img src="/logo.png" alt="Logo Baterias Pioneiro" />
      <div>
        <h1>Relatório de Checklist de Equipamentos</h1>
        <div class="meta">
          <div><span>Período</span><strong>${formatarDataBR(relatorioDataInicio)} a ${formatarDataBR(relatorioDataFim)}</strong></div>
          <div><span>Turno</span><strong>${escaparHTML(turnoTexto)}</strong></div>
          <div><span>Fotos</span><strong>${escaparHTML(fotosTexto)}</strong></div>
          <div><span>Equipamentos</span><strong>${escaparHTML(tagsOrdenadas.join(", "))}</strong></div>
          <div><span>Gerado por</span><strong>${escaparHTML(perfilUsuario?.nome || operador || "ADMIN")}</strong></div>
          <div><span>Emissão</span><strong>${escaparHTML(emitidoEm)}</strong></div>
        </div>
      </div>
    </header>
    ${blocosEquipamentos}
    <footer>Relatório gerado pelo sistema de checklist de equipamentos.</footer>
  </div>
</body>
</html>`;

    const janela = window.open("", "_blank");
    if (!janela) return setMensagem("O navegador bloqueou a abertura do relatório. Libere pop-ups para este site.");

    janela.document.open();
    janela.document.write(html);
    janela.document.close();
    janela.focus();
    setMensagem(`Relatório gerado com ${checklistsRelatorio.length} checklist(s). O layout diário com fotos foi compactado para salvar em PDF.`);
  }

  function exportarResumoCSV() {
    const cabecalho = ["DATA", "TURNO", "HORARIO_REFERENCIA", "HORA", "OPERADOR", "TAG", "EQUIPAMENTO", "MODELO", "AREA", "SITUACAO", "RESULTADO", "HORIMETRO", "OBSERVACAO", "FOTO_EVIDENCIA", "FOTO_HORIMETRO"];
    const linhas = checklists.map((r) => [
      r.data_checklist,
      r.turno_nome || nomeTurno((r.turno_codigo || "T1") as TurnoCodigo),
      r.horario_referencia || horarioReferenciaTurno((r.turno_codigo || "T1") as TurnoCodigo),
      r.hora_checklist || "",
      r.operador_nome,
      r.tag,
      r.tipo_equipamento || "",
      r.modelo || "",
      r.area || "",
      r.situacao_equipamento,
      r.resultado_final,
      r.horimetro || "",
      r.observacao_geral || "",
      r.foto_evidencia_url || "",
      r.foto_horimetro_url || "",
    ]);
    const csv = [cabecalho, ...linhas].map((linha) => linha.map((v) => `"${String(v || "").replaceAll('"', '""')}"`).join(";")).join("\n");
    baixarArquivo(`resumo_checklists_${data}.csv`, csv);
  }

  function exportarDetalhadoCSV() {
    const cabecalho = ["DATA", "TURNO", "OPERADOR", "TAG", "MODELO", "AREA", "RESULTADO_FINAL", "ITEM", "STATUS_ITEM", "OBSERVACAO_ITEM"];
    const linhas = checklists.flatMap((c) =>
      respostasBanco
        .filter((r) => r.checklist_id === c.id)
        .map((r) => [c.data_checklist, c.turno_nome || nomeTurno((c.turno_codigo || "T1") as TurnoCodigo), c.operador_nome, c.tag, c.modelo || "", c.area || "", c.resultado_final, r.item_descricao, r.status, r.observacao || ""])
    );
    const csv = [cabecalho, ...linhas].map((linha) => linha.map((v) => `"${String(v || "").replaceAll('"', '""')}"`).join(";")).join("\n");
    baixarArquivo(`checklists_detalhado_${data}.csv`, csv);
  }

  function renderDashboardDetalhe() {
    if (!dashboardDetalhe) return null;

    if (dashboardDetalhe === "OK") {
      return (
        <section style={styles.boxInterno}>
          <div style={styles.botoesLinha}>
            <h3 style={{ ...styles.subtituloSecao, margin: 0 }}>Máquinas OK no período atual</h3>
            <button onClick={() => setDashboardDetalhe("")} style={styles.botaoCinza}>Fechar</button>
          </div>
          <div style={styles.tabelaEquipamentos}>
            {maquinasOkDashboard.map((e) => {
              const chk = checklistsAtualPorTag.get(normalizarTagOS(e.tag));
              return (
                <div key={e.tag} style={isMobile ? styles.linhaEquipamentoMobile : styles.linhaEquipamento}>
                  <div><strong>{e.tag}</strong><br />{e.tipo_equipamento} | {e.area || "Área não informada"}<br /><small>Último do período: {chk ? dataISOParaBR(chk.data_checklist) : "-"} | {nomePeriodicidadeChecklist(periodicidadeChecklistDoEquipamento(e))}</small></div>
                  <button onClick={() => abrirHistoricoEquipamento(e.tag)} style={styles.botaoCinza}>Histórico</button>
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    if (dashboardDetalhe === "AVARIAS") {
      return (
        <section style={styles.boxInternoDestaque}>
          <div style={styles.botoesLinha}>
            <h3 style={{ ...styles.subtituloSecao, margin: 0 }}>Máquinas com avaria</h3>
            <button onClick={() => setDashboardDetalhe("")} style={styles.botaoCinza}>Fechar</button>
          </div>
          {maquinasAvariaDashboard.map((e) => {
            const chk = checklistsAtualPorTag.get(normalizarTagOS(e.tag));
            const problemas = chk?.id ? respostasBanco.filter((r) => r.checklist_id === chk.id && r.status === "NÃO OK") : [];
            return (
              <div key={e.tag} style={styles.alertaItem}>
                <strong>{e.tag} - {e.tipo_equipamento}</strong><br />
                {problemas.map((r) => <div key={`${e.tag}-${r.item_numero}`}>Item {r.item_numero}: {r.item_descricao} — <strong>{r.observacao || "Sem observação"}</strong></div>)}
                {chk && <small>Reportado por {chk.operador_nome} em {dataISOParaBR(chk.data_checklist)}</small>}
                <div style={styles.botoesLinha}><button onClick={() => abrirHistoricoEquipamento(e.tag)} style={styles.botaoCinza}>Ver histórico</button></div>
              </div>
            );
          })}
        </section>
      );
    }

    if (dashboardDetalhe === "PENDENTES") {
      return (
        <section style={styles.boxInternoDestaque}>
          <div style={styles.botoesLinha}>
            <h3 style={{ ...styles.subtituloSecao, margin: 0 }}>Checklists pendentes agora</h3>
            <button onClick={() => setDashboardDetalhe("")} style={styles.botaoCinza}>Fechar</button>
          </div>
          <div style={styles.pendentesGrid}>
            {pendentesChecklistDashboard.map((e) => {
              const ultimo = ultimoChecklistPorTag.get(normalizarTagOS(e.tag));
              return <div key={e.tag} style={styles.pendenteItem}><strong>{e.tag}</strong><br />{e.tipo_equipamento}<br /><small>{e.area || "Área não informada"}</small><br /><span style={styles.badgeAtrasado}>{nomePeriodicidadeChecklist(periodicidadeChecklistDoEquipamento(e))} pendente</span><br /><small>Último: {ultimo ? dataISOParaBR(ultimo.data_checklist) : "Nunca realizado"}</small></div>;
            })}
          </div>
        </section>
      );
    }

    if (dashboardDetalhe === "MANUTENCAO") {
      return (
        <section style={styles.boxInternoDestaque}>
          <div style={styles.botoesLinha}><h3 style={{ ...styles.subtituloSecao, margin: 0 }}>Equipamentos em manutenção</h3><button onClick={() => setDashboardDetalhe("")} style={styles.botaoCinza}>Fechar</button></div>
          {maquinasManutencaoDashboard.map((e) => <div key={e.tag} style={styles.alertaItem}><strong>{e.tag}</strong> — {e.tipo_equipamento}<br />{e.area || "Área não informada"}<div style={styles.botoesLinha}><button onClick={() => abrirHistoricoEquipamento(e.tag)} style={styles.botaoCinza}>Histórico</button></div></div>)}
        </section>
      );
    }

    if (dashboardDetalhe === "PREVENTIVAS") {
      const lista = [...preventivasAtrasadasDashboard, ...preventivasProximasDashboard.filter((p) => !preventivasAtrasadasDashboard.some((a) => a.id === p.id))];
      return (
        <section style={styles.boxInternoDestaque}>
          <div style={styles.botoesLinha}><h3 style={{ ...styles.subtituloSecao, margin: 0 }}>Preventivas que exigem atenção</h3><button onClick={() => setDashboardDetalhe("")} style={styles.botaoCinza}>Fechar</button></div>
          {lista.map((p) => {
            const plano = planosPreventivos.find((x) => x.id === p.plano_id);
            const atrasada = p.status === "ATRASADO" || p.data_programada < hojeDashboard;
            return <div key={p.id} style={styles.alertaItem}><strong>{p.tag} — {p.plano_tipo}</strong><br />Programada: {dataISOParaBR(p.data_programada)} | <span style={atrasada ? styles.badgeAtrasado : styles.badgeAguardando}>{atrasada ? "ATRASADA" : "PRÓXIMA"}</span>{plano && <div style={styles.botoesLinha}><button onClick={() => selecionarPlanoParaOS(plano)} style={styles.botaoPreto}>Registrar execução / OS</button></div>}</div>;
          })}
        </section>
      );
    }

    if (dashboardDetalhe === "NA") {
      return (
        <section style={styles.boxInterno}>
          <div style={styles.botoesLinha}><h3 style={{ ...styles.subtituloSecao, margin: 0 }}>N/A aguardando validação</h3><button onClick={() => setDashboardDetalhe("")} style={styles.botaoCinza}>Fechar</button></div>
          {sugestoesNAPendentes.map((s: any) => <div key={s.key} style={styles.naCard}><strong>{s.modeloLabel}</strong><br />Item {s.itemNumero}: {s.itemDescricao}<br />Ocorrências: {s.totalOcorrencias}</div>)}
          <div style={styles.botoesLinha}><button onClick={() => { setFiltroAdmin("NA_VALIDACAO"); setDashboardDetalhe(""); }} style={styles.botaoPreto}>Abrir validação N/A</button></div>
        </section>
      );
    }

    return null;
  }

  if (!perfilUsuario) {
    return (
      <main style={{ ...styles.main, display: "grid", placeItems: "center" }}>
        <div style={styles.loginBox}>
          <div style={styles.loginMarca}>
            <img src="/logo.png" alt="Logo Baterias Pioneiro" style={styles.logoLogin} onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div>
              <h1 style={{ margin: 0 }}>Checklist Diário</h1>
              <p>
                {telaLogin === "ENTRAR" && "Entre com usuário e senha."}
                {telaLogin === "CRIAR" && "Crie sua conta de operador."}

              </p>
            </div>
          </div>

          {telaLogin === "ENTRAR" && (
            <>
              <Campo label="Usuário">
                <input value={loginUsuario} onChange={(e) => setLoginUsuario(e.target.value)} placeholder="Ex.: eduardo.m" style={styles.input} />
              </Campo>
              <Campo label="Senha">
                <input value={loginSenha} onChange={(e) => setLoginSenha(e.target.value)} type="password" placeholder="Digite sua senha" style={styles.input} onKeyDown={(e) => { if (e.key === "Enter") entrarNoPerfil(); }} />
              </Campo>
              <button onClick={entrarNoPerfil} style={styles.botaoPreto}>Entrar</button>
              <div style={styles.botoesLinha}>
                <button onClick={() => { setTelaLogin("CRIAR"); setMensagem(""); }} style={styles.botaoCinza}>Criar conta</button>

              </div>
            </>
          )}

          {telaLogin === "CRIAR" && (
            <>
              <Campo label="Nome completo">
                <input value={cadNome} onChange={(e) => setCadNome(e.target.value)} placeholder="Nome completo" style={styles.input} />
              </Campo>
              <Campo label="Usuário">
                <input value={cadUsuario} onChange={(e) => setCadUsuario(normalizarUsuario(e.target.value))} placeholder="Ex.: eduardo.m" style={styles.input} />
              </Campo>
              <Campo label="Senha">
                <input value={cadSenha} onChange={(e) => setCadSenha(e.target.value)} type="password" placeholder="Mínimo 6 caracteres" style={styles.input} />
              </Campo>
              <Campo label="Confirmar senha">
                <input value={cadSenha2} onChange={(e) => setCadSenha2(e.target.value)} type="password" placeholder="Repita a senha" style={styles.input} />
              </Campo>
              <button onClick={criarConta} style={styles.botaoPreto}>Criar conta como operador</button>
              <div style={styles.botoesLinha}>
                <button onClick={() => { setTelaLogin("ENTRAR"); setMensagem(""); }} style={styles.botaoCinza}>Voltar para login</button>
              </div>
            </>
          )}

          <div style={styles.loginDica}>
            Use somente o usuário curto, por exemplo: eduardo ou eduardo.m.
          </div>
          {carregando && <p style={styles.msg}>Carregando...</p>}
          {mensagem && <p style={mensagem.includes("Erro") ? styles.msgErro : styles.msg}>{mensagem}</p>}
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <section style={isMobile ? styles.headerMobile : styles.header}>
          <div style={styles.brandArea}>
            <img src="/logo.png" alt="Logo Baterias Pioneiro" style={styles.logo} onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div>
              <div style={styles.empresaNome}>Baterias Pioneiro</div>
              <h1 style={styles.titulo}>Checklist e Gestão da Frota Interna</h1>
              <p style={styles.subtitulo}>Usuário: {perfilUsuario.usuario} | Perfil: {perfil}</p>
            </div>
          </div>
          <div style={styles.perfilBox}>
            <button onClick={() => carregarDados()} style={styles.perfilBotao}>Atualizar</button>
            <button onClick={sair} style={styles.perfilBotao}>Sair</button>
          </div>
        </section>

        {carregando && <div style={styles.aviso}>Carregando/salvando dados...</div>}
        {mensagem && <div style={mensagem.includes("Erro") ? styles.avisoErro : styles.aviso}>{mensagem}</div>}

        {perfil === "OPERADOR" && (
          <>
            <section style={isMobile ? styles.kpiGridMobile : styles.kpiGrid}>
              <Card titulo="Obrigatórios" valor={equipamentosObrigatorios.length} />
              <Card titulo="Concluídos no período" valor={concluidosHoje} />
              <Card titulo="Pendentes no período" valor={pendentesHoje.length} />
              <Card titulo="Com avaria" valor={comAvariaHoje.length} destaque={comAvariaHoje.length > 0} />
            </section>

            <section style={styles.box}>
              <h2 style={styles.boxTitulo}>Filtros</h2>
              <div style={isMobile ? styles.gridMobile : styles.grid4}>
                <Campo label="Nome completo">
                  <input value={operador} onChange={(e) => setOperador(e.target.value)} placeholder="Nome completo" style={styles.input} />
                </Campo>
                <Campo label="Módulo">
                  <select value={moduloSelecionado} onChange={(e) => setModuloSelecionado(e.target.value as ModuloEquipamento)} style={styles.input}>
                    <option value="FROTA">Frota</option>
                    <option value="MONOVIA">Monovia / Talha</option>
                    <option value="TODOS">Todos</option>
                  </select>
                </Campo>
                <Campo label="Data de referência">
                  <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={styles.input} />
                </Campo>
                <Campo label="Área">
                  <select value={area} onChange={(e) => setArea(e.target.value)} style={styles.input}>
                    {areas.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </Campo>
                <Campo label="Buscar">
                  <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="TAG, modelo, local..." style={styles.input} />
                </Campo>
              </div>
            </section>
          </>
        )}

        {perfil === "OPERADOR" && telaOperador === "LISTA" && (
          <section style={styles.box}>
            <h2 style={styles.boxTitulo}>Selecionar equipamento</h2>
            <div style={isMobile ? styles.listaEquipamentosMobile : styles.listaEquipamentos}>
              {equipamentosFiltrados.map((e) => {
                const feito = tagsFeitasTurno.has(normalizar(e.tag));
                return (
                  <button key={e.tag} onClick={() => selecionarEquipamento(e.tag)} style={styles.cardSelecao}>
                    <strong style={styles.tagMini}>{e.tag}</strong>
                    <span>{e.tipo_equipamento}</span>
                    <small>Módulo: {nomeModulo(moduloDoEquipamento(e))}</small>
                    <small>Modelo: {e.modelo || "Não informado"}</small>
                    <small>{e.area || "LOCAL A DEFINIR"}</small>
                    {e.status_operacional === "EM_MANUTENCAO" && <span style={styles.badgeAtrasado}>Em manutenção</span>}
                    {tagsComAlertaCmms.has(normalizarTagOS(e.tag)) && <span style={styles.badgeAtrasado}>Manutenção pendente</span>}
                    {tagsComAgendaManutencao.has(normalizarTagOS(e.tag)) && <span style={styles.badgeAguardando}>Manutenção programada</span>}
                    <span style={styles.badgeAguardando}>{nomePeriodicidadeChecklist(periodicidadeChecklistDoEquipamento(e))}</span>
                    {e.checklist_obrigatorio === false && <span style={styles.badgeOpcional}>Não obrigatório</span>}
                    {feito && <span style={styles.badgeConcluido}>Feito no período</span>}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {perfil === "OPERADOR" && telaOperador === "CHECKLIST" && equipamentoSelecionado && (
          <section style={styles.boxTela}>
            <div style={styles.topoChecklist}>
              <button onClick={() => setTelaOperador("LISTA")} style={styles.botaoCinza}>Voltar</button>
              <div>
                <h2 style={{ margin: 0 }}>Checklist - {equipamentoSelecionado.tag}</h2>
                <p style={{ marginTop: 6, color: "#475569" }}>
                  {descricaoPeriodoChecklist(equipamentoSelecionado, data)} | Fotos no Storage e dados no banco.
                </p>
              </div>
            </div>

            <div style={isMobile ? styles.infoEquipamentoGridMobile : styles.infoEquipamentoGrid}>
              <Info label="TAG" valor={equipamentoSelecionado.tag} destaque />
              <Info label="Tipo" valor={equipamentoSelecionado.tipo_equipamento || "Não informado"} />
              <Info label="Módulo" valor={nomeModulo(moduloDoEquipamento(equipamentoSelecionado))} />
              <Info label="Modelo" valor={equipamentoSelecionado.modelo || "Não informado"} />
              <Info label="Série" valor={equipamentoSelecionado.numero_serie || "Não informado"} />
              <Info label="Local" valor={equipamentoSelecionado.local_correto || "LOCAL A DEFINIR"} destaque />
              <Info label="Área" valor={equipamentoSelecionado.area || "LOCAL A DEFINIR"} destaque />
            </div>

            {alertasManutencaoSelecionado.length > 0 && (
              <section style={styles.alertaManutencaoBox}>
                <h3 style={styles.subtituloSecao}>Alerta de manutenção</h3>
                <p style={styles.textoApoio}>Existe ordem de manutenção aberta ou pendente importada do CMMS para este equipamento.</p>
                {alertasManutencaoSelecionado.map(({ os, alerta }) => (
                  <div key={`${os.num_os}-${os.tag}`} style={styles.alertaItem}>
                    <strong>{alerta.titulo} - OS {os.num_os}</strong><br />
                    {alerta.mensagem}<br />
                    Tipo: {os.tipo_manut || "Não informado"} | Status: {os.status || "Não informado"}<br />
                    Data programada: {os.dt_progr || "Não informada"}<br />
                    Descrição: {os.descricao || os.desc_codigo_parada || "Sem descrição"}
                  </div>
                ))}
                <label style={styles.checkLabel}>
                  <input type="checkbox" checked={confirmacaoAlertaManutencao} onChange={(e) => setConfirmacaoAlertaManutencao(e.target.checked)} />
                  Estou ciente do alerta de manutenção deste equipamento.
                </label>
              </section>
            )}

            {alertasAgendaSelecionado.length > 0 && (
              <section style={styles.alertaManutencaoBox}>
                <h3 style={styles.subtituloSecao}>Calendário de manutenção</h3>
                <p style={styles.textoApoio}>Existe manutenção programada no calendário interno para este equipamento.</p>
                {alertasAgendaSelecionado.map(({ agenda, alerta }) => (
                  <div key={`${agenda.id || agenda.tag}-${agenda.data_programada}`} style={styles.alertaItem}>
                    <strong>{alerta.titulo}</strong><br />
                    {alerta.mensagem}<br />
                    Data programada: {dataISOParaBR(agenda.data_programada)}<br />
                    Descrição: {agenda.descricao || "Sem observação"}
                  </div>
                ))}
                <label style={styles.checkLabel}>
                  <input type="checkbox" checked={confirmacaoAlertaManutencao} onChange={(e) => setConfirmacaoAlertaManutencao(e.target.checked)} />
                  Estou ciente do alerta de manutenção deste equipamento.
                </label>
              </section>
            )}

            <section style={styles.boxInternoDestaque}>
              <h3 style={styles.subtituloSecao}>Situação do equipamento</h3>
              <Campo label="Situação">
                <select value={situacaoEquipamento} onChange={(e) => setSituacaoEquipamento(e.target.value)} style={styles.input}>
                  <option>EM OPERAÇÃO</option>
                  <option>PARADO NA ÁREA</option>
                  <option>NÃO LOCALIZADO</option>
                  <option>EM MANUTENÇÃO</option>
                  <option>EMPRESTADO PARA OUTRA ÁREA</option>
                </select>
              </Campo>
            </section>

            <div style={styles.confirmacaoBox}>
              <label style={styles.checkLabel}>
                <input type="checkbox" checked={avariaImpedeUso} onChange={(e) => setAvariaImpedeUso(e.target.checked)} />
                A avaria impede o funcionamento completo da máquina
              </label>
              {avariaImpedeUso && <p style={styles.textoApoio}>Orientação: abrir OS e encaminhar a máquina ao setor de manutenção.</p>}
            </div>

            {(situacaoEquipamento === "EM MANUTENÇÃO" || avariaImpedeUso) && (
              <section style={styles.boxInternoDestaque}>
                <h3 style={styles.subtituloSecao}>Abertura de OS / máquina parada</h3>
                <div style={isMobile ? styles.gridMobile : styles.grid2}>
                  <Campo label="Número da OS">
                    <input value={numeroOS} onChange={(e) => setNumeroOS(e.target.value)} placeholder="Ex.: OS 12345" style={styles.input} />
                  </Campo>
                  <label style={styles.checkLabel}>
                    <input type="checkbox" checked={afetaOperacao} onChange={(e) => setAfetaOperacao(e.target.checked)} />
                    Afeta completamente a operação e precisa avaliar equipamento reserva
                  </label>
                </div>
              </section>
            )}

            <div style={styles.checklistLista}>
              {respostas.map((r) => (
                <div key={r.item_numero} style={isMobile ? styles.itemChecklistMobile : styles.itemChecklist}>
                  <div>
                    <strong>{r.item_numero}. {r.item_descricao}</strong>
                    {(r.status === "NÃO OK" || r.status === "N/A") && (
                      <textarea
                        value={r.observacao}
                        onChange={(e) => alterarObservacaoItem(r.item_numero, e.target.value)}
                        placeholder={r.status === "N/A" ? "Explique por que é N/A. Irá para validação do Admin." : "Descreva a avaria."}
                        style={styles.textarea}
                      />
                    )}
                  </div>
                  <div style={isMobile ? styles.statusBotoesMobile : styles.statusBotoes}>
                    <button onClick={() => alterarStatusItem(r.item_numero, "OK")} style={r.status === "OK" ? styles.okAtivo : styles.statusBotao}>OK</button>
                    <button onClick={() => alterarStatusItem(r.item_numero, "NÃO OK")} style={r.status === "NÃO OK" ? styles.naoOkAtivo : styles.statusBotao}>Não OK</button>
                    <button onClick={() => alterarStatusItem(r.item_numero, "N/A")} style={r.status === "N/A" ? styles.naAtivo : styles.statusBotao}>N/A</button>
                  </div>
                </div>
              ))}
            </div>

            <section style={styles.boxInterno}>
              <h3 style={styles.subtituloSecao}>Fotos</h3>
              <p style={styles.textoApoio}>Toque no campo de foto para abrir a câmera do celular/tablet. A foto será reduzida automaticamente antes do envio.</p>
              <div style={isMobile ? styles.gridMobile : styles.grid2}>
                <Campo label="Tirar foto do equipamento/avaria">
                  <input type="file" accept="image/*" capture="environment" onChange={(e) => carregarFoto(e, "EVIDENCIA")} style={styles.input} />
                </Campo>
                {fotoEvidencia && <PreviewImagem titulo="Prévia evidência" src={fotoEvidencia} onRemover={() => setFotoEvidencia("")} />}
              </div>
            </section>

            {ehEquipamentoEletrico(equipamentoSelecionado) && (
              <section style={styles.boxInternoDestaque}>
                <h3 style={styles.subtituloSecao}>Horímetro - somente elétricos</h3>
                <div style={isMobile ? styles.gridMobile : styles.grid2}>
                  <Campo label="Leitura / descrição do horímetro">
                    <input value={horimetroLeitura} onChange={(e) => setHorimetroLeitura(e.target.value)} placeholder="Ex.: 1245,6 h - painel normal" style={styles.input} />
                  </Campo>
                  <Campo label="Tirar foto do horímetro">
                    <input type="file" accept="image/*" capture="environment" onChange={(e) => carregarFoto(e, "HORIMETRO")} style={styles.input} />
                  </Campo>
                </div>
                {fotoHorimetro && <PreviewImagem titulo="Prévia horímetro" src={fotoHorimetro} onRemover={() => setFotoHorimetro("")} />}
              </section>
            )}

            <Campo label="Observação geral">
              <textarea value={observacaoGeral} onChange={(e) => setObservacaoGeral(e.target.value)} style={styles.textarea} placeholder="Opcional" />
            </Campo>

            <div style={styles.confirmacaoBox}>
              <label style={styles.checkLabel}>
                <input type="checkbox" checked={confirmacaoOperador} onChange={(e) => setConfirmacaoOperador(e.target.checked)} />
                Confirmo que realizei o checklist visual e funcional deste equipamento antes do uso.
              </label>
            </div>

            {errosChecklist.length > 0 && (
              <section style={styles.erroChecklistBox}>
                <strong>Não foi possível salvar. Corrija os itens abaixo:</strong>
                <ul style={styles.erroChecklistLista}>
                  {errosChecklist.map((erro, i) => (
                    <li key={`${erro}-${i}`}>{erro}</li>
                  ))}
                </ul>
              </section>
            )}

            <div style={styles.botoesLinha}>
              <button onClick={finalizarChecklist} style={styles.botaoPreto}>Finalizar e salvar</button>
            </div>
          </section>
        )}

        {isAdmin && (
          <>
            <section style={styles.box}>
              <div style={isMobile ? styles.headerAdminMobile : styles.headerAdminLinha}>
                <div>
                  <div style={styles.empresaNome}>Área exclusiva ADMIN</div>
                  <h2 style={{ ...styles.boxTitulo, marginBottom: 4 }}>Gestão da Frota Interna</h2>
                  <p style={styles.textoApoio}>Dashboard, checklists, plano mestre, mapa de 52 semanas e histórico em páginas separadas.</p>
                </div>
                <div style={styles.botoesLinha}>
                  <button onClick={exportarResumoCSV} style={styles.botaoPreto}>Exportar resumo CSV</button>
                  <button onClick={exportarDetalhadoCSV} style={styles.botaoCinza}>Exportar detalhado CSV</button>
                </div>
              </div>

              <div style={styles.adminMenuGrid}>
                {([
                  ["DASHBOARD", "Dashboard"],
                  ["HOJE", "Feito hoje"],
                  ["PLANO_MESTRE", "Plano Mestre"],
                  ["MAPA_52", "Mapa 52 Semanas"],
                  ["OS_MANUAL", "OS / Execuções"],
                  ["EQUIPAMENTOS", "Equipamentos"],
                  ["HISTORICO", "Histórico"],
                  ["NA_VALIDACAO", "N/A - Validação"],
                  ["CHECKLIST", "Itens checklist"],
                  ["RETIRAR_MODELO", "Retirar por modelo"],
                  ["USUARIOS", "Usuários"],
                  ["PARADAS", "Paradas / Reserva"],
                  ["RELATORIOS", "Relatórios"],
                  ["CMMS", "CMMS"],
                ] as const).map(([id, label]) => (
                  <button key={id} onClick={() => { setFiltroAdmin(id); setDashboardDetalhe(""); }} style={filtroAdmin === id ? styles.adminMenuAtivo : styles.adminMenuBotao}>{label}</button>
                ))}
              </div>
            </section>

            {filtroAdmin === "DASHBOARD" && (
              <>
                <section style={styles.box}>
                  <div style={styles.dashboardTituloLinha}>
                    <div>
                      <h2 style={styles.boxTitulo}>Visão geral</h2>
                      <p style={styles.textoApoio}>Situação atual calculada automaticamente a partir dos checklists, avarias e plano de manutenção.</p>
                    </div>
                    <button onClick={() => carregarDados()} style={styles.botaoCinza}>Atualizar agora</button>
                  </div>

                  <div style={isMobile ? styles.dashboardKpiGridMobile : styles.dashboardKpiGrid}>
                    <DashboardCard titulo="Máquinas OK" valor={maquinasOkDashboard.length} subtitulo="Checklist do período conforme" cor="VERDE" onClick={() => setDashboardDetalhe("OK")} />
                    <DashboardCard titulo="Com avaria" valor={maquinasAvariaDashboard.length} subtitulo="Último checklist do período" cor="AMARELO" onClick={() => setDashboardDetalhe("AVARIAS")} />
                    <DashboardCard titulo="Em manutenção" valor={maquinasManutencaoDashboard.length} subtitulo="Paradas / indisponíveis" cor="VERMELHO" onClick={() => setDashboardDetalhe("MANUTENCAO")} />
                    <DashboardCard titulo="Checklist pendente" valor={pendentesChecklistDashboard.length} subtitulo="Exato pela periodicidade de cada TAG" cor={pendentesChecklistDashboard.length ? "VERMELHO" : "VERDE"} onClick={() => setDashboardDetalhe("PENDENTES")} />
                    <DashboardCard titulo="Preventivas atrasadas" valor={preventivasAtrasadasDashboard.length} subtitulo="Mapa / plano mestre" cor={preventivasAtrasadasDashboard.length ? "VERMELHO" : "VERDE"} onClick={() => setDashboardDetalhe("PREVENTIVAS")} />
                    <DashboardCard titulo="Próximos 7 dias" valor={preventivasProximasDashboard.length} subtitulo="Manutenções programadas" cor="AZUL" onClick={() => setDashboardDetalhe("PREVENTIVAS")} />
                    <DashboardCard titulo="N/A para validar" valor={sugestoesNAPendentes.length} subtitulo="Aguardando decisão do ADMIN" cor={sugestoesNAPendentes.length ? "AMARELO" : "VERDE"} onClick={() => setDashboardDetalhe("NA")} />
                    <DashboardCard titulo="Preventivas hoje" valor={preventivasExecutadasHoje.length} subtitulo="Execuções registradas" cor="PRETO" onClick={() => setFiltroAdmin("OS_MANUAL")} />
                  </div>

                  {renderDashboardDetalhe()}
                </section>

                <div style={isMobile ? styles.gridMobile : styles.dashboardDuasColunas}>
                  <section style={styles.box}>
                    <h2 style={styles.boxTitulo}>Atenção agora</h2>
                    <p style={styles.textoApoio}>Problemas que continuam abertos no último registro do mesmo item.</p>
                    {defeitosAbertosDashboard.length === 0 && <div style={styles.estadoVazio}>Nenhum defeito persistente identificado.</div>}
                    {defeitosAbertosDashboard.slice(0, 8).map((d) => (
                      <div key={`${d.tag}-${d.itemNumero}`} style={d.dias >= 7 ? styles.problemaPersistente : styles.alertaItem}>
                        <div style={styles.problemaCabecalho}>
                          <strong>{d.tag} — Item {d.itemNumero}</strong>
                          <span style={d.dias >= 14 ? styles.badgeAtrasado : styles.badgeAguardando}>{textoTempoAberto(d.dias)}</span>
                        </div>
                        <div>{d.itemDescricao}</div>
                        <div style={{ marginTop: 5 }}><strong>Observação:</strong> {d.observacao}</div>
                        <small>{d.operador} reportou novamente em {dataISOParaBR(d.ultimo)}</small>
                        <div style={styles.botoesLinha}><button onClick={() => abrirHistoricoEquipamento(d.tag)} style={styles.botaoCinza}>Histórico do equipamento</button></div>
                      </div>
                    ))}
                  </section>

                  <section style={styles.box}>
                    <h2 style={styles.boxTitulo}>Feito hoje</h2>
                    <p style={styles.textoApoio}>Resumo simples dos checklists registrados em {dataISOParaBR(hojeDashboard)}.</p>
                    <div style={styles.numeroDestaque}>{checklistsFeitosHojeDashboard.length}</div>
                    {checklistsFeitosHojeDashboard.length === 0 && <div style={styles.estadoVazio}>Nenhum checklist registrado hoje.</div>}
                    {checklistsFeitosHojeDashboard.slice(0, 10).map((c) => (
                      <button key={c.id || `${c.tag}-${c.hora_checklist}`} onClick={() => abrirHistoricoEquipamento(c.tag)} style={styles.linhaHojeBotao}>
                        <div><strong>{c.tag}</strong><br /><small>{c.operador_nome} | {c.hora_checklist || "Sem horário"}</small></div>
                        <span style={c.resultado_final === "CONFORME" ? styles.badgeConcluido : styles.badgeAtrasado}>{c.resultado_final}</span>
                      </button>
                    ))}
                    {checklistsFeitosHojeDashboard.length > 10 && <button onClick={() => setFiltroAdmin("HOJE")} style={styles.botaoCinza}>Ver todos de hoje</button>}
                  </section>
                </div>

                <div style={isMobile ? styles.gridMobile : styles.dashboardTresColunas}>
                  <section style={styles.box}>
                    <h3 style={styles.subtituloSecao}>Situação do período</h3>
                    <BarraDashboard label="OK" valor={maquinasOkDashboard.length} total={Math.max(1, equipamentosObrigatoriosDashboard.length)} tipo="VERDE" />
                    <BarraDashboard label="Avaria" valor={maquinasAvariaDashboard.length} total={Math.max(1, equipamentosObrigatoriosDashboard.length)} tipo="AMARELO" />
                    <BarraDashboard label="Pendente" valor={pendentesChecklistDashboard.length} total={Math.max(1, equipamentosObrigatoriosDashboard.length)} tipo="VERMELHO" />
                    <BarraDashboard label="Manutenção" valor={maquinasManutencaoDashboard.length} total={Math.max(1, equipamentosAtivosDashboard.length)} tipo="PRETO" />
                  </section>

                  <section style={styles.box}>
                    <h3 style={styles.subtituloSecao}>Checklists - últimos 7 dias</h3>
                    <div style={styles.miniGraficoColunas}>
                      {checklistsUltimos7Dias.map((d) => {
                        const max = Math.max(1, ...checklistsUltimos7Dias.map((x) => x.total));
                        return <div key={d.data} style={styles.miniGraficoItem}><div style={styles.miniGraficoValor}>{d.total}</div><div style={{ ...styles.miniGraficoBarra, height: `${Math.max(5, (d.total / max) * 90)}px` }} /><small>{d.data.slice(8, 10)}/{d.data.slice(5, 7)}</small></div>;
                      })}
                    </div>
                  </section>

                  <section style={styles.box}>
                    <h3 style={styles.subtituloSecao}>Carga preventiva - 8 semanas</h3>
                    <div style={styles.miniGraficoColunas}>
                      {cargaPreventiva8Semanas.map((w) => {
                        const max = Math.max(1, ...cargaPreventiva8Semanas.map((x) => x.total));
                        return <div key={`${w.ano}-${w.semana}`} style={styles.miniGraficoItem}><div style={styles.miniGraficoValor}>{w.total}</div><div style={{ ...styles.miniGraficoBarraAmarela, height: `${Math.max(5, (w.total / max) * 90)}px` }} /><small>{w.label}</small></div>;
                      })}
                    </div>
                  </section>
                </div>
              </>
            )}

            {filtroAdmin === "HOJE" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Checklists realizados hoje</h2>
                <div style={isMobile ? styles.kpiGridMobile : styles.kpiGrid}>
                  <Card titulo="Realizados" valor={checklistsFeitosHojeDashboard.length} />
                  <Card titulo="Conformes" valor={checklistsFeitosHojeDashboard.filter((c) => c.resultado_final === "CONFORME").length} />
                  <Card titulo="Com avaria" valor={checklistsFeitosHojeDashboard.filter((c) => c.resultado_final === "COM AVARIA").length} destaque />
                  <Card titulo="Pendentes agora" valor={pendentesChecklistDashboard.length} destaque={pendentesChecklistDashboard.length > 0} />
                </div>
                <div style={styles.tabelaEquipamentos}>
                  {checklistsFeitosHojeDashboard.map((c) => (
                    <div key={c.id || `${c.tag}-${c.hora_checklist}`} style={isMobile ? styles.linhaEquipamentoMobile : styles.linhaEquipamento}>
                      <div><strong>{c.tag}</strong><br />{c.tipo_equipamento} | {c.area}<br /><small>{c.operador_nome} | {c.hora_checklist || "Sem horário"} | {c.turno_nome || "Checklist"}</small></div>
                      <div style={styles.botoesLinha}><span style={c.resultado_final === "CONFORME" ? styles.badgeConcluido : styles.badgeAtrasado}>{c.resultado_final}</span><button onClick={() => abrirHistoricoEquipamento(c.tag)} style={styles.botaoCinza}>Histórico</button></div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {filtroAdmin === "PLANO_MESTRE" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Plano Mestre de Manutenção</h2>
                <p style={styles.textoApoio}>Carregado a partir do Plano de Preventivas da Frota Interna. Cada TAG possui seus níveis de manutenção e as atividades correspondentes.</p>
                <div style={isMobile ? styles.gridMobile : styles.grid4}>
                  <Card titulo="Planos ativos" valor={planosPreventivos.length} />
                  <Card titulo="Com vínculo no cadastro" valor={planosPreventivos.filter((p) => p.equipamento_id).length} />
                  <Card titulo="Sem vínculo" valor={planosPreventivos.filter((p) => !p.equipamento_id).length} destaque={planosPreventivos.some((p) => !p.equipamento_id)} />
                  <Card titulo="Atividades cadastradas" valor={itensPlanoPreventivo.filter((i) => i.plano_tipo !== "MATERIAL").length} />
                </div>
                <div style={isMobile ? styles.gridMobile : styles.grid2}>
                  <Campo label="Buscar TAG / modelo / plano"><input value={planoBusca} onChange={(e) => setPlanoBusca(e.target.value)} placeholder="Ex.: ERR4, ES15W, mensal..." style={styles.input} /></Campo>
                  <Campo label="Tipo de plano"><select value={planoTipoFiltro} onChange={(e) => setPlanoTipoFiltro(e.target.value)} style={styles.input}><option value="TODOS">Todos</option><option value="QUINZENAL">Quinzenal</option><option value="MENSAL">Mensal</option><option value="TRIMESTRAL">Trimestral</option><option value="SEMESTRAL">Semestral</option></select></Campo>
                </div>
                <div style={styles.tabelaEquipamentos}>
                  {planosFiltradosAdmin.slice(0, 400).map((plano) => {
                    const abertas = programacoesPreventivas.filter((p) => p.plano_id === plano.id && (p.status === "PROGRAMADO" || p.status === "ATRASADO")).sort((a, b) => a.data_programada.localeCompare(b.data_programada));
                    const prox = abertas[0];
                    const expandido = planoExpandidoId === plano.id;
                    const operacoes = itensPlanoPreventivo.filter((i) => i.modelo_plano === plano.modelo_plano && i.checklist === plano.checklist_referencia);
                    const materiais = itensPlanoPreventivo.filter((i) => i.modelo_plano === plano.modelo_plano && i.plano_tipo === "MATERIAL");
                    return (
                      <div key={plano.id || `${plano.tag}-${plano.plano_tipo}`} style={styles.planoCard}>
                        <div style={styles.planoCabecalho}>
                          <div>
                            <strong style={styles.tagMini}>{plano.tag}</strong> <span style={styles.badgeAguardando}>{plano.plano_tipo}</span><br />
                            <strong>{plano.modelo_plano}</strong><br />
                            <small>{plano.checklist_referencia || "Plano sem referência"}</small><br />
                            <small>Última execução: {plano.ultima_execucao ? dataISOParaBR(plano.ultima_execucao) : "Não registrada"} | Próxima: {prox ? dataISOParaBR(prox.data_programada) : plano.proxima_data ? dataISOParaBR(plano.proxima_data) : "Sem programação"}</small><br />
                            {!plano.equipamento_id && <span style={styles.badgeAtrasado}>Sem vínculo com cadastro de equipamentos</span>}
                          </div>
                          <div style={styles.botoesLinha}>
                            <button onClick={() => setPlanoExpandidoId(expandido ? "" : (plano.id || ""))} style={styles.botaoCinza}>{expandido ? "Ocultar atividades" : `Ver atividades (${operacoes.length})`}</button>
                            <button onClick={() => selecionarPlanoParaOS(plano)} style={styles.botaoPreto}>Registrar OS / execução</button>
                          </div>
                        </div>
                        <div style={styles.regraRecalculoLinha}>
                          <small>Próxima manutenção calculada a partir de:</small>
                          <select value={plano.base_recalculo} onChange={(e) => atualizarBaseRecalculoPlano(plano, e.target.value as "EXECUCAO" | "PROGRAMADO")} style={styles.inputCompacto}>
                            <option value="EXECUCAO">Data realmente executada</option>
                            <option value="PROGRAMADO">Data originalmente programada</option>
                          </select>
                        </div>
                        {expandido && (
                          <div style={styles.planoDetalhes}>
                            <h4>Atividades da manutenção</h4>
                            <div style={{ overflowX: "auto" }}><table style={styles.tabela}><thead><tr><th style={styles.th}>Sistema</th><th style={styles.th}>Operação</th><th style={styles.th}>Troca</th></tr></thead><tbody>{operacoes.map((i) => <tr key={i.id}><td style={styles.td}>{i.sistema}</td><td style={styles.td}>{i.operacao}</td><td style={styles.td}>{i.troca || ""}</td></tr>)}</tbody></table></div>
                            {materiais.length > 0 && <><h4>Materiais previstos para o modelo</h4><ul>{materiais.map((m) => <li key={m.id}>{m.operacao}{m.qtde ? ` — ${m.qtde} ${m.um || ""}` : ""}</li>)}</ul></>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {filtroAdmin === "MAPA_52" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Mapa de 52 Semanas</h2>
                <p style={styles.textoApoio}>P = Programado | E = Executado | A = Atrasado. O mapa é recalculado quando uma execução é registrada.</p>
                <div style={isMobile ? styles.gridMobile : styles.grid2}>
                  <Campo label="Ano"><input type="number" min="2025" max="2035" value={mapaAno} onChange={(e) => setMapaAno(Number(e.target.value) || Number(hojeISO().slice(0, 4)))} style={styles.input} /></Campo>
                  <Campo label="Buscar equipamento"><input value={mapaBusca} onChange={(e) => setMapaBusca(e.target.value)} placeholder="TAG, modelo ou plano" style={styles.input} /></Campo>
                </div>
                <div style={styles.legendaMapa}><span style={styles.mapaProgramado}>P</span> Programado <span style={styles.mapaExecutado}>E</span> Executado <span style={styles.mapaAtrasado}>A</span> Atrasado</div>
                <div style={styles.mapaScroll}>
                  <table style={styles.mapaTabela}>
                    <thead><tr><th style={styles.mapaCabecalhoFixo}>Equipamento / plano</th>{Array.from({ length: semanasNoAnoISO(mapaAno) }, (_, i) => i + 1).map((sem) => <th key={sem} style={styles.mapaTh}>S{String(sem).padStart(2, "0")}</th>)}</tr></thead>
                    <tbody>
                      {mapaPlanosFiltrados.map((plano) => (
                        <tr key={plano.id || `${plano.tag}-${plano.plano_tipo}`}>
                          <td style={styles.mapaTdFixo}><strong>{plano.tag}</strong><br /><small>{plano.modelo_plano} — {plano.plano_tipo}</small></td>
                          {Array.from({ length: semanasNoAnoISO(mapaAno) }, (_, i) => i + 1).map((sem) => {
                            const prog = plano.id ? programacaoPorPlanoSemana.get(`${plano.id}|${mapaAno}|${sem}`) : undefined;
                            if (!prog) return <td key={sem} style={styles.mapaTd}></td>;
                            const atrasado = (prog.status === "ATRASADO" || (prog.status === "PROGRAMADO" && prog.data_programada < hojeDashboard));
                            const letra = prog.status === "EXECUTADO" ? "E" : prog.status === "CANCELADO" ? "C" : atrasado ? "A" : "P";
                            const estilo = prog.status === "EXECUTADO" ? styles.mapaExecutado : atrasado ? styles.mapaAtrasado : prog.status === "CANCELADO" ? styles.mapaCancelado : styles.mapaProgramado;
                            return <td key={sem} style={styles.mapaTd}><button title={`${plano.tag} - ${plano.plano_tipo} - ${dataISOParaBR(prog.data_programada)}`} onClick={() => prog.status !== "EXECUTADO" && selecionarPlanoParaOS(plano)} style={estilo}>{letra}</button></td>;
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {filtroAdmin === "OS_MANUAL" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Registro manual de OS / execução preventiva</h2>
                <p style={styles.textoApoio}>Enquanto não houver integração com o CMMS, informe a OS aqui. Ao salvar, a próxima manutenção e o mapa são recalculados automaticamente.</p>
                <div style={isMobile ? styles.gridMobile : styles.grid4}>
                  <Campo label="Plano / equipamento"><select value={osPlanoId} onChange={(e) => setOsPlanoId(e.target.value)} style={styles.input}><option value="">Selecione</option>{planosPreventivos.map((p) => <option key={p.id} value={p.id}>{p.tag} — {p.plano_tipo} — {p.modelo_plano}</option>)}</select></Campo>
                  <Campo label="Número da OS"><input value={osNumero} onChange={(e) => setOsNumero(e.target.value)} placeholder="Ex.: 245321" style={styles.input} /></Campo>
                  <Campo label="Data executada"><input type="date" value={osDataExecucao} onChange={(e) => setOsDataExecucao(e.target.value)} style={styles.input} /></Campo>
                  <Campo label="Executor"><input value={osExecutor} onChange={(e) => setOsExecutor(e.target.value)} placeholder="Nome do técnico/responsável" style={styles.input} /></Campo>
                </div>
                <Campo label="Observação / serviço executado"><textarea value={osObservacao} onChange={(e) => setOsObservacao(e.target.value)} placeholder="Observação opcional" style={styles.textarea} /></Campo>
                {planoOsSelecionado && <div style={styles.boxInternoDestaque}><strong>{planoOsSelecionado.tag} — {planoOsSelecionado.plano_tipo}</strong><br />{planoOsSelecionado.checklist_referencia}<br /><small>Recálculo: {planoOsSelecionado.base_recalculo === "EXECUCAO" ? "pela data executada" : "pela data programada"} | Intervalo: {planoOsSelecionado.periodicidade_valor} {planoOsSelecionado.periodicidade_unidade.toLowerCase()}</small></div>}
                <div style={styles.botoesLinha}><button onClick={registrarExecucaoPreventiva} style={styles.botaoVerde}>Registrar execução e recalcular próxima</button></div>

                <section style={styles.boxInterno}>
                  <h3 style={styles.subtituloSecao}>Últimas execuções registradas</h3>
                  {programacoesExecutadasRecentes.slice(0, 30).map((p) => <div key={p.id} style={styles.linhaHistorico}><div><strong>{p.tag} — {p.plano_tipo}</strong><br />OS: {p.numero_os || "Sem OS"} | Executada: {dataISOParaBR(p.data_execucao || p.data_programada)} | {p.executor || "Executor não informado"}</div><button onClick={() => abrirHistoricoEquipamento(p.tag)} style={styles.botaoCinza}>Histórico</button></div>)}
                </section>
              </section>
            )}

            {filtroAdmin === "EQUIPAMENTOS" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Cadastro e edição de equipamentos</h2>
                <Campo label="Buscar cadastro"><input value={buscaCadastro} onChange={(e) => setBuscaCadastro(e.target.value)} placeholder="TAG, modelo, área..." style={styles.input} /></Campo>
                <div style={styles.tabelaEquipamentos}>
                  {(buscaCadastro ? equipamentosCadastroFiltrados : equipamentos.slice(0, 120)).map((e) => (
                    <div key={e.tag} style={isMobile ? styles.linhaEquipamentoMobile : styles.linhaEquipamento}>
                      <div><strong>{e.tag}</strong><br />{e.tipo_equipamento} | Modelo: {e.modelo || "Não informado"}<br /><small>{e.local_correto} — {e.area}</small><br /><span style={styles.badgeAguardando}>{nomePeriodicidadeChecklist(periodicidadeChecklistDoEquipamento(e))}</span> <span style={e.checklist_obrigatorio === false ? styles.badgeOpcional : styles.badgeObrigatorio}>{e.checklist_obrigatorio === false ? "Não obrigatório" : "Obrigatório"}</span></div>
                      <div style={styles.botoesLinha}><button onClick={() => { setEditandoTag(e.tag); setEquipamentoEdicao({ ...e }); }} style={styles.botaoCinza}>Editar</button><button onClick={() => abrirHistoricoEquipamento(e.tag)} style={styles.botaoPreto}>Histórico</button></div>
                    </div>
                  ))}
                </div>
                <section style={styles.boxInternoDestaque}>
                  <h3>{editandoTag ? `Editando ${editandoTag}` : "Novo cadastro"}</h3>
                  <div style={isMobile ? styles.gridMobile : styles.grid3}>
                    <Campo label="TAG"><input value={equipamentoEdicao.tag} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, tag: e.target.value })} style={styles.input} /></Campo>
                    <Campo label="Tipo de equipamento"><input value={equipamentoEdicao.tipo_equipamento} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, tipo_equipamento: e.target.value })} style={styles.input} /></Campo>
                    <Campo label="Módulo"><select value={moduloDoEquipamento(equipamentoEdicao)} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, modulo: e.target.value as ModuloEquipamento, periodicidade_checklist: e.target.value === "MONOVIA" ? "MENSAL" : (equipamentoEdicao.periodicidade_checklist || "DIARIO") })} style={styles.input}><option value="FROTA">Frota</option><option value="MONOVIA">Monovia / Talha</option></select></Campo>
                    <Campo label="Periodicidade checklist"><select value={periodicidadeChecklistDoEquipamento(equipamentoEdicao)} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, periodicidade_checklist: e.target.value as PeriodicidadeChecklist })} style={styles.input}><option value="DIARIO">Diário - 1 vez/dia</option><option value="SEMANAL">Semanal - 1 vez/semana</option><option value="MENSAL">Mensal - 1 vez/mês</option></select></Campo>
                    <Campo label="Modelo"><input value={equipamentoEdicao.modelo || ""} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, modelo: e.target.value })} style={styles.input} /></Campo>
                    <Campo label="Nº série"><input value={equipamentoEdicao.numero_serie || ""} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, numero_serie: e.target.value })} style={styles.input} /></Campo>
                    <Campo label="Local"><input value={equipamentoEdicao.local_correto || ""} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, local_correto: e.target.value })} style={styles.input} /></Campo>
                    <Campo label="Área"><input value={equipamentoEdicao.area || ""} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, area: e.target.value })} style={styles.input} /></Campo>
                    <Campo label="Supervisor"><input value={equipamentoEdicao.supervisor_responsavel || ""} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, supervisor_responsavel: e.target.value })} style={styles.input} /></Campo>
                    <Campo label="E-mail supervisor"><input value={equipamentoEdicao.email_supervisor || ""} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, email_supervisor: e.target.value })} style={styles.input} /></Campo>
                    <Campo label="WhatsApp supervisor"><input value={equipamentoEdicao.whatsapp_supervisor || ""} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, whatsapp_supervisor: e.target.value })} style={styles.input} /></Campo>
                  </div>
                  <div style={styles.obrigatorioBox}><label style={styles.checkLabel}><input type="checkbox" checked={equipamentoEdicao.checklist_obrigatorio !== false} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, checklist_obrigatorio: e.target.checked })} /> Checklist obrigatório conforme periodicidade cadastrada</label></div>
                  <div style={styles.botoesLinha}><button onClick={salvarEquipamento} style={styles.botaoVerde}>{editandoTag ? "Salvar alteração" : "Cadastrar equipamento"}</button><button onClick={() => { setEquipamentoEdicao(equipamentoVazio); setEditandoTag(""); }} style={styles.botaoCinza}>Limpar</button></div>
                </section>
              </section>
            )}

            {filtroAdmin === "HISTORICO" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Histórico por equipamento</h2>
                <Campo label="Equipamento"><select value={historicoTag} onChange={(e) => setHistoricoTag(e.target.value)} style={styles.input}><option value="">Selecione uma TAG</option>{equipamentos.filter((e) => e.ativo !== false).map((e) => <option key={e.tag} value={e.tag}>{e.tag} — {e.tipo_equipamento} — {e.modelo || ""}</option>)}</select></Campo>
                {!equipamentoHistorico && <div style={styles.estadoVazio}>Selecione um equipamento para ver somente o histórico dele.</div>}
                {equipamentoHistorico && (
                  <>
                    <div style={isMobile ? styles.gridMobile : styles.grid4}>
                      <Info label="TAG" valor={equipamentoHistorico.tag} destaque />
                      <Info label="Modelo" valor={equipamentoHistorico.modelo || "Não informado"} />
                      <Info label="Área" valor={equipamentoHistorico.area || "Não informada"} />
                      <Info label="Checklist" valor={nomePeriodicidadeChecklist(periodicidadeChecklistDoEquipamento(equipamentoHistorico))} />
                    </div>
                    <section style={styles.boxInterno}>
                      <h3 style={styles.subtituloSecao}>Checklists</h3>
                      {historicoChecklists.length === 0 && <p>Nenhum checklist registrado.</p>}
                      {historicoChecklists.slice(0, 50).map((c) => {
                        const problemas = c.id ? respostasBanco.filter((r) => r.checklist_id === c.id && r.status === "NÃO OK") : [];
                        return <div key={c.id} style={styles.linhaHistorico}><div><strong>{dataISOParaBR(c.data_checklist)} — {c.resultado_final}</strong><br />{c.operador_nome} | {c.hora_checklist || "Sem horário"}{problemas.map((r) => <div key={r.id} style={{ marginTop: 4 }}>Item {r.item_numero}: {r.observacao || r.item_descricao}</div>)}</div><div style={styles.previewLinha}>{c.foto_evidencia_url && <a href={c.foto_evidencia_url} target="_blank" style={styles.linkFoto}>Foto</a>}</div></div>;
                      })}
                    </section>
                    <section style={styles.boxInterno}>
                      <h3 style={styles.subtituloSecao}>Manutenções / OS</h3>
                      {historicoProgramacoes.length === 0 && <p>Nenhuma programação ou execução registrada.</p>}
                      {historicoProgramacoes.slice(0, 50).map((m) => <div key={m.id} style={styles.linhaHistorico}><div><strong>{m.plano_tipo} — {m.status}</strong><br />Programada: {dataISOParaBR(m.data_programada)}{m.data_execucao && <> | Executada: {dataISOParaBR(m.data_execucao)}</>}<br />{m.numero_os && <>OS: {m.numero_os} | </>}{m.executor || ""}<br />{m.observacao || ""}</div></div>)}
                    </section>
                  </>
                )}
              </section>
            )}

            {filtroAdmin === "NA_VALIDACAO" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Itens N/A para validação</h2>
                <p style={styles.textoApoio}>Página separada para o ADMIN decidir se o item permanece ou deve ser retirado dos equipamentos do mesmo modelo.</p>
                {sugestoesNA.length === 0 && <p>Nenhum item N/A registrado.</p>}
                {sugestoesNA.map((s: any) => (
                  <div key={s.key} style={styles.naCard}><strong>Modelo: {s.modeloLabel}</strong><br />Item {s.itemNumero}: {s.itemDescricao}<br />Ocorrências: {s.totalOcorrencias}<br />Observações:<ul>{s.observacoes.map((o: string, idx: number) => <li key={idx}>{o}</li>)}</ul>{s.decisao ? <div style={styles.decisaoBox}>Decisão: <strong>{s.decisao.decisao}</strong></div> : <div style={styles.botoesLinha}><button onClick={() => decidirNA(s, "REMOVER")} style={styles.botaoVerde}>Retirar dos modelos iguais</button><button onClick={() => decidirNA(s, "MANTER")} style={styles.botaoCinza}>Manter item</button></div>}</div>
                ))}
              </section>
            )}

            {filtroAdmin === "CHECKLIST" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Configuração dos itens de checklist</h2>
                <p style={styles.textoApoio}>Aqui ficam apenas cadastro, edição e ativação geral. A retirada por modelo possui página própria.</p>
                <div style={isMobile ? styles.gridMobile : styles.grid3}>
                  <Campo label="Módulo"><select value={itemChecklistModulo} onChange={(e) => setItemChecklistModulo(e.target.value as ModuloEquipamento)} style={styles.input}><option value="FROTA">Frota</option><option value="MONOVIA">Monovia / Talha</option></select></Campo>
                  <Campo label="Número do item"><input value={itemChecklistNumero} onChange={(e) => setItemChecklistNumero(e.target.value.replace(/\D/g, ""))} placeholder="Ex.: 16" style={styles.input} /></Campo>
                  <Campo label={itemChecklistEditando ? `Editando item ${itemChecklistEditando}` : "Descrição do item"}><input value={itemChecklistDescricao} onChange={(e) => setItemChecklistDescricao(e.target.value)} style={styles.input} /></Campo>
                </div>
                <div style={styles.botoesLinha}><button onClick={salvarItemChecklist} style={styles.botaoVerde}>{itemChecklistEditando ? "Salvar alteração" : "Adicionar item"}</button><button onClick={limparFormularioItemChecklist} style={styles.botaoCinza}>Limpar</button></div>
                <div style={styles.tabelaEquipamentos}>{itensConfigPorModulo(itemChecklistModulo).sort((a, b) => a.numero - b.numero).map((item) => <div key={`${item.modulo || "FROTA"}-${item.numero}`} style={isMobile ? styles.linhaEquipamentoMobile : styles.linhaEquipamento}><div><strong>{item.numero}. {item.descricao}</strong><br /><span style={item.ativo === false ? styles.badgeOpcional : styles.badgeObrigatorio}>{item.ativo === false ? "Inativo geral" : "Ativo geral"}</span></div><div style={styles.botoesLinha}><button onClick={() => editarItemChecklist(item)} style={styles.botaoCinza}>Editar</button>{item.ativo === false ? <button onClick={() => alterarAtivoItemChecklist(item, true)} style={styles.botaoVerde}>Reativar</button> : <button onClick={() => alterarAtivoItemChecklist(item, false)} style={styles.botaoPerigo}>Retirar de todos</button>}</div></div>)}</div>
              </section>
            )}

            {filtroAdmin === "RETIRAR_MODELO" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Retirar item por modelo</h2>
                <p style={styles.textoApoio}>Selecione o modelo e retire somente os itens que não se aplicam a esse grupo de equipamentos.</p>
                <div style={isMobile ? styles.gridMobile : styles.grid2}>
                  <Campo label="Módulo dos itens"><select value={itemChecklistModulo} onChange={(e) => setItemChecklistModulo(e.target.value as ModuloEquipamento)} style={styles.input}><option value="FROTA">Frota</option><option value="MONOVIA">Monovia / Talha</option></select></Campo>
                  <Campo label="Modelo"><select value={modeloConfigSelecionado} onChange={(e) => setModeloConfigSelecionado(e.target.value)} style={styles.input}><option value="">Selecione um modelo</option>{modelosDisponiveis.map((m) => <option key={m.chave} value={m.chave}>{m.label}</option>)}</select></Campo>
                </div>
                <div style={styles.tabelaEquipamentos}>{itensConfigPorModulo(itemChecklistModulo).filter((i) => i.ativo !== false).sort((a, b) => a.numero - b.numero).map((item) => <div key={`${item.modulo}-${item.numero}`} style={isMobile ? styles.linhaEquipamentoMobile : styles.linhaEquipamento}><div><strong>{item.numero}. {item.descricao}</strong></div><button onClick={() => retirarItemPorModelo(item)} style={styles.botaoPreto}>Retirar deste modelo</button></div>)}</div>
                <section style={styles.boxInterno}><h3 style={styles.subtituloSecao}>Itens já retirados por modelo</h3>{itensRetiradosPorModelo.length === 0 && <p>Nenhum item retirado.</p>}{itensRetiradosPorModelo.map((d) => <div key={`${d.modelo_chave}-${d.item_numero}`} style={styles.linhaHistorico}><div><strong>{d.modelo_label}</strong><br />Item {d.item_numero}: {d.item_descricao}</div><button onClick={() => reativarItemPorModelo(d)} style={styles.botaoVerde}>Reativar</button></div>)}</section>
              </section>
            )}

            {filtroAdmin === "USUARIOS" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Usuários do sistema</h2>
                <p style={styles.textoApoio}>O ADMIN não visualiza senhas. Ele pode criar usuário, bloquear, alterar perfil ou redefinir a senha.</p>
                <div style={isMobile ? styles.gridMobile : styles.grid4}>
                  <Campo label="Nome completo"><input value={usuarioAdminNome} onChange={(e) => setUsuarioAdminNome(e.target.value)} style={styles.input} /></Campo>
                  <Campo label="Usuário"><input value={usuarioAdminLogin} onChange={(e) => setUsuarioAdminLogin(normalizarUsuario(e.target.value))} style={styles.input} /></Campo>
                  <Campo label={usuarioAdminEditando ? "Nova senha (opcional)" : "Senha inicial"}><input value={usuarioAdminSenha} onChange={(e) => setUsuarioAdminSenha(e.target.value)} type="password" placeholder={usuarioAdminEditando ? "Em branco mantém a senha atual" : "Mínimo 6 caracteres"} style={styles.input} /></Campo>
                  <Campo label="Perfil"><select value={usuarioAdminPerfil} onChange={(e) => setUsuarioAdminPerfil(e.target.value as Perfil)} style={styles.input}><option value="OPERADOR">OPERADOR</option><option value="ADMIN">ADMIN</option></select></Campo>
                </div>
                <div style={styles.obrigatorioBox}><label style={styles.checkLabel}><input type="checkbox" checked={usuarioAdminAtivo} onChange={(e) => setUsuarioAdminAtivo(e.target.checked)} /> Usuário ativo</label></div>
                <div style={styles.botoesLinha}><button onClick={salvarUsuarioAppAdmin} style={styles.botaoVerde}>{usuarioAdminEditando ? "Salvar usuário" : "Criar usuário"}</button><button onClick={limparFormularioUsuarioAdmin} style={styles.botaoCinza}>Limpar</button></div>
                <div style={styles.tabelaEquipamentos}>{usuariosApp.map((u) => <div key={u.usuario} style={isMobile ? styles.linhaEquipamentoMobile : styles.linhaEquipamento}><div><strong>{u.nome}</strong><br />Usuário: {u.usuario} | Perfil: {u.perfil}<br /><span style={styles.textoApoio}>Senha: protegida / não exibida</span><br /><span style={u.ativo === false ? styles.badgeOpcional : styles.badgeObrigatorio}>{u.ativo === false ? "Bloqueado" : "Ativo"}</span></div><div style={styles.botoesLinha}><button onClick={() => editarUsuarioApp(u)} style={styles.botaoCinza}>Editar / redefinir senha</button><button onClick={() => alternarUsuarioAtivo(u)} style={u.ativo === false ? styles.botaoVerde : styles.botaoPerigo}>{u.ativo === false ? "Ativar" : "Bloquear"}</button></div></div>)}</div>
              </section>
            )}

            {filtroAdmin === "PARADAS" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Máquinas paradas / reserva</h2>
                {paradasManutencao.length === 0 && <p>Nenhuma máquina parada aguardando ação.</p>}
                {paradasManutencao.map((p) => {
                  const inicio = new Date(`${p.data_inicio}T${p.hora_inicio || "00:00:00"}`);
                  const horas = Math.max(0, (Date.now() - inicio.getTime()) / 3600000);
                  return <div key={p.id} style={styles.alertaItem}><strong>{p.tag_original} — OS {p.numero_os}</strong><br />Status: {p.status}<br />Motivo: {p.motivo}<br />Operador: {p.operador_nome}<br />Afeta operação: {p.afeta_operacao ? "SIM" : "NÃO"}<br />Tempo parado atual: {horas.toFixed(1)} h<br />{p.tag_reserva && <>Reserva definida: {p.tag_reserva}<br /></>}{p.afeta_operacao && p.status === "AGUARDANDO_RESERVA" && <div style={styles.botoesLinha}><select value={tagReservaSelecionada} onChange={(e) => setTagReservaSelecionada(e.target.value)} style={styles.input}><option value="">Selecionar equipamento reserva</option>{equipamentosReservaDisponiveis.map((e) => <option key={e.tag} value={e.tag}>{e.tag} — {e.tipo_equipamento} — {e.area}</option>)}</select><input value={observacaoAdminParada} onChange={(e) => setObservacaoAdminParada(e.target.value)} placeholder="Observação" style={styles.input} /><button onClick={() => definirReserva(p)} style={styles.botaoVerde}>Definir reserva</button></div>}<div style={styles.botoesLinha}><button onClick={() => finalizarParada(p)} style={styles.botaoPreto}>Finalizar manutenção / reativar checklist</button><button onClick={() => abrirHistoricoEquipamento(p.tag_original)} style={styles.botaoCinza}>Histórico</button></div></div>;
                })}
              </section>
            )}

            {filtroAdmin === "RELATORIOS" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Relatório de Checklist de Equipamentos</h2>
                <p style={styles.textoApoio}>O relatório atual foi mantido. Selecione período e equipamentos para gerar o PDF.</p>
                <div style={isMobile ? styles.gridMobile : styles.grid4}>
                  <Campo label="Data inicial"><input type="date" value={relatorioDataInicio} onChange={(e) => setRelatorioDataInicio(e.target.value)} style={styles.input} /></Campo>
                  <Campo label="Data final"><input type="date" value={relatorioDataFim} onChange={(e) => setRelatorioDataFim(e.target.value)} style={styles.input} /></Campo>
                  <Campo label="Execução"><input value="Uma inspeção por período do equipamento" readOnly style={styles.input} /></Campo>
                  <Campo label="Fotos"><select value={relatorioIncluirFotos ? "SIM" : "NAO"} onChange={(e) => setRelatorioIncluirFotos(e.target.value === "SIM")} style={styles.input}><option value="NAO">Período: mostrar somente links</option><option value="SIM">Período: incluir fotos no PDF</option></select><small style={styles.textoApoio}>Em um único dia, as fotos entram automaticamente.</small></Campo>
                </div>
                <Campo label="Buscar equipamento"><input value={relatorioBuscaEquipamento} onChange={(e) => setRelatorioBuscaEquipamento(e.target.value)} placeholder="TAG, área, modelo..." style={styles.input} /></Campo>
                <div style={styles.botoesLinha}><button onClick={selecionarTodosEquipamentosRelatorio} style={styles.botaoCinza}>Selecionar lista filtrada</button><button onClick={limparSelecaoRelatorio} style={styles.botaoCinza}>Limpar seleção</button><button onClick={gerarRelatorioChecklistPDF} style={styles.botaoPreto}>Gerar relatório PDF</button></div>
                <p style={styles.textoApoio}>Selecionados: {relatorioTagsSelecionadas.length ? relatorioTagsSelecionadas.join(", ") : "nenhum equipamento selecionado"}</p>
                <div style={isMobile ? styles.listaEquipamentosMobile : styles.listaEquipamentos}>{equipamentosRelatorioFiltrados.map((e) => { const selecionado = relatorioTagsSelecionadas.includes(e.tag); return <button key={e.tag} onClick={() => alternarEquipamentoRelatorio(e.tag)} style={{ ...styles.cardSelecao, border: selecionado ? "2px solid #111111" : "1px solid #e2e8f0", background: selecionado ? "#fef9c3" : "white" }}><strong style={styles.tagMini}>{e.tag}</strong><span>{e.tipo_equipamento}</span><small>{e.modelo || "Modelo não informado"} | {e.area || "Área não informada"}</small><strong>{selecionado ? "Selecionado" : "Selecionar"}</strong></button>; })}</div>
              </section>
            )}

            {filtroAdmin === "CMMS" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>CMMS - importação opcional</h2>
                <p style={styles.textoApoio}>A integração automática ainda não é necessária. Esta página preserva a importação manual já existente.</p>
                <div style={isMobile ? styles.gridMobile : styles.grid4}><Card titulo="OS importadas" valor={osCmms.length} /><Card titulo="OS abertas" valor={osCmmsAbertas.length} /><Card titulo="Sem vínculo ativo" valor={osCmmsSemVinculo.length} /><Card titulo="Alertas na frota" valor={tagsComAlertaCmms.size} /></div>
                <Campo label="Selecionar arquivo exportado do CMMS"><input type="file" accept=".xls,.html,.htm" onChange={importarArquivoCMMS} style={styles.input} /></Campo>
                {resultadoImportacaoCMMS && <div style={styles.alertaItem}><strong>Última importação: {resultadoImportacaoCMMS.arquivo}</strong><br />Linhas lidas: {resultadoImportacaoCMMS.total}<br />OS importadas/atualizadas: {resultadoImportacaoCMMS.importadas}<br />Vinculadas: {resultadoImportacaoCMMS.vinculadas}<br />Sem vínculo: {resultadoImportacaoCMMS.semVinculo}</div>}
                <section style={styles.boxInterno}><h3 style={styles.subtituloSecao}>OS abertas / pendentes</h3>{osCmmsAbertas.slice(0, 80).map((os) => { const alerta = classificarAlertaCmms(os); return <div key={`${os.num_os}-${os.tag}`} style={styles.linhaHistorico}><div><strong>{os.tag} — OS {os.num_os}</strong><br />{os.tipo_manut || "Tipo não informado"} | {os.status || "Status não informado"}<br />{os.descricao || os.desc_codigo_parada || "Sem descrição"}</div><span style={alerta.nivel === "CRITICO" ? styles.badgeAtrasado : styles.badgeAguardando}>{alerta.titulo}</span></div>; })}</section>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function Card({ titulo, valor, destaque = false }: { titulo: string; valor: number; destaque?: boolean }) {
  return (
    <div style={{ ...styles.kpiCard, border: destaque ? "1px solid #f59e0b" : "1px solid #e2e8f0" }}>
      <strong>{titulo}</strong>
      <h2 style={{ marginBottom: 0 }}>{valor}</h2>
    </div>
  );
}

function DashboardCard({
  titulo,
  valor,
  subtitulo,
  cor = "PRETO",
  onClick,
}: {
  titulo: string;
  valor: number;
  subtitulo?: string;
  cor?: "VERDE" | "AMARELO" | "VERMELHO" | "AZUL" | "PRETO";
  onClick?: () => void;
}) {
  const paleta: Record<string, { fundo: string; borda: string; numero: string }> = {
    VERDE: { fundo: "#f0fdf4", borda: "#86efac", numero: "#166534" },
    AMARELO: { fundo: "#fffbeb", borda: "#fcd34d", numero: "#92400e" },
    VERMELHO: { fundo: "#fef2f2", borda: "#fca5a5", numero: "#991b1b" },
    AZUL: { fundo: "#eff6ff", borda: "#93c5fd", numero: "#1d4ed8" },
    PRETO: { fundo: "#171717", borda: "#404040", numero: "#FFE600" },
  };
  const p = paleta[cor] || paleta.PRETO;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.dashboardKpiCard,
        background: p.fundo,
        borderColor: p.borda,
        cursor: onClick ? "pointer" : "default",
        color: cor === "PRETO" ? "white" : "#0f172a",
      }}
    >
      <span style={{ ...styles.dashboardKpiNumero, color: p.numero }}>{valor}</span>
      <strong style={styles.dashboardKpiTitulo}>{titulo}</strong>
      {subtitulo && <span style={{ ...styles.dashboardKpiSubtitulo, color: cor === "PRETO" ? "#d4d4d4" : "#64748b" }}>{subtitulo}</span>}
    </button>
  );
}

function BarraDashboard({
  label,
  valor,
  total,
  tipo = "PRETO",
}: {
  label: string;
  valor: number;
  total: number;
  tipo?: "VERDE" | "AMARELO" | "VERMELHO" | "AZUL" | "PRETO";
}) {
  const cores: Record<string, string> = {
    VERDE: "#16a34a",
    AMARELO: "#eab308",
    VERMELHO: "#dc2626",
    AZUL: "#2563eb",
    PRETO: "#171717",
  };
  const percentual = Math.max(0, Math.min(100, total > 0 ? (valor / total) * 100 : 0));
  return (
    <div style={styles.barraDashboardItem}>
      <div style={styles.barraDashboardCabecalho}>
        <strong>{label}</strong>
        <span>{valor}</span>
      </div>
      <div style={styles.barraDashboardTrilho}>
        <div style={{ ...styles.barraDashboardPreenchimento, width: `${percentual}%`, background: cores[tipo] || cores.PRETO }} />
      </div>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={styles.campo}>
      {label}
      {children}
    </label>
  );
}

function Info({ label, valor, destaque = false }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <small style={styles.infoLabel}>{label}</small>
      <div style={{ fontWeight: destaque ? 800 : 600, fontSize: destaque ? 16 : 15 }}>{valor}</div>
    </div>
  );
}

function PreviewImagem({ titulo, src, onRemover }: { titulo: string; src: string; onRemover: () => void }) {
  return (
    <div style={styles.previewBox}>
      <small style={styles.infoLabel}>{titulo}</small>
      <img src={src} alt={titulo} style={styles.previewImg} />
      <button onClick={onRemover} style={styles.botaoPerigo}>Remover foto</button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: "100vh", background: "#f1f5f9", padding: 20, color: "#0f172a" },
  container: { maxWidth: 1220, margin: "0 auto" },
  loginBox: { maxWidth: 560, background: "white", padding: 24, borderRadius: 22, border: "1px solid #e2e8f0", borderTop: "6px solid #FFE600", boxShadow: "0 14px 30px rgba(0,0,0,0.12)" },
  loginMarca: { display: "flex", gap: 14, alignItems: "center", marginBottom: 16, flexWrap: "wrap" },
  logoLogin: { width: 240, height: 86, objectFit: "contain", background: "black", borderRadius: 16, padding: 8, border: "1px solid #e2e8f0" },
  loginDica: { marginTop: 16, background: "#f8fafc", padding: 12, borderRadius: 12, color: "#475569", fontSize: 14 },
  header: { background: "linear-gradient(135deg, #000000 0%, #171717 55%, #2b1700 100%)", color: "white", padding: 28, borderRadius: 24, marginBottom: 18, display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", borderTop: "6px solid #FFE600", boxShadow: "0 12px 30px rgba(0,0,0,0.18)" },
  headerMobile: { background: "linear-gradient(135deg, #000000 0%, #171717 55%, #2b1700 100%)", color: "white", padding: 18, borderRadius: 20, marginBottom: 18, display: "grid", gap: 14, borderTop: "6px solid #FFE600" },
  brandArea: { display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" },
  logo: { width: 230, height: 72, objectFit: "contain", background: "black", borderRadius: 16, padding: 8, border: "1px solid rgba(255,255,255,0.18)" },
  empresaNome: { color: "#FFE600", fontWeight: 900, letterSpacing: 0.5, textTransform: "uppercase", fontSize: 13 },
  titulo: { fontSize: 28, margin: 0 },
  subtitulo: { color: "#dbeafe", marginTop: 10 },
  perfilBox: { display: "flex", gap: 8, background: "rgba(255,255,255,0.1)", padding: 8, borderRadius: 16 },
  perfilBotao: { padding: "10px 14px", borderRadius: 12, border: "none", background: "transparent", color: "white", fontWeight: "bold", cursor: "pointer" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 },
  kpiGridMobile: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 },
  kpiCard: { background: "white", padding: 18, borderRadius: 16 },
  box: { background: "white", padding: 18, borderRadius: 20, marginBottom: 18, border: "1px solid #e2e8f0" },
  boxTela: { background: "white", padding: 22, borderRadius: 24, marginBottom: 18, border: "1px solid #cbd5e1" },
  boxTitulo: { marginTop: 0 },
  boxInterno: { background: "#f8fafc", padding: 16, borderRadius: 16, marginTop: 16, border: "1px solid #e2e8f0" },
  boxInternoDestaque: { background: "#eff6ff", padding: 16, borderRadius: 16, marginTop: 16, border: "1px solid #bfdbfe" },
  subtituloSecao: { marginTop: 0 },
  textoApoio: { color: "#64748b", marginTop: 8 },
  grid4: { display: "grid", gap: 12, gridTemplateColumns: "repeat(4, 1fr)" },
  grid3: { display: "grid", gap: 12, gridTemplateColumns: "repeat(3, 1fr)" },
  grid2: { display: "grid", gap: 12, gridTemplateColumns: "repeat(2, 1fr)", alignItems: "start" },
  gridMobile: { display: "grid", gap: 12, gridTemplateColumns: "1fr" },
  campo: { display: "grid", gap: 6, fontWeight: 700, fontSize: 14, marginBottom: 10 },
  input: { width: "100%", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14 },
  textarea: { width: "100%", minHeight: 72, padding: 10, borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, marginTop: 8 },
  listaEquipamentos: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
  listaEquipamentosMobile: { display: "grid", gridTemplateColumns: "1fr", gap: 10 },
  cardSelecao: { textAlign: "left", background: "white", padding: 14, borderRadius: 14, cursor: "pointer", display: "grid", gap: 6, border: "1px solid #e2e8f0" },
  tagMini: { background: "#111111", color: "#FFE600", padding: "5px 10px", borderRadius: 999, width: "fit-content" },
  badgeConcluido: { background: "#dcfce7", color: "#166534", padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, width: "fit-content" },
  badgeOpcional: { background: "#e2e8f0", color: "#334155", padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, width: "fit-content" },
  badgeObrigatorio: { background: "#dbeafe", color: "#1e40af", padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, display: "inline-block", marginTop: 6 },
  badgeAtrasado: { background: "#fee2e2", color: "#991b1b", padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, display: "inline-block", marginTop: 6 },
  badgeAguardando: { background: "#fef3c7", color: "#92400e", padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, display: "inline-block", marginTop: 6 },
  topoChecklist: { display: "flex", gap: 12, alignItems: "center", marginBottom: 18 },
  infoEquipamentoGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, background: "#f8fafc", borderRadius: 16, padding: 14, marginBottom: 16 },
  infoEquipamentoGridMobile: { display: "grid", gridTemplateColumns: "1fr", gap: 12, background: "#f8fafc", borderRadius: 16, padding: 14, marginBottom: 16 },
  checklistLista: { display: "grid", gap: 10 },
  itemChecklist: { display: "grid", gridTemplateColumns: "1fr 260px", gap: 12, alignItems: "start", padding: 14, border: "1px solid #e2e8f0", borderRadius: 14 },
  itemChecklistMobile: { display: "grid", gridTemplateColumns: "1fr", gap: 12, alignItems: "start", padding: 14, border: "1px solid #e2e8f0", borderRadius: 14 },
  statusBotoes: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 },
  statusBotoesMobile: { display: "grid", gridTemplateColumns: "1fr", gap: 8 },
  statusBotao: { padding: 10, borderRadius: 10, border: "1px solid #cbd5e1", background: "white", color: "#0f172a", fontWeight: "bold", cursor: "pointer" },
  okAtivo: { padding: 10, borderRadius: 10, border: "none", background: "#16a34a", color: "white", fontWeight: "bold", cursor: "pointer" },
  naoOkAtivo: { padding: 10, borderRadius: 10, border: "none", background: "#dc2626", color: "white", fontWeight: "bold", cursor: "pointer" },
  naAtivo: { padding: 10, borderRadius: 10, border: "none", background: "#64748b", color: "white", fontWeight: "bold", cursor: "pointer" },
  botoesLinha: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 14 },
  botaoPreto: { padding: "11px 14px", borderRadius: 12, border: "none", background: "#111111", color: "#FFE600", fontWeight: "bold", cursor: "pointer" },
  botaoCinza: { padding: "11px 14px", borderRadius: 12, border: "none", background: "#e2e8f0", color: "#0f172a", fontWeight: "bold", cursor: "pointer" },
  botaoVerde: { padding: "11px 14px", borderRadius: 12, border: "none", background: "#15803d", color: "white", fontWeight: "bold", cursor: "pointer" },
  botaoPerigo: { padding: "9px 12px", borderRadius: 10, border: "none", background: "#dc2626", color: "white", fontWeight: "bold", cursor: "pointer", marginTop: 8 },
  confirmacaoBox: { background: "#ecfdf5", border: "1px solid #86efac", padding: 14, borderRadius: 14, marginTop: 14 },
  erroChecklistBox: { background: "#fef2f2", border: "2px solid #ef4444", color: "#7f1d1d", padding: 14, borderRadius: 14, marginTop: 14 },
  erroChecklistLista: { margin: "10px 0 0 18px", padding: 0, display: "grid", gap: 6, fontWeight: 700 },
  checkLabel: { display: "flex", gap: 10, alignItems: "center", fontWeight: 800 },
  filtroLinha: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 },
  filtroBotao: { padding: "9px 12px", borderRadius: 999, border: "1px solid #cbd5e1", background: "white", color: "#0f172a", fontWeight: 800, cursor: "pointer" },
  filtroAtivo: { padding: "9px 12px", borderRadius: 999, border: "none", background: "#111111", color: "#FFE600", fontWeight: 800, cursor: "pointer" },
  alertaItem: { background: "#fff7ed", border: "1px solid #fdba74", padding: 14, borderRadius: 14, marginBottom: 10 },
  alertaManutencaoBox: { background: "#fef2f2", border: "2px solid #ef4444", padding: 16, borderRadius: 16, marginTop: 16 },
  pendentesGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 },
  pendentesGridMobile: { display: "grid", gridTemplateColumns: "1fr", gap: 10 },
  pendenteItem: { background: "#f8fafc", border: "1px solid #e2e8f0", padding: 12, borderRadius: 12 },
  naCard: { background: "#f8fafc", border: "1px solid #e2e8f0", padding: 14, borderRadius: 14, marginBottom: 12 },
  decisaoBox: { background: "#eef2ff", color: "#3730a3", border: "1px solid #c7d2fe", padding: 10, borderRadius: 12, marginTop: 10 },
  tabelaEquipamentos: { display: "grid", gap: 8, marginTop: 12 },
  linhaEquipamento: { display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", background: "#f8fafc", border: "1px solid #e2e8f0", padding: 12, borderRadius: 12 },
  linhaEquipamentoMobile: { display: "grid", gridTemplateColumns: "1fr", gap: 10, alignItems: "center", background: "#f8fafc", border: "1px solid #e2e8f0", padding: 12, borderRadius: 12 },
  obrigatorioBox: { background: "#f8fafc", border: "1px solid #e2e8f0", padding: 12, borderRadius: 12, marginTop: 12 },
  infoLabel: { display: "block", color: "#64748b", fontWeight: 700, textTransform: "uppercase", fontSize: 11, marginBottom: 3 },
  previewBox: { background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 10 },
  previewImg: { width: "100%", maxHeight: 260, objectFit: "contain", borderRadius: 8 },
  previewLinha: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 },
  linkFoto: { display: "inline-block", background: "#111111", color: "#FFE600", padding: "8px 10px", borderRadius: 10, fontWeight: 800, textDecoration: "none" },
  aviso: { background: "#ecfdf5", border: "1px solid #86efac", color: "#166534", padding: 12, borderRadius: 12, marginBottom: 12, fontWeight: 700 },
  avisoErro: { background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: 12, borderRadius: 12, marginBottom: 12, fontWeight: 700 },
  msg: { color: "#15803d", fontWeight: 700 },
  msgErro: { color: "#b45309", fontWeight: 700 },
  headerAdminMobile: { display: "grid", gap: 12, alignItems: "start" },
  headerAdminLinha: { display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", flexWrap: "wrap" },
  adminMenuGrid: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 },
  adminMenuAtivo: { padding: "10px 13px", borderRadius: 12, border: "none", background: "#111111", color: "#FFE600", fontWeight: 900, cursor: "pointer" },
  adminMenuBotao: { padding: "10px 13px", borderRadius: 12, border: "1px solid #cbd5e1", background: "white", color: "#0f172a", fontWeight: 800, cursor: "pointer" },
  dashboardTituloLinha: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 },
  dashboardKpiGridMobile: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 },
  dashboardKpiGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 16 },
  dashboardKpiCard: { minHeight: 132, textAlign: "left", display: "grid", alignContent: "start", gap: 5, border: "1px solid #e2e8f0", borderRadius: 18, padding: 16, boxShadow: "0 6px 18px rgba(15,23,42,0.05)" },
  dashboardKpiNumero: { display: "block", fontSize: 34, lineHeight: 1, fontWeight: 950 },
  dashboardKpiTitulo: { display: "block", fontSize: 15 },
  dashboardKpiSubtitulo: { display: "block", fontSize: 12, lineHeight: 1.35 },
  dashboardDuasColunas: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14, marginBottom: 16 },
  dashboardTresColunas: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14, marginBottom: 16 },
  estadoVazio: { padding: 18, background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 14, color: "#64748b", textAlign: "center" },
  problemaPersistente: { background: "#fff7ed", border: "1px solid #fdba74", borderLeft: "5px solid #f97316", padding: 14, borderRadius: 14, marginBottom: 10 },
  problemaCabecalho: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 7 },
  numeroDestaque: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, height: 28, padding: "0 8px", borderRadius: 999, background: "#111111", color: "#FFE600", fontWeight: 900 },
  linhaHojeBotao: { width: "100%", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", background: "#f8fafc", border: "1px solid #e2e8f0", padding: 12, borderRadius: 12, cursor: "pointer", color: "#0f172a" },
  miniGraficoColunas: { display: "grid", gridTemplateColumns: "repeat(8, minmax(38px, 1fr))", gap: 7, alignItems: "end", minHeight: 150, overflowX: "auto", paddingTop: 8 },
  miniGraficoItem: { display: "grid", justifyItems: "center", gap: 5, minWidth: 38 },
  miniGraficoValor: { fontSize: 11, fontWeight: 900, color: "#334155" },
  miniGraficoBarra: { width: "100%", minHeight: 4, background: "#111111", borderRadius: "7px 7px 3px 3px" },
  miniGraficoBarraAmarela: { width: "100%", minHeight: 4, background: "#FFE600", border: "1px solid #eab308", borderRadius: "7px 7px 3px 3px" },
  planoCard: { background: "white", border: "1px solid #e2e8f0", borderLeft: "5px solid #FFE600", borderRadius: 16, padding: 14, marginBottom: 10 },
  planoCabecalho: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" },
  regraRecalculoLinha: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 10, paddingTop: 10, borderTop: "1px solid #e2e8f0" },
  inputCompacto: { padding: "7px 9px", borderRadius: 9, border: "1px solid #cbd5e1", fontSize: 12, background: "white" },
  planoDetalhes: { marginTop: 12, padding: 12, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", overflowX: "auto" },
  legendaMapa: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", margin: "12px 0" },
  mapaProgramado: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, height: 28, borderRadius: 7, background: "#dbeafe", color: "#1d4ed8", fontWeight: 900, border: "1px solid #93c5fd" },
  mapaExecutado: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, height: 28, borderRadius: 7, background: "#dcfce7", color: "#166534", fontWeight: 900, border: "1px solid #86efac" },
  mapaAtrasado: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, height: 28, borderRadius: 7, background: "#fee2e2", color: "#991b1b", fontWeight: 900, border: "1px solid #fca5a5" },
  mapaCancelado: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, height: 28, borderRadius: 7, background: "#e2e8f0", color: "#64748b", fontWeight: 900, border: "1px solid #cbd5e1" },
  mapaScroll: { width: "100%", overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 14 },
  mapaTabela: { borderCollapse: "separate", borderSpacing: 0, minWidth: 2700, width: "100%", fontSize: 11 },
  mapaCabecalhoFixo: { position: "sticky", left: 0, zIndex: 4, background: "#111111", color: "#FFE600", minWidth: 170, padding: 8, borderRight: "2px solid #64748b", borderBottom: "1px solid #475569", textAlign: "left" },
  mapaTh: { background: "#111111", color: "#FFE600", minWidth: 43, padding: 7, borderBottom: "1px solid #475569", textAlign: "center", position: "sticky", top: 0, zIndex: 2 },
  mapaTdFixo: { position: "sticky", left: 0, zIndex: 3, background: "white", minWidth: 170, padding: 8, borderRight: "2px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", fontWeight: 800 },
  mapaTd: { minWidth: 43, height: 39, padding: 4, textAlign: "center", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #f1f5f9" },
  linhaHistorico: { display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", background: "#f8fafc", border: "1px solid #e2e8f0", padding: 12, borderRadius: 12, marginBottom: 8 },
  barraDashboardItem: { display: "grid", gap: 5, marginBottom: 11 },
  barraDashboardCabecalho: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 13 },
  barraDashboardTrilho: { height: 10, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" },
  barraDashboardPreenchimento: { height: "100%", borderRadius: 999, minWidth: 2 },
  tabela: { width: "100%", borderCollapse: "collapse", fontSize: 12, marginTop: 10 },
  th: { background: "#111111", color: "#FFE600", padding: 8, textAlign: "left", borderBottom: "1px solid #475569" },
  td: { padding: 8, borderBottom: "1px solid #e2e8f0", verticalAlign: "top" },
};
