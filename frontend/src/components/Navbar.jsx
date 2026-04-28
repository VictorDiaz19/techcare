import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onLogout }) {
  const location = useLocation();
  const userRole = localStorage.getItem('userRole'); // Obtenemos el rol guardado en el login
  const userName = localStorage.getItem('userName');

  // Función para saber si una ruta está activa (para el diseño)
  const isActive = (path) => location.pathname === path ? 'active' : '';

  // REGLAS DE VISIBILIDAD (RBAC)
  const esAdmin = userRole === 'ADMIN';
  const esRecepcionista = userRole === 'RECEPCIONISTA';
  const esTecnico = userRole === 'TECNICO';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">TechCare</Link>
      </div>

      <div className="navbar-links">
        {/* Dashboard: Visible para todos */}
        <Link to="/dashboard" className={isActive('/dashboard')}>Resumen</Link>

        {/* Reparaciones: Visible para todos */}
        <Link to="/reparaciones" className={isActive('/reparaciones')}>Reparaciones</Link>

        {/* Servicios: Solo Admin */}
        {esAdmin && <Link to="/servicios" className={isActive('/servicios')}>Servicios</Link>}

        {/* Clientes: Admin y Recepcionista */}
        {(esAdmin || esRecepcionista) && <Link to="/clientes" className={isActive('/clientes')}>Clientes</Link>}

        {/* Técnicos: Solo Admin */}
        {esAdmin && <Link to="/tecnicos" className={isActive('/tecnicos')}>Técnicos</Link>}

        {/* Inventario: Admin y Técnico */}
        {(esAdmin || esTecnico) && <Link to="/inventario" className={isActive('/inventario')}>Inventario</Link>}

        {/* Proveedores: Solo Admin */}
        {esAdmin && <Link to="/proveedores" className={isActive('/proveedores')}>Proveedores</Link>}

        {/* Cotizaciones: Admin y Recepcionista */}
        {(esAdmin || esRecepcionista) && <Link to="/cotizaciones" className={isActive('/cotizaciones')}>Cotizaciones</Link>}
      </div>

      <div className="navbar-user">
        <span className="user-info">{userName} - {userRole}</span>
        <button className="btn-logout" onClick={onLogout}>Cerrar Sesión</button>
      </div>
    </nav>
  );
}

export default Navbar;