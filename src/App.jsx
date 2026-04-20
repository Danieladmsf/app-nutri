import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ReportGenerator from './pages/ReportGenerator';
import ClientList from './pages/ClientList';
import Agenda from './pages/Agenda';
import Settings from './pages/Settings';
import Login from './pages/Login';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <AppProvider>{children}</AppProvider>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout><Agenda /></Layout></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute><Layout><ClientList /></Layout></PrivateRoute>} />
          <Route path="/indicadores" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/laudos" element={<PrivateRoute><Layout><ReportGenerator /></Layout></PrivateRoute>} />
          <Route path="/config" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
