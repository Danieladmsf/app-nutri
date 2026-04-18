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
