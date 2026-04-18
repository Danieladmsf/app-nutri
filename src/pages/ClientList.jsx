import React from 'react';
import { Search, UserPlus, MoreVertical, Phone, MapPin, ArrowRight, Filter, Download } from 'lucide-react';
import { clientsMock } from '../data/mockDatabase';

const ClientList = () => {
  const clients = clientsMock.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.whatsapp || c.phone,
    address: c.address,
    status: c.status,
    lastVisit: c.lastVisitDate ? c.lastVisitDate.split('-').reverse().join('/') : '—',
    tags: c.tags || [],
    tier: c.tier,
    contact: c.contact,
    contactRole: c.contactRole,
    lastReportStatus: c.lastReportStatus
  }));

  return (
    <div className="reveal-staggered" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Toolbar */}
      <header style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-dim)', paddingBottom: '1rem' }}>
        <div className="flex-toolbar" style={{ gap: '1rem', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
             Lista de Clientes
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button className="btn btn-primary full-width-mobile" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}><UserPlus size={16} /> NOVO CLIENTE</button>
          </div>
        </div>
      </header>

      {/* SaaS Toolbar */}
      <div className="flex-toolbar">
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }} className="full-width-mobile">
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 1.2rem', background: 'var(--bg-surface)', flex: 1, maxWidth: '400px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou cidade..." 
              style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '0.8rem', color: 'var(--text-main)' }}
            />
          </div>
          <button className="btn"><Filter size={16} /> Filtros</button>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }} className="full-width-mobile">
          <button className="btn full-width-mobile"><Download size={16} /> Exportar CSV</button>
        </div>
      </div>

      {/* Data Grid Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem', minWidth: '800px', tableLayout: 'auto' }}>
          <thead>
            <tr style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--border-dim)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>CLIENTE</th>
              <th className="desktop-only" style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>CONTATO</th>
              <th style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>VISITA</th>
              <th style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>STATUS</th>
              <th className="desktop-only" style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>TAGS</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} style={{ borderBottom: '1px solid var(--border-dim)', transition: 'background 0.2s' }} className="table-row-hover">
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                   <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{client.name}</div>
                   <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{client.contactRole}</div>
                </td>
                <td className="desktop-only" style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem', fontSize: '0.75rem' }}>
                    <Phone size={11} color="var(--primary)" style={{ flexShrink: 0 }} /> {client.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    <MapPin size={11} style={{ flexShrink: 0 }} /> {client.address.split(' - ')[0]}
                  </div>
                </td>
                <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>{client.lastVisit}</td>
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <span style={{ 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: '100px', 
                    fontSize: '0.65rem', 
                    fontWeight: 700,
                    background: client.status === 'Ativo' ? 'rgba(27, 61, 47, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    color: client.status === 'Ativo' ? 'var(--primary)' : 'var(--text-muted)'
                  }}>
                    {client.status.toUpperCase()}
                  </span>
                </td>
                <td className="desktop-only" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'nowrap' }}>
                    {client.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={{ fontSize: '0.6rem', background: 'var(--bg-deep)', padding: '0.15rem 0.4rem', border: '1px solid var(--border-dim)', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                        {tag}
                      </span>
                    ))}
                    {client.tags.length > 3 && (
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>+{client.tags.length - 3}</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                   <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <MoreVertical size={16} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
         <div>Mostrando {clients.length} clientes</div>
         <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" style={{ padding: '0.4rem 0.8rem' }}>Anterior</button>
            <button className="btn" style={{ padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'white' }}>Próximo</button>
         </div>
      </div>
    </div>
  );
};

export default ClientList;
