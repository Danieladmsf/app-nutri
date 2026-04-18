import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, X, FileText, FileCheck, ArrowRight, Building, Plus } from 'lucide-react';
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

import { visitsMock as initialVisitsMock } from '../data/mockDatabase';

const Agenda = () => {
  const navigate = useNavigate();
  const { workDays, workStart, workEnd } = useAppContext();
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
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border-dim)', paddingBottom: '1rem' }}>
        <div className="flex-toolbar" style={{ gap: '1rem', alignItems: 'center' }}>
          
          {/* Title */}
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
             Agenda & Rotinas
          </h1>

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
        <div className="reveal-staggered agenda-hero-layout" style={{ flex: 1, alignItems: 'flex-start' }}>
           
           {/* Sidebar: Mini Calendar */}
           <div className="agenda-sidebar">
              <div>
                 <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Mês Base</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.2rem', marginBottom: '0.5rem' }}>
                   {['D','S','T','Q','Q','S','S'].map((d, idx) => (
                      <div key={idx} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>{d}</div>
                   ))}
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.2rem' }}>
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
                           style={{ 
                             aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                             background: isSelected ? 'var(--primary)' : 'transparent', 
                             color: isSelected ? 'white' : 'var(--text-main)',
                             borderRadius: '50%', fontSize: '0.75rem', fontWeight: isSelected ? 800 : 500,
                             cursor: 'pointer', position: 'relative'
                           }}>
                            {dayObj.date}
                            {hasVisits && !isSelected && <div style={{ position: 'absolute', bottom: '2px', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }}></div>}
                         </div>
                      )
                   })}
                 </div>
              </div>

              {/* Seletor de Visitas Lote Sidebar */}
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-dim)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Ações em Lote</h3>
                  <button 
                    onClick={() => { setIsSelectMode(!isSelectMode); setSelectedVisits([]); }} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, color: isSelectMode ? '#c0392b' : 'var(--primary)', padding: 0 }}>
                    {isSelectMode ? '✕ Cancelar' : 'Ativar'}
                  </button>
                </div>
                {isSelectMode && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button 
                      onClick={() => {
                         const acts = visitsData[selectedDate] || [];
                         if (selectedVisits.length === acts.length) setSelectedVisits([]);
                         else setSelectedVisits([...acts]);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: 0, textAlign: 'left' }}>
                      {selectedVisits.length === (visitsData[selectedDate] || []).length && selectedVisits.length > 0 ? '☑ Desmarcar todos' : '☐ Selecionar todo o dia'}
                    </button>
                    {selectedVisits.length > 0 && (
                       <button 
                         onClick={() => window.dispatchEvent(new CustomEvent('openScheduleModal', { detail: selectedVisits }))}
                         className="btn btn-primary reveal-staggered" 
                         style={{ width: '100%', padding: '0.7rem', justifyContent: 'center', fontSize: '0.8rem' }}>
                         Reagendar {selectedVisits.length} visita{selectedVisits.length > 1 ? 's' : ''}
                       </button>
                    )}
                  </div>
                )}
              </div>
           </div>

           {/* Hourly Grid View */}
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
             {/* Header Day */}
             <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-dim)' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, textTransform: 'capitalize' }}>{weekDays.find(d => d.fullDate === selectedDate)?.dayStr || 'Data'}</h2>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{selectedDate.split('-').reverse().join('/')}</span>
                </div>
                {/* Context Action Menu for Selected Visit */}
                {selectedVisit && (
                  <div className="reveal-staggered" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dim)' }}>
                     <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>FOCO: <span style={{color: 'var(--primary)'}}>{selectedVisit.client}</span></span>
                     <span style={{ width: '1px', height: '20px', background: 'var(--border-dim)', margin: '0 0.5rem' }}></span>
                     <button onClick={() => window.dispatchEvent(new CustomEvent('openScheduleModal', { detail: selectedVisit }))} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Reagendar</button>
                     <button onClick={() => navigate('/laudos')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Avaliar</button>
                     <button onClick={() => setSelectedVisit(null)} className="btn" style={{ padding: '0.4rem', border: 'none' }}><X size={16}/></button>
                  </div>
                )}
             </div>

             <div className="hourly-grid-container" style={{ flex: 1, minHeight: '600px', border: '1px solid var(--border-dim)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', overflowY: 'auto', position: 'relative' }}>
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
                           const isChecked = selectedVisits.some(v => v.id === visit.id);
                           
                           // Don't render if it's completely out of the grid bounds
                           if (relativeTopPx + heightPx < 0 || relativeTopPx > gridHours.length * 60) return null;

                           return (
                              <div 
                                key={visit.id}
                                onClick={() => {
                                  if (isSelectMode) toggleVisitSelection(visit);
                                  else setSelectedVisit(visit);
                                }}
                                style={{
                                   position: 'absolute', top: `${relativeTopPx}px`, height: `${heightPx}px`, left: '65px', right: '1rem',
                                   background: (isSelected || isChecked) ? 'rgba(27,61,47,0.15)' : (visit.isRecurring ? 'rgba(27,61,47,0.05)' : 'rgba(212,163,115,0.05)'),
                                   border: '1px solid', borderColor: (isSelected || isChecked) ? 'var(--primary)' : 'var(--border-dim)',
                                   borderLeft: (isSelected || isChecked) ? '4px solid var(--primary)' : `4px solid ${visit.isRecurring ? 'var(--primary)' : 'var(--secondary)'}`,
                                   borderRadius: '6px', padding: '0.4rem 0.8rem', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s ease',
                                   zIndex: (isSelected || isChecked) ? 10 : 5, boxShadow: (isSelected || isChecked) ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                   display: 'flex', flexDirection: 'column'
                                }}
                              >
                                 {isSelectMode && (
                                   <div style={{ position: 'absolute', top: '0.4rem', right: '0.4rem' }}>
                                      <input type="checkbox" checked={isChecked} readOnly style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                   </div>
                                 )}
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
        <div className="days-horizontal-scroll" style={{ 
          display: 'flex', width: '100%', overflowX: 'auto', gap: '0.5rem', 
          paddingBottom: '0.5rem', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' 
        }}>
          {weekDays.map((day) => {
            const isActive = selectedDate === day.fullDate;
            const hasVisits = visitsData[day.fullDate]?.length > 0;
            const isWorkDay = workDays[day.dayKey] !== false;
            return (
              <button 
                key={day.id}
                onClick={() => { if (isWorkDay) { setSelectedDate(day.fullDate); setSelectedVisit(null); } }}
                style={{ 
                  flex: '0 0 auto',
                  minWidth: '110px', 
                  padding: '1.2rem 1rem', 
                  borderRadius: 'var(--radius-md)',
                  background: !isWorkDay ? 'repeating-linear-gradient(135deg, var(--bg-deep), var(--bg-deep) 4px, transparent 4px, transparent 8px)' : isActive ? 'var(--bg-surface)' : 'var(--bg-deep)',
                  border: '1px solid',
                  borderColor: isActive && isWorkDay ? 'var(--primary)' : 'var(--border-dim)',
                  borderBottom: isActive && isWorkDay ? '3px solid var(--primary)' : '1px solid var(--border-dim)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  cursor: isWorkDay ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  opacity: isWorkDay ? 1 : 0.4
                }}
              >
                {hasVisits && !isActive && isWorkDay && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                )}
                <span style={{ fontSize: '0.7rem', color: isActive && isWorkDay ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  {day.dayStr}
                </span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: isWorkDay ? 'var(--text-main)' : 'var(--text-muted)', lineHeight: '1' }}>
                  {day.date}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '0.2rem' }}>
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
