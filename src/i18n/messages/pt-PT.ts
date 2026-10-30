import type en from "./en";

const messages: typeof en = {
  Metadata: {
    homeTitle: "Christmas Slippers | Um bocadinho de magia de Natal",
    homeDescription: "Uma oficina de Natal acolhedora onde podes imaginar as tuas pantufas de tricô feitas à mão.",
    workshopTitle: "Oficina Christmas Slippers | Personaliza o teu par",
    workshopDescription: "Escolhe um nome, um tamanho e as cores de lã DROPS Snow para um desejo especial de pantufas de Natal.",
  },
  Brand: {tagline: "Feito com um bocadinho de magia"},
  Language: {label: "Escolher idioma", portuguese: "Português", english: "English", switchTo: "Mudar para {language}"},
  Header: {
    backToTop: "Christmas Slippers, voltar ao início", navigation: "Navegação principal", howItWorks: "Como funciona", craft: "A história", workshop: "Oficina", makeSlippers: "Criar as minhas pantufas", openWorkshop: "Abrir a oficina Christmas Slippers", home: "Página inicial Christmas Slippers", backHome: "Voltar ao início",
  },
  Hero: {
    eyebrow: "A oficina de Natal · Desde 2026", title: "Da magia de Natal,", titleAccent: " para os teus pés.", copy: "Imagina um par de pantufas de Natal em tricô, escolhe cada cor aconchegante e envia o teu desejo a quem as faz devagarinho, com carinho e à mão.", discover: "Descobrir a história feita à mão", note: "Personaliza o teu par e experimenta as cores na oficina. Ainda não será enviado nenhum pedido.", knitted: "Feitas à mão", madeWithLove: "Feitas com amor", elfAlt: "A criadora da Christmas Slippers vestida de elfo de Natal, sentada a fazer tricô.",
  },
  How: {
    eyebrow: "Um desejo em três passinhos", title: "Como acontece a magia", intro: "Um pequeno ritual para transformares as tuas cores de Natal preferidas em algo quente, pessoal e mesmo confortável.", sizeTitle: "Escolhe o tamanho", sizeDescription: "Para que assente na perfeição, começa por escolher o teu tamanho para muitos momentos quentinhos e aconchegantes.", coloursTitle: "Escolhe as tuas cores", coloursDescription: "Dá cor às tuas pantufas com os teus tons favoritos, escolhidos de uma seleção de fios 100% lã.", wishTitle: "Envia o teu desejo", wishDescription: "Revê o teu desenho único, acrescenta um recadinho carinhoso e envia o teu desejo de Natal à elfa artesã.", note: "A personalização, a pré-visualização interativa das cores e os pedidos já estão à tua espera na oficina.",
  },
  Handmade: {
    quote: "Os presentes mais bonitos ainda guardam o calor das mãos que os fizeram.", quoteBy: "Um bilhetinho da oficina", eyebrow: "Feitas com tempo. Guardadas com carinho.", title: "Não vêm de uma prateleira.", titleAccent: "São feitas só para ti.", copy: "Cada par imaginado começa com uma pessoa: o tamanho dessa pessoa, as cores de que gosta, o Natal que vive. Nesta oficina celebramos a paciência, as pequenas irregularidades e os acabamentos cuidados que dão vida às coisas feitas à mão.", detailDesign: "Pensadas com carinho", detailKnitting: "Tricô sem pressas", detailStory: "Um presente com história", steps: "Ver os três passos", elfAlt: "A criadora da Christmas Slippers vestida de elfo, a abraçar uma pilha de peças de tricô feitas à mão.",
  },
  Footer: {
    story: "Aos pés quentinhos e às histórias de Natal inesquecíveis.", navigation: "Navegação do rodapé", top: "Voltar ao início", workshop: "Abrir a oficina", copyright: "© 2026 Christmas Slippers. Um projeto de código aberto feito com carinho.", note: "Ilustrações originais · Os desejos são revistos à mão",
  },
  Workshop: {
    eyebrow: "Entra na oficina de Natal", title: "Cria um desejo de pantufas,", titleAccent: "uma cor de cada vez.", copy: "Escreve um nome, encontra o tamanho certo e passeia pelas 87 lãs DROPS Snow para escolheres quatro pormenores aconchegantes.", note: "Não fazes nenhuma encomenda aqui — este é o teu cartão de personalização.", formLabel: "Formulário de personalização das pantufas", footerTitle: "Feitas para pés quentinhos e desejos de Natal cheios de carinho.", footerNote: "Os pedidos de personalização são revistos à mão — não estás a fazer uma compra.",
  },
  Personal: {
    eyebrow: "Começa o desejo", title: "Para quem são estas pantufas?", name: "Nome de quem as vai receber", nameHint: "O nome que vamos escrever neste pequeno desejo de Natal.", namePlaceholder: "por ex., Beatriz", size: "Tamanho EU", sizeHint: "Escolhe o tamanho que costuma ser mais confortável.",
  },
  Configurator: {
    loading: "A abrir a janela do provador…", yarnEyebrow: "Visita a prateleira das lãs", yarnTitle: "Escolhe as cores", yarnIntro: "Combina diferentes cores de lã DROPS Snow, 100% lã de ovelha, ou repete as tuas favoritas. Se preferires pantufas sem riscas, basta escolheres a mesma cor para a Risca 1 e a Risca 2.", checkTitle: "Vamos espreitar se está tudo?", checkNote: "Vamos apenas para rever as tuas escolhas, e não enviar pedido.", checkButton: "Verificar escolhas", valid: "Que bonito — o teu desenho está completo e pronto a rever. Ainda não foi enviado nenhum pedido.", invalid: "Ainda faltam alguns pormenores com o teu toque de Natal. Assinalámo-los acima.",
  },
  Zones: {
    stripe1: {label: "Risca 1", description: "Escolhe a cor da primeira risca"}, stripe2: {label: "Risca 2", description: "Escolhe a cor da segunda risca"}, ankle: {label: "Tornozelo", description: "Escolhe a cor do rebordo"}, sole: {label: "Sola", description: "Escolhe a cor debaixo do pé"},
  },
  YarnPicker: {
    clear: "Limpar", clearLabel: "Limpar a cor de {zone}", search: "Procurar na prateleira das lãs", placeholder: "Experimenta ‘56’ ou ‘christmas red’", found: "{count, plural, =1 {# cor encontrada} other {# cores encontradas}}", listLabel: "Cores de lã para {zone}", number: "N.º {id} · {type}", empty: "Não encontrámos lãs nesta prateleira.", clearSearch: "Limpar a pesquisa", availability: "Podes pedir qualquer cor da lista. O stock do revendedor foi consultado pela última vez em {date}; confirmaremos a disponibilidade mais tarde.",
  },
  Summary: {
    eyebrow: "O teu cartão da oficina", title: "O teu desejo de pantufas", complete: "Completo", draft: "Rascunho", progress: "{completed} de 6 pormenores do desenho concluídos", allReady: "Os seis pormenores estão prontos", remaining: "{count, plural, =1 {Falta # escolha} other {Faltam # escolhas}}", recipient: "Destinatário", addName: "Acrescenta um nome", size: "Tamanho EU", chooseSize: "Escolhe um tamanho", chooseColour: "Escolhe uma cor", completeTitle: "O teu desenho está completo.", draftTitle: "Este desenho ainda é um rascunho.", completeNote: "Está tudo pronto para reveres, mas ainda não foi enviado nenhum pedido.", draftNote: "Escolhe os pormenores em falta quando quiseres. Nada é enviado a partir desta página.",
  },
  Viewer: {
    eyebrow: "O teu estudo de cores", title: "Pré-visualização das pantufas", reset: "Repor vista", unavailableTitle: "A janela do provador está a descansar.", unavailableMessage: "Este navegador não consegue abrir a vista 3D interativa. Os controlos de personalização e o resumo de cores continuam disponíveis mais abaixo.", checkingTitle: "À procura das pantufas…", missingTitle: "O modelo realista está a ser preparado.", missingMessage: "A oficina está pronta para o GLB final das Sailor Slippers. As tuas quatro escolhas de cor ficam guardadas e serão aplicadas ao modelo assim que o ficheiro for adicionado.", instructions: "Arrasta para rodar · aproxima ou usa o scroll para ampliar", pendingInstructions: "Os controlos interativos serão ativados com o modelo final", note: "O GLB usa a cor principal de pré-visualização para lãs mix e print.", pendingNote: "A pré-visualização interativa regressará quando o modelo GLB final for adicionado.",
  },
  Gift: {
    postbox: "A caixa de correio de Natal está aberta", readyTitle: "Pronto para enviar este desejo?", readyCopy: "Revê o desenho terminado e deixa os teus contactos para podermos falar contigo sobre este pedido de Natal.", readyButton: "Enviar o meu desejo de Natal", successTitle: "O teu desejo de Natal já vai a caminho! 🎄", successCopy: "A notificação foi aceite para processamento. Isto não é uma confirmação de compra, um recibo final de entrega nem uma garantia de que as pantufas serão feitas.", reviewEyebrow: "Fecha o envelope", reviewTitle: "Revê e envia o teu desejo", reviewCopy: "Não estás a comprar nada aqui. Só usaremos estes dados para falar contigo sobre este pedido.", recipient: "Destinatário", size: "Tamanho", notSelected: "Por escolher", changed: "Mudaste o desenho e precisamos de o verificar outra vez acima antes de o enviares. Os teus contactos continuam aqui.", yourName: "O teu nome", email: "Endereço de email", whatsapp: "Número de WhatsApp", optional: "opcional", whatsappHelp: "Inclui o indicativo do país. Podemos falar contigo manualmente se for preciso substituir uma cor de lã ou esclarecer o pedido.", message: "Queres deixar um recadinho à Elfa ajudante do Pai Natal?", consent: "Aceito que falem comigo sobre este desejo de Natal específico por email e, se indicar um número, por WhatsApp.", consentNote: "Esta opção não está pré-selecionada.", privacy: "Os teus contactos são enviados em privado para a caixa de entrada da oficina. Não aparecem em páginas públicas, URLs ou análises, e não enviamos mensagens automáticas de WhatsApp.", sending: "A enviar o teu desejo…", retry: "Tenta enviar novamente", submit: "Enviar o meu desejo de Natal", networkError: "Não conseguimos chegar à caixa de correio de Natal. Os teus dados continuam aqui — tenta novamente.", genericError: "Não foi possível enviar o teu desejo agora. Tenta novamente.",
  },
  Validation: {
    recipientName: "Escreve o nome de quem vai receber as pantufas", euSize: "Escolhe um tamanho EU disponível", colour: "Escolhe uma cor DROPS Snow para {zone}", requesterName: "Escreve o teu nome", requesterEmail: "Escreve um endereço de email válido", whatsappPhone: "Escreve um número internacional válido, com o indicativo do país", christmasMessage: "O teu recadinho de Natal pode ter até 500 caracteres", contactConsent: "Aceita o contacto sobre este desejo de Natal", configuration: "Revê os pormenores do desenho das pantufas",
  },
  ApiErrors: {
    mediaType: "Envia este desejo de Natal em formato JSON.", rateLimited: "Foram enviados demasiados desejos a partir desta ligação. Tenta novamente daqui a pouco.", validation: "Revê os campos assinalados e tenta novamente.", tooLarge: "Este desejo de Natal é demasiado grande para ser enviado.", unreadable: "Não conseguimos ler este desejo de Natal.", unavailable: "A caixa de correio de Natal ainda não está configurada. Tenta novamente mais tarde.", delivery: "Não conseguimos enviar o teu desejo agora. O teu desenho continua aqui — tenta novamente.", accepted: "O teu desejo de Natal foi aceite para processamento.",
  },
  Artwork: {title: "Um par de pantufas de Natal feitas à mão", description: "Ilustração original de pantufas de tricô em vermelho-arando e creme, unidas por uma fita dourada."},
  Invitation: {
    metadataTitle: "Um convite de Natal | Christmas Slippers",
    metadataDescription: "Abre uma pequena surpresa de Natal enviada pela elfo do tricô.",
    brandNote: "Entrega especial do Polo Norte",
    skip: "Saltar o convite",
    progress: "Passo {current} de 4 do convite",
    sealedEyebrow: "Uma entrega muito especial",
    sealedTitle: "Tens correio do Polo Norte!",
    sealedCopy: "Uma pequena surpresa foi preparada especialmente para ti...",
    sealedAction: "Abrir o meu convite",
    envelopeTo: "Para alguém muito especial...",
    envelopePersonalisedLabel: "Para:",
    envelopeFrom: "A oficina de tricô de Natal",
    postalMark: "Polo Norte · Correio de Natal",
    sealLabel: "Quebrar o selo de cera vermelho-arando e abrir o convite",
    letterEyebrow: "Uma carta da elfa do tricô",
    letterGreeting: "Olá, olá!",
    letterPersonalisedGreeting: "Olá, {name}!",
    letterParagraph1: "Se estás a ler esta carta, é porque entraste na minha lista de pessoas especiais deste Natal.",
    letterParagraph2: "Este ano, a minha pequena oficina vai encher-se de novelos de lã, agulhas de tricô e um bocadinho de magia.",
    letterParagraph3: "Mas há uma coisa que só tu podes fazer, por isso, vou precisar da tua ajuda! ",
    letterQuestion: "Preparado para descobrir a tua surpresa?",
    letterClosing: "Com carinho,",
    letterSignature: "A tua elfa favorita",
    letterAction: "Ver a minha surpresa",
    elfAlt: "A elfo do tricô da Christmas Slippers sentada com as suas agulhas e lãs.",
    giftEyebrow: "Só falta um lacinho",
    giftTitle: "Há uma surpresa de Natal à tua espera...",
    giftCopy: "Toca no presente para desatares o laço.",
    giftAction: "Desembrulhar o meu presente",
    giftLabel: "Desembrulhar o presente de Natal creme e vermelho-arando",
    completedEyebrow: "O teu convite",
    completedTitle: "Este Natal, vou fazer umas pantufas especialmente para ti!",
    completedPersonalisedTitle: "{name}, este Natal vou fazer umas pantufas especialmente para ti!",
    completedCopy: "Tu escolhes as cores. Eu trato da magia.",
    completedAction: "Escolher as minhas cores",
    completedNote: "O teu par feito à mão começa com quatro pequenas escolhas de cor.",
    slipperPreviewAlt: "Um par de Sailor Slippers às riscas, feitas à mão em cores de Natal.",
    replay: "Abrir outra vez",
  },
};

export default messages;
