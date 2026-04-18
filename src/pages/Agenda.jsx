import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, X, FileText, FileCheck, ArrowRight, Building, Plus } from 'lucide-react';

const generateWeekDays = (startDateStr) => {
  const parts = startDateStr.split('-');
  const start = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0); // Bloqueando ao meio-dia para evitar bug de fuso horário
  
  const days = [];
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  
  for(let i = 0; i < 7; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    
    days.push({
      id: `${yyyy}${mm}${dd}`,
      dayStr: dayNames[current.getDay()],
      date: dd,
      month: monthNames[current.getMonth()],
      fullDate: `${yyyy}-${mm}-${dd}`
    });
  }
  return days;
}

const shiftWeek = (startDateStr, daysToShift) => {
  const parts = startDateStr.split('-');
  const d = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  d.setDate(d.getDate() + daysToShift);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const initialVisitsMock = {
  '2026-04-14': [],
  '2026-04-15': [
     { id: 1, time: '08:00', duration: '2h', client: 'Cozinha Industrial Matriz', address: 'Av. Paulista, 1500 - Bela Vista', 
       status: 'Em aberto',
       isRecurring: true, // É da rotina fixa
       clientData: { 
         contact: 'João Silva / Gerente Geral', 
         lastVisitDate: '01 ABR 2026', 
         lastReportStatus: 'Atenção Necessária',
         historicIssues: 'Problemas recorrentes no uso da touca de proteção e ausência de etiquetas de abertura nos laticínios.' 
       } 
     },
     { id: 2, time: '14:30', duration: '1h 30m', client: 'Supermercado Nova Era', address: 'Rua Augusta, 400 - Consolação',
       status: 'Em aberto',
       isRecurring: false, // Visita solicitada/pontual
       clientData: {
         contact: 'Mariana Oliveira / Chefe de Setor',
         lastVisitDate: '28 MAR 2026',
         lastReportStatus: 'Conforme',
         historicIssues: 'Historicamente excelente, porém solicitou suporte térmico no freezer 3. Visita técnica.'
       }
     }
  ],
  '2026-04-16': [
     { id: 3, time: '09:00', duration: '3h', client: 'Refeitório São João', address: 'Av. do Estado, 3000',
       status: 'Em aberto',
       isRecurring: true,
       clientData: {
         contact: 'Carlos Eduardo',
         lastVisitDate: '15 MAR 2026',
         lastReportStatus: 'Crítico',
         historicIssues: 'Equipe foi advertida pela falta sistemática de luvas de malha de aço no setor de carnes.'
       }
     }
  ]
};

const Agenda = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('diaria'); // 'diaria' | 'mensal'
  const [weekStartObj, setWeekStartObj] = useState('2026-04-12'); // O domingo base
  const [selectedDate, setSelectedDate] = useState('2026-04-15');
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedVisits, setSelectedVisits] = useState([]);
  const [visitsData, setVisitsData] = useState(initialVisitsMock);

  useEffect(() => {
    const handleSaveSchedule = (e) => {
       const { newDate, visits, rescheduleType } = e.detail;
       if (!newDate || !visits) return;
       
       setVisitsData(prev => {
         const newState = { ...prev };
         const visitsArray = Array.isArray(visits) ? visits : [visits];
         
         // Remove from origins
         Object.keys(newState).forEach(date => {
            newState[date] = newState[date].filter(v => !visitsArray.find(mv => mv.id === v.id));
         });
         
         // Add to destination
         if (!newState[newDate]) newState[newDate] = [];
         visitsArray.forEach(v => {
            newState[newDate].push({ 
                ...v, 
                time: '12:00', // Mocking same time, logic can expand later
                rescheduleType 
            }); 
         });
         return newState;
       });

       setIsSelectMode(false);
       setSelectedVisits([]);
       setSelectedDate(newDate);
       
       // Force week jump if necessary
       setWeekStartObj(newDate); 
    };

    window.addEventListener('saveSchedule', handleSaveSchedule);
    return () => window.removeEventListener('saveSchedule', handleSaveSchedule);
  }, []);

  const toggleVisitSelection = (visit) => {
    if (selectedVisits.find(v => v.id === visit.id)) {
       setSelectedVisits(selectedVisits.filter(v => v.id !== visit.id));
    } else {
       setSelectedVisits([...selectedVisits, visit]);
    }
  }

  const weekDays = generateWeekDays(weekStartObj);
  const activeVisits = visitsData[selectedDate] || [];

  const handlePrevWeek = () => {
    setWeekStartObj(prev => shiftWeek(prev, -7));
  }

  const handleNextWeek = () => {
    setWeekStartObj(prev => shiftWeek(prev, 7));
  }

  return (
    <div className="reveal-staggered" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Toolbar */}
      <div className="flex-toolbar" style={{ gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }} className="full-width-mobile">
          <div className="card" style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
             <button 
                onClick={() => setViewMode('diaria')}
                className="btn" 
                style={{ border: 'none', background: viewMode === 'diaria' ? 'var(--bg-deep)' : 'transparent', boxShadow: viewMode === 'diaria' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', color: viewMode === 'mensal' ? 'var(--text-muted)' : 'var(--text-main)', transition: 'all 0.2s' }}>
               Agenda Diária
             </button>
             <button 
                onClick={() => setViewMode('mensal')}
                className="btn" 
                style={{ border: 'none', background: viewMode === 'mensal' ? 'var(--bg-deep)' : 'transparent', boxShadow: viewMode === 'mensal' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', color: viewMode === 'diaria' ? 'var(--text-muted)' : 'var(--text-main)', transition: 'all 0.2s' }}>
               Visão Mensal (Rotas)
             </button>
          </div>
        </div>
      </div>

      {viewMode === 'mensal' ? (
        <div className="reveal-staggered" style={{ padding: '6rem 2rem', textAlign: 'center', background: 'var(--bg-surface)', border: '1px dashed var(--border-dim)', borderRadius: 'var(--radius-md)', flex: 1 }}>
           <Calendar size={48} style={{ opacity: 0.2, margin: '0 auto 1.5rem', color: 'var(--text-main)' }} />
           <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Módulo de Visão Mensal</h3>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
              O calendário expandido de planejamento será liberado na próxima etapa do desenvolvimento. Por enquanto, utilize a <strong>Agenda Diária</strong> para as operações de campo.
           </p>
           <button onClick={() => setViewMode('diaria')} className="btn btn-primary" style={{ marginTop: '2rem' }}>Voltar para a Agenda Diária</button>
        </div>
      ) : (
        <>
          {/* Week Selector Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button onClick={handlePrevWeek} className="btn" style={{ padding: '0.4rem', border: '1px solid var(--border-dim)' }}><ChevronLeft size={16} /></button>
          <div className="card" style={{ padding: '0.5rem 2rem', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)' }}>
             <Calendar size={16} color="var(--primary)" />
             Semana Atual <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.75rem', marginLeft: '0.5rem' }}>{weekDays[0].date}/{weekDays[0].month} - {weekDays[6].date}/{weekDays[6].month}</span>
          </div>
          <button onClick={handleNextWeek} className="btn" style={{ padding: '0.4rem', border: '1px solid var(--border-dim)' }}><ChevronRight size={16} /></button>
        </div>

        {/* Days Horizontal List */}
        <div className="days-horizontal-scroll" style={{ 
          display: 'flex', width: '100%', overflowX: 'auto', gap: '0.5rem', 
          paddingBottom: '0.5rem', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' 
        }}>
          {weekDays.map((day) => {
            const isActive = selectedDate === day.fullDate;
            const hasVisits = visitsData[day.fullDate]?.length > 0;
            return (
              <button 
                key={day.id}
                onClick={() => { setSelectedDate(day.fullDate); setSelectedVisit(null); }}
                style={{ 
                  flex: '0 0 auto',
                  minWidth: '110px', 
                  padding: '1.2rem 1rem', 
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--bg-surface)' : 'var(--bg-deep)',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--primary)' : 'var(--border-dim)',
                  borderBottom: isActive ? '3px solid var(--primary)' : '1px solid var(--border-dim)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {hasVisits && !isActive && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                )}
                <span style={{ fontSize: '0.7rem', color: isActive ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  {day.dayStr}
                </span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: '1' }}>
                  {day.date}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '0.2rem' }}>
                  {day.month}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Area: List vs Side Panel */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Agenda List Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '5rem' }} className="reveal-staggered">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Visitas Agendadas</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                 {isSelectMode && activeVisits.length > 0 && (
                   <button 
                     onClick={() => {
                        if (selectedVisits.length === activeVisits.length) {
                           setSelectedVisits([]);
                        } else {
                           setSelectedVisits([...activeVisits]);
                        }
                     }}
                     className="btn"
                     style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid var(--border-dim)', color: 'var(--text-main)' }}>
                     {selectedVisits.length === activeVisits.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                   </button>
                 )}
                 <button 
                   onClick={() => { setIsSelectMode(!isSelectMode); setSelectedVisits([]); }} 
                   className="btn" 
                   style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', background: isSelectMode ? 'var(--primary)' : 'transparent', border: isSelectMode ? '1px solid var(--primary)' : '1px solid var(--border-dim)', color: isSelectMode ? 'white' : 'var(--text-main)' }}>
                   {isSelectMode ? 'Cancelar Seleção' : 'Reagendar'}
                 </button>
              </div>
           </div>
           
           {activeVisits.length > 0 ? activeVisits.map((visit) => {
             const isSelected = selectedVisit?.id === visit.id;
             const isChecked = selectedVisits.some(v => v.id === visit.id);
             return (
               <div 
                 key={visit.id}
                 onClick={() => {
                    if (isSelectMode) toggleVisitSelection(visit);
                    else setSelectedVisit(visit);
                 }}
                 style={{ 
                   background: (isSelected || isChecked) ? 'rgba(27, 61, 47, 0.05)' : 'var(--bg-surface)', 
                   border: '1px solid',
                   borderColor: (isSelected || isChecked) ? 'var(--primary)' : 'var(--border-dim)',
                   borderLeft: (isSelected || isChecked) ? '4px solid var(--primary)' : '1px solid var(--border-dim)',
                   borderRadius: 'var(--radius-md)',
                   padding: '1.2rem',
                   cursor: 'pointer',
                   display: 'grid', gridTemplateColumns: isSelectMode ? '30px 80px 1fr 40px' : '80px 1fr 40px', alignItems: 'center',
                   transition: 'all 0.2s ease',
                 }}
               >
                 {isSelectMode && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                       <input type="checkbox" checked={isChecked} readOnly style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                    </div>
                 )}
                 <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{visit.time}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{visit.duration}</div>
                 </div>
                 <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                       {visit.client} 
                       {visit.isRecurring === false && <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', background: 'rgba(212,163,115,0.1)', color: 'var(--secondary)', borderRadius: '4px', border: '1px solid currentColor', whiteSpace: 'nowrap' }}>PONTUAL</span>}
                       {visit.isRecurring === true && <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', background: 'rgba(27,61,47,0.1)', color: 'var(--primary)', borderRadius: '4px', border: '1px solid currentColor', whiteSpace: 'nowrap' }}>ROTINA FIXA</span>}
                       {visit.rescheduleType === 'provisional' && <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', background: '#fff9ed', color: '#b27a00', borderRadius: '4px', border: '1px dashed currentColor', whiteSpace: 'nowrap' }}>&bull; EXCEPCIONAL</span>}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>

                       <MapPin size={12} /> {visit.address}
                    </div>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'flex-end', color: isSelected ? 'var(--primary)' : 'var(--border-dim)' }}>
                    <ChevronRight size={20} />
                 </div>
               </div>
             )
           }) : (
             <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-surface)', border: '1px dashed var(--border-dim)', borderRadius: 'var(--radius-md)' }}>
                <Calendar size={32} style={{ opacity: 0.3, margin: '0 auto 1rem', color: 'var(--text-main)' }} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Nenhuma visita agendada</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Aproveite o dia livre para emitir relatórios ou criar uma nova rotina.</p>
             </div>
           )}

           {/* Mass Action Floating Button */}
           {isSelectMode && selectedVisits.length > 0 && (
              <div style={{ position: 'sticky', bottom: '1rem', marginTop: 'auto', zIndex: 10 }}>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('openScheduleModal', { detail: selectedVisits }))}
                  className="btn btn-primary reveal-staggered" 
                  style={{ width: '100%', padding: '1.2rem', justifyContent: 'center', boxShadow: '0 8px 24px rgba(27,61,47,0.2)' }}>
                  Reagendar {selectedVisits.length} visita{selectedVisits.length > 1 ? 's' : ''}
                </button>
              </div>
           )}
        </div>

        {/* Desktop Context Drawer / Side Panel */}
        {selectedVisit && (
          <div className="card desktop-only reveal-staggered" style={{ width: '400px', display: 'flex', flexDirection: 'column', padding: 0, position: 'sticky', top: '100px' }}>
             {/* Header */}
             <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-dim)', background: 'rgba(27, 61, 47, 0.05)', position: 'relative' }}>
                <button onClick={() => setSelectedVisit(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16}/></button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-minimal)', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                     {selectedVisit.client.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{selectedVisit.client}</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                       <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'var(--bg-deep)', borderRadius: '4px', fontWeight: 700, color: 'var(--text-main)' }}>{selectedVisit.status.toUpperCase()}</span>
                       <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: selectedVisit.isRecurring ? 'rgba(27,61,47,0.1)' : 'rgba(212,163,115,0.1)', color: selectedVisit.isRecurring ? 'var(--primary)' : 'var(--secondary)', borderRadius: '4px', fontWeight: 700 }}>
                          {selectedVisit.isRecurring ? 'ROTINA FIXA' : 'VISITA PONTUAL'}
                       </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                   <Clock size={14} color="var(--primary)" /> Hoje, {selectedVisit.time} <span>({selectedVisit.duration})</span>
                </div>
             </div>

             {/* Content */}
             <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               
               {/* CRM Info */}
               <div>
                 <h5 className="stat-label" style={{ marginBottom: '0.5rem' }}>CONTATO RESPONSÁVEL</h5>
                 <div style={{ fontSize: '0.85rem' }}>{selectedVisit.clientData.contact}</div>
               </div>

               {/* Historic Context */}
               <div style={{ background: 'var(--bg-deep)', padding: '1rem', border: '1px solid var(--border-dim)' }}>
                 <h5 className="stat-label" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileCheck size={14} /> ÚLTIMA AUDITORIA ({selectedVisit.clientData.lastVisitDate})
                 </h5>
                 <div style={{ display: 'inline-block', padding: '0.2rem 0.6rem', fontSize: '0.65rem', fontWeight: 700, borderRadius: '4px', background: selectedVisit.clientData.lastReportStatus === 'Conforme' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(212, 163, 115, 0.1)', color: selectedVisit.clientData.lastReportStatus === 'Conforme' ? 'var(--primary)' : 'var(--secondary)', marginBottom: '0.8rem' }}>
                    STATUS: {selectedVisit.clientData.lastReportStatus}
                 </div>
                 <p style={{ fontSize: '0.8rem', lineHeight: '1.5', color: 'var(--text-muted)' }}>
                    <strong>Foco de Atenção:</strong> {selectedVisit.clientData.historicIssues}
                 </p>
               </div>
             </div>

             {/* Actions Footers */}
             <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-dim)', background: 'var(--bg-surface)', display: 'flex', gap: '1rem' }}>
                 <button 
                   onClick={() => window.dispatchEvent(new CustomEvent('openScheduleModal', { detail: selectedVisit }))} 
                   className="btn" 
                   style={{ flex: 1, justifyContent: 'center', padding: '1rem' }}
                 >
                    Reagendar
                 </button>
                 <button 
                   onClick={() => navigate('/laudos')} 
                   className="btn btn-primary" 
                   style={{ flex: 2, justifyContent: 'center', padding: '1rem' }}
                 >
                    <FileText size={16} /> AUDITORIA IA
                 </button>
             </div>
          </div>
        )}
      </div>

      {/* Mobile Context Modal/Drawer */}
      {selectedVisit && (
        <div className="mobile-only" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
        }}>
          <div style={{ background: 'var(--bg-surface)', width: '100%', maxHeight: '90vh', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
             <div style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid var(--border-dim)', position: 'relative' }}>
                <div style={{ width: '40px', height: '4px', background: 'var(--border-dim)', borderRadius: '2px', margin: '0 auto 1rem' }}></div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>{selectedVisit.client}</h4>
                <button onClick={() => setSelectedVisit(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={20}/></button>
             </div>
             
             <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)', border: '1px solid var(--border-dim)', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)' }}>
                   <Clock size={16} color="var(--primary)" /> {selectedVisit.time} <span>({selectedVisit.duration})</span>
                </div>
                
                <div>
                  <h5 className="stat-label" style={{ marginBottom: '0.5rem' }}>CONTEXTO DA ÚLTIMA VISITA</h5>
                  <p style={{ fontSize: '0.8rem', lineHeight: '1.6', color: 'var(--text-muted)', background: 'rgba(212,163,115,0.05)', padding: '1rem', borderLeft: '3px solid var(--secondary)' }}>
                     {selectedVisit.clientData.historicIssues}
                  </p>
                </div>
             </div>

             <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-dim)', background: 'var(--bg-surface)', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))', display: 'flex', gap: '1rem' }}>
                 <button 
                   onClick={() => window.dispatchEvent(new CustomEvent('openScheduleModal', { detail: selectedVisit }))} 
                   className="btn" 
                   style={{ flex: 1, justifyContent: 'center', padding: '1rem' }}
                 >
                    Reagendar
                 </button>
                 <button 
                   onClick={() => navigate('/laudos')} 
                   className="btn btn-primary" 
                   style={{ flex: 2, justifyContent: 'center', padding: '1rem' }}
                 >
                    <FileText size={16} /> AUDITORIA IA
                 </button>
             </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default Agenda;
