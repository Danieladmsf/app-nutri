import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, FileText, Settings, LogOut, Zap, Search, Bell } from 'lucide-react';

const Sidebar = () => {
  return (
    <div style={{ 
      width: '280px', 
      height: '100vh', 
      padding: '2rem 0', 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'fixed', 
      left: 0, top: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-dim)',
      zIndex: 100
    }}>
      {/* Workspace Selector */}
      <div style={{ padding: '0 1.5rem', marginBottom: '3rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          padding: '0.75rem', 
          background: 'var(--bg-deep)', 
          border: '1px solid var(--border-dim)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer'
        }}>
          <div style={{ width: '24px', height: '24px', background: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>A</div>
          <div style={{ flex: 1 }}>
             <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Ana Nutri</div>
             <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Workspace Profissional</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 1rem' }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, padding: '0 1rem 0.5rem', letterSpacing: '0.1em' }}>MENU PRINCIPAL</div>
        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>
        <NavLink to="/clientes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Users size={16} /> Clientes
        </NavLink>
        <NavLink to="/agenda" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Calendar size={16} /> Agenda
        </NavLink>
        <NavLink to="/laudos" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <FileText size={16} /> Laudos IA
        </NavLink>
        
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, padding: '1.5rem 1rem 0.5rem', letterSpacing: '0.1em' }}>SISTEMA</div>
        <NavLink to="/config" className="sidebar-link">
          <Settings size={16} /> Configurações
        </NavLink>
      </nav>

      {/* Quick Search Trigger */}
      <div style={{ padding: '1rem' }}>
         <div style={{ 
           display: 'flex', 
           alignItems: 'center', 
           gap: '0.75rem', 
           padding: '0.75rem 1rem', 
           background: 'var(--bg-deep)', 
           borderRadius: 'var(--radius-md)',
           color: 'var(--text-muted)',
           fontSize: '0.7rem',
           cursor: 'pointer'
         }}>
           <Search size={14} /> <span>Pressione / para buscar</span>
         </div>
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-dim)', marginTop: 'auto' }}>
        <button className="sidebar-link" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
          <LogOut size={16} /> Sair da conta
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
