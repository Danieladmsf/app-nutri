import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ReportGenerator from './pages/ReportGenerator';
import ClientList from './pages/ClientList';

// Placeholder pages
const Placeholder = ({ title }) => (
  <Layout>
    <div className="card">
      <h2>{title}</h2>
      <p>Esta funcionalidade está sendo implementada.</p>
    </div>
  </Layout>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/clientes" element={<Layout><ClientList /></Layout>} />
        <Route path="/agenda" element={<Placeholder title="Agenda Completa" />} />
        <Route path="/laudos" element={<Layout><ReportGenerator /></Layout>} />
        <Route path="/config" element={<Placeholder title="Configurações" />} />
      </Routes>
    </Router>
  );
}

export default App;
