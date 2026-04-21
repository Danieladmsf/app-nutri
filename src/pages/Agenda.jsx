import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, X, FileText, FileCheck, ArrowRight, Building, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

// Map JS getDay() index to workDays keys
const DAY_KEY_MAP = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

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
      dayKey: DAY_KEY_MAP[current.getDay()],
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

const generateMonthCalendar = (year, month) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); 

  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const mm = String(month).padStart(2, '0');
    const dd = String(i).padStart(2, '0');
    days.push({
       date: i,
       fullDate: `${year}-${mm}-${dd}`
    });
  }
  return days;
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
};

const parseDurationToMinutes = (durationStr) => {
  if (!durationStr) return 60; 
  let mins = 0;
  const text = durationStr.toLowerCase();
  
  const hoursMatch = text.match(/(\d+)\s*h/);
  if (hoursMatch) mins += parseInt(hoursMatch[1]) * 60;
  
  const minsMatch = text.match(/(\d+)\s*m/);
  if (minsMatch) mins += parseInt(minsMatch[1]);
  
  return mins;
};

import { subscribeToVisits, deleteVisit, subscribeToClients } from '../services/firestore';

const Agenda = () => {
  const navigate = useNavigate();
  const { workDays, workStart, workEnd, laudos, visitTags } = useAppContext();

  // Calcula a data de hoje e o domingo da semana atual
  const getInitialDates = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());

    const fmt = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };

    return { weekStart: fmt(sunday), today: fmt(today) };
  };

  const initialDates = getInitialDates();
  const [viewMode, setViewMode] = useState('diaria');
  const [weekStartObj, setWeekStartObj] = useState(initialDates.weekStart);
  const [selectedDate, setSelectedDate] = useState(initialDates.today);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedVisits, setSelectedVisits] = useState([]);
  const [visitsData, setVisitsData] = useState({});
  const [clients, setClients] = useState([]);
  const [fullNoteModal, setFullNoteModal] = useState(null);

  // Se hoje for dia de folga, avança para o próximo dia de trabalho
  useEffect(() => {
    const todayKey = DAY_KEY_MAP[new Date().getDay()];
    if (workDays[todayKey] === false) {
      const now = new Date();
      const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
      for (let i = 1; i <= 7; i++) {
        cursor.setDate(cursor.getDate() + 1);
        const key = DAY_KEY_MAP[cursor.getDay()];
        if (workDays[key] !== false) {
          const y = cursor.getFullYear();
          const m = String(cursor.getMonth() + 1).padStart(2, '0');
          const d = String(cursor.getDate()).padStart(2, '0');
          const nextWorkDate = `${y}-${m}-${d}`;
          setSelectedDate(nextWorkDate);
          // Se o próximo dia útil for em outra semana, ajustar a semana também
          const sun = new Date(cursor);
          sun.setDate(cursor.getDate() - cursor.getDay());
          const sy = sun.getFullYear();
          const sm = String(sun.getMonth() + 1).padStart(2, '0');
          const sd = String(sun.getDate()).padStart(2, '0');
          setWeekStartObj(`${sy}-${sm}-${sd}`);
          break;
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsub = subscribeToVisits((data) => {
      setVisitsData(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeToClients((data) => {
      setClients(data);
    });
    return () => unsub();
  }, []);

  // Resolve dados do cliente ao vivo (by id primeiro; fallback por nome para visitas antigas sem clientId)
  const getLiveClientData = (visit) => {
    if (!visit) return null;
    const snap = visit.clientData || {};
    const byId = visit.clientId ? clients.find(c => c.id === visit.clientId) : null;
    const byName = !byId && visit.client ? clients.find(c => c.name === visit.client) : null;
    const live = byId || byName;
    if (!live) return snap;
    return {
      contact: live.contactRole || live.contact || snap.contact || 'Contato',
      hasRealAudit: live.hasRealAudit === true,
      lastVisitDate: live.lastVisitDate,
      lastReportStatus: live.lastReportStatus,
      historicIssues: live.historicIssues,
    };
  };

  const toggleVisitSelection = (visit) => {
    if (selectedVisits.find(v => v.id === visit.id)) {
       setSelectedVisits(selectedVisits.filter(v => v.id !== visit.id));
    } else {
       setSelectedVisits([...selectedVisits, visit]);
    }
  };

  const handleDeleteVisit = async (visitId) => {
    if (window.confirm("Certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.")) {
       try {
         await deleteVisit(visitId);
         setSelectedVisit(null);
       } catch (e) {
         console.error(e);
         alert("Erro ao excluir agendamento. Tente novamente.");
       }
    }
  };

  const weekDays = generateWeekDays(weekStartObj);
  const activeVisits = visitsData[selectedDate] || [];

  const handlePrevWeek = () => {
    setWeekStartObj(prev => shiftWeek(prev, -7));
    setSelectedDate(prev => shiftWeek(prev, -7));
    setSelectedVisit(null);
  }

  const handleNextWeek = () => {
    setWeekStartObj(prev => shiftWeek(prev, 7));
    setSelectedDate(prev => shiftWeek(prev, 7));
    setSelectedVisit(null);
  }

  return (
    <div className={`reveal-staggered ${viewMode === 'mensal' ? 'agenda-mensal-page' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Header Toolbar */}
      <header className="agenda-page-header" style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border-dim)', paddingBottom: '1rem' }}>
        <div className="flex-toolbar" style={{ gap: '1rem', alignItems: 'center' }}>

          {/* Title + Selected Date */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
               Rotinas
            </h1>
            {viewMode === 'mensal' && (
              <>
                <span style={{ color: 'var(--border-dim)', fontWeight: 300 }}>|</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'capitalize' }}>
                  {weekDays.find(d => d.fullDate === selectedDate)?.dayStr || 'Data'},
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {selectedDate.split('-').reverse().join('/')}
                </span>
              </>
            )}
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
             
             {/* View Mode Toggles */}
             <div className="card" style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
                <button 
                   onClick={() => setViewMode('diaria')}
                   className="btn" 
                   style={{ border: 'none', background: viewMode === 'diaria' ? 'var(--bg-deep)' : 'transparent', boxShadow: viewMode === 'diaria' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', color: viewMode === 'mensal' ? 'var(--text-muted)' : 'var(--text-main)', transition: 'all 0.2s', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                  Agenda Diária
                </button>
                <button 
                   onClick={() => setViewMode('mensal')}
                   className="btn" 
                   style={{ border: 'none', background: viewMode === 'mensal' ? 'var(--bg-deep)' : 'transparent', boxShadow: viewMode === 'mensal' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', color: viewMode === 'diaria' ? 'var(--text-muted)' : 'var(--text-main)', transition: 'all 0.2s', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                  Visão Calendário
                </button>
             </div>

             <button 
               onClick={() => window.dispatchEvent(new CustomEvent('openScheduleModal', { detail: null }))}
               className="btn btn-primary" 
               style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
             >
               + NOVA VISITA
             </button>

          </div>
        </div>
      </header>

      {viewMode === 'mensal' ? (
        <div className="reveal-staggered agenda-hero-layout" style={{ width: '100%' }}>
           
              <div className="agenda-sidebar">
              <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-md)' }}>
                 <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.2rem' }}>Mês Base</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.8rem' }}>
                   {['D','S','T','Q','Q','S','S'].map((d, idx) => (
                      <div key={idx} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.3rem 0' }}>{d}</div>
                   ))}
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.3rem' }}>
                   {generateMonthCalendar(2026, 4).map((dayObj, i) => {
                      if (!dayObj) return <div key={`empty-${i}`} style={{ background: 'transparent' }} />;
                      const isSelected = selectedDate === dayObj.fullDate;
                      const dayVisits = visitsData[dayObj.fullDate] || [];
                      const hasVisits = dayVisits.length > 0;
                      return (
                         <div
                           key={dayObj.fullDate}
                           onClick={() => {
                              setSelectedDate(dayObj.fullDate);
                              setWeekStartObj(dayObj.fullDate);
                              setSelectedVisit(null);
                           }}
                           className={`cal-day-cell ${isSelected ? 'cal-day-cell--selected' : ''}`}
                           style={{ 
                             margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                             background: isSelected ? 'var(--primary)' : 'var(--bg-surface)', 
                             color: isSelected ? 'white' : 'var(--text-main)',
                             borderRadius: 'var(--radius-minimal)', fontSize: '0.8rem', fontWeight: isSelected ? 800 : 500,
                             cursor: 'pointer', position: 'relative', transition: 'all 0.15s ease',
                             border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-dim)'
                           }}>
                            {dayObj.date}
                            {hasVisits && !isSelected && <div style={{ position: 'absolute', bottom: '3px', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }}></div>}
                         </div>
                      )
                   })}
                 </div>
              </div>

           </div>

           {/* Hourly Grid View */}
           <div className="agenda-timeline-col">
             {/* Context Action Menu for Selected Visit (only renders when a visit is selected) */}
             {selectedVisit && (() => {
               const linkedLaudo = (laudos || []).find(l => l.visitId === selectedVisit.id);
               return (
                 <div className="agenda-timeline-header reveal-staggered" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', padding: '0.5rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dim)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>FOCO: <span style={{color: 'var(--primary)'}}>{selectedVisit.client}</span></span>
                    <span style={{ width: '1px', height: '20px', background: 'var(--border-dim)', margin: '0 0.5rem' }}></span>
                    <button onClick={() => window.dispatchEvent(new CustomEvent('openScheduleModal', { detail: selectedVisit }))} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Reagendar</button>
                    <button onClick={() => navigate('/laudos', { state: { client: selectedVisit.client, clientId: selectedVisit.clientId, visitId: selectedVisit.id, laudoId: linkedLaudo?.id } })} className={linkedLaudo ? "btn" : "btn btn-primary"} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', border: linkedLaudo ? '1px solid var(--primary)' : 'none', color: linkedLaudo ? 'var(--primary)' : 'white' }}>{linkedLaudo ? 'Ver Laudo' : 'Avaliar'}</button>
                    <button onClick={() => setSelectedVisit(null)} className="btn" style={{ padding: '0.4rem', border: 'none', marginLeft: 'auto' }}><X size={16}/></button>
                 </div>
               );
             })()}

             <div className="hourly-grid-container" style={{ border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', position: 'relative' }}>
                {(() => {
                   const gridStartHour = parseInt((workStart || '07:00').split(':')[0], 10);
                   const gridEndHour = parseInt((workEnd || '18:00').split(':')[0], 10);
                   const startOffsetPx = gridStartHour * 60;
                   const gridHours = Array.from({ length: Math.max(1, gridEndHour - gridStartHour + 1) }, (_, i) => gridStartHour + i);
                   
                   return (
                     <div style={{ position: 'relative', height: `${gridHours.length * 60}px`, marginTop: '10px' }}>
                        {gridHours.map((h, i) => (
                           <div key={`hour-${h}`} style={{ 
                              position: 'absolute', top: `${i * 60}px`, left: 0, right: 0, height: '60px', 
                              borderBottom: '1px solid var(--border-dim)', display: 'flex', paddingLeft: '0.5rem'
                           }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, transform: 'translateY(-50%)', background: 'var(--bg-surface)', padding: '0 0.5rem', alignSelf: 'flex-start' }}>
                                {String(h).padStart(2, '0')}:00
                              </span>
                           </div>
                        ))}
                        {(visitsData[selectedDate] || []).map(visit => {
                           const absoluteTopPx = parseTimeToMinutes(visit.time);
                           const relativeTopPx = absoluteTopPx - startOffsetPx;
                           const heightPx = parseDurationToMinutes(visit.duration);
                           const isSelected = selectedVisit?.id === visit.id;

                           // Don't render if it's completely out of the grid bounds
                           if (relativeTopPx + heightPx < 0 || relativeTopPx > gridHours.length * 60) return null;

                           return (
                              <div
                                key={visit.id}
                                onClick={() => setSelectedVisit(visit)}
                                style={{
                                   position: 'absolute', top: `${relativeTopPx}px`, height: `${heightPx}px`, left: '65px', right: '1rem',
                                   background: isSelected ? 'rgba(27,61,47,0.15)' : (visit.isRecurring ? 'rgba(27,61,47,0.05)' : 'rgba(212,163,115,0.05)'),
                                   border: '1px solid', borderColor: isSelected ? 'var(--primary)' : 'var(--border-dim)',
                                   borderLeft: isSelected ? '4px solid var(--primary)' : `4px solid ${visit.isRecurring ? 'var(--primary)' : 'var(--secondary)'}`,
                                   borderRadius: '6px', padding: '0.4rem 0.8rem', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s ease',
                                   zIndex: isSelected ? 10 : 5, boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                   display: 'flex', flexDirection: 'column'
                                }}
                              >
                                 <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {visit.time} - {visit.client}
                                 </div>
                                 <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                   <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                      <MapPin size={10} style={{ display: 'inline', marginRight: '2px' }} /> {visit.address.split('-')[0]}
                                   </div>
                                   {visit.rescheduleType === 'provisional' && (
                                     <span style={{ fontSize: '0.55rem', padding: '0.1rem 0.3rem', background: '#fff9ed', color: '#b27a00', borderRadius: '4px', border: '1px dashed currentColor' }}>EXCEPCIONAL</span>
                                   )}
                                 </div>
                                 {heightPx > 60 && (
                                    <div style={{ marginTop: 'auto', fontSize: '0.7rem', opacity: 0.6, fontWeight: 600 }}>Duração: {visit.duration}</div>
                                 )}
                              </div>
                           )
                        })}
                     </div>
                   );
                })()}
             </div>
           </div>
        </div>
      ) : (
        <>
          {/* Week Selector Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button onClick={handlePrevWeek} className="btn" style={{ padding: '0.4rem', border: '1px solid var(--border-dim)' }}><ChevronLeft size={16} /></button>
          <div className="card" style={{ padding: '0.5rem 1rem', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', whiteSpace: 'nowrap' }}>
             <Calendar size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
             Semana <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.7rem' }}>{weekDays[0].date}/{weekDays[0].month} – {weekDays[6].date}/{weekDays[6].month}</span>
          </div>
          <button onClick={handleNextWeek} className="btn" style={{ padding: '0.4rem', border: '1px solid var(--border-dim)' }}><ChevronRight size={16} /></button>
        </div>

        {/* Days Horizontal List */}
        <div className="days-horizontal-wrapper">
          {weekDays.map((day) => {
            const isActive = selectedDate === day.fullDate;
            const hasVisits = visitsData[day.fullDate]?.length > 0;
            const isWorkDay = workDays[day.dayKey] !== false;
            return (
              <button 
                key={day.id}
                className="week-day-card"
                onClick={() => { if (isWorkDay) { setSelectedDate(day.fullDate); setSelectedVisit(null); } }}
                style={{ 
                  background: !isWorkDay ? 'repeating-linear-gradient(135deg, var(--bg-deep), var(--bg-deep) 4px, transparent 4px, transparent 8px)' : isActive ? 'var(--bg-surface)' : 'var(--bg-deep)',
                  borderColor: isActive && isWorkDay ? 'var(--primary)' : 'var(--border-dim)',
                  borderBottomColor: isActive && isWorkDay ? 'var(--primary)' : 'var(--border-dim)',
                  borderBottomWidth: isActive && isWorkDay ? '3px' : '1px',
                  cursor: isWorkDay ? 'pointer' : 'default',
                  opacity: isWorkDay ? 1 : 0.4
                }}
              >
                {hasVisits && !isActive && isWorkDay && (
                  <div style={{ position: 'absolute', top: '6px', right: '6px', width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                )}
                <span className="week-day-name" style={{ color: isActive && isWorkDay ? 'var(--primary)' : 'var(--text-muted)' }}>
                  <span className="desktop-only">{day.dayStr}</span>
                  <span className="mobile-only">{day.dayStr.slice(0, 3)}</span>
                </span>
                <span className="week-day-number" style={{ color: isWorkDay ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {day.date}
                </span>
                <span className="week-day-sub">
                  {isWorkDay ? day.month : 'FOLGA'}
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
             const linkedLaudo = (laudos || []).find(l => l.visitId === visit.id);
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
                       {linkedLaudo && (linkedLaudo.clientSignatureImage || linkedLaudo.status === 'signed') ? (
                         <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', background: 'var(--primary)', color: 'white', borderRadius: '4px', fontWeight: 800, whiteSpace: 'nowrap' }}>AUDITADO</span>
                       ) : linkedLaudo ? (
                         <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', background: 'var(--secondary)', color: 'white', borderRadius: '4px', fontWeight: 800, whiteSpace: 'nowrap' }}>EM ANDAMENTO</span>
                       ) : null}
                       {(() => {
                         const tagObj = visitTags?.find(t => t.id === visit.tag);
                         if (tagObj) {
                           return <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', background: `${tagObj.color}15`, color: tagObj.color, borderRadius: '4px', border: '1px solid currentColor', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{tagObj.label}</span>;
                         } else {
                           return (
                             <>
                               {visit.isRecurring === false && <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', background: 'rgba(212,163,115,0.1)', color: 'var(--secondary)', borderRadius: '4px', border: '1px solid currentColor', whiteSpace: 'nowrap' }}>PONTUAL</span>}
                               {visit.isRecurring === true && <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', background: 'rgba(27,61,47,0.1)', color: 'var(--primary)', borderRadius: '4px', border: '1px solid currentColor', whiteSpace: 'nowrap' }}>ROTINA FIXA</span>}
                             </>
                           );
                         }
                       })()}
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
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.8rem' }}>
                  <button onClick={() => handleDeleteVisit(selectedVisit.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }} title="Excluir"><Trash2 size={16}/></button>
                  <button onClick={() => setSelectedVisit(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Fechar"><X size={16}/></button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-minimal)', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                     {selectedVisit.client.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{selectedVisit.client}</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                       {(() => {
                         const panelLaudo = (laudos || []).find(l => l.visitId === selectedVisit.id);
                         if (!panelLaudo) return null;
                         if (panelLaudo.clientSignatureImage || panelLaudo.status === 'signed') {
                           return <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'var(--primary)', borderRadius: '4px', fontWeight: 800, color: 'white' }}>AUDITADO</span>;
                         }
                         return <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'var(--secondary)', borderRadius: '4px', fontWeight: 800, color: 'white' }}>EM ANDAMENTO</span>;
                       })()}
                       <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'var(--bg-deep)', borderRadius: '4px', fontWeight: 700, color: 'var(--text-main)' }}>{selectedVisit.status.toUpperCase()}</span>
                       {(() => {
                         const tagObj = visitTags?.find(t => t.id === selectedVisit.tag);
                         if (tagObj) {
                           return <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: `${tagObj.color}15`, color: tagObj.color, borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>{tagObj.label}</span>;
                         } else {
                           return (
                             <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: selectedVisit.isRecurring ? 'rgba(27,61,47,0.1)' : 'rgba(212,163,115,0.1)', color: selectedVisit.isRecurring ? 'var(--primary)' : 'var(--secondary)', borderRadius: '4px', fontWeight: 700 }}>
                                {selectedVisit.isRecurring ? 'ROTINA FIXA' : 'VISITA PONTUAL'}
                             </span>
                           );
                         }
                       })()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                   <Clock size={14} color="var(--primary)" /> Hoje, {selectedVisit.time} <span>({selectedVisit.duration})</span>
                </div>
             </div>

             {/* Content */}
             <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               {(() => {
                 const liveData = getLiveClientData(selectedVisit);
                 return (
                   <>
                     {/* CRM Info */}
                     <div>
                       <h5 className="stat-label" style={{ marginBottom: '0.5rem' }}>CONTATO RESPONSÁVEL</h5>
                       <div style={{ fontSize: '0.85rem' }}>{liveData?.contact}</div>
                     </div>

                     {/* Historic Context — compacto */}
                     {liveData?.hasRealAudit && (
                       <div style={{ background: 'var(--bg-deep)', padding: '0.6rem 0.8rem', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-md)' }}>
                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                           <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.55rem' }}>
                             <FileCheck size={11} /> ÚLTIMA AUDITORIA ({liveData.lastVisitDate})
                           </span>
                           <span style={{ fontSize: '0.55rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '3px', background: liveData.lastReportStatus === 'Conforme' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(212, 163, 115, 0.1)', color: liveData.lastReportStatus === 'Conforme' ? 'var(--primary)' : 'var(--secondary)' }}>
                             {liveData.lastReportStatus}
                           </span>
                         </div>
                         <p 
                           style={{ fontSize: '0.7rem', lineHeight: '1.4', color: 'var(--text-muted)', margin: 0, cursor: liveData.historicIssues?.length > 120 ? 'pointer' : 'default' }}
                           onClick={() => { if (liveData.historicIssues?.length > 120) setFullNoteModal(liveData.historicIssues); }}
                         >
                            <strong>Foco:</strong> {liveData.historicIssues && liveData.historicIssues.length > 120 ? (
                              <span>{liveData.historicIssues.slice(0, 120)}... <span style={{ color: 'var(--primary)', fontWeight: 600 }}>ler mais</span></span>
                            ) : liveData.historicIssues}
                         </p>
                       </div>
                     )}
                   </>
                 );
               })()}
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
                 {(() => {
                    const linkedLaudo = (laudos || []).find(l => l.visitId === selectedVisit.id);
                    return (
                      <button
                        onClick={() => navigate('/laudos', { state: { client: selectedVisit.client, clientId: selectedVisit.clientId, visitId: selectedVisit.id, laudoId: linkedLaudo?.id } })}
                        className={linkedLaudo ? "btn" : "btn btn-primary"}
                        style={{ flex: 2, justifyContent: 'center', padding: '1rem', border: linkedLaudo ? '1px solid var(--primary)' : 'none', color: linkedLaudo ? 'var(--primary)' : 'white' }}
                      >
                         <FileText size={16} /> {(() => { const _s = linkedLaudo && (linkedLaudo.clientSignatureImage || linkedLaudo.status === 'signed'); if (_s) return 'Ver Laudo'; if (linkedLaudo) return 'Continuar Auditoria'; return 'Auditar'; })()}
                      </button>
                    );
                 })()}
             </div>
          </div>
        )}
      </div>

      {/* Mobile Context Modal/Drawer */}
      {selectedVisit && (
        <div className="mobile-only" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
        }}>
          <div style={{ background: 'var(--bg-surface)', width: '100%', maxHeight: '85vh', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
             <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-dim)', background: 'rgba(27, 61, 47, 0.05)', position: 'relative', flexShrink: 0 }}>
                <div style={{ width: '40px', height: '4px', background: 'var(--border-dim)', borderRadius: '2px', margin: '0 auto 1rem' }}></div>
                <div style={{ position: 'absolute', top: '1.5rem', right: '1rem', display: 'flex', gap: '1.2rem' }}>
                  <button onClick={() => handleDeleteVisit(selectedVisit.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }} title="Excluir"><Trash2 size={20}/></button>
                  <button onClick={() => setSelectedVisit(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Fechar"><X size={20}/></button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-minimal)', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                     {selectedVisit.client.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{selectedVisit.client}</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                       {(() => {
                         const mobileLaudo = (laudos || []).find(l => l.visitId === selectedVisit.id);
                         if (!mobileLaudo) return null;
                         if (mobileLaudo.clientSignatureImage || mobileLaudo.status === 'signed') {
                           return <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'var(--primary)', borderRadius: '4px', fontWeight: 800, color: 'white' }}>AUDITADO</span>;
                         }
                         return <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'var(--secondary)', borderRadius: '4px', fontWeight: 800, color: 'white' }}>EM ANDAMENTO</span>;
                       })()}
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
             
             <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
               {(() => {
                 const liveData = getLiveClientData(selectedVisit);
                 return (
                   <>
                     {/* CRM Info */}
                     <div>
                       <h5 className="stat-label" style={{ marginBottom: '0.5rem' }}>CONTATO RESPONSÁVEL</h5>
                       <div style={{ fontSize: '0.85rem' }}>{liveData?.contact}</div>
                        {/* Historic Context — compacto */}
                      {liveData?.hasRealAudit && (
                        <div style={{ background: 'var(--bg-deep)', padding: '0.6rem 0.8rem', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.55rem' }}>
                              <FileCheck size={11} /> ÚLTIMA AUDITORIA ({liveData.lastVisitDate})
                            </span>
                            <span style={{ fontSize: '0.55rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '3px', background: liveData.lastReportStatus === 'Conforme' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(212, 163, 115, 0.1)', color: liveData.lastReportStatus === 'Conforme' ? 'var(--primary)' : 'var(--secondary)' }}>
                              {liveData.lastReportStatus}
                            </span>
                          </div>
                          <p 
                            style={{ fontSize: '0.7rem', lineHeight: '1.4', color: 'var(--text-muted)', margin: 0, cursor: liveData.historicIssues?.length > 120 ? 'pointer' : 'default' }}
                            onClick={() => { if (liveData.historicIssues?.length > 120) setFullNoteModal(liveData.historicIssues); }}
                          >
                             <strong>Foco:</strong> {liveData.historicIssues && liveData.historicIssues.length > 120 ? (
                               <span>{liveData.historicIssues.slice(0, 120)}... <span style={{ color: 'var(--primary)', fontWeight: 600 }}>ler mais</span></span>
                             ) : liveData.historicIssues}
                          </p>
                        </div>
                      )}     </div>
                   </>
                 );
               })()}
             </div>

             <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-dim)', background: 'var(--bg-surface)', display: 'flex', gap: '1rem', flexShrink: 0 }}>
                 <button 
                   onClick={() => window.dispatchEvent(new CustomEvent('openScheduleModal', { detail: selectedVisit }))} 
                   className="btn" 
                   style={{ flex: 1, justifyContent: 'center', padding: '1rem' }}
                 >
                    Reagendar
                 </button>
                 {(() => {
                    const linkedLaudo = (laudos || []).find(l => l.visitId === selectedVisit.id);
                    return (
                      <button
                        onClick={() => navigate('/laudos', { state: { client: selectedVisit.client, clientId: selectedVisit.clientId, visitId: selectedVisit.id, laudoId: linkedLaudo?.id } })}
                        className={linkedLaudo ? "btn" : "btn btn-primary"}
                        style={{ flex: 2, justifyContent: 'center', padding: '1rem', border: linkedLaudo ? '1px solid var(--primary)' : 'none', color: linkedLaudo ? 'var(--primary)' : 'white' }}
                      >
                         <FileText size={16} /> {(() => { const _s = linkedLaudo && (linkedLaudo.clientSignatureImage || linkedLaudo.status === 'signed'); if (_s) return 'Ver Laudo'; if (linkedLaudo) return 'Continuar Auditoria'; return 'Auditar'; })()}
                      </button>
                    );
                 })()}
             </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* Full Note Reading Modal */}
      {fullNoteModal && (
        <div onClick={() => setFullNoteModal(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', boxSizing: 'border-box' }} className="reveal-staggered">
           <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: 'calc(100% - 2rem)', maxWidth: '500px', background: 'var(--bg-surface)', padding: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh', margin: '0 auto', boxSizing: 'border-box' }}>
              <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-deep)', flexShrink: 0 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <FileCheck size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Histórico da Última Auditoria</h3>
                 </div>
                 <button onClick={() => setFullNoteModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem', flexShrink: 0 }}><X size={20}/></button>
              </div>
              <div style={{ padding: '1.2rem', overflowY: 'auto', overflowX: 'hidden', wordBreak: 'break-word' }}>
                 <div style={{ fontSize: '0.82rem', lineHeight: '1.7', color: 'var(--text-main)', wordBreak: 'break-word' }}
                   dangerouslySetInnerHTML={{
                     __html: fullNoteModal
                       .replace(/\*\*(.+?)\*\*/g, '<strong style="display:block;margin-top:0.8rem;margin-bottom:0.3rem;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.03em;color:var(--primary)">$1</strong>')
                       .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border-dim);margin:0.8rem 0" />')
                       .replace(/\n/g, '<br/>')
                   }}
                 />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
