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
};

type ChecklistItemPadrao = {
  numero: number;
  descricao: string;
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
  const hora = Number(partesDataHoraBrasil().hora);
  return hora < 15 ? "T1" : "T2";
}

function nomeTurno(turno: TurnoCodigo) {
  return turno === "T1" ? "Turno 1 - 06h" : "Turno 2 - 18h";
}

function horarioReferenciaTurno(turno: TurnoCodigo) {
  return turno === "T1" ? "06:00" : "18:00";
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
  const [turnoSelecionado, setTurnoSelecionado] = useState<TurnoCodigo>(turnoAutomatico());
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
  const [filtroAdmin, setFiltroAdmin] = useState<"TODOS" | "AVARIAS" | "PENDENTES" | "CONCLUIDOS" | "RELATORIOS" | "CMMS" | "AGENDA">("TODOS");
  const [tagReservaSelecionada, setTagReservaSelecionada] = useState("");
  const [observacaoAdminParada, setObservacaoAdminParada] = useState("");

  const [itemChecklistNumero, setItemChecklistNumero] = useState("");
  const [itemChecklistDescricao, setItemChecklistDescricao] = useState("");
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

    const [eqs, itens, itensTodos, chks, resps, decs, pars, usersApp, osImportadas, agendaProg] = await Promise.all([
      supabaseRequest<Equipamento[]>("equipamentos?select=*&order=tag.asc"),
      supabaseRequest<ChecklistItemPadrao[]>("checklist_itens_padrao?select=numero,descricao,ativo&ativo=eq.true&order=numero.asc"),
      supabaseRequest<ChecklistItemPadrao[]>("checklist_itens_padrao?select=numero,descricao,ativo&order=numero.asc"),
      supabaseRequest<ChecklistRegistro[]>("checklists?select=*&order=criado_em.desc&limit=1000"),
      supabaseRequest<RespostaBanco[]>("checklist_respostas?select=*&order=item_numero.asc&limit=5000"),
      supabaseRequest<DecisaoNA[]>("decisoes_na?select=*&order=criado_em.desc"),
      supabaseRequest<ParadaManutencao[]>("paradas_manutencao?select=*&status=neq.FINALIZADA&order=criado_em.desc"),
      supabaseRequest<PerfilUsuario[]>("usuarios_app?select=*&order=nome.asc"),
      supabaseRequest<OsCmms[]>("os_cmms?select=*&order=importado_em.desc&limit=5000").catch(() => []),
      supabaseRequest<AgendaManutencao[]>("agenda_manutencao?select=*&order=data_programada.asc&limit=3000").catch(() => []),
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
  const checklistsTurnoSelecionado = checklistsDoDia.filter((c) => (c.turno_codigo || "T1") === turnoSelecionado);
  const tagsFeitasTurno = new Set(checklistsTurnoSelecionado.map((c) => normalizar(c.tag)));
  const equipamentosObrigatorios = equipamentos.filter((e) =>
    e.ativo !== false &&
    e.checklist_obrigatorio !== false &&
    e.status_operacional !== "EM_MANUTENCAO" &&
    (moduloSelecionado === "TODOS" || moduloDoEquipamento(e) === moduloSelecionado)
  );
  const pendentesHoje = equipamentosObrigatorios.filter((e) => !tagsFeitasTurno.has(normalizar(e.tag)));
  const concluidosHoje = checklistsTurnoSelecionado.filter((c) => equipamentosObrigatorios.some((e) => normalizar(e.tag) === normalizar(c.tag))).length;
  const comAvariaHoje = checklistsTurnoSelecionado.filter((c) => c.resultado_final === "COM AVARIA");
  const horaAtual = Number(partesDataHoraBrasil().hora);

  const checklistsT1 = checklistsDoDia.filter((c) => (c.turno_codigo || "T1") === "T1");
  const checklistsT2 = checklistsDoDia.filter((c) => (c.turno_codigo || "T1") === "T2");
  const tagsT1 = new Set(checklistsT1.map((c) => normalizar(c.tag)));
  const tagsT2 = new Set(checklistsT2.map((c) => normalizar(c.tag)));
  const pendentesT1 = equipamentosObrigatorios.filter((e) => !tagsT1.has(normalizar(e.tag)));
  const pendentesT2 = equipamentosObrigatorios.filter((e) => !tagsT2.has(normalizar(e.tag)));
  const avariasT1 = checklistsT1.filter((c) => c.resultado_final === "COM AVARIA");
  const avariasT2 = checklistsT2.filter((c) => c.resultado_final === "COM AVARIA");

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

  function resetarChecklist(removidos: number[] = itemIdsRemovidosModelo) {
    setRespostas(montarRespostasPadrao(itensPadrao, removidos));
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

    const existente = checklists.find((c) =>
      c.data_checklist === data &&
      c.tag === tag &&
      (c.turno_codigo || "T1") === turnoSelecionado
    );

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

      setRespostas(resp.length ? resp : montarRespostasPadrao(itensPadrao, removidos));
    } else {
      resetarChecklist(removidos);
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

    if (!perfilUsuario) return setMensagem("Usuário não autenticado.");
    if (!operador.trim()) return setMensagem("Informe o nome completo.");
    if (!equipamentoSelecionado) return setMensagem("Selecione um equipamento.");
    if (respostas.some((r) => !r.status)) return setMensagem("Responda todos os itens do checklist.");

    const naoOkSemObs = respostas.filter((r) => r.status === "NÃO OK" && !r.observacao.trim());
    if (naoOkSemObs.length) return setMensagem("Todo item NÃO OK precisa de observação da avaria.");

    const naSemObs = respostas.filter((r) => r.status === "N/A" && !r.observacao.trim());
    if (naSemObs.length) return setMensagem("Todo N/A precisa de observação para validação do Admin.");

    if (ehEquipamentoEletrico(equipamentoSelecionado) && !horimetroLeitura.trim()) {
      return setMensagem("Para equipamento elétrico, informe a leitura/descrição do horímetro.");
    }

    if ((avariaImpedeUso || situacaoEquipamento === "EM MANUTENÇÃO") && !numeroOS.trim()) {
      return setMensagem("Informe o número da OS para equipamento parado/em manutenção.");
    }

    if ((alertasManutencaoSelecionado.length || alertasAgendaSelecionado.length) && !confirmacaoAlertaManutencao) {
      return setMensagem("Confirme que está ciente do alerta de manutenção antes de finalizar o checklist.");
    }

    if (!confirmacaoOperador) return setMensagem("Marque a confirmação final do operador.");

    const situacaoAlerta = situacaoEquipamento !== "EM OPERAÇÃO" && situacaoEquipamento !== "PARADO NA ÁREA";
    const resultado = respostas.some((r) => r.status === "NÃO OK") || situacaoAlerta || avariaImpedeUso ? "COM AVARIA" : "CONFORME";

    try {
      setCarregando(true);

      const pastaFotos = `${data}/${normalizar(equipamentoSelecionado.tag)}`;
      const fotoEvidenciaUrl = fotoEvidencia ? await enviarFotoStorage(fotoEvidencia, pastaFotos, "evidencia") : "";
      const fotoHorimetroUrl = fotoHorimetro ? await enviarFotoStorage(fotoHorimetro, pastaFotos, "horimetro") : "";

      const payload: ChecklistRegistro = {
        data_checklist: data,
        operador_nome: operador.trim(),
        operador_user_id: null,
        turno_codigo: turnoSelecionado,
        turno_nome: nomeTurno(turnoSelecionado),
        horario_referencia: horarioReferenciaTurno(turnoSelecionado),
        equipamento_id: equipamentoSelecionado.id || null,
        tag: equipamentoSelecionado.tag,
        tipo_equipamento: equipamentoSelecionado.tipo_equipamento,
        modelo: equipamentoSelecionado.modelo || "",
        numero_serie: equipamentoSelecionado.numero_serie || "",
        local_correto: equipamentoSelecionado.local_correto || "",
        area: equipamentoSelecionado.area || "",
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
            equipamento_id: equipamentoSelecionado.id || null,
            tag_original: equipamentoSelecionado.tag,
            operador_nome: operador.trim(),
            operador_user_id: null,
            numero_os: numeroOS.trim(),
            motivo: observacaoGeral || "Equipamento parado por avaria identificada no checklist.",
            afeta_operacao: afetaOperacao,
            status: afetaOperacao ? "AGUARDANDO_RESERVA" : "EM_MANUTENCAO",
          }),
        });

        await supabaseRequest<Equipamento[]>(`equipamentos?tag=eq.${encodeURIComponent(equipamentoSelecionado.tag)}`, {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            checklist_obrigatorio: false,
            status_operacional: "EM_MANUTENCAO",
          }),
        });
      }

      await carregarDados();
      setMensagem(`Checklist da ${equipamentoSelecionado.tag} finalizado no ${nomeTurno(turnoSelecionado)}: ${resultado}.`);
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
    setItemChecklistEditando(null);
  }

  function editarItemChecklist(item: ChecklistItemPadrao) {
    setItemChecklistNumero(String(item.numero));
    setItemChecklistDescricao(item.descricao);
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

      await supabaseRequest<ChecklistItemPadrao[]>("checklist_itens_padrao?on_conflict=numero", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({
          numero,
          descricao,
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

      await supabaseRequest<ChecklistItemPadrao[]>(`checklist_itens_padrao?numero=eq.${item.numero}`, {
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
    setUsuarioAdminSenha(u.senha);
    setUsuarioAdminPerfil(u.perfil);
    setUsuarioAdminAtivo(u.ativo !== false);
    setMensagem("");
  }

  async function salvarUsuarioAppAdmin() {
    setMensagem("");

    if (!isAdmin) return setMensagem("Somente Admin pode alterar usuários.");

    const usuario = normalizarUsuario(usuarioAdminLogin);
    if (!usuarioAdminNome.trim()) return setMensagem("Informe o nome do usuário.");
    if (!usuario) return setMensagem("Informe um usuário válido.");
    if (usuarioAdminSenha.length < 6) return setMensagem("A senha precisa ter pelo menos 6 caracteres.");

    try {
      setCarregando(true);

      await supabaseRequest<PerfilUsuario[]>("usuarios_app?on_conflict=usuario", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({
          nome: usuarioAdminNome.trim(),
          usuario,
          senha: usuarioAdminSenha,
          perfil: usuarioAdminPerfil,
          ativo: usuarioAdminAtivo,
        }),
      });

      await carregarDados();
      limparFormularioUsuarioAdmin();
      setMensagem(`Usuário ${usuario} salvo.`);
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
            ${deveIncluirFotos
              ? fotos.map((f) => `<div class="foto-card"><span>${escaparHTML(f.titulo)}</span><img src="${escaparHTML(f.url)}" /></div>`).join("")
              : fotos.map((f) => `<div class="link-foto"><strong>${escaparHTML(f.titulo)}:</strong> <a href="${escaparHTML(f.url)}">${escaparHTML(f.url)}</a></div>`).join("")
            }
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
    body { font-family: Arial, Helvetica, sans-serif; color: #111827; margin: 0; background: #f3f4f6; }
    .pagina { max-width: 1120px; margin: 0 auto; background: #fff; min-height: 100vh; padding: 24px; }
    .barra-acoes { display: flex; gap: 10px; justify-content: flex-end; margin-bottom: 14px; }
    .barra-acoes button { border: none; background: #111; color: #FFE600; font-weight: 800; border-radius: 10px; padding: 10px 14px; cursor: pointer; }
    header { border: 1px solid #e5e7eb; border-top: 7px solid #FFE600; border-radius: 16px; padding: 16px; display: grid; grid-template-columns: 230px 1fr; gap: 18px; align-items: center; margin-bottom: 18px; }
    header img { max-width: 220px; max-height: 80px; object-fit: contain; background: #000; border-radius: 12px; padding: 8px; }
    h1 { margin: 0 0 8px; font-size: 24px; }
    .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 12px; color: #374151; }
    .meta div, .dados-maquina div, .checklist-topo div { border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px; background: #f9fafb; }
    span { display: block; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: .03em; margin-bottom: 3px; }
    strong { color: #111827; }
    .equipamento { page-break-inside: avoid; border: 1px solid #d1d5db; border-radius: 16px; padding: 14px; margin: 18px 0; }
    .equipamento h2 { margin: 0 0 10px; background: #111; color: #FFE600; padding: 10px 12px; border-radius: 10px; font-size: 20px; }
    .dados-maquina { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
    .checklist { page-break-inside: avoid; border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 12px; }
    .checklist-topo { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 10px; }
    .observacao { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
    th { background: #111; color: #FFE600; text-align: left; }
    th, td { border: 1px solid #d1d5db; padding: 7px; vertical-align: top; }
    tr:nth-child(even) td { background: #f9fafb; }
    .status { font-weight: 800; text-align: center; }
    .ok { color: #166534; }
    .nok { color: #991b1b; }
    .na { color: #475569; }
    .fotos { margin-top: 12px; display: grid; gap: 8px; }
    .fotos h4 { margin: 0 0 4px; }
    .foto-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px; page-break-inside: avoid; }
    .foto-card img { display: block; margin-top: 6px; max-width: 100%; max-height: 280px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; }
    .link-foto { word-break: break-all; font-size: 11px; padding: 6px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .sem-dados { color: #6b7280; }
    footer { margin-top: 24px; color: #6b7280; font-size: 11px; text-align: center; }
    @page { size: A4 portrait; margin: 10mm; }
    @media print { body { background: #fff; } .pagina { max-width: none; padding: 0; } .barra-acoes { display: none; } a { color: #111827; text-decoration: none; } }
  </style>
</head>
<body>
  <div class="pagina">
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
    setMensagem(`Relatório gerado com ${checklistsRelatorio.length} checklist(s). Use Imprimir / salvar em PDF.`);
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
              <h1 style={styles.titulo}>Checklist Diário de Empilhadeiras e Paleteiras</h1>
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

        <section style={isMobile ? styles.kpiGridMobile : styles.kpiGrid}>
          <Card titulo="Obrigatórios" valor={equipamentosObrigatorios.length} />
          <Card titulo={`Concluídos ${nomeTurno(turnoSelecionado)}`} valor={concluidosHoje} />
          <Card titulo={`Pendentes ${nomeTurno(turnoSelecionado)}`} valor={pendentesHoje.length} />
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
            <Campo label="Data">
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={styles.input} />
            </Campo>
            <Campo label="Turno">
              <select value={turnoSelecionado} onChange={(e) => setTurnoSelecionado(e.target.value as TurnoCodigo)} style={styles.input}>
                <option value="T1">Turno 1 - 06h</option>
                <option value="T2">Turno 2 - 18h</option>
              </select>
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
                    {e.checklist_obrigatorio === false && <span style={styles.badgeOpcional}>Não obrigatório</span>}
                    {feito && <span style={styles.badgeConcluido}>Feito neste turno</span>}
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
                  {nomeTurno(turnoSelecionado)} | Fotos no Storage e dados no banco.
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

            <div style={styles.botoesLinha}>
              <button onClick={finalizarChecklist} style={styles.botaoPreto}>Finalizar e salvar</button>
            </div>
          </section>
        )}

        {isAdmin && (
          <>
            <section style={styles.box}>
              <h2 style={styles.boxTitulo}>Painel Admin</h2>
              <div style={styles.botoesLinha}>
                <button onClick={exportarResumoCSV} style={styles.botaoPreto}>Exportar resumo CSV</button>
                <button onClick={exportarDetalhadoCSV} style={styles.botaoCinza}>Exportar detalhado CSV</button>
              </div>
              <div style={styles.filtroLinha}>
                {(["TODOS", "AVARIAS", "PENDENTES", "CONCLUIDOS", "RELATORIOS", "CMMS", "AGENDA"] as const).map((f) => (
                  <button key={f} onClick={() => setFiltroAdmin(f)} style={filtroAdmin === f ? styles.filtroAtivo : styles.filtroBotao}>{f}</button>
                ))}
              </div>
            </section>

            {filtroAdmin === "AGENDA" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Calendário de manutenção</h2>
                <p style={styles.textoApoio}>
                  Área exclusiva do ADMIN. Cadastre preventivas ou programações para que o operador veja o aviso ao selecionar o equipamento.
                </p>

                <div style={isMobile ? styles.gridMobile : styles.grid4}>
                  <Card titulo="Programadas" valor={agendaManutencaoAtivaLista.length} />
                  <Card titulo="Atrasadas" valor={agendaAtrasada.length} destaque={agendaAtrasada.length > 0} />
                  <Card titulo="Hoje" valor={agendaHoje.length} destaque={agendaHoje.length > 0} />
                  <Card titulo="Módulo selecionado" valor={agendaEquipamentosDisponiveis.length} />
                </div>

                <section style={styles.boxInternoDestaque}>
                  <h3 style={styles.subtituloSecao}>Nova programação</h3>
                  <div style={isMobile ? styles.gridMobile : styles.grid4}>
                    <Campo label="Módulo">
                      <select value={agendaModulo} onChange={(e) => { setAgendaModulo(e.target.value as ModuloEquipamento); setAgendaTag(""); }} style={styles.input}>
                        <option value="FROTA">Frota</option>
                        <option value="MONOVIA">Monovia / Talha</option>
                        <option value="TODOS">Todos</option>
                      </select>
                    </Campo>
                    <Campo label="Equipamento">
                      <select value={agendaTag} onChange={(e) => setAgendaTag(e.target.value)} style={styles.input}>
                        <option value="">Selecione</option>
                        {agendaEquipamentosDisponiveis.map((e) => (
                          <option key={e.tag} value={e.tag}>{e.tag} - {e.tipo_equipamento}</option>
                        ))}
                      </select>
                    </Campo>
                    <Campo label="Data programada">
                      <input type="date" value={agendaDataProgramada} onChange={(e) => setAgendaDataProgramada(e.target.value)} style={styles.input} />
                    </Campo>
                    <Campo label="Tipo">
                      <select value={agendaTipo} onChange={(e) => setAgendaTipo(e.target.value)} style={styles.input}>
                        <option>Preventiva</option>
                        <option>Inspeção</option>
                        <option>Corretiva programada</option>
                        <option>Troca programada</option>
                      </select>
                    </Campo>
                  </div>
                  <Campo label="Observação / serviço previsto">
                    <textarea value={agendaDescricao} onChange={(e) => setAgendaDescricao(e.target.value)} style={styles.textarea} placeholder="Ex.: Preventiva geral, lubrificação, inspeção de segurança, revisão de freio..." />
                  </Campo>
                  <div style={styles.botoesLinha}>
                    <button onClick={salvarAgendaManutencao} style={styles.botaoVerde}>Salvar programação</button>
                  </div>
                </section>

                <section style={styles.boxInterno}>
                  <h3 style={styles.subtituloSecao}>Programações ativas</h3>
                  {agendaManutencaoAtivaLista.length === 0 && <p>Nenhuma programação ativa.</p>}
                  <div style={styles.tabelaEquipamentos}>
                    {agendaManutencaoAtivaLista.slice(0, 120).map((ag) => {
                      const alerta = classificarAlertaAgenda(ag);
                      return (
                        <div key={ag.id || `${ag.tag}-${ag.data_programada}`} style={isMobile ? styles.linhaEquipamentoMobile : styles.linhaEquipamento}>
                          <div>
                            <strong>{ag.tag} - {ag.tipo_manutencao}</strong><br />
                            Módulo: {nomeModulo(ag.modulo as ModuloEquipamento)} | Data: {dataISOParaBR(ag.data_programada)} | Status: {ag.status}<br />
                            {ag.descricao || "Sem observação"}
                          </div>
                          <div>
                            <span style={alerta.nivel === "CRITICO" ? styles.badgeAtrasado : styles.badgeAguardando}>{alerta.titulo}</span>
                            <div style={styles.botoesLinha}>
                              <button onClick={() => atualizarStatusAgenda(ag.id, "CONCLUIDO")} style={styles.botaoVerde}>Concluir</button>
                              <button onClick={() => atualizarStatusAgenda(ag.id, "CANCELADO")} style={styles.botaoPerigo}>Cancelar</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </section>
            )}

            {filtroAdmin === "CMMS" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Importar OS do CMMS</h2>
                <p style={styles.textoApoio}>
                  Área exclusiva do ADMIN. Importe o relatório Extrato de Manutenções Amplo em .xls. O app vincula as OS pela TAG do equipamento.
                </p>

                <div style={isMobile ? styles.gridMobile : styles.grid4}>
                  <Card titulo="OS importadas" valor={osCmms.length} />
                  <Card titulo="OS abertas" valor={osCmmsAbertas.length} />
                  <Card titulo="Sem vínculo ativo" valor={osCmmsSemVinculo.length} />
                  <Card titulo="Alertas na frota" valor={tagsComAlertaCmms.size} />
                </div>

                <Campo label="Selecionar arquivo exportado do CMMS">
                  <input type="file" accept=".xls,.html,.htm" onChange={importarArquivoCMMS} style={styles.input} />
                </Campo>

                {resultadoImportacaoCMMS && (
                  <div style={styles.alertaItem}>
                    <strong>Última importação: {resultadoImportacaoCMMS.arquivo}</strong><br />
                    Linhas lidas: {resultadoImportacaoCMMS.total}<br />
                    OS importadas/atualizadas: {resultadoImportacaoCMMS.importadas}<br />
                    Vinculadas ao cadastro atual: {resultadoImportacaoCMMS.vinculadas}<br />
                    Sem vínculo ativo: {resultadoImportacaoCMMS.semVinculo}
                  </div>
                )}

                <section style={styles.boxInterno}>
                  <h3 style={styles.subtituloSecao}>OS abertas / pendentes importadas</h3>
                  {osCmmsAbertas.length === 0 && <p>Nenhuma OS aberta importada.</p>}
                  <div style={styles.tabelaEquipamentos}>
                    {osCmmsAbertas.slice(0, 60).map((os) => {
                      const alerta = classificarAlertaCmms(os);
                      return (
                        <div key={`${os.num_os}-${os.tag}`} style={isMobile ? styles.linhaEquipamentoMobile : styles.linhaEquipamento}>
                          <div>
                            <strong>{os.tag} - OS {os.num_os}</strong><br />
                            {alerta.titulo} | {os.tipo_manut || "Tipo não informado"} | Status: {os.status || "Não informado"}<br />
                            Data programada: {os.dt_progr || "Não informada"}<br />
                            Descrição: {os.descricao || os.desc_codigo_parada || "Sem descrição"}
                          </div>
                          <span style={alerta.nivel === "CRITICO" ? styles.badgeAtrasado : styles.badgeAguardando}>{alerta.titulo}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section style={styles.boxInterno}>
                  <h3 style={styles.subtituloSecao}>OS sem vínculo com equipamento ativo</h3>
                  <p style={styles.textoApoio}>Isso é esperado quando importar histórico antigo ou equipamentos que não existem mais no app.</p>
                  {osCmmsSemVinculo.length === 0 && <p>Nenhuma OS sem vínculo.</p>}
                  <div style={styles.tabelaEquipamentos}>
                    {osCmmsSemVinculo.slice(0, 40).map((os) => (
                      <div key={`${os.num_os}-${os.tag}`} style={isMobile ? styles.linhaEquipamentoMobile : styles.linhaEquipamento}>
                        <div>
                          <strong>{os.tag} - OS {os.num_os}</strong><br />
                          Equipamento CMMS: {os.equipamento_texto}<br />
                          Tipo: {os.tipo_manut || "Não informado"} | Status: {os.status || "Não informado"}<br />
                          Descrição: {os.descricao || os.desc_codigo_parada || "Sem descrição"}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </section>
            )}

            {filtroAdmin === "RELATORIOS" && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Relatório de Checklist de Equipamentos</h2>
                <p style={styles.textoApoio}>
                  Relatório exclusivo do perfil ADMIN. Selecione o período e os equipamentos para gerar um único relatório com os checklists registrados.
                </p>

                <div style={isMobile ? styles.gridMobile : styles.grid4}>
                  <Campo label="Data inicial">
                    <input type="date" value={relatorioDataInicio} onChange={(e) => setRelatorioDataInicio(e.target.value)} style={styles.input} />
                  </Campo>
                  <Campo label="Data final">
                    <input type="date" value={relatorioDataFim} onChange={(e) => setRelatorioDataFim(e.target.value)} style={styles.input} />
                  </Campo>
                  <Campo label="Turno">
                    <select value={relatorioTurno} onChange={(e) => setRelatorioTurno(e.target.value as "TODOS" | TurnoCodigo)} style={styles.input}>
                      <option value="TODOS">Todos</option>
                      <option value="T1">Turno 1 - 06h</option>
                      <option value="T2">Turno 2 - 18h</option>
                    </select>
                  </Campo>
                  <Campo label="Fotos">
                    <select value={relatorioIncluirFotos ? "SIM" : "NAO"} onChange={(e) => setRelatorioIncluirFotos(e.target.value === "SIM")} style={styles.input}>
                      <option value="NAO">Período: mostrar somente links</option>
                      <option value="SIM">Período: incluir fotos no PDF</option>
                    </select>
                    <small style={styles.textoApoio}>Se for somente um dia, as fotos entram automaticamente.</small>
                  </Campo>
                </div>

                <Campo label="Buscar equipamento">
                  <input value={relatorioBuscaEquipamento} onChange={(e) => setRelatorioBuscaEquipamento(e.target.value)} placeholder="Ex.: PLE 12, PLE 80, PLE 100, área, modelo..." style={styles.input} />
                </Campo>

                <div style={styles.botoesLinha}>
                  <button onClick={selecionarTodosEquipamentosRelatorio} style={styles.botaoCinza}>Selecionar lista filtrada</button>
                  <button onClick={limparSelecaoRelatorio} style={styles.botaoCinza}>Limpar seleção</button>
                  <button onClick={gerarRelatorioChecklistPDF} style={styles.botaoPreto}>Gerar relatório PDF</button>
                </div>

                <p style={styles.textoApoio}>Selecionados: {relatorioTagsSelecionadas.length ? relatorioTagsSelecionadas.join(", ") : "nenhum equipamento selecionado"}</p>

                <div style={isMobile ? styles.listaEquipamentosMobile : styles.listaEquipamentos}>
                  {equipamentosRelatorioFiltrados.map((e) => {
                    const selecionado = relatorioTagsSelecionadas.includes(e.tag);
                    return (
                      <button key={e.tag} onClick={() => alternarEquipamentoRelatorio(e.tag)} style={{ ...styles.cardSelecao, border: selecionado ? "2px solid #111111" : "1px solid #e2e8f0", background: selecionado ? "#fef9c3" : "white" }}>
                        <strong style={styles.tagMini}>{e.tag}</strong>
                        <span>{e.tipo_equipamento}</span>
                        <small>{e.modelo || "Modelo não informado"} | {e.area || "Área não informada"}</small>
                        <strong>{selecionado ? "Selecionado" : "Selecionar"}</strong>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <section style={styles.box}>
              <h2 style={styles.boxTitulo}>Resumo por turno</h2>
              <div style={isMobile ? styles.kpiGridMobile : styles.kpiGrid}>
                <Card titulo="T1 - Feitos" valor={checklistsT1.length} />
                <Card titulo="T1 - Pendentes" valor={pendentesT1.length} />
                <Card titulo="T2 - Feitos" valor={checklistsT2.length} />
                <Card titulo="T2 - Pendentes" valor={pendentesT2.length} />
              </div>
              <div style={isMobile ? styles.gridMobile : styles.grid2}>
                <div style={styles.alertaItem}>
                  <strong>Turno 1 - 06h</strong><br />
                  Obrigatórios: {equipamentosObrigatorios.length}<br />
                  Concluídos: {checklistsT1.length}<br />
                  Pendentes: {pendentesT1.length}<br />
                  Avarias: {avariasT1.length}
                </div>
                <div style={styles.alertaItem}>
                  <strong>Turno 2 - 18h</strong><br />
                  Obrigatórios: {equipamentosObrigatorios.length}<br />
                  Concluídos: {checklistsT2.length}<br />
                  Pendentes: {pendentesT2.length}<br />
                  Avarias: {avariasT2.length}
                </div>
              </div>
            </section>

            {(filtroAdmin === "TODOS" || filtroAdmin === "AVARIAS") && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Máquinas com avaria na data</h2>
                {comAvariaHoje.length === 0 && <p>Nenhuma avaria registrada.</p>}
                {comAvariaHoje.map((c) => (
                  <div key={c.id} style={styles.alertaItem}>
                    <strong>{c.tag} - {c.resultado_final}</strong><br />
                    {c.tipo_equipamento} | Modelo: {c.modelo || "Não informado"}<br />
                    Situação: {c.situacao_equipamento}<br />
                    Área: {c.area}<br />
                    Operador: {c.operador_nome} | Horário: {c.hora_checklist || ""}<br />
                    {c.horimetro && <>Horímetro: {c.horimetro}<br /></>}
                    <ul>
                      {respostasBanco.filter((r) => r.checklist_id === c.id && r.status === "NÃO OK").map((r) => (
                        <li key={r.id}>{r.item_descricao} - {r.observacao}</li>
                      ))}
                    </ul>
                    <div style={styles.previewLinha}>
                      {c.foto_evidencia_url && <a href={c.foto_evidencia_url} target="_blank" style={styles.linkFoto}>Abrir foto da evidência</a>}
                      {c.foto_horimetro_url && <a href={c.foto_horimetro_url} target="_blank" style={styles.linkFoto}>Abrir foto do horímetro</a>}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {(filtroAdmin === "TODOS" || filtroAdmin === "PENDENTES") && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Pendentes obrigatórios - {nomeTurno(turnoSelecionado)}</h2>
                <div style={isMobile ? styles.pendentesGridMobile : styles.pendentesGrid}>
                  {pendentesHoje.map((e) => (
                    <div key={e.tag} style={styles.pendenteItem}>
                      <strong>{e.tag}</strong><br />
                      {e.tipo_equipamento}<br />
                      <small>{e.area}</small><br />
                      <span style={horaAtual >= 10 ? styles.badgeAtrasado : styles.badgeAguardando}>{horaAtual >= 10 ? "Pendente após 10h" : "Pendente"}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section style={styles.box}>
              <h2 style={styles.boxTitulo}>Itens N/A para validação</h2>
              {sugestoesNA.length === 0 && <p>Nenhum item N/A registrado.</p>}
              {sugestoesNA.map((s) => (
                <div key={s.key} style={styles.naCard}>
                  <strong>Modelo: {s.modeloLabel}</strong><br />
                  Item: {s.itemDescricao}<br />
                  Ocorrências: {s.totalOcorrencias}<br />
                  Observações:
                  <ul>{s.observacoes.map((o: string, idx: number) => <li key={idx}>{o}</li>)}</ul>
                  {s.decisao ? (
                    <div style={styles.decisaoBox}>Decisão: <strong>{s.decisao.decisao}</strong></div>
                  ) : (
                    <div style={styles.botoesLinha}>
                      <button onClick={() => decidirNA(s, "REMOVER")} style={styles.botaoVerde}>Retirar dos modelos iguais</button>
                      <button onClick={() => decidirNA(s, "MANTER")} style={styles.botaoCinza}>Manter item</button>
                    </div>
                  )}
                </div>
              ))}
            </section>

            <section style={styles.box}>
              <h2 style={styles.boxTitulo}>Usuários do sistema</h2>
              <p style={styles.textoApoio}>
                Crie, bloqueie e altere perfis de usuários sem e-mail. O próprio operador também pode criar conta na tela inicial.
              </p>

              <div style={isMobile ? styles.gridMobile : styles.grid4}>
                <Campo label="Nome completo">
                  <input value={usuarioAdminNome} onChange={(e) => setUsuarioAdminNome(e.target.value)} placeholder="Nome completo" style={styles.input} />
                </Campo>
                <Campo label="Usuário">
                  <input value={usuarioAdminLogin} onChange={(e) => setUsuarioAdminLogin(normalizarUsuario(e.target.value))} placeholder="Ex.: joao.s" style={styles.input} />
                </Campo>
                <Campo label="Senha">
                  <input value={usuarioAdminSenha} onChange={(e) => setUsuarioAdminSenha(e.target.value)} placeholder="Mínimo 6 caracteres" style={styles.input} />
                </Campo>
                <Campo label="Perfil">
                  <select value={usuarioAdminPerfil} onChange={(e) => setUsuarioAdminPerfil(e.target.value as Perfil)} style={styles.input}>
                    <option value="OPERADOR">OPERADOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </Campo>
              </div>

              <div style={styles.obrigatorioBox}>
                <label style={styles.checkLabel}>
                  <input type="checkbox" checked={usuarioAdminAtivo} onChange={(e) => setUsuarioAdminAtivo(e.target.checked)} />
                  Usuário ativo
                </label>
              </div>

              <div style={styles.botoesLinha}>
                <button onClick={salvarUsuarioAppAdmin} style={styles.botaoVerde}>{usuarioAdminEditando ? "Salvar usuário" : "Criar usuário"}</button>
                <button onClick={limparFormularioUsuarioAdmin} style={styles.botaoCinza}>Limpar</button>
              </div>

              <div style={styles.tabelaEquipamentos}>
                {usuariosApp.map((u) => (
                  <div key={u.usuario} style={isMobile ? styles.linhaEquipamentoMobile : styles.linhaEquipamento}>
                    <div>
                      <strong>{u.nome}</strong><br />
                      Usuário: {u.usuario} | Perfil: {u.perfil}<br />
                      <span style={u.ativo === false ? styles.badgeOpcional : styles.badgeObrigatorio}>
                        {u.ativo === false ? "Bloqueado" : "Ativo"}
                      </span>
                    </div>
                    <div style={styles.botoesLinha}>
                      <button onClick={() => editarUsuarioApp(u)} style={styles.botaoCinza}>Editar</button>
                      <button onClick={() => alternarUsuarioAtivo(u)} style={u.ativo === false ? styles.botaoVerde : styles.botaoPerigo}>
                        {u.ativo === false ? "Ativar" : "Bloquear"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.box}>
              <h2 style={styles.boxTitulo}>Configuração do Checklist</h2>
              <p style={styles.textoApoio}>
                Configure os itens do checklist direto pelo app. Você pode retirar um item para todos os equipamentos
                ou retirar apenas para todos os equipamentos do mesmo modelo.
              </p>

              <div style={isMobile ? styles.gridMobile : styles.grid2}>
                <Campo label="Número do item">
                  <input
                    value={itemChecklistNumero}
                    onChange={(e) => setItemChecklistNumero(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ex.: 16"
                    style={styles.input}
                  />
                </Campo>

                <Campo label={itemChecklistEditando ? `Editando item ${itemChecklistEditando}` : "Descrição do item"}>
                  <input
                    value={itemChecklistDescricao}
                    onChange={(e) => setItemChecklistDescricao(e.target.value)}
                    placeholder="Ex.: Verificar carregador de bateria"
                    style={styles.input}
                  />
                </Campo>
              </div>

              <div style={styles.botoesLinha}>
                <button onClick={salvarItemChecklist} style={styles.botaoVerde}>
                  {itemChecklistEditando ? "Salvar alteração do item" : "Adicionar item"}
                </button>
                <button onClick={limparFormularioItemChecklist} style={styles.botaoCinza}>
                  Limpar
                </button>
              </div>

              <section style={styles.boxInternoDestaque}>
                <h3 style={styles.subtituloSecao}>Retirada por modelo</h3>
                <p style={styles.textoApoio}>
                  Se você selecionar um modelo e clicar em “Retirar deste modelo”, o item some do checklist
                  de todos os equipamentos com o mesmo modelo.
                </p>
                <Campo label="Modelo para retirada específica">
                  <select value={modeloConfigSelecionado} onChange={(e) => setModeloConfigSelecionado(e.target.value)} style={styles.input}>
                    <option value="">Selecione um modelo</option>
                    {modelosDisponiveis.map((m) => (
                      <option key={m.chave} value={m.chave}>{m.label}</option>
                    ))}
                  </select>
                </Campo>
              </section>

              <div style={styles.tabelaEquipamentos}>
                {[...itensConfig].sort((a, b) => a.numero - b.numero).map((item) => (
                  <div key={item.numero} style={isMobile ? styles.linhaEquipamentoMobile : styles.linhaEquipamento}>
                    <div>
                      <strong>{item.numero}. {item.descricao}</strong><br />
                      <span style={item.ativo === false ? styles.badgeOpcional : styles.badgeObrigatorio}>
                        {item.ativo === false ? "Inativo geral / retirado de todos" : "Ativo geral"}
                      </span>
                    </div>
                    <div style={styles.botoesLinha}>
                      <button onClick={() => editarItemChecklist(item)} style={styles.botaoCinza}>Editar</button>
                      {item.ativo === false ? (
                        <button onClick={() => alterarAtivoItemChecklist(item, true)} style={styles.botaoVerde}>Reativar geral</button>
                      ) : (
                        <button onClick={() => alterarAtivoItemChecklist(item, false)} style={styles.botaoPerigo}>Retirar de todos</button>
                      )}
                      <button onClick={() => retirarItemPorModelo(item)} style={styles.botaoPreto}>Retirar deste modelo</button>
                    </div>
                  </div>
                ))}
              </div>

              <section style={styles.boxInterno}>
                <h3 style={styles.subtituloSecao}>Itens retirados por modelo</h3>
                {itensRetiradosPorModelo.length === 0 && <p>Nenhum item retirado por modelo.</p>}
                {itensRetiradosPorModelo.map((d) => (
                  <div key={`${d.modelo_chave}-${d.item_numero}`} style={isMobile ? styles.linhaEquipamentoMobile : styles.linhaEquipamento}>
                    <div>
                      <strong>Modelo: {d.modelo_label}</strong><br />
                      Item {d.item_numero}: {d.item_descricao}
                    </div>
                    <button onClick={() => reativarItemPorModelo(d)} style={styles.botaoVerde}>Reativar neste modelo</button>
                  </div>
                ))}
              </section>
            </section>

            <section style={styles.box}>
              <h2 style={styles.boxTitulo}>Máquinas paradas / reserva</h2>
              {paradasManutencao.length === 0 && <p>Nenhuma máquina parada aguardando ação.</p>}
              {paradasManutencao.map((p) => {
                const inicio = new Date(`${p.data_inicio}T${p.hora_inicio || "00:00:00"}`);
                const horas = Math.max(0, (Date.now() - inicio.getTime()) / 3600000);

                return (
                  <div key={p.id} style={styles.alertaItem}>
                    <strong>{p.tag_original} - OS {p.numero_os}</strong><br />
                    Status: {p.status}<br />
                    Motivo: {p.motivo}<br />
                    Operador: {p.operador_nome}<br />
                    Afeta operação: {p.afeta_operacao ? "SIM" : "NÃO"}<br />
                    Tempo parado atual: {horas.toFixed(1)} h<br />
                    {p.tag_reserva && <>Reserva definida: {p.tag_reserva}<br /></>}

                    {p.afeta_operacao && p.status === "AGUARDANDO_RESERVA" && (
                      <div style={styles.botoesLinha}>
                        <select value={tagReservaSelecionada} onChange={(e) => setTagReservaSelecionada(e.target.value)} style={styles.input}>
                          <option value="">Selecionar equipamento reserva</option>
                          {equipamentosReservaDisponiveis.map((e) => (
                            <option key={e.tag} value={e.tag}>{e.tag} - {e.tipo_equipamento} - {e.area}</option>
                          ))}
                        </select>
                        <input value={observacaoAdminParada} onChange={(e) => setObservacaoAdminParada(e.target.value)} placeholder="Observação do analista" style={styles.input} />
                        <button onClick={() => definirReserva(p)} style={styles.botaoVerde}>Definir reserva</button>
                      </div>
                    )}

                    <div style={styles.botoesLinha}>
                      <button onClick={() => finalizarParada(p)} style={styles.botaoPreto}>Finalizar manutenção / reativar checklist</button>
                    </div>
                  </div>
                );
              })}
            </section>

            <section style={styles.box}>
              <h2 style={styles.boxTitulo}>Cadastro e edição de equipamentos</h2>
              <Campo label="Buscar cadastro">
                <input value={buscaCadastro} onChange={(e) => setBuscaCadastro(e.target.value)} placeholder="TAG, modelo, área..." style={styles.input} />
              </Campo>

              {buscaCadastro && (
                <div style={styles.tabelaEquipamentos}>
                  {equipamentosCadastroFiltrados.map((e) => (
                    <div key={e.tag} style={isMobile ? styles.linhaEquipamentoMobile : styles.linhaEquipamento}>
                      <div>
                        <strong>{e.tag}</strong><br />
                        {e.tipo_equipamento} | Modelo: {e.modelo || "Não informado"}<br />
                        <small>{e.local_correto} - {e.area}</small><br />
                        <span style={e.checklist_obrigatorio === false ? styles.badgeOpcional : styles.badgeObrigatorio}>{e.checklist_obrigatorio === false ? "Não obrigatório" : "Obrigatório"}</span>
                      </div>
                      <button onClick={() => { setEditandoTag(e.tag); setEquipamentoEdicao({ ...e }); }} style={styles.botaoCinza}>Editar</button>
                    </div>
                  ))}
                </div>
              )}

              <h3>{editandoTag ? `Editando ${editandoTag}` : "Novo cadastro"}</h3>
              <div style={isMobile ? styles.gridMobile : styles.grid3}>
                <Campo label="TAG"><input value={equipamentoEdicao.tag} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, tag: e.target.value })} style={styles.input} /></Campo>
                <Campo label="Tipo de equipamento"><input value={equipamentoEdicao.tipo_equipamento} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, tipo_equipamento: e.target.value })} style={styles.input} /></Campo>
                <Campo label="Módulo">
                  <select value={moduloDoEquipamento(equipamentoEdicao)} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, modulo: e.target.value as ModuloEquipamento })} style={styles.input}>
                    <option value="FROTA">Frota</option>
                    <option value="MONOVIA">Monovia / Talha</option>
                  </select>
                </Campo>
                <Campo label="Modelo"><input value={equipamentoEdicao.modelo || ""} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, modelo: e.target.value })} style={styles.input} /></Campo>
                <Campo label="Nº série"><input value={equipamentoEdicao.numero_serie || ""} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, numero_serie: e.target.value })} style={styles.input} /></Campo>
                <Campo label="Local"><input value={equipamentoEdicao.local_correto || ""} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, local_correto: e.target.value })} style={styles.input} /></Campo>
                <Campo label="Área"><input value={equipamentoEdicao.area || ""} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, area: e.target.value })} style={styles.input} /></Campo>
                <Campo label="Supervisor"><input value={equipamentoEdicao.supervisor_responsavel || ""} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, supervisor_responsavel: e.target.value })} style={styles.input} /></Campo>
                <Campo label="E-mail supervisor"><input value={equipamentoEdicao.email_supervisor || ""} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, email_supervisor: e.target.value })} style={styles.input} /></Campo>
                <Campo label="WhatsApp supervisor"><input value={equipamentoEdicao.whatsapp_supervisor || ""} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, whatsapp_supervisor: e.target.value })} style={styles.input} /></Campo>
              </div>
              <div style={styles.obrigatorioBox}>
                <label style={styles.checkLabel}>
                  <input type="checkbox" checked={equipamentoEdicao.checklist_obrigatorio !== false} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, checklist_obrigatorio: e.target.checked })} />
                  Checklist diário obrigatório
                </label>
              </div>
              <div style={styles.botoesLinha}>
                <button onClick={salvarEquipamento} style={styles.botaoVerde}>{editandoTag ? "Salvar alteração" : "Cadastrar equipamento"}</button>
                <button onClick={() => { setEquipamentoEdicao(equipamentoVazio); setEditandoTag(""); }} style={styles.botaoCinza}>Limpar</button>
              </div>
            </section>
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
};
