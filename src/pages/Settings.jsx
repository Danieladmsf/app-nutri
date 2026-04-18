import React, { useState } from 'react';
import { Save, Plus, Trash2, Camera, GripVertical, ChevronRight, Calendar, User, Sparkles, Clock, X, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

// ─── Default Data ───
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

// ─── Subcomponents ───

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.8rem 1.2rem', width: '100%',
      background: active ? 'var(--bg-deep)' : 'transparent',
      border: '1px solid', borderColor: active ? 'var(--border-dim)' : 'transparent',
      borderRadius: 'var(--radius-md)',
      color: active ? 'var(--text-main)' : 'var(--text-muted)',
      fontWeight: active ? 700 : 500, fontSize: '0.85rem',
      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
    }}
  >
    {icon}
    <span style={{ flex: 1 }}>{label}</span>
    <ChevronRight size={14} style={{ opacity: active ? 1 : 0.3 }} />
  </button>
);

// ─── Tab: Agenda & Rotina ───
const AgendaSettings = ({ workDays, setWorkDays, workStart, setWorkStart, workEnd, setWorkEnd, slotDuration, setSlotDuration }) => {
  const dayLabels = {
    dom: 'Domingo', seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta', sex: 'Sexta', sab: 'Sábado'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* Working Days */}
      <section>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.5rem' }}>Dias de Trabalho</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Selecione os dias da semana em que você realiza visitas. A Agenda e o Calendário só exibirão rotas para esses dias.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {Object.entries(dayLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setWorkDays(prev => ({ ...prev, [key]: !prev[key] }))}
              style={{
                padding: '1rem', borderRadius: 'var(--radius-md)',
                border: '1px solid', borderColor: workDays[key] ? 'var(--primary)' : 'var(--border-dim)',
                background: workDays[key] ? 'rgba(27,61,47,0.08)' : 'var(--bg-deep)',
                color: workDays[key] ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <div style={{
                width: '18px', height: '18px', borderRadius: '4px',
                border: '2px solid', borderColor: workDays[key] ? 'var(--primary)' : 'var(--border-dim)',
                background: workDays[key] ? 'var(--primary)' : 'transparent',
                display: 'grid', placeItems: 'center', flexShrink: 0
              }}>
                {workDays[key] && <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 900 }}>✓</span>}
              </div>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Work Hours */}
      <section>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.5rem' }}>Horário de Expediente</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Define o horário visível no grid de calendário. Visitas fora desse intervalo ainda podem ser agendadas.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>INÍCIO</label>
            <input type="time" value={workStart} onChange={e => setWorkStart(e.target.value)}
              style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-minimal)', background: 'var(--bg-deep)', fontSize: '0.85rem', outline: 'none', color: 'var(--text-main)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>FIM</label>
            <input type="time" value={workEnd} onChange={e => setWorkEnd(e.target.value)}
              style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-minimal)', background: 'var(--bg-deep)', fontSize: '0.85rem', outline: 'none', color: 'var(--text-main)' }}
            />
          </div>
        </div>
      </section>

      {/* Slot Duration */}
      <section>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.5rem' }}>Duração Padrão da Visita</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Tempo padrão reservado para cada visita ao criar novos agendamentos.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {['30 min', '45 min', '1h', '1h30', '2h'].map(opt => (
            <button
              key={opt}
              onClick={() => setSlotDuration(opt)}
              style={{
                padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-md)',
                border: '1px solid', borderColor: slotDuration === opt ? 'var(--primary)' : 'var(--border-dim)',
                background: slotDuration === opt ? 'rgba(27,61,47,0.08)' : 'var(--bg-deep)',
                color: slotDuration === opt ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.5rem' }}>Notificações de Rota</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Receba lembretes antes de cada visita agendada via notificação push ou WhatsApp.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Lembrete 30min antes da visita', key: 'reminder30' },
            { label: 'Resumo diário da rota às 07:00', key: 'dailySummary' },
            { label: 'Alerta de reagendamento', key: 'rescheduleAlert' }
          ].map(item => (
            <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.label}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
};

