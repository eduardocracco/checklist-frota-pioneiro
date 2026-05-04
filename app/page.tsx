"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";

const SUPABASE_URL = "https://wndajcdtcfsuorvjqtbh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZGFqY2R0Y2ZzdW9ydmpxdGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAwMDgsImV4cCI6MjA5MzE0NjAwOH0.Sybmebm4eDuGJXIDZG6YZitycGu-oEwBBmsgU3Hr_dI";

const PIN_ADMIN = "1234";
const PIN_OPERADOR = "0000";

type Perfil = "OPERADOR" | "ADMIN";
type StatusItem = "OK" | "NÃO OK" | "N/A" | "";

type Equipamento = {
  id?: string;
  tag: string;
  tipo?: string;
  tipo_equipamento: string;
  modelo?: string;
  numero_serie?: string;
  local_correto?: string;
  area?: string;
  checklist_obrigatorio: boolean;
  ativo: boolean;
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
  operador_nome: string;
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
  observacao_admin?: string;
  criado_em?: string;
};

const equipamentoVazio: Equipamento = {
  tag: "",
  tipo: "NOVA",
  tipo_equipamento: "",
  modelo: "",
  numero_serie: "",
  local_correto: "",
  area: "",
  checklist_obrigatorio: true,
  ativo: true,
  supervisor_responsavel: "",
  email_supervisor: "",
  whatsapp_supervisor: "",
  origem: "Cadastro manual",
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

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
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

function baixarArquivo(nome: string, conteudo: string) {
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

function montarRespostasPadrao(itens: ChecklistItemPadrao[], removidos: number[] = []): RespostaItem[] {
  return itens
    .filter((i) => i.ativo !== false && !removidos.includes(i.numero))
    .sort((a, b) => a.numero - b.numero)
    .map((i) => ({
      item_numero: i.numero,
      item_descricao: i.descricao,
      status: "",
      observacao: "",
    }));
}

function lerArquivoComoBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [perfil, setPerfil] = useState<Perfil>("OPERADOR");
  const [autenticado, setAutenticado] = useState(false);
  const [pin, setPin] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [itensPadrao, setItensPadrao] = useState<ChecklistItemPadrao[]>(itensFallback);
  const [checklists, setChecklists] = useState<ChecklistRegistro[]>([]);
  const [respostasBanco, setRespostasBanco] = useState<RespostaBanco[]>([]);
  const [decisoesNA, setDecisoesNA] = useState<DecisaoNA[]>([]);

  const [operador, setOperador] = useState("");
  const [data, setData] = useState(hojeISO());
  const [area, setArea] = useState("TODAS");
  const [busca, setBusca] = useState("");
  const [buscaCadastro, setBuscaCadastro] = useState("");
  const [tagSelecionada, setTagSelecionada] = useState("");
  const [telaOperador, setTelaOperador] = useState<"LISTA" | "CHECKLIST">("LISTA");

  const [respostas, setRespostas] = useState<RespostaItem[]>(montarRespostasPadrao(itensFallback));
  const [situacaoEquipamento, setSituacaoEquipamento] = useState("EM OPERAÇÃO");
  const [observacaoGeral, setObservacaoGeral] = useState("");
  const [horimetroLeitura, setHorimetroLeitura] = useState("");
  const [confirmacaoOperador, setConfirmacaoOperador] = useState(false);
  const [fotoEvidencia, setFotoEvidencia] = useState("");
  const [fotoHorimetro, setFotoHorimetro] = useState("");

  const [equipamentoEdicao, setEquipamentoEdicao] = useState<Equipamento>(equipamentoVazio);
  const [editandoTag, setEditandoTag] = useState("");
  const [filtroAdmin, setFiltroAdmin] = useState<"TODOS" | "AVARIAS" | "PENDENTES" | "CONCLUIDOS">("TODOS");

  async function carregarDados() {
    setCarregando(true);
    setMensagem("");

    try {
      const [eqs, itens, chks, resps, decs] = await Promise.all([
        supabaseRequest<Equipamento[]>("equipamentos?select=*&order=tag.asc"),
        supabaseRequest<ChecklistItemPadrao[]>("checklist_itens_padrao?select=numero,descricao,ativo&ativo=eq.true&order=numero.asc"),
        supabaseRequest<ChecklistRegistro[]>("checklists?select=*&order=criado_em.desc&limit=1000"),
        supabaseRequest<RespostaBanco[]>("checklist_respostas?select=*&order=item_numero.asc&limit=5000"),
        supabaseRequest<DecisaoNA[]>("decisoes_na?select=*&order=criado_em.desc"),
      ]);

      setEquipamentos(eqs);
      setItensPadrao(itens.length ? itens : itensFallback);
      setChecklists(chks);
      setRespostasBanco(resps);
      setDecisoesNA(decs);
    } catch (err: any) {
      setMensagem(`Erro ao carregar Supabase: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    function atualizarMobile() {
      setIsMobile(window.innerWidth <= 820);
    }

    atualizarMobile();
    window.addEventListener("resize", atualizarMobile);
    return () => window.removeEventListener("resize", atualizarMobile);
  }, []);

  useEffect(() => {
    const operadorSalvo = localStorage.getItem("operador_checklist_empilhadeiras");
    if (operadorSalvo) setOperador(operadorSalvo);
    carregarDados();
  }, []);

  useEffect(() => {
    localStorage.setItem("operador_checklist_empilhadeiras", operador);
  }, [operador]);

  const areas = useMemo(() => {
    return ["TODAS", ...Array.from(new Set(equipamentos.map((e) => e.area || "LOCAL A DEFINIR"))).sort()];
  }, [equipamentos]);

  const equipamentosFiltrados = useMemo(() => {
    return equipamentos.filter((e) => {
      const passaArea = area === "TODAS" || e.area === area;
      const texto = `${e.tag} ${e.tipo_equipamento} ${e.modelo || ""} ${e.numero_serie || ""} ${e.local_correto || ""} ${e.area || ""}`;
      return passaArea && normalizar(texto).includes(normalizar(busca));
    });
  }, [equipamentos, area, busca]);

  const equipamentosCadastroFiltrados = useMemo(() => {
    const termo = normalizar(buscaCadastro);
    if (!termo) return [];
    return equipamentos
      .filter((e) => {
        const texto = `${e.tag} ${e.tipo_equipamento} ${e.modelo || ""} ${e.numero_serie || ""} ${e.local_correto || ""} ${e.area || ""}`;
        return normalizar(texto).includes(termo);
      })
      .slice(0, 20);
  }, [equipamentos, buscaCadastro]);

  const equipamentoSelecionado = equipamentos.find((e) => e.tag === tagSelecionada) || null;

  const checklistsDoDia = checklists.filter((c) => c.data_checklist === data);
  const tagsFeitasHoje = new Set(checklistsDoDia.map((c) => normalizar(c.tag)));
  const equipamentosObrigatorios = equipamentos.filter((e) => e.ativo !== false && e.checklist_obrigatorio !== false);
  const pendentesHoje = equipamentosObrigatorios.filter((e) => !tagsFeitasHoje.has(normalizar(e.tag)));
  const concluidosHoje = checklistsDoDia.filter((c) => equipamentosObrigatorios.some((e) => normalizar(e.tag) === normalizar(c.tag))).length;
  const comAvariaHoje = checklistsDoDia.filter((c) => c.resultado_final === "COM AVARIA");
  const horaAtual = new Date().getHours();

  const itemIdsRemovidosModelo = useMemo(() => {
    if (!equipamentoSelecionado) return [];
    const chave = modeloChave(equipamentoSelecionado);
    return decisoesNA.filter((d) => d.modelo_chave === chave && d.decisao === "REMOVER").map((d) => d.item_numero);
  }, [equipamentoSelecionado, decisoesNA]);

  const sugestoesNA = useMemo(() => {
    const mapa = new Map<string, {
      key: string;
      modeloKey: string;
      modeloLabel: string;
      itemNumero: number;
      itemDescricao: string;
      totalOcorrencias: number;
      observacoes: string[];
      decisao?: DecisaoNA;
    }>();

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

        const item = mapa.get(key)!;
        item.totalOcorrencias += 1;
        item.decisao = decisao;
        if (resp.observacao && !item.observacoes.includes(resp.observacao)) item.observacoes.push(resp.observacao);
      });
    });

    return Array.from(mapa.values()).sort((a, b) => a.modeloLabel.localeCompare(b.modeloLabel));
  }, [checklists, respostasBanco, decisoesNA]);

  function entrarNoPerfil() {
    const esperado = perfil === "ADMIN" ? PIN_ADMIN : PIN_OPERADOR;
    if (pin === esperado) {
      setAutenticado(true);
      setMensagem("");
    } else {
      setMensagem("PIN incorreto.");
    }
  }

  function sair() {
    setAutenticado(false);
    setPin("");
    setTelaOperador("LISTA");
    setMensagem("");
  }

  function resetarChecklist(removidos: number[] = itemIdsRemovidosModelo) {
    setRespostas(montarRespostasPadrao(itensPadrao, removidos));
    setSituacaoEquipamento("EM OPERAÇÃO");
    setObservacaoGeral("");
    setHorimetroLeitura("");
    setConfirmacaoOperador(false);
    setFotoEvidencia("");
    setFotoHorimetro("");
  }

  function selecionarEquipamento(tag: string) {
    const equipamento = equipamentos.find((e) => e.tag === tag) || null;
    const removidos = equipamento
      ? decisoesNA.filter((d) => d.modelo_chave === modeloChave(equipamento) && d.decisao === "REMOVER").map((d) => d.item_numero)
      : [];

    setTagSelecionada(tag);
    setTelaOperador("CHECKLIST");
    setMensagem("");

    const existente = checklists.find((c) => c.data_checklist === data && c.tag === tag);
    if (existente?.id) {
      setSituacaoEquipamento(existente.situacao_equipamento || "EM OPERAÇÃO");
      setObservacaoGeral(existente.observacao_geral || "");
      setHorimetroLeitura(existente.horimetro || "");
      setConfirmacaoOperador(existente.confirmacao_operador || false);
      setFotoEvidencia(existente.foto_evidencia_url || "");
      setFotoHorimetro(existente.foto_horimetro_url || "");

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
      atuais.map((r) =>
        r.item_numero === itemNumero
          ? { ...r, status, observacao: status === "OK" ? "" : r.observacao }
          : r
      )
    );
  }

  function alterarObservacaoItem(itemNumero: number, observacao: string) {
    setRespostas((atuais) => atuais.map((r) => (r.item_numero === itemNumero ? { ...r, observacao } : r)));
  }

  async function carregarFoto(evento: React.ChangeEvent<HTMLInputElement>, tipo: "EVIDENCIA" | "HORIMETRO") {
    const file = evento.target.files?.[0];
    if (!file) return;
    const base64 = await lerArquivoComoBase64(file);
    if (tipo === "EVIDENCIA") setFotoEvidencia(base64);
    if (tipo === "HORIMETRO") setFotoHorimetro(base64);
    evento.target.value = "";
  }

  async function finalizarChecklist() {
    setMensagem("");

    if (!operador.trim()) return setMensagem("Informe o nome completo do operador/supervisor.");
    if (!equipamentoSelecionado) return setMensagem("Selecione um equipamento.");
    if (respostas.some((r) => !r.status)) return setMensagem("Responda todos os itens do checklist.");

    const naoOkSemObs = respostas.filter((r) => r.status === "NÃO OK" && !r.observacao.trim());
    if (naoOkSemObs.length) return setMensagem("Todo item NÃO OK precisa de observação da avaria.");

    const naSemObs = respostas.filter((r) => r.status === "N/A" && !r.observacao.trim());
    if (naSemObs.length) return setMensagem("Todo N/A precisa de observação para validação do Admin.");

    if (ehEquipamentoEletrico(equipamentoSelecionado) && !horimetroLeitura.trim()) {
      return setMensagem("Para equipamento elétrico, informe a leitura/descrição do horímetro.");
    }

    if (!confirmacaoOperador) return setMensagem("Marque a confirmação final do operador.");

    const situacaoAlerta = situacaoEquipamento !== "EM OPERAÇÃO" && situacaoEquipamento !== "PARADO NA ÁREA";
    const resultado = respostas.some((r) => r.status === "NÃO OK") || situacaoAlerta ? "COM AVARIA" : "CONFORME";

    const payload: ChecklistRegistro = {
      data_checklist: data,
      operador_nome: operador.trim(),
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
      foto_evidencia_url: fotoEvidencia,
      foto_horimetro_url: fotoHorimetro,
      confirmacao_operador: true,
    };

    try {
      setCarregando(true);
      const salvo = await supabaseRequest<ChecklistRegistro[]>("checklists?on_conflict=tag,data_checklist", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(payload),
      });

      const checklistId = salvo[0]?.id;
      if (!checklistId) throw new Error("Não retornou ID do checklist.");

      await supabaseRequest<null>(`checklist_respostas?checklist_id=eq.${checklistId}`, { method: "DELETE" });

      const respostasPayload = respostas.map((r) => ({
        checklist_id: checklistId,
        item_numero: r.item_numero,
        item_descricao: r.item_descricao,
        status: r.status,
        observacao: r.observacao,
      }));

      await supabaseRequest<RespostaBanco[]>("checklist_respostas", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(respostasPayload),
      });

      await carregarDados();
      setMensagem(`Checklist da ${equipamentoSelecionado.tag} finalizado: ${resultado}.`);
      setTelaOperador("LISTA");
    } catch (err: any) {
      setMensagem(`Erro ao salvar checklist: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function salvarEquipamento() {
    setMensagem("");

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
      setMensagem(`Cadastro ${payload.tag} salvo no Supabase.`);
    } catch (err: any) {
      setMensagem(`Erro ao salvar cadastro: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  function iniciarEdicao(e: Equipamento) {
    setEditandoTag(e.tag);
    setEquipamentoEdicao({ ...e });
    setMensagem("");
  }

  async function decidirNA(s: { modeloKey: string; modeloLabel: string; itemNumero: number; itemDescricao: string }, decisao: "REMOVER" | "MANTER") {
    const payload = {
      modelo_chave: s.modeloKey,
      modelo_label: s.modeloLabel,
      item_numero: s.itemNumero,
      item_descricao: s.itemDescricao,
      decisao,
    };

    try {
      setCarregando(true);
      await supabaseRequest<DecisaoNA[]>("decisoes_na?on_conflict=modelo_chave,item_numero", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(payload),
      });
      await carregarDados();
    } catch (err: any) {
      setMensagem(`Erro ao salvar decisão N/A: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  function exportarResumoCSV() {
    const cabecalho = ["DATA", "HORA", "OPERADOR", "TAG", "EQUIPAMENTO", "MODELO", "AREA", "SITUACAO", "RESULTADO", "HORIMETRO", "OBSERVACAO"];
    const linhas = checklists.map((r) => [
      r.data_checklist,
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
    ]);

    const csv = [cabecalho, ...linhas].map((linha) => linha.map((v) => `"${String(v || "").replaceAll('"', '""')}"`).join(";")).join("\n");
    baixarArquivo(`resumo_checklists_${data}.csv`, csv);
  }

  function exportarDetalhadoCSV() {
    const cabecalho = ["DATA", "OPERADOR", "TAG", "MODELO", "AREA", "RESULTADO_FINAL", "ITEM", "STATUS_ITEM", "OBSERVACAO_ITEM"];
    const linhas = checklists.flatMap((c) =>
      respostasBanco
        .filter((r) => r.checklist_id === c.id)
        .map((r) => [c.data_checklist, c.operador_nome, c.tag, c.modelo || "", c.area || "", c.resultado_final, r.item_descricao, r.status, r.observacao || ""])
    );
    const csv = [cabecalho, ...linhas].map((linha) => linha.map((v) => `"${String(v || "").replaceAll('"', '""')}"`).join(";")).join("\n");
    baixarArquivo(`checklists_detalhado_${data}.csv`, csv);
  }

  if (!autenticado) {
    return (
      <main style={{ ...styles.main, display: "grid", placeItems: "center" }}>
        <div style={styles.loginBox}>
          <div style={styles.loginMarca}>
            <img src="/logo.png" alt="Logo Baterias Pioneiro" style={styles.logoLogin} onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div>
              <h1 style={{ margin: 0 }}>Checklist Diário</h1>
              <p>Selecione o perfil e informe o PIN de acesso.</p>
            </div>
          </div>

          <div style={styles.perfilBoxClaro}>
            <button onClick={() => { setPerfil("OPERADOR"); setPin(""); setMensagem(""); }} style={perfil === "OPERADOR" ? styles.perfilAtivoClaro : styles.perfilBotaoClaro}>Operador</button>
            <button onClick={() => { setPerfil("ADMIN"); setPin(""); setMensagem(""); }} style={perfil === "ADMIN" ? styles.perfilAtivoClaro : styles.perfilBotaoClaro}>Admin</button>
          </div>

          <Campo label={`PIN ${perfil === "ADMIN" ? "Admin" : "Operador"}`}>
            <input value={pin} onChange={(e) => setPin(e.target.value)} type="password" placeholder="Digite o PIN" style={styles.input} onKeyDown={(e) => { if (e.key === "Enter") entrarNoPerfil(); }} />
          </Campo>

          <button onClick={entrarNoPerfil} style={styles.botaoPreto}>Entrar</button>
          <div style={styles.loginDica}><strong>PIN teste:</strong> Operador 0000 | Admin 1234</div>
          {mensagem && <p style={styles.msgErro}>{mensagem}</p>}
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
              <p style={styles.subtitulo}>Conectado ao Supabase. Perfil atual: {perfil}</p>
            </div>
          </div>
          <div style={styles.perfilBox}>
            <button onClick={carregarDados} style={styles.perfilBotao}>Atualizar</button>
            <button onClick={sair} style={styles.perfilBotao}>Sair</button>
          </div>
        </section>

        {carregando && <div style={styles.aviso}>Carregando/salvando dados...</div>}
        {mensagem && <div style={mensagem.includes("Erro") || mensagem.includes("PIN") ? styles.avisoErro : styles.aviso}>{mensagem}</div>}

        <section style={isMobile ? styles.kpiGridMobile : styles.kpiGrid}>
          <Card titulo="Obrigatórios" valor={equipamentosObrigatorios.length} />
          <Card titulo="Concluídos na data" valor={concluidosHoje} />
          <Card titulo="Pendentes obrigatórios" valor={pendentesHoje.length} />
          <Card titulo="Com avaria" valor={comAvariaHoje.length} destaque={comAvariaHoje.length > 0} />
        </section>

        <section style={styles.box}>
          <h2 style={styles.boxTitulo}>Filtros</h2>
          <div style={isMobile ? styles.gridMobile : styles.grid4}>
            <Campo label="Nome completo do operador/supervisor">
              <input value={operador} onChange={(e) => setOperador(e.target.value)} placeholder="Nome completo" style={styles.input} />
            </Campo>
            <Campo label="Data de análise/checklist">
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

        {perfil === "OPERADOR" && telaOperador === "LISTA" && (
          <section style={styles.box}>
            <h2 style={styles.boxTitulo}>Selecionar equipamento</h2>
            <div style={isMobile ? styles.listaEquipamentosMobile : styles.listaEquipamentos}>
              {equipamentosFiltrados.map((e) => {
                const feito = tagsFeitasHoje.has(normalizar(e.tag));
                return (
                  <button key={e.tag} onClick={() => selecionarEquipamento(e.tag)} style={styles.cardSelecao}>
                    <strong style={styles.tagMini}>{e.tag}</strong>
                    <span>{e.tipo_equipamento}</span>
                    <small>Modelo: {e.modelo || "Não informado"}</small>
                    <small>{e.area || "LOCAL A DEFINIR"}</small>
                    {e.checklist_obrigatorio === false && <span style={styles.badgeOpcional}>Não obrigatório</span>}
                    {feito && <span style={styles.badgeConcluido}>Feito na data</span>}
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
                <p style={{ marginTop: 6, color: "#475569" }}>Dados serão salvos no Supabase.</p>
              </div>
            </div>

            <div style={isMobile ? styles.infoEquipamentoGridMobile : styles.infoEquipamentoGrid}>
              <Info label="TAG" valor={equipamentoSelecionado.tag} destaque />
              <Info label="Tipo" valor={equipamentoSelecionado.tipo_equipamento || "Não informado"} />
              <Info label="Modelo" valor={equipamentoSelecionado.modelo || "Não informado"} />
              <Info label="Série" valor={equipamentoSelecionado.numero_serie || "Não informado"} />
              <Info label="Local" valor={equipamentoSelecionado.local_correto || "LOCAL A DEFINIR"} destaque />
              <Info label="Área" valor={equipamentoSelecionado.area || "LOCAL A DEFINIR"} destaque />
            </div>

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
              <p style={styles.textoApoio}>Nesta etapa, a foto fica salva como texto no banco para teste. Depois migraremos para Supabase Storage.</p>
              <div style={isMobile ? styles.gridMobile : styles.grid2}>
                <Campo label="Foto do equipamento/avaria">
                  <input type="file" accept="image/*" onChange={(e) => carregarFoto(e, "EVIDENCIA")} style={styles.input} />
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
                  <Campo label="Foto do horímetro">
                    <input type="file" accept="image/*" onChange={(e) => carregarFoto(e, "HORIMETRO")} style={styles.input} />
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
              <button onClick={finalizarChecklist} style={styles.botaoPreto}>Finalizar e salvar no Supabase</button>
            </div>
          </section>
        )}

        {perfil === "ADMIN" && (
          <>
            <section style={styles.box}>
              <h2 style={styles.boxTitulo}>Painel Admin</h2>
              <div style={styles.botoesLinha}>
                <button onClick={exportarResumoCSV} style={styles.botaoPreto}>Exportar resumo CSV</button>
                <button onClick={exportarDetalhadoCSV} style={styles.botaoCinza}>Exportar detalhado CSV</button>
              </div>
              <div style={styles.filtroLinha}>
                {(["TODOS", "AVARIAS", "PENDENTES", "CONCLUIDOS"] as const).map((f) => (
                  <button key={f} onClick={() => setFiltroAdmin(f)} style={filtroAdmin === f ? styles.filtroAtivo : styles.filtroBotao}>{f}</button>
                ))}
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
                  </div>
                ))}
              </section>
            )}

            {(filtroAdmin === "TODOS" || filtroAdmin === "PENDENTES") && (
              <section style={styles.box}>
                <h2 style={styles.boxTitulo}>Pendentes obrigatórios</h2>
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
                  <ul>{s.observacoes.map((o, idx) => <li key={idx}>{o}</li>)}</ul>
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
                      <button onClick={() => iniciarEdicao(e)} style={styles.botaoCinza}>Editar</button>
                    </div>
                  ))}
                </div>
              )}

              <h3>{editandoTag ? `Editando ${editandoTag}` : "Novo cadastro"}</h3>
              <div style={isMobile ? styles.gridMobile : styles.grid3}>
                <Campo label="TAG"><input value={equipamentoEdicao.tag} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, tag: e.target.value })} style={styles.input} /></Campo>
                <Campo label="Tipo de equipamento"><input value={equipamentoEdicao.tipo_equipamento} onChange={(e) => setEquipamentoEdicao({ ...equipamentoEdicao, tipo_equipamento: e.target.value })} style={styles.input} /></Campo>
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
  return <div style={{ ...styles.kpiCard, border: destaque ? "1px solid #f59e0b" : "1px solid #e2e8f0" }}><strong>{titulo}</strong><h2 style={{ marginBottom: 0 }}>{valor}</h2></div>;
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={styles.campo}>{label}{children}</label>;
}

function Info({ label, valor, destaque = false }: { label: string; valor: string; destaque?: boolean }) {
  return <div style={{ marginBottom: 10 }}><small style={styles.infoLabel}>{label}</small><div style={{ fontWeight: destaque ? 800 : 600, fontSize: destaque ? 16 : 15 }}>{valor}</div></div>;
}

function PreviewImagem({ titulo, src, onRemover }: { titulo: string; src: string; onRemover: () => void }) {
  return <div style={styles.previewBox}><small style={styles.infoLabel}>{titulo}</small><img src={src} alt={titulo} style={styles.previewImg} /><button onClick={onRemover} style={styles.botaoPerigo}>Remover foto</button></div>;
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: "100vh", background: "#f1f5f9", padding: 20, color: "#0f172a" },
  container: { maxWidth: 1220, margin: "0 auto" },
  loginBox: { maxWidth: 520, background: "white", padding: 24, borderRadius: 22, border: "1px solid #e2e8f0", borderTop: "6px solid #FFE600", boxShadow: "0 14px 30px rgba(0,0,0,0.12)" },
  loginMarca: { display: "flex", gap: 14, alignItems: "center", marginBottom: 16 },
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
  perfilBoxClaro: { display: "flex", gap: 8, background: "#f1f5f9", padding: 8, borderRadius: 16, marginBottom: 16 },
  perfilBotaoClaro: { padding: "10px 14px", borderRadius: 12, border: "none", background: "transparent", color: "#0f172a", fontWeight: "bold", cursor: "pointer", flex: 1 },
  perfilAtivoClaro: { padding: "10px 14px", borderRadius: 12, border: "none", background: "#111111", color: "#FFE600", fontWeight: "bold", cursor: "pointer", flex: 1 },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 },
  kpiGridMobile: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 },
  kpiCard: { background: "white", padding: 18, borderRadius: 16 },
  box: { background: "white", padding: 18, borderRadius: 20, marginBottom: 18, border: "1px solid #e2e8f0" },
  boxTela: { background: "white", padding: 22, borderRadius: 24, marginBottom: 18, border: "1px solid #cbd5e1" },
  boxTitulo: { marginTop: 0 },
  boxInterno: { background: "#f8fafc", padding: 16, borderRadius: 16, marginTop: 16, border: "1px solid #e2e8f0" },
  boxInternoDestaque: { background: "#eff6ff", padding: 16, borderRadius: 16, marginTop: 16, border: "1px solid #bfdbfe" },
  subtituloSecao: { marginTop: 0 },
  textoApoio: { color: "#64748b", marginTop: -4 },
  grid4: { display: "grid", gap: 12, gridTemplateColumns: "repeat(4, 1fr)" },
  grid3: { display: "grid", gap: 12, gridTemplateColumns: "repeat(3, 1fr)" },
  grid2: { display: "grid", gap: 12, gridTemplateColumns: "repeat(2, 1fr)", alignItems: "start" },
  gridMobile: { display: "grid", gap: 12, gridTemplateColumns: "1fr" },
  campo: { display: "grid", gap: 6, fontWeight: 700, fontSize: 14, marginBottom: 10 },
  input: { width: "100%", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box" },
  textarea: { width: "100%", minHeight: 72, padding: 10, borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box", marginTop: 8 },
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
  aviso: { background: "#ecfdf5", border: "1px solid #86efac", color: "#166534", padding: 12, borderRadius: 12, marginBottom: 12, fontWeight: 700 },
  avisoErro: { background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: 12, borderRadius: 12, marginBottom: 12, fontWeight: 700 },
  msgErro: { color: "#b45309", fontWeight: 700 },
};
