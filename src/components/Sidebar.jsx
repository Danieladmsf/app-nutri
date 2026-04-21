import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, FileText, Settings, LogOut, Search } from 'lucide-react';

const Sidebar = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="desktop-only" style={{ 
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
            <div style={{ width: '48px', height: '48px', background: 'var(--primary)', borderRadius: '6px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <img src="/nutrition-symbol.svg" alt="NutriApp" style={{ width: '40px', height: '40px' }} />
            </div>
            <div style={{ flex: 1 }}>
               <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>NutriApp</div>
               <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Workspace Profissional</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 1rem' }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, padding: '0 1rem 0.5rem', letterSpacing: '0.1em' }}>MENU PRINCIPAL</div>
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Calendar size={16} /> Agenda & Rotinas
          </NavLink>
          <NavLink to="/clientes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Users size={16} /> Clientes
          </NavLink>
          <NavLink to="/laudos" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FileText size={16} /> Laudos
          </NavLink>
          <NavLink to="/indicadores" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={16} /> Indicadores Gerais
          </NavLink>
          
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, padding: '1.5rem 1rem 0.5rem', letterSpacing: '0.1em' }}>SISTEMA</div>
          <NavLink to="/config" className="sidebar-link">
            <Settings size={16} /> Configurações
          </NavLink>
        </nav>



        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-dim)', marginTop: 'auto' }}>
          <button className="sidebar-link" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
            <LogOut size={16} /> Sair da conta
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-only" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '70px',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-dim)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        <NavLink to="/" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} style={mobileNavLinkStyle}>
          <Calendar size={20} />
          <span style={{ fontSize: '10px', marginTop: '4px' }}>Rotinas</span>
        </NavLink>
        <NavLink to="/clientes" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} style={mobileNavLinkStyle}>
          <Users size={20} />
          <span style={{ fontSize: '10px', marginTop: '4px' }}>Clientes</span>
        </NavLink>
        <NavLink to="/laudos" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} style={mobileNavLinkStyle}>
          <FileText size={20} />
          <span style={{ fontSize: '10px', marginTop: '4px' }}>Laudos</span>
        </NavLink>
        <NavLink to="/indicadores" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} style={mobileNavLinkStyle}>
          <LayoutDashboard size={20} />
          <span style={{ fontSize: '10px', marginTop: '4px' }}>Métricas</span>
        </NavLink>
        <NavLink to="/config" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} style={mobileNavLinkStyle}>
          <Settings size={20} />
          <span style={{ fontSize: '10px', marginTop: '4px' }}>Config</span>
        </NavLink>
      </div>
    </>
  );
};

const mobileNavLinkStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  color: 'var(--text-muted)',
  textDecoration: 'none',
  padding: '10px'
};

export default Sidebar;