// ─── Tab: Perfil do Usuário ───
const UserProfile = ({ profile, setProfile }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* Avatar */}
      <section style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'var(--bg-deep)', border: '2px dashed var(--border-dim)',
          display: 'grid', placeItems: 'center', position: 'relative', cursor: 'pointer', flexShrink: 0,
          backgroundImage: profile.photo ? `url(${profile.photo})` : 'none',
          backgroundSize: 'cover', backgroundPosition: 'center'
        }}>
          {!profile.photo && <Camera size={24} color="var(--text-muted)" />}
          <div style={{
            position: 'absolute', bottom: '-4px', right: '-4px',
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'var(--primary)', color: 'white',
            display: 'grid', placeItems: 'center', border: '2px solid var(--bg-surface)'
          }}>
            <Camera size={12} />
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Foto de Perfil</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            JPG ou PNG. Máximo 2MB. Será exibida nos laudos gerados.
          </div>
        </div>
      </section>

      {/* Form Fields */}
      <section>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1.5rem' }}>Dados Profissionais</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            { key: 'name', label: 'NOME COMPLETO', placeholder: 'Ana Carolina da Silva', type: 'text' },
            { key: 'email', label: 'E-MAIL PROFISSIONAL', placeholder: 'ana@empresa.com.br', type: 'email' },
            { key: 'whatsapp', label: 'WHATSAPP', placeholder: '(11) 99999-0000', type: 'tel' },
            { key: 'crm', label: 'CRM / REGISTRO PROFISSIONAL', placeholder: 'CRN-3 12345', type: 'text' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
                {field.label}
              </label>
              <input
                type={field.type}
                value={profile[field.key]}
                onChange={e => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                style={{
                  width: '100%', padding: '0.8rem 1rem',
                  border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-minimal)',
                  background: 'var(--bg-deep)', outline: 'none', fontSize: '0.85rem',
                  color: 'var(--text-main)', boxSizing: 'border-box'
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Business Info */}
      <section>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.5rem' }}>Sobre o Escritório</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
          Essas informações aparecerão no cabeçalho dos laudos e relatórios exportados.
        </p>
        <textarea
          value={profile.bio}
          onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Ex: Consultoria em segurança alimentar e auditorias industriais — atuando desde 2015 no Estado de SP."
          style={{
            width: '100%', minHeight: '100px', padding: '1rem',
            border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-minimal)',
            background: 'var(--bg-deep)', outline: 'none', fontSize: '0.85rem',
            color: 'var(--text-main)', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box'
          }}
        />
      </section>
    </div>
  );
};

