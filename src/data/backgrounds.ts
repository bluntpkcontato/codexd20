export interface Background {
  id: string;
  name: string;
  quote: string;
  desc: string;
  skills: string[];
  tools?: string[];
  vehicles?: string[];
  languages?: string[];
  equipment: string[];
  featureName: string;
  featureDesc: string;
  roleplaySuggestions?: {
    ideal?: string;
    bond?: string;
    flaw?: string;
    personality?: string;
  };
}

export const BACKGROUNDS: Background[] = [
  {
    id: "acolito",
    name: "Acólito",
    quote: "A fé não é apenas uma crença, é um farol que me guia na escuridão mais densa.",
    desc: "Você passou a vida inteira servindo em um templo, realizando ritos sagrados em honra a uma divindade ou panteão. Você atua como um canal direto entre o mundo divino e os mortais.",
    skills: ["Intuição", "Religião"],
    languages: ["+2 idiomas de sua escolha"],
    equipment: ["Símbolo sagrado", "Livro de orações", "Incenso (5 barras)", "Vestes cerimoniais", "15 PO"],
    featureName: "Abrigo dos Fiéis",
    featureDesc: "Como um clérigo de seu templo, você e seus companheiros aventureiros podem esperar receber cura gratuita e cuidados médicos básicos em qualquer templo, santuário ou presença de sua fé. Além disso, aqueles que compartilham sua religião proverão abrigo modesto para você (mas não para todo o seu grupo)."
  },
  {
    id: "soldado",
    name: "Soldado",
    quote: "O som das trombetas e a poeira das marchas forjadas moldaram minha alma para o inevitável conflito.",
    desc: "A guerra corre em suas veias. Você passou sua juventude marchando por Faerûn, treinado sob rígida disciplina e calejado por inúmeros campos de batalha. Você sabe comandar e sabe obedecer.",
    skills: ["Atletismo", "Intimidação"],
    tools: ["Conjunto de dados"],
    vehicles: ["Veículos terrestres"],
    equipment: ["Insígnia militar de patente", "Um troféu de guerra (ex: estandarte rasgado, dente quebrado)", "Mochila comum", "10 PO"],
    featureName: "Patente Militar",
    featureDesc: "Você possui uma patente militar da sua época de serviço. Soldados leais ao seu antigo exército ainda reconhecem sua autoridade, o tratam com respeito e garantem acesso rápido a postos militares e caravanas de suprimentos de suas antigas fileiras."
  },
  {
    id: "criminoso",
    name: "Criminoso",
    quote: "A honra de um homem é medida pelo que ele está disposto a sacricifar no escuro para sobreviver até o amanhecer.",
    desc: "Você sempre sobreviveu operando à margem das leis. A honestidade é um luxo que você nunca pôde bancar, e o submundo tornou-se o seu lar, escola e campo de testes.",
    skills: ["Enganação", "Furtividade"],
    tools: ["Ferramentas de ladrão", "Kit de jogo"],
    equipment: ["Pé de cabra", "Roupas escuras e discretas com capuz", "15 PO"],
    featureName: "Contato Criminoso",
    featureDesc: "Você possui um contato altamente confiável na rede criminal. Através desse contato, você consegue mensagens, mercadorias ilegais e dicas sobre alvos em potencial em quase qualquer cidade onde a gangue opere."
  },
  {
    id: "sabio",
    name: "Sábio",
    quote: "Ignorância é a maior das fraquezas; o conhecimento, a maior das armas.",
    desc: "O pergaminho poeirento é sua arma, a tinta é seu escudo. Você dedicou incontáveis anos devorando tomos arcanos e desvendando mistérios esquecidos nas entranhas das maiores bibliotecas do continente.",
    skills: ["Arcanismo", "História"],
    languages: ["+2 idiomas de sua escolha"],
    equipment: ["Livro de anotações e contos", "Pena de coruja", "Frasco de tinta", "Faca pequena", "Roupas comuns", "10 PO"],
    featureName: "Pesquisador",
    featureDesc: "Sempre que você tenta se lembrar de um pedaço de conhecimento e não o sabe, muitas vezes saberá de onde e de quem você pode obtê-lo (como bibliotecas secretas, escribas famosos ou sábios reclusos)."
  },
  {
    id: "heroi_povo",
    name: "Herói do Povo",
    quote: "Os deuses não salvam as colheitas nem expulsam os tiranos. Nós, o povo, fazemos isso.",
    desc: "Você é de origem humilde, mas seu destino é grandioso. O povo o adora porque em tempos de necessidade, quando as autoridades fecharam os olhos, foi você quem se ergueu contra a injustiça.",
    skills: ["Adestrar Animais", "Sobrevivência"],
    tools: ["Ferramentas de artesão (uma de sua escolha)"],
    vehicles: ["Veículos terrestres"],
    equipment: ["Pá ou outra ferramenta rústica", "Ferramentas de trabalho da sua profissão", "Roupas comuns remendadas", "10 PO"],
    featureName: "Hospitalidade Rústica",
    featureDesc: "Como um genuíno herói do povo, você sempre encontrará abrigo e comida gratuita entre os camponeses e operários. Eles lhe protegerão e o ajudarão a se esconder de autoridades cruéis."
  },
  {
    id: "marinheiro",
    name: "Marinheiro",
    quote: "A terra firme é segura, mas sufoca. O mar é letal, mas é o único lugar onde me sinto verdadeiramente livre.",
    desc: "Você navegou por águas traiçoeiras a bordo de galés comerciais ou navios de guerra, enfrentando tempestades, monstros marinhos e os caprichos dos mares revoltos.",
    skills: ["Atletismo", "Percepção"],
    tools: ["Ferramentas de Navegação"],
    vehicles: ["Veículos Aquáticos"],
    equipment: ["Corda de seda (15 metros)", "Um amuleto da sorte do mar", "Roupas comuns de marinheiro", "10 PO"],
    featureName: "Passagem no Navio",
    featureDesc: "Quando você precisa, consegue passagem gratuita num navio mercante para si e seus companheiros, em troca de seus serviços na manutenção e navegação do barco durante a viagem."
  },
  {
    id: "artista",
    name: "Artista",
    quote: "A vida não é senão um grande palco, e todos devem interpretar o papel que lhes foi dado da melhor maneira possível.",
    desc: "Onde as palavras falham, a música, o drama e a arte prevalecem. Você prospera nos holofotes, cativando tabernas barulhentas e cortes requintadas com o seu carisma e talento natural.",
    skills: ["Acrobacia", "Performance"],
    tools: ["Um instrumento musical (sua escolha)"],
    equipment: ["Fantasia extravagante ou roupa de palco", "Instrumento musical principal", "Uma recordação amorosa de um fã", "15 PO"],
    featureName: "Popularidade Inata",
    featureDesc: "Você sempre consegue encontrar um lugar para se apresentar (uma taverna movimentada ou o coreto de uma feira). Em troca de sua performance, você recebe acomodação modesta gratuita para si e para seus companheiros de jornada."
  },
  {
    id: "eremita",
    name: "Eremita",
    quote: "O silêncio me ensinou as verdades que as cidades ensurdeceram.",
    desc: "Você passou grande parte da sua vida em total isolamento nas florestas, montanhas ou picos nevados. No exílio voluntário da sociedade, você encontrou paz, propósito e profunda epifania.",
    skills: ["Medicina", "Religião"],
    languages: ["+1 idioma de sua escolha"],
    equipment: ["Estojo de pergaminhos cheios de anotações e preces", "Cobertor de inverno", "Roupas rústicas ou manto desgastado", "Kit de herbalismo", "5 PO"],
    featureName: "Descoberta Majestosa",
    featureDesc: "O isolamento absoluto de sua reclusão garantiu-lhe acesso a uma descoberta única, reveladora ou um segredo mortal a respeito do cosmos, uma conspiração de um rei ou das divindades esquecidas."
  },
  {
    id: "nobre",
    name: "Nobre",
    quote: "Privilégio não é um direito inquestionável, é uma responsabilidade outorgada pelo próprio destino.",
    desc: "Dinheiro, terras, influência e poder. Você cresceu com tudo isso, educado nas mais altas estirpes de nobreza. As alianças políticas da sua família ainda ecoam, quer você goste delas ou não.",
    skills: ["História", "Persuasão"],
    languages: ["+1 idioma de sua escolha"],
    tools: ["Kit de jogo (um jogo refinado como Xadrez de Dragão)"],
    equipment: ["Anel de sinete familiar", "Pergaminho de comprovação de linhagem", "Roupas finas e suntuosas", "25 PO"],
    featureName: "Privilégio de Posição",
    featureDesc: "Devido ao peso do seu título, as pessoas tendem a pensar o melhor de você. Você é bem recebido em eventos da alta sociedade e plebeus farão de tudo para acomodá-lo, evitando o desagrado de sua linhagem."
  },
  {
    id: "forasteiro",
    name: "Forasteiro",
    quote: "As leis da natureza não negociam e não hesitam. Você é o caçador, ou você é a caça.",
    desc: "Longe da segurança dos muros de pedras das metrópoles, as terras selvagens acolheram você. Seu conhecimento do mundo provém das fogueiras, das selvas espessas e das cordilheiras geladas.",
    skills: ["Atletismo", "Sobrevivência"],
    tools: ["Um instrumento musical típico tribal"],
    equipment: ["Cajado esculpido de madeira forte", "Armadilha de caça rudimentar", "Faca de esfolamento", "Roupas de pele de animais", "10 PO"],
    featureName: "Andarilho",
    featureDesc: "Você possui uma memória excelente para mapas e geografia, e sempre é capaz de se localizar no ermo. Além disso, você consegue forragear comida fresca e água suficiente para você e até cinco pessoas diariamente, desde que o terreno permita."
  }
];
