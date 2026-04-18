import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Plus, Filter, Users, Map, MoreVertical, CheckCircle2 } from 'lucide-react';

const Agenda = () => {
  const [currentDay, setCurrentDay] = useState('Segunda-feira');

  const daysOfWeek = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];

  const routes = {
    'Segunda-feira': [
      { id: 1, time: '08:00 - 10:00', client: 'Cozinha Industrial Matriz', address: 'Av. Paulista, 1500 - Bela Vista', type: 'Auditoria Completa', status: 'pendente' },
      { id: 2, time: '10:30 - 12:00', client: 'Supermercado Nova Era', address: 'Rua Augusta, 400 - Consolação', type: 'Checklist de Etiquetas', status: 'pendente' },
      { id: 3, time: '14:00 - 16:30', client: 'Refeitório São João', address: 'Av. do Estado, 3000', type: 'Treinamento de EPIs', status: 'pendente' }
    ],
    'Terça-feira': [
      { id: 4, time: '07:30 - 09:30', client: 'Escola Infantil Crescer', address: 'Rua das Flores, 123', type: 'Cardápio e Estoque', status: 'pendente' },
      { id: 5, time: '10:00 - 11:30', client: 'Restaurante Central', address: 'Praça da Sé, 100', type: 'Visita Técnica', status: 'pendente' }
    ],
    'Quarta-feira': [],
    'Quinta-feira': [],
    'Sexta-feira': []
  };

  return (
    <div className="reveal-staggered" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: 'calc(100vh - 120px)' }}>
      
      {/* Header Toolbar */}
      <div className="flex-toolbar" style={{ gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }} className="full-width-mobile">
          <div className="card" style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
             <button className="btn" style={{ border: 'none', background: 'var(--bg-deep)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
               <Map size={16} /> Rotas Diárias
             </button>
             <button className="btn" style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)' }}>
               <Calendar size={16} /> Visão Mensal
             </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }} className="full-width-mobile">
          <button className="btn full-width-mobile"><Filter size={16} /> Filtrar</button>
          <button className="btn btn-primary full-width-mobile"><Plus size={16} /> Nova Rotina</button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-responsive-2col" style={{ flex: 1, minHeight: 0 }}>
        
        {/* Days Sidebar / Tabs */}
        <section className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
           <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-dim)', background: 'var(--bg-deep)' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em' }}>DIAS DA SEMANA</h3>
           </div>
           <div style={{ flex: 1, overflowY: 'auto' }}>
             {daysOfWeek.map((day) => {
               const dayRoutes = routes[day] || [];
               return (
                 <div 
                   key={day} 
                   onClick={() => setCurrentDay(day)}
                   style={{ 
                     padding: '1.2rem', 
                     borderBottom: '1px solid var(--border-dim)',
                     cursor: 'pointer',
                     background: currentDay === day ? 'rgba(27, 61, 47, 0.05)' : 'transparent',
                     borderLeft: `3px solid ${currentDay === day ? 'var(--primary)' : 'transparent'}`,
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center'
                   }}
                 >
                   <div style={{ fontWeight: currentDay === day ? 700 : 500, color: currentDay === day ? 'var(--primary)' : 'var(--text-main)' }}>
                     {day}
                   </div>
                   <div style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'var(--bg-deep)', borderRadius: '100px', fontWeight: 700 }}>
                     {dayRoutes.length} rotas
                   </div>
                 </div>
               )
             })}
           </div>
        </section>

        {/* Selected Day Route List */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                 <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Rota de {currentDay}</h2>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Você tem {routes[currentDay]?.length || 0} visitas programadas para este dia.</div>
              </div>
              <button className="btn btn-primary"><MapPin size={16}/> Otimizar no Mapa</button>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {routes[currentDay]?.length > 0 ? (
               routes[currentDay].map((route, index) => (
                 <div key={route.id} style={{ 
                    border: '1px solid var(--border-dim)', 
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    background: 'var(--bg-surface)'
                 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                         <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(27, 61, 47, 0.1)', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontWeight: 'bold' }}>
                            {index + 1}
                         </div>
                         <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{route.client}</h3>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                               <MapPin size={12} /> {route.address}
                            </div>
                         </div>
                      </div>
                      <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MoreVertical size={16}/></button>
                   </div>
                   
                   <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border-dim)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                         <Clock size={14} color="var(--primary)" /> {route.time}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                         <Users size={14} color="var(--primary)" /> {route.type}
                      </div>
                   </div>
                 </div>
               ))
             ) : (
               <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-dim)', borderRadius: 'var(--radius-md)' }}>
                  <Calendar size={32} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Dia Livre</h3>
                  <p style={{ fontSize: '0.8rem' }}>Você não tem visitas rotineiras programadas para {currentDay}.</p>
               </div>
             )}
           </div>
        </section>

      </div>
    </div>
  );
};

export default Agenda;
