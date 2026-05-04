"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { createClient } from "@supabase/supabase-js";
import type { Session, User } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wndajcdtcfsuorvjqtbh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZGFqY2R0Y2ZzdW9ydmpxdGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzAwMDgsImV4cCI6MjA5MzE0NjAwOH0.Sybmebm4eDuGJXIDZG6YZitycGu-oEwBBmsgU3Hr_dI";
const DOMINIO_LOGIN_INTERNO = "pioneirobaterias.com.br";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type Perfil = "ADMIN" | "OPERADOR";
type StatusItem = "OK" | "NÃO OK" | "N/A" | "";
type TelaLogin = "ENTRAR" | "CRIAR" | "ESQUECI";

type PerfilUsuario = {
  user_id: string;
  nome: string;
  usuario_login: string;
  email_auth: string;
  email_recuperacao?: string;
  perfil: Perfil;
  ativo: boolean;
};

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
  modelo: "",
  numero_serie: "",
  local_correto: "",
  area: "",
  checklist_obrigatorio: true,
  ativo: true,
  status_operacional: "DISPONIVEL",
  origem: "Cadastro manual",
};

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
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token || SUPABASE_KEY;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
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

  if (error) throw error;

  const { data } = supabase.storage.from("checklist-fotos").getPublicUrl(caminho);
  return data.publicUrl;
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
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

  const [operador, setOperador] = useState("");
  const [data, setData] = useState(hojeISO());
  const [area, setArea] = useState("TODAS");
  const [busca, setBusca] = useState("");
  const [tagSelecionada, setTagSelecionada] = useState("");
  const [telaOperador, setTelaOperador] = useState<"LISTA" | "CHECKLIST">("LISTA");

  const [respostas, setRespostas] = useState<RespostaItem[]>(montarRespostasPadrao(itensFallback));
  const [situacaoEquipamento, setSituacaoEquipamento] = useState("EM OPERAÇÃO");
  const [observacaoGeral, setObservacaoGeral] = useState("");
  const [horimetroLeitura, setHorimetroLeitura] = useState("");
  const [confirmacaoOperador, setConfirmacaoOperador] = useState(false);
  const [fotoEvidencia, setFotoEvidencia] = useState("");
  const [fotoHorimetro, setFotoHorimetro] = useState("");

  const [avariaImpedeUso, setAvariaImpedeUso] = useState(false);
  const [numeroOS, setNumeroOS] = useState("");
  const [afetaOperacao, setAfetaOperacao] = useState(false);

  const [equipamentoEdicao, setEquipamentoEdicao] = useState<Equipamento>(equipamentoVazio);
  const [editandoTag, setEditandoTag] = useState("");
  const [buscaCadastro, setBuscaCadastro] = useState("");
  const [filtroAdmin, setFiltroAdmin] = useState<"TODOS" | "AVARIAS" | "PENDENTES" | "CONCLUIDOS">("TODOS");
  const [tagReservaSelecionada, setTagReservaSelecionada] = useState("");
  const [observacaoAdminParada, setObservacaoAdminParada] = useState("");

  const [itemChecklistNumero, setItemChecklistNumero] = useState("");
  const [itemChecklistDescricao, setItemChecklistDescricao] = useState("");
  const [itemChecklistEditando, setItemChecklistEditando] = useState<number | null>(null);
  const [modeloConfigSelecionado, setModeloConfigSelecionado] = useState("");

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
    async function iniciarSessao() {
      setCarregando(true);

      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);

        if (data.session?.user) {
          await carregarPerfil(data.session.user.id);
          await carregarDados();
        }
      } catch (err: any) {
        setMensagem(`Erro ao carregar sessão: ${err.message || err}`);
      } finally {
        setCarregando(false);
      }
    }

    iniciarSessao();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, novaSession) => {
      setSession(novaSession);
      setUser(novaSession?.user || null);

      if (novaSession?.user) {
        try {
          setCarregando(true);
          await carregarPerfil(novaSession.user.id);
          await carregarDados();
        } catch (err: any) {
          setMensagem(`Erro ao carregar perfil: ${err.message || err}`);
        } finally {
          setCarregando(false);
        }
      } else {
        setPerfilUsuario(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function carregarPerfil(userId: string) {
    const perfis = await supabaseRequest<PerfilUsuario[]>(
      `perfis_usuario?select=*&user_id=eq.${userId}&ativo=eq.true`
    );

    if (!perfis.length) throw new Error("Usuário sem perfil ativo cadastrado.");
    setPerfilUsuario(perfis[0]);
    setOperador(perfis[0].nome || "");
  }

  async function carregarDados() {
    setMensagem("");

    const [eqs, itens, itensTodos, chks, resps, decs, pars] = await Promise.all([
      supabaseRequest<Equipamento[]>("equipamentos?select=*&order=tag.asc"),
      supabaseRequest<ChecklistItemPadrao[]>("checklist_itens_padrao?select=numero,descricao,ativo&ativo=eq.true&order=numero.asc"),
      supabaseRequest<ChecklistItemPadrao[]>("checklist_itens_padrao?select=numero,descricao,ativo&order=numero.asc"),
      supabaseRequest<ChecklistRegistro[]>("checklists?select=*&order=criado_em.desc&limit=1000"),
      supabaseRequest<RespostaBanco[]>("checklist_respostas?select=*&order=item_numero.asc&limit=5000"),
      supabaseRequest<DecisaoNA[]>("decisoes_na?select=*&order=criado_em.desc"),
      supabaseRequest<ParadaManutencao[]>("paradas_manutencao?select=*&status=neq.FINALIZADA&order=criado_em.desc"),
    ]);

    setEquipamentos(eqs || []);
    setItensPadrao(itens?.length ? itens : itensFallback);
    setItensConfig(itensTodos?.length ? itensTodos : itensFallback);
    setChecklists(chks || []);
    setRespostasBanco(resps || []);
    setDecisoesNA(decs || []);
    setParadasManutencao(pars || []);
  }

  async function entrarNoPerfil() {
    setMensagem("");
    setCarregando(true);

    try {
      const usuario = normalizarUsuario(loginUsuario);
      if (!usuario) throw new Error("Informe o usuário.");

      const mapa = await supabaseRequest<any[]>(
        `usuarios_login?select=*&usuario_login=eq.${encodeURIComponent(usuario)}&ativo=eq.true`
      );
      const emailAuth = mapa[0]?.email_auth || usuarioParaEmailInterno(usuario);

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: emailAuth,
        password: loginSenha,
      });

      if (error) throw error;
      if (!authData.user || !authData.session) throw new Error("Login não retornou sessão.");

      setSession(authData.session);
      setUser(authData.user);

      await carregarPerfil(authData.user.id);
      await carregarDados();
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

      const existentes = await supabaseRequest<any[]>(
        `usuarios_login?select=usuario_login&usuario_login=eq.${encodeURIComponent(usuario)}`
      );
      if (existentes.length) throw new Error("Este usuário já existe.");

      const emailAuth = usuarioParaEmailInterno(usuario);

      const { data: cadastro, error } = await supabase.auth.signUp({
        email: emailAuth,
        password: cadSenha,
        options: {
          data: {
            nome: cadNome.trim(),
            usuario_login: usuario,
          },
        },
      });

      if (error) throw error;
      if (!cadastro.user) throw new Error("Cadastro não retornou usuário.");

      await supabaseRequest<any[]>("usuarios_login", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          usuario_login: usuario,
          email_auth: emailAuth,
          email_recuperacao: "",
          nome: cadNome.trim(),
          ativo: true,
        }),
      });

      if (!cadastro.session) {
        throw new Error("Conta criada, mas precisa confirmação de e-mail. Desative confirmação de e-mail no Supabase para o piloto.");
      }

      await supabaseRequest<any[]>("perfis_usuario", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          user_id: cadastro.user.id,
          nome: cadNome.trim(),
          usuario_login: usuario,
          email_auth: emailAuth,
          email_recuperacao: "",
          email: emailAuth,
          perfil: "OPERADOR",
          ativo: true,
        }),
      });

      setLoginUsuario(usuario);
      setLoginSenha("");
      setTelaLogin("ENTRAR");
      setMensagem("Conta criada como OPERADOR. Entre com usuário e senha.");
      setCadNome("");
      setCadUsuario("");
      setCadSenha("");
      setCadSenha2("");
    } catch (err: any) {
      setMensagem(`Erro ao criar conta: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function recuperarSenha() {
    setMensagem("");
    setCarregando(true);

    try {
      const usuario = normalizarUsuario(loginUsuario || cadUsuario);
      if (!usuario) throw new Error("Informe o usuário.");

      const mapa = await supabaseRequest<any[]>(
        `usuarios_login?select=*&usuario_login=eq.${encodeURIComponent(usuario)}&ativo=eq.true`
      );
      if (!mapa.length) throw new Error("Usuário não encontrado.");

      const { error } = await supabase.auth.resetPasswordForEmail(mapa[0].email_auth, {
        redirectTo: window.location.origin,
      });

      if (error) throw error;

      setMensagem("Solicitação enviada. Se o SMTP estiver configurado, chegará um link de redefinição.");
      setTelaLogin("ENTRAR");
    } catch (err: any) {
      setMensagem(`Erro ao recuperar senha: ${err.message || err}`);
    } finally {
      setCarregando(false);
    }
  }

  async function sair() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setPerfilUsuario(null);
    setTelaOperador("LISTA");
    setMensagem("");
  }

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
      .filter((e) => normalizar(`${e.tag} ${e.tipo_equipamento} ${e.modelo || ""} ${e.local_correto || ""} ${e.area || ""}`).includes(termo))
      .slice(0, 20);
  }, [equipamentos, buscaCadastro]);

  const equipamentoSelecionado = equipamentos.find((e) => e.tag === tagSelecionada) || null;
  const checklistsDoDia = checklists.filter((c) => c.data_checklist === data);
  const tagsFeitasHoje = new Set(checklistsDoDia.map((c) => normalizar(c.tag)));
  const equipamentosObrigatorios = equipamentos.filter((e) => e.ativo !== false && e.checklist_obrigatorio !== false && e.status_operacional !== "EM_MANUTENCAO");
  const pendentesHoje = equipamentosObrigatorios.filter((e) => !tagsFeitasHoje.has(normalizar(e.tag)));
  const concluidosHoje = checklistsDoDia.filter((c) => equipamentosObrigatorios.some((e) => normalizar(e.tag) === normalizar(c.tag))).length;
  const comAvariaHoje = checklistsDoDia.filter((c) => c.resultado_final === "COM AVARIA");
  const horaAtual = new Date().getHours();

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
    resetarChecklist(removidos);
  }

  function alterarStatusItem(itemNumero: number, status: StatusItem) {
    setRespostas((atuais) =>
      atuais.map((r) => r.item_numero === itemNumero ? { ...r, status, observacao: status === "OK" ? "" : r.observacao } : r)
    );
  }

  function alterarObservacaoItem(itemNumero: number, observacao: string) {
    setRespostas((atuais) => atuais.map((r) => r.item_numero === itemNumero ? { ...r, observacao } : r));
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

    if (!user) return setMensagem("Usuário não autenticado.");
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
        operador_user_id: user.id,
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

      const salvo = await supabaseRequest<ChecklistRegistro[]>("checklists?on_conflict=tag,data_checklist", {
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
            operador_user_id: user.id,
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

  function exportarResumoCSV() {
    const cabecalho = ["DATA", "HORA", "OPERADOR", "TAG", "EQUIPAMENTO", "MODELO", "AREA", "SITUACAO", "RESULTADO", "HORIMETRO", "OBSERVACAO", "FOTO_EVIDENCIA", "FOTO_HORIMETRO"];
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
      r.foto_evidencia_url || "",
      r.foto_horimetro_url || "",
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

  if (!session || !perfilUsuario) {
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
                {telaLogin === "ESQUECI" && "Informe seu usuário para recuperar senha."}
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
                <button onClick={() => { setTelaLogin("ESQUECI"); setMensagem(""); }} style={styles.botaoCinza}>Esqueci minha senha</button>
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

          {telaLogin === "ESQUECI" && (
            <>
              <Campo label="Usuário">
                <input value={loginUsuario} onChange={(e) => setLoginUsuario(e.target.value)} placeholder="Ex.: eduardo.m" style={styles.input} />
              </Campo>
              <button onClick={recuperarSenha} style={styles.botaoPreto}>Enviar recuperação</button>
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
              <p style={styles.subtitulo}>Usuário: {perfilUsuario.usuario_login} | Perfil: {perfil}</p>
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
          <Card titulo="Concluídos na data" valor={concluidosHoje} />
          <Card titulo="Pendentes obrigatórios" valor={pendentesHoje.length} />
          <Card titulo="Com avaria" valor={comAvariaHoje.length} destaque={comAvariaHoje.length > 0} />
        </section>

        <section style={styles.box}>
          <h2 style={styles.boxTitulo}>Filtros</h2>
          <div style={isMobile ? styles.gridMobile : styles.grid4}>
            <Campo label="Nome completo">
              <input value={operador} onChange={(e) => setOperador(e.target.value)} placeholder="Nome completo" style={styles.input} />
            </Campo>
            <Campo label="Data">
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
                    {e.status_operacional === "EM_MANUTENCAO" && <span style={styles.badgeAtrasado}>Em manutenção</span>}
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
                <p style={{ marginTop: 6, color: "#475569" }}>Fotos no Storage e dados no banco.</p>
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
              <p style={styles.textoApoio}>A foto será enviada para o Supabase Storage. O banco salvará apenas o link.</p>
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
