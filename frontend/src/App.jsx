// Se encarga de decidir qué pantalla mostrar dependiendo de la URL en la que este
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Importamos el Navbar
import Dashboard from './pages/Dashboard';
import Reparaciones from './pages/Reparaciones';
import Servicios from './pages/Servicios';
import Clientes from './pages/Clientes';
import Inventario from './pages/Inventario';

function App(){
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Ruta principal (Inicio) */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/reparaciones" element={<Reparaciones />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/clientes" element={<Clientes />} />
        {/* Aqui va Tecnicos */}
        <Route path="/inventario" element={<Inventario />} />
      </Routes>
    </BrowserRouter>
  );
}

// Exportar la aplicación
export default App;