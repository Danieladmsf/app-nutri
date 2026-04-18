import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ScheduleModal from './ScheduleModal';

const Layout = ({ children }) => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);

  useEffect(() => {
    const handleOpen = (e) => {
      setScheduleData(e.detail || null);
      setIsScheduleModalOpen(true);
    };
    window.addEventListener('openScheduleModal', handleOpen);
    return () => window.removeEventListener('openScheduleModal', handleOpen);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Sidebar />
      {/* Remove giant Ana watermark for software feel */}
      
      <main className="app-main">
        <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border-dim)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600 }}>
             <span>ANA NUTRI</span> <span>/</span> <span style={{ color: 'var(--text-main)' }}>DASHBOARD</span>
          </div>
          <div className="flex-toolbar">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Visão Geral do <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>Escritório</span>
            </h1>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}>FILTRAR</button>
               <button 
                 onClick={() => { setScheduleData(null); setIsScheduleModalOpen(true); }}
                 className="btn btn-primary" 
                 style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}
               >
                 + NOVA VISITA
               </button>
            </div>
          </div>
        </header>

        <div className="reveal-staggered">
          {children}
        </div>
      </main>

      <ScheduleModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)} 
        initialData={scheduleData} 
      />
    </div>
  );
};

export default Layout;
