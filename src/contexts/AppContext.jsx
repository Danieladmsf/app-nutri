import React, { createContext, useContext, useState, useEffect } from 'react';

// ─── Default Values ───
const DEFAULT_WORK_DAYS = {
  dom: false, seg: true, ter: true, qua: true, qui: true, sex: true, sab: false
};

const DEFAULT_CATEGORIES = [
  {
    id: 'epis',
    label: 'EPIs e Segurança',
    description: 'Itens de proteção individual e segurança do trabalho em ambientes de manipulação de alimentos. A IA deve verificar fotos e relatos buscando ausência, mau estado ou uso incorreto de equipamentos como toucas, luvas, aventais térmicos e botas antiderrapantes.',
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
    description: 'Condições de higienização de superfícies, equipamentos e instalações. A IA deve analisar registros focando em acúmulo de resíduos, sujidade visível, presença de gelo excessivo em refrigeradores e condições gerais de limpeza dos ambientes de produção.',
    items: [
      { id: 'equipamentos', label: 'Equipamentos', text: 'Equipamentos com acúmulo de resíduos e falta de higienização pós-uso.' },
      { id: 'geladeiras', label: 'Geladeiras/Freezers', text: 'Presença de sujidade interna e gelo excessivo nas unidades de refrigeração.' },
      { id: 'camara', label: 'Câmara Fria', text: 'Piso e prateleiras da câmara fria com necessidade urgente de limpeza.' }
    ]
  },
  {
    id: 'processos',
    label: 'Processos e Estocagem',
    description: 'Procedimentos de armazenamento, rotulagem e controle de validade. A IA deve identificar nos relatos e fotos problemas como produtos sem etiqueta, itens vencidos, armazenamento incorreto (no chão, encostado na parede) e falta de controle PVPS (Primeiro que Vence, Primeiro que Sai).',
    items: [
      { id: 'etiquetagem', label: 'Etiquetagem', text: 'Insumos abertos sem etiqueta de identificação de abertura/validade.' },
      { id: 'validade', label: 'Produtos Vencidos', text: 'Identificado produto com data de validade expirada na área de estoque.' },
      { id: 'armazenamento', label: 'Armazenamento', text: 'Insumos armazenados diretamente no chão ou em contato com a parede.' }
    ]
  }
];

const DEFAULT_PROFILE = {
  name: '', email: '', whatsapp: '', crm: '', photo: '', bio: ''
};

// ─── LocalStorage helpers ───
const STORAGE_KEY = 'ana_nutri_settings';

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* silently fail */ }
};

// ─── Context ───
const AppContext = createContext(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }) => {
  const stored = loadFromStorage();

  // Agenda & Rotina
  const [workDays, setWorkDays] = useState(stored?.workDays || DEFAULT_WORK_DAYS);
  const [workStart, setWorkStart] = useState(stored?.workStart || '07:00');
  const [workEnd, setWorkEnd] = useState(stored?.workEnd || '18:00');
  const [slotDuration, setSlotDuration] = useState(stored?.slotDuration || '1h');

  // Perfil
  const [profile, setProfile] = useState(stored?.profile || DEFAULT_PROFILE);

  // Laudo IA Categories
  const [categories, setCategories] = useState(stored?.categories || DEFAULT_CATEGORIES);

  // Persist on change
  useEffect(() => {
    saveToStorage({ workDays, workStart, workEnd, slotDuration, profile, categories });
  }, [workDays, workStart, workEnd, slotDuration, profile, categories]);

  const value = {
    // Agenda settings
    workDays, setWorkDays,
    workStart, setWorkStart,
    workEnd, setWorkEnd,
    slotDuration, setSlotDuration,

    // Profile
    profile, setProfile,

    // Laudo IA
    categories, setCategories,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
