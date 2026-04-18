import React from 'react';
import { Search, UserPlus, MoreVertical, Phone, MapPin, ArrowRight, Filter, Download } from 'lucide-react';

const ClientList = () => {
  const clients = [
    { id: 1, name: 'João Silva', phone: '11 99999 0001', address: 'Rua das Flores, 123', status: 'Ativo', lastVisit: '10/04/2026', tags: ['PCD', 'Hipertenso'] },
    { id: 2, name: 'Maria Oliveira', phone: '11 99999 0002', address: 'Av. Paulista, 1500', status: 'Ativo', lastVisit: '15/04/2026', tags: ['Idoso'] },
    { id: 3, name: 'Pedro Santos', phone: '11 99999 0003', address: 'Rua Augusta, 400', status: 'Inativo', lastVisit: '01/03/2026', tags: [] },
    { id: 4, name: 'Ana Costa', phone: '11 98888 1122', address: 'Rua Bela Cintra, 900', status: 'Ativo', lastVisit: '18/04/2026', tags: ['Atleta'] },
  ];

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
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--border-dim)' }}>
              <th style={{ padding: '1.2rem 2rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem' }}>CLIENTE</th>
              <th className="desktop-only" style={{ padding: '1.2rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem' }}>CONTATO & ENDEREÇO</th>
              <th style={{ padding: '1.2rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem' }}>ÚLTIMA VISITA</th>
              <th style={{ padding: '1.2rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem' }}>STATUS</th>
              <th className="desktop-only" style={{ padding: '1.2rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem' }}>TAGS</th>
              <th style={{ padding: '1.2rem 2rem', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} style={{ borderBottom: '1px solid var(--border-dim)', transition: 'background 0.2s' }} className="table-row-hover">
                <td style={{ padding: '1.2rem 2rem' }}>
                   <div style={{ fontWeight: 600 }}>{client.name}</div>
                   <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: #{client.id}00342</div>
                </td>
                <td className="desktop-only" style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <Phone size={12} color="var(--primary)" /> {client.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <MapPin size={12} /> {client.address}
                  </div>
                </td>
                <td style={{ padding: '1.2rem' }}>{client.lastVisit}</td>
                <td style={{ padding: '1.2rem' }}>
                  <span style={{ 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '100px', 
                    fontSize: '0.7rem', 
                    fontWeight: 700,
                    background: client.status === 'Ativo' ? 'rgba(27, 61, 47, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    color: client.status === 'Ativo' ? 'var(--primary)' : 'var(--text-muted)'
                  }}>
                    {client.status.toUpperCase()}
                  </span>
                </td>
                <td className="desktop-only" style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {client.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '0.65rem', background: 'var(--bg-deep)', padding: '0.2rem 0.5rem', border: '1px solid var(--border-dim)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '1.2rem 2rem', textAlign: 'right' }}>
                   <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <MoreVertical size={18} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
         <div>Mostrando 4 de 128 clientes</div>
         <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" style={{ padding: '0.4rem 0.8rem' }}>Anterior</button>
            <button className="btn" style={{ padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'white' }}>Próximo</button>
         </div>
      </div>
    </div>
  );
};

export default ClientList;
