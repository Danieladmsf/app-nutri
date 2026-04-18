// ─── BANCO DE DADOS TESTE — Contexto de Auditoria Industrial Alimentar ───
// Clientes, Visitas e Laudos simulados para o mês de Abril/2026

// ═══════════════════════════════════════════════
// 1. CLIENTES INDUSTRIAIS
// ═══════════════════════════════════════════════

export const clientsMock = [
  {
    id: 'cli_001',
    name: 'Cozinha Industrial Matriz',
    cnpj: '12.345.678/0001-90',
    phone: '(11) 3456-7890',
    whatsapp: '(11) 99876-5432',
    email: 'matriz@cozinhaindustrial.com.br',
    address: 'Av. Paulista, 1500 - Bela Vista, SP',
    contact: 'João Silva',
    contactRole: 'Gerente Geral',
    status: 'Ativo',
    tier: 'Premium',
    tags: ['Indústria', 'Alta Demanda', 'ANVISA'],
    contractStart: '2025-01-15',
    visitDay: 'ter', // Dia fixo da rotina: terça
    notes: 'Cliente estratégico. Opera 3 turnos. Possui 2 câmaras frias e 1 linha de produção de marmitex.',
    lastVisitDate: '2026-04-08',
    lastReportStatus: 'Atenção Necessária',
    historicIssues: 'Problemas recorrentes no uso da touca de proteção e ausência de etiquetas de abertura nos laticínios.'
  },
  {
    id: 'cli_002',
    name: 'Supermercado Nova Era',
    cnpj: '23.456.789/0001-01',
    phone: '(11) 2345-6789',
    whatsapp: '(11) 98765-4321',
    email: 'qualidade@novaera.com.br',
    address: 'Rua Augusta, 400 - Consolação, SP',
    contact: 'Mariana Oliveira',
    contactRole: 'Chefe de Setor Perecíveis',
    status: 'Ativo',
    tier: 'Standard',
    tags: ['Varejo', 'Perecíveis'],
    contractStart: '2025-06-01',
    visitDay: 'ter', // Dia fixo: terça
    notes: 'Foco de auditoria: setor de frios, padaria e rotisseria. Historicamente excelente.',
    lastVisitDate: '2026-04-01',
    lastReportStatus: 'Conforme',
    historicIssues: 'Solicitou suporte térmico no freezer 3. Sem não-conformidades recentes.'
  },
  {
    id: 'cli_003',
    name: 'Refeitório São João',
    cnpj: '34.567.890/0001-12',
    phone: '(11) 3567-8901',
    whatsapp: '(11) 97654-3210',
    email: 'gerencia@refeitoriosz.com.br',
    address: 'Av. do Estado, 3000 - Cambuci, SP',
    contact: 'Carlos Eduardo',
    contactRole: 'Coordenador de Produção',
    status: 'Ativo',
    tier: 'Premium',
    tags: ['Refeitório', 'Crítico', 'EPIs'],
    contractStart: '2024-11-01',
    visitDay: 'qua', // Dia fixo: quarta
    notes: 'Refeitório corporativo para 800 funcionários. Auditoria focada em EPIs e cadeia de frio. ATENÇÃO: histórico crítico.',
    lastVisitDate: '2026-04-02',
    lastReportStatus: 'Crítico',
    historicIssues: 'Equipe advertida pela falta sistemática de luvas de malha de aço no setor de carnes. Reincidência em 3 visitas.'
  },
  {
    id: 'cli_004',
    name: 'Restaurante Sabor & Saúde',
    cnpj: '45.678.901/0001-23',
    phone: '(11) 4678-9012',
    whatsapp: '(11) 96543-2109',
    email: 'chef@saboresaude.com.br',
    address: 'Rua Oscar Freire, 780 - Jardins, SP',
    contact: 'Fernanda Costa',
    contactRole: 'Chef Executiva',
    status: 'Ativo',
    tier: 'Standard',
    tags: ['Restaurante', 'A La Carte'],
    contractStart: '2025-08-15',
    visitDay: 'qui', // Dia fixo: quinta
    notes: 'Restaurante gastronômico. Foco em boas práticas de manipulação e rastreabilidade de ingredientes orgânicos.',
    lastVisitDate: '2026-04-03',
    lastReportStatus: 'Conforme',
    historicIssues: 'Nenhum histórico crítico. Excelência operacional.'
  },
  {
    id: 'cli_005',
    name: 'Frigorífico Central Carnes',
    cnpj: '56.789.012/0001-34',
    phone: '(11) 5789-0123',
    whatsapp: '(11) 95432-1098',
    email: 'diretoria@centralcarnes.ind.br',
    address: 'Rod. Anhanguera, Km 47 - Jundiaí, SP',
    contact: 'Roberto Mendes',
    contactRole: 'Diretor de Qualidade',
    status: 'Ativo',
    tier: 'Premium',
    tags: ['Frigorífico', 'SIF', 'Exportação', 'Alta Complexidade'],
    contractStart: '2024-06-01',
    visitDay: 'seg', // Dia fixo: segunda
    notes: 'Planta frigorífica com SIF. Exporta para 3 países. Auditoria completa exigida a cada 15 dias. Inclui checklist APPCC.',
    lastVisitDate: '2026-04-07',
    lastReportStatus: 'Atenção Necessária',
    historicIssues: 'Temperatura da câmara 2 acima do limite (>4°C) por 2h no último registro. Manutenção do compressor em andamento.'
  },
  {
    id: 'cli_006',
    name: 'Padaria & Confeitaria Trigo Dourado',
    cnpj: '67.890.123/0001-45',
    phone: '(11) 6890-1234',
    whatsapp: '(11) 94321-0987',
    email: 'padaria@trigodourado.com',
    address: 'Rua Vergueiro, 2100 - Vila Mariana, SP',
    contact: 'Lúcia Ferreira',
    contactRole: 'Proprietária',
    status: 'Ativo',
    tier: 'Básico',
    tags: ['Padaria', 'Confeitaria', 'Produção Própria'],
    contractStart: '2026-01-10',
    visitDay: 'sex', // Dia fixo: sexta
    notes: 'Produção artesanal com 4 funcionários. Foco em rotulagem e controle de alérgenos (glúten, lactose).',
    lastVisitDate: '2026-04-04',
    lastReportStatus: 'Conforme',
    historicIssues: 'Rótulos de alérgenos estavam incompletos na visita de fevereiro. Corrigido.'
  },
  {
    id: 'cli_007',
    name: 'Hospital Municipal Sta. Clara',
    cnpj: '78.901.234/0001-56',
    phone: '(11) 7901-2345',
    whatsapp: '(11) 93210-9876',
    email: 'nutricao@hm-santaclara.sp.gov.br',
    address: 'Rua Doutor Arnaldo, 455 - Cerqueira César, SP',
    contact: 'Dra. Patrícia Lemos',
    contactRole: 'Nutricionista Chefe',
    status: 'Ativo',
    tier: 'Premium',
    tags: ['Hospitalar', 'Dietas Especiais', 'ANVISA', 'Crítico'],
    contractStart: '2025-03-01',
    visitDay: 'qua', // Dia fixo: quarta
    notes: 'Cozinha hospitalar. Prepara 1200 refeições/dia incluindo dietas enteral, pastosa e hipossódica. Rigor máximo.',
    lastVisitDate: '2026-04-09',
    lastReportStatus: 'Atenção Necessária',
    historicIssues: 'Técnico de enfermagem manipulou alimentos sem lavar as mãos no setor de dietas especiais. Treinamento agendado.'
  },
  {
    id: 'cli_008',
    name: 'Escola Infantil Pequeno Príncipe',
    cnpj: '89.012.345/0001-67',
    phone: '(11) 8012-3456',
    whatsapp: '(11) 92109-8765',
    email: 'coordenacao@pequenoprincipe.edu.br',
    address: 'Rua Haddock Lobo, 330 - Cerqueira César, SP',
    contact: 'Camila Santos',
    contactRole: 'Coordenadora Pedagógica',
    status: 'Ativo',
    tier: 'Standard',
    tags: ['Escola', 'Infantil', 'Alergia Alimentar'],
    contractStart: '2026-02-01',
    visitDay: 'qui', // Dia fixo: quinta
    notes: 'Merenda para 200 crianças (2-6 anos). Protocolo rigoroso para alérgenos. 3 crianças celíacas, 5 com intolerância à lactose.',
    lastVisitDate: '2026-04-10',
    lastReportStatus: 'Conforme',
    historicIssues: 'Sem ocorrências. Equipe muito bem treinada. Manter vigilância de cross-contamination.'
  }
];

