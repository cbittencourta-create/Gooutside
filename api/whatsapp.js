// Webhook do WhatsApp Cloud API (Meta) — recebe mensagens, entende com a Claude
// e le/escreve os dados financeiros do usuario no Supabase.
//
// Variaveis de ambiente necessarias (configurar no Vercel, nunca no codigo):
//   WHATSAPP_TOKEN            - token de acesso da Meta (permanente, de um System User)
//   WHATSAPP_PHONE_NUMBER_ID  - Phone Number ID do WhatsApp Cloud API
//   WHATSAPP_VERIFY_TOKEN     - string aleatoria escolhida por voce, usada so na verificacao do webhook
//   WHATSAPP_ALLOWED_NUMBER   - seu numero de WhatsApp em formato E.164 sem "+", ex: 5511999999999
//   VELARA_USER_ID            - seu user id no Supabase (o mesmo usado pelo app, localStorage "velara_user_id")
//   SUPABASE_URL              - mesma URL usada no app (SUPA_URL)
//   SUPABASE_SERVICE_ROLE_KEY - service role key do projeto Supabase (Project Settings > API) — NUNCA a anon key aqui
//   ANTHROPIC_API_KEY         - chave da API da Anthropic

const { CATEGORIAS_DESPESA, CATEGORIAS_RECEITA } = require("./_categorias");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_ID = process.env.VELARA_USER_ID;

async function supaGet(key) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/velara_data?key=eq.${USER_ID}_${key}&select=value`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  const d = await r.json();
  return d?.[0]?.value ?? null;
}

async function supaSet(key, value) {
  await fetch(`${SUPABASE_URL}/rest/v1/velara_data`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ key: `${USER_ID}_${key}`, value, updated_at: new Date().toISOString() }),
  });
}

function uid() {
  return Date.now() + Math.random().toString(36).slice(2);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function monthKey(ds) {
  return ds ? ds.slice(0, 7) : "";
}

async function sendWhatsAppMessage(to, text) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
}

function buildContext(movs, plantoes) {
  const mesAtual = today().slice(0, 7);
  const movsMes = movs.filter((m) => monthKey(m.data) === mesAtual);
  const entradas = movsMes.filter((m) => m.tipo === "entrada").reduce((s, m) => s + m.valor, 0);
  const saidas = movsMes.filter((m) => m.tipo === "saida").reduce((s, m) => s + m.valor, 0);
  const pendentes = plantoes.filter((p) => p.status === "pendente");
  const totalPendente = pendentes.reduce((s, p) => s + (p.valorTotal || 0), 0);
  const ultimosMovs = [...movs]
    .sort((a, b) => (b.data || "").localeCompare(a.data || ""))
    .slice(0, 15)
    .map((m) => `${m.data} | ${m.tipo} | ${m.categoria} | ${m.descricao} | R$${m.valor}`);

  return `Hoje é ${today()}.
Resumo do mês atual (${mesAtual}): entradas R$${entradas.toFixed(2)}, saídas R$${saidas.toFixed(2)}, saldo do mês R$${(entradas - saidas).toFixed(2)}.
Plantões pendentes de recebimento: ${pendentes.length} (total R$${totalPendente.toFixed(2)}).
Últimos lançamentos:
${ultimosMovs.join("\n") || "(nenhum lançamento registrado ainda)"}`;
}

async function askClaude(mensagem, contexto) {
  const systemPrompt = `Você é o assistente financeiro pessoal da Velara Finance, conversando por WhatsApp com a dona da conta (uma médica plantonista).
Seu trabalho é interpretar a mensagem dela e fazer UMA das duas coisas usando as ferramentas disponíveis:
1. Se a mensagem descreve um gasto, recebimento ou transferência (ex: "gastei 50 no mercado", "recebi 800 do plantão"), chame "registrar_lancamento".
2. Se é uma pergunta ou pedido de informação (ex: "quanto gastei esse mês", "qual meu saldo"), chame "responder_pergunta" usando os dados de contexto abaixo.
Se a mensagem for ambígua ou faltar informação essencial (como o valor), use "responder_pergunta" pra pedir esclarecimento, de forma breve e natural, em português do Brasil.

Categorias de despesa válidas: ${CATEGORIAS_DESPESA.join(", ")}
Categorias de receita válidas: ${CATEGORIAS_RECEITA.join(", ")}

Contexto financeiro atual:
${contexto}`;

  const tools = [
    {
      name: "registrar_lancamento",
      description: "Registra uma nova entrada, saída ou transferência financeira",
      input_schema: {
        type: "object",
        properties: {
          tipo: { type: "string", enum: ["entrada", "saida", "transferencia"] },
          valor: { type: "number", description: "valor em reais, sempre positivo" },
          descricao: { type: "string" },
          categoria: { type: "string", description: "uma das categorias válidas listadas, incluindo o emoji" },
          data: { type: "string", description: "data no formato YYYY-MM-DD; use hoje se não especificado" },
          resposta: { type: "string", description: "mensagem curta de confirmação pra enviar de volta, em português" },
        },
        required: ["tipo", "valor", "descricao", "categoria", "data", "resposta"],
      },
    },
    {
      name: "responder_pergunta",
      description: "Responde a uma pergunta ou pedido de esclarecimento, sem registrar nada",
      input_schema: {
        type: "object",
        properties: {
          resposta: { type: "string", description: "resposta em português, curta e direta, formatada pra WhatsApp" },
        },
        required: ["resposta"],
      },
    },
  ];

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-opus-5",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: systemPrompt,
      tools,
      tool_choice: { type: "any" },
      messages: [{ role: "user", content: mensagem }],
    }),
  });

  const data = await r.json();
  const toolUse = data?.content?.find((c) => c.type === "tool_use");
  if (!toolUse) {
    return { action: "responder_pergunta", resposta: "Não consegui entender, pode reformular?" };
  }
  return { action: toolUse.name, ...toolUse.input };
}

module.exports = async (req, res) => {
  // Verificacao do webhook (handshake inicial do Meta)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send("Forbidden");
    }
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    // Eventos que nao sao mensagem de texto (status de entrega, etc) — apenas confirma recebimento
    if (!message || message.type !== "text") {
      res.status(200).send("ok");
      return;
    }

    const from = message.from; // numero de quem mandou, ja sem "+"
    const texto = message.text.body;

    // So processa mensagens do numero autorizado (dono da conta)
    if (from !== process.env.WHATSAPP_ALLOWED_NUMBER) {
      res.status(200).send("ignored");
      return;
    }

    const [movs, plantoes] = await Promise.all([
      supaGet("v4_movs").then((v) => v || []),
      supaGet("v4_plt").then((v) => v || []),
    ]);

    const contexto = buildContext(movs, plantoes);
    const result = await askClaude(texto, contexto);

    if (result.action === "registrar_lancamento") {
      const novoMov = {
        id: uid(),
        tipo: result.tipo,
        descricao: result.descricao,
        valor: Math.abs(+result.valor || 0),
        categoria: result.categoria,
        data: result.data || today(),
      };
      await supaSet("v4_movs", [novoMov, ...movs]);
      await sendWhatsAppMessage(from, result.resposta || `✓ Registrado: ${novoMov.descricao} — R$${novoMov.valor.toFixed(2)}`);
    } else {
      await sendWhatsAppMessage(from, result.resposta || "Não consegui entender, pode reformular?");
    }

    res.status(200).send("ok");
  } catch (err) {
    console.error("Erro no webhook do WhatsApp:", err);
    res.status(200).send("ok"); // sempre 200 pra Meta nao ficar reenviando
  }
};
