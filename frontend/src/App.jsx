import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Reparaciones from './pages/Reparaciones';
import Servicios from './pages/Servicios';
import Clientes from './pages/Clientes';
import Tecnicos from './pages/Tecnicos';
import Inventario from './pages/Inventario';
import Proveedores from './pages/Proveedores';
import Cotizaciones from './pages/Cotizaciones';
import DetallesTaller from './pages/DetallesTaller';
import LandingPage from './pages/LandingPage';

function App(){
  // 1. LEER LA SESIÓN AL CARGAR: Revisamos si ya había una sesión guardada en el navegador
  const [autenticando, setAutenticando] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // 2. GUARDAR SESIÓN: Cuando el login es exitoso, guardamos el permiso
  const manejarLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setAutenticando(true);
  };

  // 3. BORRAR SESIÓN: Cuando el usuario le da a "Cerrar Sesión"
  const manejarLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setAutenticando(false);
  };

  if (!autenticando) {
    return (
      <LandingPage onLoginExitoso={manejarLogin} />
    );
  }

  return (
    <Router>
      <div className="app-container">
        {/* Pasamos la función de logout al Navbar */}
        <Navbar onLogout={manejarLogout} />
        
        <div className="main-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reparaciones" element={<Reparaciones />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/tecnicos" element={<Tecnicos />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/cotizaciones" element={<Cotizaciones />} />
            <Route path="/detalles/:folio" element={<DetallesTaller />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;