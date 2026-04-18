import React from 'react';
import { Users, Calendar, FileText, ChevronRight, Plus, ArrowUpRight, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="reveal-staggered" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* SaaS Stat Grid */}
      <div className="grid-stats">
        {[
          { label: 'Visitas Hoje', value: '03', detail: '+1 desde ontem', icon: <Calendar size={16}/>, color: 'var(--primary)' },
          { label: 'Laudos Pendentes', value: '05', detail: '2 urgentes', icon: <Clock size={16}/>, color: 'var(--secondary)' },
          { label: 'Total Clientes', value: '24', detail: '+3 este mês', icon: <Users size={16}/>, color: 'var(--primary)' },
          { label: 'Taxa de Retenção', value: '98%', detail: 'Alto nível', icon: <TrendingUp size={16}/>, color: 'var(--primary)' },
        ].map((stat, idx) => (
          <div key={idx} className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-dim)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '1rem' }}>
               <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em' }}>{stat.label}</span>
               {stat.icon}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{stat.value}</div>
            <div style={{ fontSize: '0.65rem', color: stat.color, fontWeight: 600 }}>{stat.detail}</div>
          </div>
        ))}
      </div>

      {/* Structured Management Grid */}
      <div className="grid-responsive-2col">
        
        {/* Active Route Table */}
        <section className="card" style={{ padding: '0' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>SUA ROTA DE HOJE (SEGUNDA-FEIRA)</h3>
             <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>VER ROTA COMPLETA</button>
          </div>
          <div style={{ width: '100%' }}>
            {[
              { time: '08:00', name: 'Cozinha Industrial Matriz', type: 'Auditoria Completa', status: 'Em Rota' },
              { time: '10:30', name: 'Supermercado Nova Era', type: 'Checklist de Etiquetas', status: 'Pendente' },
              { time: '14:00', name: 'Refeitório São João', type: 'Treinamento de EPIs', status: 'Pendente' },
            ].map((item, idx) => (
              <div key={idx} style={{ 
                padding: '1.2rem 2rem', 
                borderBottom: idx === 2 ? 'none' : '1px solid var(--border-dim)',
                display: 'grid',
                gridTemplateColumns: '60px 1fr auto',
                gap: '1rem',
                alignItems: 'center',
                fontSize: '0.85rem'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.time}</div>
                <div>
                   <div style={{ fontWeight: 600 }}>{item.name}</div>
                   <div className="desktop-only" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.type}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.status === 'Em Rota' ? 'var(--primary)' : 'var(--secondary)' }}></div>
                   <span className="desktop-only" style={{ fontSize: '0.75rem' }}>{item.status}</span>
                </div>
              </div>
            ))}
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

          <section className="card" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>SISTEMA OPERACIONAL</h3>
            <div style={{ fontSize: '0.7rem', opacity: 0.9, lineHeight: '1.6' }}>
              Base de dados sincronizada via Cloud Sync. <br/>
              Status: <strong>OPERACIONAL</strong>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
