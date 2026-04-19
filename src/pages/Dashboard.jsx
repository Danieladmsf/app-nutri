import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, FileText, ChevronRight, Plus, ArrowUpRight, TrendingUp, Clock, CheckCircle2, Tag } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { subscribeToVisits, subscribeToClients } from '../services/firestore';

const Dashboard = () => {
  const { visitTags } = useAppContext();
  const [visitsData, setVisitsData] = useState({});
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const unsub1 = subscribeToVisits((data) => setVisitsData(data));
    const unsub2 = subscribeToClients((data) => setClients(data));
    return () => { unsub1(); unsub2(); };
  }, []);

  // Today's date key
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayVisits = visitsData[todayKey] || [];

  // Build tag summary for today
  const tagSummary = {};
  todayVisits.forEach(v => {
    // Determine tag: use saved tag, or infer from isRecurring
    const tagId = v.tag || (v.isRecurring ? 'rotina_fixa' : 'pontual');
    if (!tagSummary[tagId]) tagSummary[tagId] = { count: 0, visits: [] };
    tagSummary[tagId].count++;
    tagSummary[tagId].visits.push(v);
  });

  // Build dynamic cards from tags that have visits today
  const dynamicCards = Object.entries(tagSummary).map(([tagId, data]) => {
    const tagDef = visitTags?.find(t => t.id === tagId);
    return {
      label: tagDef?.label || tagId.toUpperCase(),
      value: String(data.count).padStart(2, '0'),
      detail: data.visits.map(v => v.client).slice(0, 2).join(', ') + (data.count > 2 ? ` +${data.count - 2}` : ''),
      color: tagDef?.color || 'var(--primary)',
      icon: <Tag size={16} />
    };
  });

  // Always add total clients card
  dynamicCards.push({
    label: 'Total Clientes',
    value: String(clients.length).padStart(2, '0'),
    detail: 'Cadastrados no sistema',
    color: 'var(--primary)',
    icon: <Users size={16} />
  });

  // If no visits today, show a "no visits" card
  if (todayVisits.length === 0) {
    dynamicCards.unshift({
      label: 'Visitas Hoje',
      value: '00',
      detail: 'Nenhuma visita agendada',
      color: 'var(--text-muted)',
      icon: <Calendar size={16} />
    });
  }

  return (
    <div className="reveal-staggered" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Header Toolbar */}
      <header style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-dim)', paddingBottom: '1rem' }}>
        <div className="flex-toolbar" style={{ gap: '1rem', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
             Dashboard <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>Executivo</span>
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>FILTRAR PERÍODO</button>
          </div>
        </div>
      </header>

      {/* Dynamic Tag-Based Stat Grid */}
      <div className="grid-stats">
        {dynamicCards.map((stat, idx) => (
          <div key={idx} className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-dim)', borderLeft: `4px solid ${stat.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '1rem' }}>
               <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em' }}>{stat.label}</span>
               <div style={{ color: stat.color }}>{stat.icon}</div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stat.detail}</div>
          </div>
        ))}
      </div>

      {/* Structured Management Grid */}
      <div className="grid-responsive-2col">
        
        {/* Active Route Table */}
        <section className="card" style={{ padding: '0' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>SUA ROTA DE HOJE ({today.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase()})</h3>
             <Link to="/" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>VER ROTA COMPLETA</Link>
          </div>
          <div style={{ width: '100%' }}>
            {todayVisits.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Nenhuma visita agendada para hoje.
              </div>
            ) : (
              todayVisits.sort((a, b) => a.time.localeCompare(b.time)).map((item, idx) => {
                const isPast = new Date(`${todayKey}T${item.time}`) < new Date();
                const status = item.status === 'Concluído' ? 'Concluído' : (isPast ? 'Pendente' : 'Em Rota');
                const tagColor = visitTags?.find(t => t.id === item.tag)?.color || 'var(--primary)';

                return (
                  <div key={item.id || idx} style={{ 
                    padding: '1.2rem 2rem', 
                    borderBottom: idx === todayVisits.length - 1 ? 'none' : '1px solid var(--border-dim)',
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr auto',
                    gap: '1rem',
                    alignItems: 'center',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.time}</div>
                    <div>
                       <div style={{ fontWeight: 600 }}>{item.client}</div>
                       <div className="desktop-only" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.visitType || 'Auditoria'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: status === 'Concluído' ? tagColor : (status === 'Pendente' ? 'var(--secondary)' : 'var(--primary)') }}></div>
                       <span className="desktop-only" style={{ fontSize: '0.75rem', color: status === 'Concluído' ? tagColor : 'inherit' }}>{status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* System Insights & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section className="card">
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <FileText size={16} /> RECOMENDAÇÕES DA ROTA
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div style={{ padding: '1rem', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
                  <p style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                    <strong>Alerta de Roteiro:</strong> Recomenda-se iniciar a auditoria na <em>Cozinha Matriz</em> focando nos EPIs devido ao histórico de não-conformidades.
                  </p>
               </div>
               <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>INICIAR AUDITORIA IA</button>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