// ═══════════════════════════════════════════════
// 2. VISITAS DO MÊS (Abril 2026)
// ═══════════════════════════════════════════════
const v = (id, time, duration, clientId, client, address, isRecurring, contact, lastReportStatus, historicIssues, rescheduleType = null) => ({
  id, time, duration, client, address, status: 'Em aberto', isRecurring, rescheduleType,
  clientData: { contact, lastVisitDate: '—', lastReportStatus, historicIssues }
});

export const visitsMock = {
  // ── Semana 1 (7-11 Abril) ──
  '2026-04-07': [
    v(101, '08:00', '3h', 'cli_005', 'Frigorífico Central Carnes', 'Rod. Anhanguera, Km 47 - Jundiaí', true, 'Roberto Mendes', 'Atenção Necessária', 'Temperatura câmara 2 acima do limite.'),
  ],
  '2026-04-08': [
    v(102, '08:00', '2h', 'cli_001', 'Cozinha Industrial Matriz', 'Av. Paulista, 1500 - Bela Vista', true, 'João Silva', 'Atenção Necessária', 'Problemas com touca e etiquetas.'),
    v(103, '14:00', '1h 30m', 'cli_002', 'Supermercado Nova Era', 'Rua Augusta, 400 - Consolação', true, 'Mariana Oliveira', 'Conforme', 'Sem não-conformidades recentes.'),
  ],
  '2026-04-09': [
    v(104, '08:30', '2h 30m', 'cli_003', 'Refeitório São João', 'Av. do Estado, 3000 - Cambuci', true, 'Carlos Eduardo', 'Crítico', 'Falta de luvas de malha de aço. Reincidência.'),
    v(105, '14:00', '2h', 'cli_007', 'Hospital Municipal Sta. Clara', 'Rua Doutor Arnaldo, 455', true, 'Dra. Patrícia Lemos', 'Atenção Necessária', 'Mãos não higienizadas no setor de dietas.'),
  ],
  '2026-04-10': [
    v(106, '09:00', '1h 30m', 'cli_004', 'Restaurante Sabor & Saúde', 'Rua Oscar Freire, 780 - Jardins', true, 'Fernanda Costa', 'Conforme', 'Nenhum histórico crítico.'),
    v(107, '14:00', '1h', 'cli_008', 'Escola Infantil Pequeno Príncipe', 'Rua Haddock Lobo, 330', true, 'Camila Santos', 'Conforme', 'Sem ocorrências.'),
  ],
  '2026-04-11': [
    v(108, '08:00', '1h 30m', 'cli_006', 'Padaria Trigo Dourado', 'Rua Vergueiro, 2100 - Vila Mariana', true, 'Lúcia Ferreira', 'Conforme', 'Rótulos de alérgenos corrigidos.'),
  ],

  // ── Semana 2 (14-18 Abril — SEMANA ATUAL) ──
  '2026-04-14': [
    v(201, '07:30', '3h', 'cli_005', 'Frigorífico Central Carnes', 'Rod. Anhanguera, Km 47 - Jundiaí', true, 'Roberto Mendes', 'Atenção Necessária', 'Re-checar temperatura câmara 2.'),
  ],
  '2026-04-15': [
    v(202, '08:00', '2h', 'cli_001', 'Cozinha Industrial Matriz', 'Av. Paulista, 1500 - Bela Vista', true, 'João Silva', 'Atenção Necessária', 'Verificar uso de toucas e etiquetas.'),
    v(203, '14:30', '1h 30m', 'cli_002', 'Supermercado Nova Era', 'Rua Augusta, 400 - Consolação', true, 'Mariana Oliveira', 'Conforme', 'Suporte técnico freezer 3.'),
  ],
  '2026-04-16': [
    v(204, '08:30', '2h 30m', 'cli_003', 'Refeitório São João', 'Av. do Estado, 3000 - Cambuci', true, 'Carlos Eduardo', 'Crítico', 'ALERTA: 3ª reincidência em luvas de aço.'),
    v(205, '14:00', '2h', 'cli_007', 'Hospital Municipal Sta. Clara', 'Rua Doutor Arnaldo, 455', true, 'Dra. Patrícia Lemos', 'Atenção Necessária', 'Re-treino higienização de mãos.'),
  ],
  '2026-04-17': [
    v(206, '09:00', '1h 30m', 'cli_004', 'Restaurante Sabor & Saúde', 'Rua Oscar Freire, 780 - Jardins', true, 'Fernanda Costa', 'Conforme', 'Auditoria de rastreabilidade orgânicos.'),
    v(207, '14:00', '1h', 'cli_008', 'Escola Infantil Pequeno Príncipe', 'Rua Haddock Lobo, 330', true, 'Camila Santos', 'Conforme', 'Protocolo alérgenos — verificação mensal.'),
  ],
  '2026-04-18': [
    v(208, '08:00', '1h 30m', 'cli_006', 'Padaria Trigo Dourado', 'Rua Vergueiro, 2100 - Vila Mariana', true, 'Lúcia Ferreira', 'Conforme', 'Checklist rotulagem alérgenos.'),
    v(209, '10:30', '1h', 'cli_002', 'Supermercado Nova Era', 'Rua Augusta, 400 - Consolação', false, 'Mariana Oliveira', 'Conforme', 'Visita extra: calibração termômetros.'),
  ],

  // ── Semana 3 (21-25 Abril) ──
  '2026-04-21': [
    v(301, '07:30', '3h', 'cli_005', 'Frigorífico Central Carnes', 'Rod. Anhanguera, Km 47 - Jundiaí', true, 'Roberto Mendes', 'Atenção', 'Auditoria APPCC quinzenal.'),
  ],
  '2026-04-22': [
    v(302, '08:00', '2h', 'cli_001', 'Cozinha Industrial Matriz', 'Av. Paulista, 1500 - Bela Vista', true, 'João Silva', 'Atenção Necessária', 'Follow-up toucas e etiquetas.'),
    v(303, '14:00', '1h', 'cli_002', 'Supermercado Nova Era', 'Rua Augusta, 400 - Consolação', true, 'Mariana Oliveira', 'Conforme', 'Visita de rotina.'),
  ],
  '2026-04-23': [
    v(304, '08:30', '2h 30m', 'cli_003', 'Refeitório São João', 'Av. do Estado, 3000 - Cambuci', true, 'Carlos Eduardo', 'Crítico', 'Verificar se luvas foram adquiridas.'),
    v(305, '15:00', '2h', 'cli_007', 'Hospital Municipal Sta. Clara', 'Rua Doutor Arnaldo, 455', true, 'Dra. Patrícia Lemos', 'Atenção', 'Acompanhar treinamento equipe.'),
  ],
  '2026-04-24': [
    v(306, '09:00', '1h 30m', 'cli_004', 'Restaurante Sabor & Saúde', 'Rua Oscar Freire, 780 - Jardins', true, 'Fernanda Costa', 'Conforme', 'Rotina quinzenal.'),
    v(307, '14:00', '1h', 'cli_008', 'Escola Infantil Pequeno Príncipe', 'Rua Haddock Lobo, 330', true, 'Camila Santos', 'Conforme', 'Checklist alérgenos + cardápio.'),
  ],
  '2026-04-25': [
    v(308, '08:00', '1h 30m', 'cli_006', 'Padaria Trigo Dourado', 'Rua Vergueiro, 2100 - Vila Mariana', true, 'Lúcia Ferreira', 'Conforme', 'Rotina mensal.'),
  ],

  // ── Semana 4 (28-30 Abril) ──
  '2026-04-28': [
    v(401, '08:00', '3h', 'cli_005', 'Frigorífico Central Carnes', 'Rod. Anhanguera, Km 47 - Jundiaí', true, 'Roberto Mendes', 'Atenção', 'Checklist para relatório mensal SIF.'),
    v(402, '14:00', '1h', 'cli_006', 'Padaria Trigo Dourado', 'Rua Vergueiro, 2100 - Vila Mariana', false, 'Lúcia Ferreira', 'Conforme', 'Visita pontual: nova linha de produtos sem glúten.'),
  ],
  '2026-04-29': [
    v(403, '08:00', '2h', 'cli_001', 'Cozinha Industrial Matriz', 'Av. Paulista, 1500 - Bela Vista', true, 'João Silva', 'Atenção', 'Fechamento mensal de auditoria.'),
    v(404, '14:00', '1h 30m', 'cli_002', 'Supermercado Nova Era', 'Rua Augusta, 400 - Consolação', true, 'Mariana Oliveira', 'Conforme', 'Rotina + entrega de relatório mensal.'),
  ],
  '2026-04-30': [
    v(405, '08:30', '2h', 'cli_003', 'Refeitório São João', 'Av. do Estado, 3000 - Cambuci', true, 'Carlos Eduardo', 'Crítico', 'Fechamento mensal. Decisão: manter ou escalar advertência.'),
    v(406, '14:00', '2h', 'cli_007', 'Hospital Municipal Sta. Clara', 'Rua Doutor Arnaldo, 455', true, 'Dra. Patrícia Lemos', 'Atenção', 'Relatório mensal + análise de conformidade.'),
    v(407, '17:00', '1h', 'cli_008', 'Escola Infantil Pequeno Príncipe', 'Rua Haddock Lobo, 330', false, 'Camila Santos', 'Conforme', 'Reunião com diretoria sobre cardápio de maio.'),
  ],
};

