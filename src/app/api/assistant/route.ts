import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Você é o Master Assistant do CODEX D20, um Dungeon Master veterano e carismático.
Aja como um mentor, use citações sobre destino, perigo e heroísmo. 
Você ajuda com criação de personagens, lore, dicas de RPG e regras. 
Responda de forma concisa e temática de fantasia sombria (estilo Baldur's Gate e Diablo).`;

// Thematic mock response generator for offline/local simulation mode
function generateThematicMockResponse(userMessage: string, systemMessage: string = ""): string {
  const msg = userMessage.toLowerCase();
  const sys = systemMessage.toLowerCase();
  
  // 1. Handle JSON concept generation requests
  if (msg.includes("json") || sys.includes("json")) {
    let race = "Humano";
    let charClass = "Guerreiro";
    let name = "Aegis do Destino";

    if (msg.includes("bruxo") || msg.includes("warlock") || msg.includes("asmodeus")) {
      race = "Tiefling";
      charClass = "Bruxo";
      name = "Malakor Sombra";
    } else if (msg.includes("mago") || msg.includes("wizard") || msg.includes("elfo")) {
      race = "Elfo";
      charClass = "Mago";
      name = "Aelrindel Sol";
    } else if (msg.includes("ladino") || msg.includes("rogue") || msg.includes("furtivo")) {
      race = "Halfling";
      charClass = "Ladino";
      name = "Kellen Dedos-Leves";
    } else if (msg.includes("clerigo") || msg.includes("clérigo") || msg.includes("cleric")) {
      race = "Anão";
      charClass = "Clérigo";
      name = "Thornin Escudo-Forte";
    } else if (msg.includes("barbaro") || msg.includes("bárbaro") || msg.includes("fúria")) {
      race = "Orc";
      charClass = "Bárbaro";
      name = "Grom Garra-de-Ferro";
    }

    return JSON.stringify({
      race: race,
      char_class: charClass,
      name: name
    });
  }

  // 2. Extract character details
  let charName = "aventureiro";
  let charClass = "Guerreiro";
  let charLevel = "1";
  
  const nameMatch = systemMessage.match(/personagem ([^,]+)/i);
  if (nameMatch) charName = nameMatch[1];
  
  const classMatch = systemMessage.match(/(Humano|Elfo|Anão|Halfling|Tiefling|Gnomo|Draconato|Meio-Elfo|Meio-Orc|Warforged|Tabaxi|Centauro|Tortle)\s+([^ ]+)\s+de Nível/i);
  if (classMatch) {
    charClass = classMatch[2];
  } else {
    const altClassMatch = systemMessage.match(/classe:\s*([^\n,]+)/i);
    if (altClassMatch) charClass = altClassMatch[1].trim();
  }
  
  const lvlMatch = systemMessage.match(/Nível\s+(\d+)/i);
  if (lvlMatch) charLevel = lvlMatch[1];

  // 3. Handle Story / Lore preludes
  if (msg.includes("prelúdio") || msg.includes("preludio") || msg.includes("história") || msg.includes("lore") || msg.includes("crie um")) {
    return `Nas brumas gélidas da Costa da Espada, ${charName} trilha uma senda forjada em sangue e segredos antigos. Como um ${charClass} de determinação implacável, seus passos iniciais ecoam os sussurros de divindades esquecidas e acordos selados sob eclipses sombrios. Cada cicatriz que carrega em sua carne conta a história de reinos que caíram, e sua lâmina agora ergue-se para gravar seu nome no próprio firmamento de Faerûn.`;
  }

  // 4. Combat maneuvers
  if (msg.includes("manobra") || msg.includes("superioridade") || msg.includes("guerreiro") || msg.includes("mestre de batalha")) {
    return `*(O som de dados de superioridade rolando ecoa)* 
    
Olá, **${charName}**. Como um **${charClass}** de nível **${charLevel}**, você possui acesso às Manobras de Combate de Mestre de Batalha:
    
• **Dado de Superioridade:** Você possui dados **d8** que pode usar para amplificar seus ataques na aba **Combate**.
• **Ataque de Precisão:** Rola o d8 e soma ao teste de acerto para superar a CA do alvo.
• **Derrubar (Trip Attack):** Adiciona 1d8 ao dano do ataque. O inimigo deve passar em uma Salvaguarda de Força ou cair caído (*Prone*), garantindo vantagem nos ataques corporais de seus aliados!
• **Aparar (Parry):** Como reação, gaste 1 dado de superioridade para reduzir o dano sofrido em 1d8 + seu modificador de Destreza.
    
Gaste seus dados na ficha e descanse (curto/longo) para restaurá-los!`;
  }
  
  // 5. Spells and spellbooks
  if (msg.includes("grimorio") || msg.includes("magia") || msg.includes("slot") || msg.includes("conjur") || msg.includes("mago") || msg.includes("feitic")) {
    return `*(Runas arcanas brilhantes flutuam ao redor de suas mãos)* 
    
Como um **${charClass}** de nível **${charLevel}**, o Grimório do Codex possui mais de 300 magias traduzidas:
    
• **Aprender Magias:** Vá na aba **Grimório**, busque qualquer magia do livro e clique em "Aprender" para adicioná-la ao seu Grimório Pessoal.
• **Espaços de Magia (Slots):** Use seus slots para conjurar feitiços de círculos maiores. Ao clicar em "Conjurar" na visualização da magia, a ficha deduzirá automaticamente 1 slot ativo.
• **Descanso Longo:** Use o botão de Descanso Longo na aba de combate para recuperar todos os seus espaços de magia e vida.`;
  }
  
  // 6. Backpack / inventory
  if (msg.includes("mochila") || msg.includes("item") || msg.includes("peso") || msg.includes("carga") || msg.includes("equipa") || msg.includes("inventar") || msg.includes("adicionar") || msg.includes("colocar") || msg.includes("machado") || msg.includes("espada") || msg.includes("arma") || msg.includes("escudo") || msg.includes("armadura")) {
    return `*(O couro da sua mochila range com o peso de suas provisões)* 
    
Olá, **${charName}**. Para **adicionar ou equipar** itens (como um machado de duas mãos, espada ou escudo):
    
1. Vá até a aba **Mochila** no topo da sua ficha.
2. Preencha o painel **"Adicionar Novo Item"**:
   • **Nome**: Insira o nome (ex: *Machado de Duas Mãos*).
   • **Tipo**: Selecione o tipo correto (ex: *Arma*).
   • **Peso**: Defina o peso em libras (ex: *7*).
   • **Dado Dano / CA Base**: Defina o dado correspondente (ex: *12* para um d12 de machado, ou a CA base para armaduras).
3. Clique em **"Colocar na Mochila"**.
4. No item adicionado na lista abaixo, clique em **"Equipar"**. 
    
Se for uma **Arma**, ela gerará botões automáticos de jogada de acerto/dano na aba **Combate**. Se for uma **Armadura** ou **Escudo**, seu valor de CA será atualizado dinamicamente!`;
  }
  
  // 7. General help
  return `*(A voz do Mestre ecoa pelas paredes de pedra)* 
  
Olá, **${charName}**. O Códice D20 está pronto. 
  
Posso lhe orientar sobre **manobras de combate**, explicar o uso do **grimório de magias**, organizar os itens da sua **mochila**, ou ensinar como **subir de nível** seu herói. Qual o seu chamado neste momento?`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const apiKey = process.env.AI_TEXT_API_KEY;
    
    if (!apiKey || apiKey.trim() === "" || apiKey === "your-text-ai-key-here") {
      const lastUserMessage = messages[messages.length - 1]?.content || "";
      const systemMessage = messages.find((m: any) => m.role === "system")?.content || "";
      const simulatedReply = generateThematicMockResponse(lastUserMessage, systemMessage);
      
      return NextResponse.json({ 
        reply: simulatedReply 
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', 
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
        response_format: req.url.includes("json") ? { type: "json_object" } : { type: "text" }
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content });
    
  } catch (error: any) {
    console.error("Master Assistant Error:", error.message);
    return NextResponse.json({ error: 'A magia falhou e a conexão se perdeu.' }, { status: 500 });
  }
}
