import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertTriangle, RefreshCcw, Tag } from 'lucide-react';
import { saveVisit, subscribeToClients } from '../services/firestore';
import { useAppContext } from '../contexts/AppContext';

const ScheduleModal = ({ isOpen, onClose, initialData }) => {
  // Modes: 'create', 'reschedule'
  const mode = initialData ? 'reschedule' : 'create';
  
  const [client, setClient] = useState('');
  const [date, setDate] = useState('');
  const [timeSection, setTimeSection] = useState('08:00');
  const [duration, setDuration] = useState('2h');
  
  // Create state
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  
  // Get tags from context
  const { visitTags } = useAppContext();
  
  // Reschedule state
  const [rescheduleType, setRescheduleType] = useState('provisional'); // provisional | permanent
  const [reason, setReason] = useState('');

  // Load clients from Firestore for the dropdown
  useEffect(() => {
    const unsub = subscribeToClients((data) => setClients(data));
    return () => unsub();
  }, []);

  // Auto-fill if editing/rescheduling
  useEffect(() => {
    if (initialData) {
      if (Array.isArray(initialData)) {
         setClient(`Lote de ${initialData.length} Cliente(s) selecionado(s)`);
         setDate(initialData[0]?.fullDate || '2026-04-15');
         setTimeSection('--:--');
      } else {
         setClient(initialData.client || '');
         setDate(initialData.date || initialData.dateKey || '2026-04-15');
         setTimeSection(initialData.time || '10:00');
      }
    } else {
      // Reset for create mode
      setClient('');
      setDate('');
      setTimeSection('08:00');
      setDuration('2h');
      setSelectedClientId('');
      setSelectedTag('');
    }
  }, [initialData, isOpen]);

  const isBatchMode = Array.isArray(initialData);
  const isTargetRecurring = isBatchMode ? true : initialData?.isRecurring;

  // ═══ SAVE: Create new visit ═══
  const handleCreate = async () => {
    const selectedClient = clients.find(c => c.id === selectedClientId);
    if (!selectedClient) return alert('Selecione um cliente.');
    if (!date) return alert('Selecione uma data.');
    if (!selectedTag) return alert('Selecione um objetivo para a visita.');

    setSaving(true);
    try {
      const clientData = {
        contact: selectedClient.contactRole || selectedClient.contact || 'Contato',
      };
      if (selectedClient.hasRealAudit) {
        clientData.hasRealAudit = true;
        clientData.lastVisitDate = selectedClient.lastVisitDate;
        clientData.lastReportStatus = selectedClient.lastReportStatus;
        clientData.historicIssues = selectedClient.historicIssues;
      }

      const isRecurring = (selectedTag || 'pontual') === 'rotina_fixa';
      const visitPayload = {
        time: timeSection,
        duration: duration,
        client: selectedClient.name,
        clientId: selectedClient.id,
        address: selectedClient.address || '',
        status: 'Em aberto',
        isRecurring: isRecurring,
        visitType: visitTags.find(t => t.id === selectedTag)?.label || 'Visita / Auditoria',
        tag: selectedTag,
        clientData,
      };

      if (isRecurring) {
        // Criar a visita para as próximas 24 semanas (aprox 6 meses)
        const parts = date.split('-');
        let currentDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
        for (let i = 0; i < 24; i++) {
           const y = currentDate.getFullYear();
           const m = String(currentDate.getMonth() + 1).padStart(2, '0');
           const d = String(currentDate.getDate()).padStart(2, '0');
           const nextKey = `${y}-${m}-${d}`;

           await saveVisit({ ...visitPayload, dateKey: nextKey });
           
           currentDate.setDate(currentDate.getDate() + 7);
        }
      } else {
        await saveVisit({ ...visitPayload, dateKey: date });
      }
      onClose();
    } catch (err) {
      console.error('Erro ao salvar visita:', err);
      alert('Erro ao salvar visita. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // ═══ SAVE: Reschedule existing visit(s) ═══
  const handleReschedule = async () => {
    if (!date) return alert('Selecione a nova data.');

    setSaving(true);
    try {
      const visitsToUpdate = isBatchMode ? initialData : [initialData];
      
      for (const visit of visitsToUpdate) {
        await saveVisit({
          ...visit,
          dateKey: date,
          time: timeSection !== '--:--' ? timeSection : visit.time,
          rescheduleType: rescheduleType,
        });
      }
      onClose();
    } catch (err) {
      console.error('Erro ao reagendar:', err);
      alert('Erro ao reagendar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (mode === 'create') handleCreate();
    else handleReschedule();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} className="reveal-staggered">
      <div className="card" style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-surface)', padding: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-deep)' }}>
           <div>
             <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>
               {mode === 'create' ? 'Agendar Nova Visita' : 'Reagendamento de Rota'}
             </h3>
             <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
               {mode === 'create' ? 'Insira a visita no sistema' : 'Ajuste a rota existente'}
             </p>
           </div>
           <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {mode === 'reschedule' && (
            <div style={{ padding: '1rem', background: 'rgba(212, 163, 115, 0.05)', border: '1px solid rgba(212, 163, 115, 0.3)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={20} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.8rem', color: 'var(--secondary)', display: 'block', marginBottom: '0.3rem' }}>Cliente: {client}</strong>
                {isTargetRecurring ? (
                   <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                     {isBatchMode 
                       ? 'Estas visitas selecionadas sofrerão alteração na agenda. Escolha abaixo como deseja prosseguir com o reagendamento.' 
                       : 'Esta visita estava previamente agendada e faz parte da rotina fixa do cliente. Escolha abaixo como deseja prosseguir com a alteração.'}
                   </p>
                ) : (
                   <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                     Esta é uma solicitação <strong>Pontual</strong> de visita/auditoria (não faz parte da rotina fixa). Reagendá-la fará apenas a troca isolada da data.
                   </p>
                )}
              </div>
            </div>
          )}

          {/* Form Fields */}
          {mode === 'create' && (
            <div>
              <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Cliente / Estabelecimento</label>
              <select 
                value={selectedClientId} 
                onChange={e => setSelectedClientId(e.target.value)} 
                style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-dim)', borderRadius: '4px', background: 'var(--bg-deep)', fontSize: '0.8rem', color: 'var(--text-main)' }}
              >
                <option value="">Selecione um cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div>
                <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Nova Data</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-dim)', padding: '0.8rem', borderRadius: '4px', background: 'var(--bg-deep)' }}>
                  <Calendar size={16} color="var(--text-muted)" />
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.8rem', outline: 'none', color: 'var(--text-main)' }} />
                </div>
             </div>
             <div>
                <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Horário</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-dim)', padding: '0.8rem', borderRadius: '4px', background: 'var(--bg-deep)' }}>
                  <Clock size={16} color="var(--text-muted)" />
                  <input type="time" value={timeSection} onChange={e => setTimeSection(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.8rem', outline: 'none', color: 'var(--text-main)' }} />
                </div>
             </div>
          </div>

          {mode === 'create' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Duração</label>
                <select value={duration} onChange={e => setDuration(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-dim)', borderRadius: '4px', background: 'var(--bg-deep)', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                  <option>1h</option>
                  <option>1h 30m</option>
                  <option>2h</option>
                  <option>2h 30m</option>
                  <option>3h</option>
                </select>
              </div>
              <div>
                <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Objetivo</label>
                <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-dim)', borderRadius: '4px', background: 'var(--bg-deep)', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                  <option value="" disabled>Selecione um objetivo...</option>
                  {visitTags.map(tag => (
                    <option key={tag.id} value={tag.id}>{tag.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Conditional Controls */}
          <div style={{ borderTop: '1px solid var(--border-dim)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
            
            {mode === 'create' ? null : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {!isTargetRecurring ? (
                    <div style={{ padding: '0.5rem 0' }}>
                       <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Modo de Reagendamento: Simples (Visita Solicitada)</span>
                    </div>
                 ) : (
                    <>
                       <label className="stat-label">Tipo de Reagendamento da Rotina FIXA</label>
                       
                       <label style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid', borderColor: rescheduleType === 'provisional' ? 'var(--primary)' : 'var(--border-dim)', borderRadius: 'var(--radius-md)', background: rescheduleType === 'provisional' ? 'rgba(27,61,47,0.05)' : 'var(--bg-deep)', cursor: 'pointer' }}>
                         <input type="radio" name="reschedule" checked={rescheduleType === 'provisional'} onChange={() => setRescheduleType('provisional')} style={{ marginTop: '2px', accentColor: 'var(--primary)' }} />
                         <div>
                           <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Provisório ou Excepcional</div>
                           <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: '1.4' }}>Move apenas a visita desta semana (ex: Devido a Feriado). Semana que vem ela volta ao dia normal.</div>
                         </div>
                       </label>

                       <label style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid', borderColor: rescheduleType === 'permanent' ? 'var(--primary)' : 'var(--border-dim)', borderRadius: 'var(--radius-md)', background: rescheduleType === 'permanent' ? 'rgba(27,61,47,0.05)' : 'var(--bg-deep)', cursor: 'pointer' }}>
                         <input type="radio" name="reschedule" checked={rescheduleType === 'permanent'} onChange={() => setRescheduleType('permanent')} style={{ marginTop: '2px', accentColor: 'var(--primary)' }} />
                         <div>
                           <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Definitivo na Rotina</div>
                           <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: '1.4' }}>A partir de agora, o dia/horário padrão deste cliente foi oficialmente alterado.</div>
                         </div>
                       </label>
                    </>
                 )}

                 <div>
                   <label className="stat-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Motivo (Opcional)</label>
                   <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Feriado nacional, pedido do gerente, etc..." style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-dim)', borderRadius: '4px', background: 'var(--bg-deep)', fontSize: '0.8rem', color: 'var(--text-main)' }} />
                 </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-dim)', background: 'var(--bg-deep)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Salvando...' : (mode === 'create' ? 'Salvar Agendamento' : 'Confirmar Reagendamento')}
          </button>
        </div>
      </div>
    </div>
  );
};


export default ScheduleModal;
