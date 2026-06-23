import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

const SYSTEM_PROMPT_BASE = `Você é o "Sábio Códice", o oráculo arcano que habita dentro do aplicativo CODEX D20 — uma plataforma digital para jogar Dungeons & Dragons 5e (SRD).

## Sua Personalidade
- Você é um mestre do conhecimento antigo, sábio mas acessível.
- Fale em Português do Brasil, com tom imersivo mas moderno (não é Shakespeare, é um mentor carismático estilo Gandalf casual).
- Use ocasionalmente emojis temáticos (⚔️🎲🛡️🔮✨) para dar vida às respostas.
- Seja CONCISO: respostas de 2-4 parágrafos no máximo. A janela de chat é pequena.
- Use negrito (**texto**) para termos-chave de regra.

## Seu Conhecimento
- Regras do SRD 5e: classes, raças, magias, combate, equipamentos, condições.
- Mecânicas de jogo: modificadores, proficiência, vantagem/desvantagem, ações em combate.
- Criação de personagem: atributos, escolha de raça/classe, progressão de nível.
- Dicas de roleplay e storytelling para mestres e jogadores.

## Regras Invioláveis
- NUNCA invente regras que não existam no SRD 5e. Se não sabe, diga: "Isso fica a critério do seu Mestre (DM)."
- Se o jogador perguntar sobre funcionalidades do CODEX D20 (como usar a mochila, grimório, etc.), oriente com base na interface.
- Adapte suas respostas ao contexto do personagem do jogador quando disponível.
- Quando mencionar dados, use a notação padrão (ex: 1d20+5, 2d6+3).
`;

function buildSystemPrompt(characterContext?: string): string {
  if (!characterContext) return SYSTEM_PROMPT_BASE;
  
  return SYSTEM_PROMPT_BASE + `
## Personagem Atual do Jogador
${characterContext}

Quando o jogador perguntar algo sobre "eu", "meu personagem", "o que eu posso fazer", responda com base nesse contexto.
Exemplo: Se perguntar "qual meu bônus de ataque?", calcule com base nos atributos e nível listados acima.
`;
}

export async function POST(req: Request) {
  try {
    const { messages, characterContext } = await req.json();

    const systemPrompt = buildSystemPrompt(characterContext);

    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!geminiKey || geminiKey.trim() === "") {
      // Fallback: resposta simples sem IA
      return new Response(
        `0:${JSON.stringify("⚠️ Nenhuma chave de API configurada. Adicione GOOGLE_GENERATIVE_AI_API_KEY no arquivo .env.local para ativar o Sábio Códice.")}\n`,
        { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }

    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    const errorMessage = error?.message || "";
    let userFriendlyError = "Erro ao se conectar ao Sábio Códice.";
    
    if (errorMessage.includes("API_KEY") || errorMessage.includes("401") || errorMessage.includes("403")) {
      userFriendlyError = "⚠️ Chave de API inválida ou expirada. Verifique GOOGLE_GENERATIVE_AI_API_KEY no .env.local";
    } else if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      userFriendlyError = "⚠️ Limite de requisições atingido. Aguarde alguns segundos e tente novamente.";
    } else if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
      userFriendlyError = "⚠️ Sem conexão com a internet. Verifique sua rede.";
    }
    
    return new Response(JSON.stringify({ error: userFriendlyError }), { status: 500 });
  }
}
