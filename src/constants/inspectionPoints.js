export const INSPECTION_CATEGORIES = [
  {
    id: 'epis',
    label: 'EPIs e Segurança',
    items: [
      { id: 'touca', label: 'Uso de Touca', text: 'Funcionários observados sem o uso correto da touca descartável.' },
      { id: 'luva_termica', label: 'Luva Térmica', text: 'Ausência ou mau estado de conservação de luvas térmicas para manipulação de calor.' },
      { id: 'luva_aco', label: 'Luva de Aço', text: 'Falta do uso de luva de malha de aço para o corte de proteínas.' },
      { id: 'avental', label: 'Avental Térmico', text: 'Operadores de forno sem o uso do avental térmico regulamentar.' },
      { id: 'botas', label: 'Botas de PVC', text: 'Colaboradores sem calçado de segurança antiderrapante (botas de PVC).' },
      { id: 'uniforme', label: 'Uniforme Completo', text: 'Uniforme incompleto ou com sujidade excessiva durante a operação.' }
    ]
  },
  {
    id: 'higiene',
    label: 'Higiene e Limpeza',
    items: [
      { id: 'equipamentos', label: 'Equipamentos', text: 'Equipamentos com acúmulo de resíduos e falta de higienização pós-uso.' },
      { id: 'geladeiras', label: 'Geladeiras/Freezers', text: 'Presença de sujidade interna e gelo excessivo nas unidades de refrigeração.' },
      { id: 'camara', label: 'Câmara Fria', text: 'Piso e prateleiras da câmara fria com necessidade urgente de limpeza.' }
    ]
  },
  {
    id: 'processos',
    label: 'Processos e Estocagem',
    items: [
      { id: 'etiquetagem', label: 'Etiquetagem', text: 'Insumos abertos sem etiqueta de identificação de abertura/validade.' },
      { id: 'validade', label: 'Produtos Vencidos', text: 'Identificado produto com data de validade expirada na área de estoque.' },
      { id: 'armazenamento', label: 'Armazenamento', text: 'Insumos armazenados diretamente no chão ou em contato com a parede.' }
    ]
  }
];
