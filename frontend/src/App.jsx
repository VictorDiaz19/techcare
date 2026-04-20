// Se encarga de decidir qué pantalla mostrar dependiendo de la URL en la que este
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar'; // Importamos el Navbar
import Dashboard from './pages/Dashboard';
import Reparaciones from './pages/Reparaciones';
import Servicios from './pages/Servicios';
import Clientes from './pages/Clientes';
import Tecnicos from './pages/Tecnicos';
import Inventario from './pages/Inventario';
import Proveedores from './pages/Proveedores';
import Cotizaciones from './pages/Cotizaciones';
import DetallesTaller from './pages/DetallesTaller';
// 1. IMPORTAR LA NUEVA LANDING PAGE
import LandingPage from './pages/LandingPage';

function App(){
  // 2. EEL ESTADO MAESTRO DE SEGURIDAD (Inicia como falso)
  const [autenticando, setAutenticando] = useState(false);

  // 3. LA BARRERA DE SEGURIDAD (Renderizando Condicional Múltiple)

  // Si NO está autenticando, solo mostramos la Landing Page
  // No hay Navbar, no hay Router interno que puedan hackear escribiendo la URL
  if (!autenticando) {
    return (
      // Le pasamos la función que cambia el estado a 'true' cuando metan la contraseña correcta
      <LandingPage onLoginExitoso={() => setAutenticando(true)} />
    );
  }

  // Si SÍ está autenticando, devolvemos la aplicación completa
  return (
    <Router>
      <div className="app-container">
        {/* Aquí podrías agregarle al Navbar un botón de 'Cerrar Sesión' pasándole setAutenticado(false) en el futuro */}
        {/* Le pasamos una "llave" al Navbar para que pueda apagar el sistema */}
        <Navbar onLogout={() => setAutenticando(false)} />
        
        <div className="main-content">
          <Routes>
            {/* Rutas Privadas */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reparaciones" element={<Reparaciones />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/tecnicos" element={<Tecnicos />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/cotizaciones" element={<Cotizaciones />} />
            <Route path="/detalles/:folio" element={<DetallesTaller />} />
            
            {/* Redirección automática: Si alguien ya logeado va a la raíz '/', mándalo al Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// Exportar la aplicación
export default App;