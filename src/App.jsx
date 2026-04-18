import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ReportGenerator from './pages/ReportGenerator';
import ClientList from './pages/ClientList';
import Agenda from './pages/Agenda';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Agenda /></Layout>} />
        <Route path="/clientes" element={<Layout><ClientList /></Layout>} />
        <Route path="/indicadores" element={<Layout><Dashboard /></Layout>} />
        <Route path="/laudos" element={<Layout><ReportGenerator /></Layout>} />
        <Route path="/config" element={<Layout><Settings /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