// ─── Tab: Laudo IA — Categories ───
const LaudoIASettings = ({ categories, setCategories }) => {
  const [editingCatId, setEditingCatId] = useState(null);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemText, setNewItemText] = useState('');

  const updateCategory = (catId, field, value) => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, [field]: value } : c));
  };

  const addItemToCategory = (catId) => {
    if (!newItemLabel.trim()) return;
    setCategories(prev => prev.map(c => {
      if (c.id !== catId) return c;
      return {
        ...c,
        items: [...c.items, { id: `custom_${Date.now()}`, label: newItemLabel, text: newItemText || newItemLabel }]
      };
    }));
    setNewItemLabel('');
    setNewItemText('');
  };

  const removeItem = (catId, itemId) => {
    setCategories(prev => prev.map(c => {
      if (c.id !== catId) return c;
      return { ...c, items: c.items.filter(it => it.id !== itemId) };
    }));
  };

  const addCategory = () => {
    const id = `cat_${Date.now()}`;
    setCategories(prev => [...prev, {
      id, label: 'Nova Categoria', description: 'Descreva aqui o que a IA deve avaliar nesta categoria...', items: []
    }]);
    setEditingCatId(id);
  };

  const removeCategory = (catId) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
    if (editingCatId === catId) setEditingCatId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Explanation */}
      <div style={{ padding: '1.2rem', background: 'rgba(27,61,47,0.04)', border: '1px solid var(--border-dim)', borderLeft: '4px solid var(--primary)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={16} color="var(--primary)" />
          <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>Como funciona?</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
          Cada categoria representa um grupo de itens de inspeção. O <strong>texto descritivo</strong> serve como orientação para a IA: quando o auditor selecionar atalhos ou enviar notas, a IA usará essas descrições para gerar laudos mais precisos e contextualizados. Quanto mais detalhada a descrição, melhor o resultado.
        </p>
      </div>

      {/* Category List */}
      {categories.map(cat => (
        <div key={cat.id} className="card" style={{ padding: 0, border: '1px solid var(--border-dim)', overflow: 'hidden' }}>
          
          {/* Category Header */}
          <div
            onClick={() => setEditingCatId(editingCatId === cat.id ? null : cat.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1.2rem 1.5rem', cursor: 'pointer',
              background: editingCatId === cat.id ? 'var(--bg-deep)' : 'var(--bg-surface)',
              transition: 'background 0.2s'
            }}
          >
            <GripVertical size={16} color="var(--text-muted)" style={{ opacity: 0.4, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{cat.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {cat.items.length} {cat.items.length === 1 ? 'item' : 'itens'} de inspeção
              </div>
            </div>
            <ChevronRight size={16} style={{ transform: editingCatId === cat.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-muted)' }} />
          </div>

          {/* Category Body (expanded) */}
          {editingCatId === cat.id && (
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-dim)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Category Name */}
              <div>
                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>NOME DA CATEGORIA</label>
                <input
                  type="text" value={cat.label}
                  onChange={e => updateCategory(cat.id, 'label', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-minimal)', background: 'var(--bg-deep)', outline: 'none', fontSize: '0.85rem', color: 'var(--text-main)', boxSizing: 'border-box' }}
                />
              </div>

              {/* AI Description */}
              <div>
                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', letterSpacing: '0.1em' }}>
                  ORIENTAÇÃO PARA A IA
                </label>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                  Descreva o que a IA deve procurar ao gerar laudos para esta categoria. Ex: "Verificar registro fotográfico de EPIs faltantes..."
                </p>
                <textarea
                  value={cat.description}
                  onChange={e => updateCategory(cat.id, 'description', e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-minimal)', background: 'var(--bg-deep)', outline: 'none', fontSize: '0.8rem', color: 'var(--text-main)', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                />
              </div>

              {/* Items */}
              <div>
                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>
                  ITENS DE INSPEÇÃO ({cat.items.length})
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {cat.items.map(item => (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      padding: '0.75rem 1rem', background: 'var(--bg-deep)',
                      border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-minimal)'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.2rem' }}>{item.label}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.text}</div>
                      </div>
                      <button
                        onClick={() => removeItem(cat.id, item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem', flexShrink: 0, opacity: 0.5, transition: 'opacity 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Item */}
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(27,61,47,0.02)', border: '1px dashed var(--border-dim)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>ADICIONAR ITEM</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input
                      type="text" value={newItemLabel}
                      onChange={e => setNewItemLabel(e.target.value)}
                      placeholder="Nome do item (ex: Piso Escorregadio)"
                      style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-minimal)', background: 'var(--bg-surface)', outline: 'none', fontSize: '0.8rem', color: 'var(--text-main)', boxSizing: 'border-box' }}
                    />
                    <input
                      type="text" value={newItemText}
                      onChange={e => setNewItemText(e.target.value)}
                      placeholder="Texto descritivo para o laudo (ex: Piso molhado sem sinalização...)"
                      style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-minimal)', background: 'var(--bg-surface)', outline: 'none', fontSize: '0.8rem', color: 'var(--text-main)', boxSizing: 'border-box' }}
                    />
                    <button
                      onClick={() => addItemToCategory(cat.id)}
                      className="btn"
                      style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                    >
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div style={{ borderTop: '1px solid var(--border-dim)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => removeCategory(cat.id)}
                  className="btn"
                  style={{ color: '#c0392b', borderColor: '#c0392b20', fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                >
                  <Trash2 size={14} /> Excluir Categoria
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add Category */}
      <button
        onClick={addCategory}
        className="btn"
        style={{
          width: '100%', justifyContent: 'center', padding: '1rem',
          border: '2px dashed var(--border-dim)', background: 'transparent',
          fontSize: '0.85rem', fontWeight: 700
        }}
      >
        <Plus size={16} /> Nova Categoria de Inspeção
      </button>
    </div>
  );
};


// ─── Main Settings Page ───
const Settings = () => {
  const [activeTab, setActiveTab] = useState('agenda');
  const [isSaving, setIsSaving] = useState(false);

  // All state now comes from the global AppContext (shared + persisted in localStorage)
  const {
    workDays, setWorkDays,
    workStart, setWorkStart,
    workEnd, setWorkEnd,
    slotDuration, setSlotDuration,
    profile, setProfile,
    categories, setCategories,
  } = useAppContext();

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1200);
    // Data already auto-persists via AppContext useEffect
  };

  const tabs = [
    { id: 'agenda', label: 'Agendamento & Rotina', icon: <Calendar size={16} /> },
    { id: 'perfil', label: 'Perfil do Usuário', icon: <User size={16} /> },
    { id: 'laudo', label: 'Laudo IA', icon: <Sparkles size={16} /> },
  ];

  return (
    <div className="reveal-staggered" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-dim)', paddingBottom: '1rem' }}>
        <div className="flex-toolbar" style={{ gap: '1rem', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Configurações
          </h1>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1.5rem', fontSize: '0.75rem' }}
            disabled={isSaving}
          >
            {isSaving ? <Clock size={14} className="spin" /> : <Save size={14} />}
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </header>

      {/* Horizontal Tabs + Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

        {/* Tab Navigation — horizontal on top */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border-dim)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.8rem 1.5rem',
                background: 'transparent',
                border: 'none', borderBottom: '2px solid',
                borderBottomColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="card" style={{ padding: '2rem', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          {activeTab === 'agenda' && (
            <AgendaSettings
              workDays={workDays} setWorkDays={setWorkDays}
              workStart={workStart} setWorkStart={setWorkStart}
              workEnd={workEnd} setWorkEnd={setWorkEnd}
              slotDuration={slotDuration} setSlotDuration={setSlotDuration}
            />
          )}
          {activeTab === 'perfil' && (
            <UserProfile profile={profile} setProfile={setProfile} />
          )}
          {activeTab === 'laudo' && (
            <LaudoIASettings categories={categories} setCategories={setCategories} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
