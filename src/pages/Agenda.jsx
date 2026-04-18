import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, X, FileText, FileCheck, ArrowRight, Building, Plus } from 'lucide-react';

const weekDaysMock = [
  { id: '12', dayStr: 'Domingo', date: '12', month: 'ABR', fullDate: '2026-04-12' },
  { id: '13', dayStr: 'Segunda', date: '13', month: 'ABR', fullDate: '2026-04-13' },
  { id: '14', dayStr: 'Terça', date: '14', month: 'ABR', fullDate: '2026-04-14' },
  { id: '15', dayStr: 'Quarta', date: '15', month: 'ABR', fullDate: '2026-04-15' },
  { id: '16', dayStr: 'Quinta', date: '16', month: 'ABR', fullDate: '2026-04-16' },
  { id: '17', dayStr: 'Sexta', date: '17', month: 'ABR', fullDate: '2026-04-17' },
  { id: '18', dayStr: 'Sábado', date: '18', month: 'ABR', fullDate: '2026-04-18' }
];

const visitsMock = {
  '2026-04-14': [],
  '2026-04-15': [
     { id: 1, time: '08:00', duration: '2h', client: 'Cozinha Industrial Matriz', address: 'Av. Paulista, 1500 - Bela Vista', 
       status: 'Em aberto',
       clientData: { 
         contact: 'João Silva / Gerente Geral', 
         lastVisitDate: '01 ABR 2026', 
         lastReportStatus: 'Atenção Necessária',
         historicIssues: 'Problemas recorrentes no uso da touca de proteção e ausência de etiquetas de abertura nos laticínios.' 
       } 
     },
     { id: 2, time: '14:30', duration: '1h 30m', client: 'Supermercado Nova Era', address: 'Rua Augusta, 400 - Consolação',
       status: 'Em aberto',
       clientData: {
         contact: 'Mariana Oliveira / Chefe de Setor',
         lastVisitDate: '28 MAR 2026',
         lastReportStatus: 'Conforme',
         historicIssues: 'Historicamente excelente, porém na última visita notou-se gelo excessivo no fundo do freezer 3. Checar manutenção.'
       }
     }
  ],
  '2026-04-16': [
     { id: 3, time: '09:00', duration: '3h', client: 'Refeitório São João', address: 'Av. do Estado, 3000',
       status: 'Em aberto',
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
  const [selectedDate, setSelectedDate] = useState('2026-04-15');
  const [selectedVisit, setSelectedVisit] = useState(null);

  const activeVisits = visitsMock[selectedDate] || [];

  return (
    <div className="reveal-staggered" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      
      {/* Week Selector Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button className="btn" style={{ padding: '0.4rem', border: '1px solid var(--border-dim)' }}><ChevronLeft size={16} /></button>
          <div className="card" style={{ padding: '0.5rem 2rem', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)' }}>
             <Calendar size={16} color="var(--primary)" />
             Semana 16 <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.75rem', marginLeft: '0.5rem' }}>12/04 - 18/04</span>
          </div>
          <button className="btn" style={{ padding: '0.4rem', border: '1px solid var(--border-dim)' }}><ChevronRight size={16} /></button>
        </div>

        {/* Days Horizontal List */}
        <div className="days-horizontal-scroll" style={{ 
          display: 'flex', width: '100%', overflowX: 'auto', gap: '0.5rem', 
          paddingBottom: '0.5rem', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' 
        }}>
          {weekDaysMock.map((day) => {
            const isActive = selectedDate === day.fullDate;
            const hasVisits = visitsMock[day.fullDate]?.length > 0;
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
      <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* Agenda List Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', gap: '1rem' }} className="reveal-staggered">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Visitas Agendadas</h3>
              <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }}><Plus size={14}/> Nova</button>
           </div>
           
           {activeVisits.length > 0 ? activeVisits.map((visit) => {
             const isSelected = selectedVisit?.id === visit.id;
             return (
               <div 
                 key={visit.id}
                 onClick={() => setSelectedVisit(visit)}
                 style={{ 
                   background: isSelected ? 'rgba(27, 61, 47, 0.05)' : 'var(--bg-surface)', 
                   border: '1px solid',
                   borderColor: isSelected ? 'var(--primary)' : 'var(--border-dim)',
                   borderLeft: isSelected ? '4px solid var(--primary)' : '1px solid var(--border-dim)',
                   borderRadius: 'var(--radius-md)',
                   padding: '1.2rem',
                   cursor: 'pointer',
                   display: 'grid', gridTemplateColumns: '80px 1fr 40px', alignItems: 'center',
                   transition: 'all 0.2s ease',
                 }}
               >
                 <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{visit.time}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{visit.duration}</div>
                 </div>
                 <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.3rem' }}>{visit.client}</h4>
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
        </div>

        {/* Desktop Context Drawer / Side Panel */}
        {selectedVisit && (
          <div className="card desktop-only reveal-staggered" style={{ width: '400px', display: 'flex', flexDirection: 'column', padding: 0 }}>
             {/* Header */}
             <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-dim)', background: 'rgba(27, 61, 47, 0.05)', position: 'relative' }}>
                <button onClick={() => setSelectedVisit(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16}/></button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-minimal)', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                     {selectedVisit.client.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{selectedVisit.client}</h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{selectedVisit.status.toUpperCase()}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                   <Clock size={14} color="var(--primary)" /> Hoje, {selectedVisit.time} <span>({selectedVisit.duration})</span>
                </div>
             </div>

             {/* Content */}
             <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               
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
             <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-dim)', background: 'var(--bg-surface)' }}>
                 <button 
                   onClick={() => navigate('/laudos')} 
                   className="btn btn-primary" 
                   style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
                 >
                    <FileText size={16} /> INICIAR AUDITORIA IA
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

             <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-dim)', background: 'var(--bg-surface)', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
                 <button 
                   onClick={() => navigate('/laudos')} 
                   className="btn btn-primary" 
                   style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
                 >
                    <FileText size={16} /> INICIAR AUDITORIA IA
                 </button>
             </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Agenda;