// ═══════════════════════════════════════════════
// 3. LAUDOS EXISTENTES (Histórico)
// ═══════════════════════════════════════════════
export const reportsMock = [
  {
    id: 'lau_001',
    clientId: 'cli_003',
    clientName: 'Refeitório São João',
    date: '2026-04-02',
    status: 'Crítico',
    title: 'RELATÓRIO DE CONFORMIDADE #038',
    summary: 'Identificadas 4 não conformidades críticas: ausência de luvas de malha de aço (reincidência), temperatura de armazenamento acima do limite, falta de etiquetagem em 12 itens e uniforme incompleto em 2 colaboradores.',
    items: ['Luva de Aço', 'Temperatura', 'Etiquetagem', 'Uniforme'],
    auditor: 'Ana Carolina'
  },
  {
    id: 'lau_002',
    clientId: 'cli_005',
    clientName: 'Frigorífico Central Carnes',
    date: '2026-04-07',
    status: 'Atenção Necessária',
    title: 'RELATÓRIO DE CONFORMIDADE #039',
    summary: 'Câmara fria 2 registrou temperatura de 5.2°C por 2h (limite: 4°C). Compressor em manutenção. Demais setores conforme.',
    items: ['Câmara Fria', 'Temperatura'],
    auditor: 'Ana Carolina'
  },
  {
    id: 'lau_003',
    clientId: 'cli_001',
    clientName: 'Cozinha Industrial Matriz',
    date: '2026-04-08',
    status: 'Atenção Necessária',
    title: 'RELATÓRIO DE CONFORMIDADE #040',
    summary: '2 funcionários sem touca descartável no turno da manhã. 5 potes de laticínios sem etiqueta de abertura.',
    items: ['Uso de Touca', 'Etiquetagem'],
    auditor: 'Ana Carolina'
  },
  {
    id: 'lau_004',
    clientId: 'cli_007',
    clientName: 'Hospital Municipal Sta. Clara',
    date: '2026-04-09',
    status: 'Atenção Necessária',
    title: 'RELATÓRIO DE CONFORMIDADE #041',
    summary: 'Técnico manipulou bandeja de dieta especial sem higienizar mãos. Treinamento emergencial requisitado à coordenação.',
    items: ['Higiene das Mãos', 'Dietas Especiais'],
    auditor: 'Ana Carolina'
  },
  {
    id: 'lau_005',
    clientId: 'cli_004',
    clientName: 'Restaurante Sabor & Saúde',
    date: '2026-04-10',
    status: 'Conforme',
    title: 'RELATÓRIO DE CONFORMIDADE #042',
    summary: 'Todas as áreas em conformidade. Rastreabilidade de orgânicos atualizada. Equipe bem treinada.',
    items: [],
    auditor: 'Ana Carolina'
  }
];
