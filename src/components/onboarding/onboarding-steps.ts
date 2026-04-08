export interface TourPageStep {
  element: string;
  title: string;
  description: string;
  side?: "top" | "bottom" | "left" | "right";
}

export interface TourPage {
  id: string;
  route: string;
  steps: TourPageStep[];
}

export const TOUR_PAGES: TourPage[] = [
  {
    id: "dashboard",
    route: "/",
    steps: [
      {
        element: "[data-tour='dashboard-title']",
        title: "Painel Principal",
        description: "Este é seu painel de controle. Aqui você acompanha todos os números da clínica de forma rápida.",
      },
      {
        element: "[data-tour='dashboard-stats']",
        title: "Resumo da Clínica",
        description: "Estes cards mostram: total de pacientes, procedimentos do mês, recalls pendentes e mensagens enviadas.",
      },
      {
        element: "[data-tour='dashboard-recalls']",
        title: "Próximos Retornos",
        description: "Aqui aparecem os retornos agendados para os próximos 7 dias. Fique de olho!",
      },
      {
        element: "[data-tour='dashboard-messages']",
        title: "Mensagens Recentes",
        description: "Últimas mensagens enviadas automaticamente para seus pacientes.",
      },
    ],
  },
  {
    id: "procedures",
    route: "/settings/procedure-types",
    steps: [
      {
        element: "[data-tour='procedures-title']",
        title: "Passo 1: Procedimentos",
        description: "Comece cadastrando os tipos de procedimento da clínica — Botox, Preenchimento, Peeling, etc. É a base para tudo funcionar!",
      },
      {
        element: "[data-tour='procedures-add-btn']",
        title: "Criar Procedimento",
        description: "Clique aqui para adicionar um novo tipo. Preencha o nome, valor e os dias de retorno (recall).",
        side: "bottom",
      },
      {
        element: "[data-tour='procedures-table']",
        title: "Lista de Procedimentos",
        description: "Seus procedimentos aparecem aqui. Você pode editar, ativar/desativar ou excluir a qualquer momento.",
        side: "top",
      },
    ],
  },
  {
    id: "patients",
    route: "/patients",
    steps: [
      {
        element: "[data-tour='patients-title']",
        title: "Passo 2: Pacientes",
        description: "Aqui ficam todos os pacientes da clínica. Cadastre com nome e telefone do WhatsApp.",
      },
      {
        element: "[data-tour='patients-add-btn']",
        title: "Nova Paciente",
        description: "Clique para cadastrar uma nova paciente. O telefone com WhatsApp é essencial para o envio automático!",
        side: "bottom",
      },
      {
        element: "[data-tour='patients-search']",
        title: "Busca Rápida",
        description: "Encontre qualquer paciente digitando o nome ou número de telefone.",
        side: "bottom",
      },
    ],
  },
  {
    id: "new-procedure",
    route: "/procedures/new",
    steps: [
      {
        element: "[data-tour='new-procedure-title']",
        title: "Passo 3: Registrar Procedimento",
        description: "Sempre que um paciente fizer um procedimento, registre aqui. Isso ativa os recalls automáticos!",
      },
      {
        element: "[data-tour='new-procedure-patient']",
        title: "Buscar Paciente",
        description: "Digite o nome para buscar. Se o paciente não existir, você pode cadastrar na hora sem sair da tela!",
        side: "bottom",
      },
      {
        element: "[data-tour='new-procedure-type']",
        title: "Tipo de Procedimento",
        description: "Selecione qual procedimento foi realizado. Eles aparecem aqui porque você cadastrou no Passo 1!",
        side: "bottom",
      },
      {
        element: "[data-tour='new-procedure-submit']",
        title: "Registrar!",
        description: "Clique em Registrar para salvar. O sistema já vai agendar os recalls automaticamente com base nas suas automações.",
        side: "top",
      },
    ],
  },
  {
    id: "templates",
    route: "/settings/message-templates",
    steps: [
      {
        element: "[data-tour='templates-title']",
        title: "Passo 4: Modelos de Mensagem",
        description: "Crie mensagens prontas para WhatsApp — lembretes de retorno, pós-procedimento, aniversário...",
      },
      {
        element: "[data-tour='templates-add-btn']",
        title: "Novo Modelo",
        description: "Clique aqui para criar um modelo. Escolha entre texto simples, com botões ou carrossel de imagens!",
        side: "bottom",
      },
      {
        element: "[data-tour='templates-variables']",
        title: "Variáveis Automáticas",
        description: "Use {nome}, {procedimento} e {data} — o sistema substitui automaticamente pelos dados de cada paciente!",
        side: "bottom",
      },
    ],
  },
  {
    id: "automations",
    route: "/automations",
    steps: [
      {
        element: "[data-tour='automations-title']",
        title: "Passo 5: Automações",
        description: "Aqui você conecta tudo! Defina regras como: \"3 dias após Botox, enviar mensagem X\".",
      },
      {
        element: "[data-tour='automations-add-btn']",
        title: "Nova Regra",
        description: "Clique para criar uma regra. Escolha o procedimento, o modelo de mensagem e quantos dias após o procedimento disparar.",
        side: "bottom",
      },
    ],
  },
  {
    id: "recalls",
    route: "/recalls",
    steps: [
      {
        element: "[data-tour='recalls-title']",
        title: "Passo 6: Recalls",
        description: "Veja todos os retornos agendados. O sistema calcula automaticamente quando cada paciente precisa voltar!",
      },
      {
        element: "[data-tour='recalls-filters']",
        title: "Filtrar por Status",
        description: "Filtre por Pendente, Enviado, Entregue ou Falhou para acompanhar rapidamente o que precisa de atenção.",
        side: "bottom",
      },
      {
        element: "[data-tour='recalls-table']",
        title: "Lista de Recalls",
        description: "Cada recall mostra a data, a mensagem e o status. Você pode cancelar ou reenviar quando necessário.",
        side: "top",
      },
    ],
  },
  {
    id: "messages",
    route: "/messages",
    steps: [
      {
        element: "[data-tour='messages-title']",
        title: "Passo 7: Histórico de Mensagens",
        description: "Registro completo de todas as mensagens enviadas e recebidas pelo WhatsApp.",
      },
      {
        element: "[data-tour='messages-search']",
        title: "Buscar Mensagens",
        description: "Pesquise por paciente ou pelo conteúdo da mensagem.",
        side: "bottom",
      },
      {
        element: "[data-tour='messages-direction-filter']",
        title: "Filtrar por Direção",
        description: "Veja só as enviadas, só as recebidas, ou todas. Clique em qualquer mensagem para ver o conteúdo completo!",
        side: "bottom",
      },
    ],
  },
];
