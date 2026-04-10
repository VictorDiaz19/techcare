/* Barra de navegacion */
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Sirve para navegar entre pantallas sin que la página parpadee
import './Navbar.css'; // Importamos el archivo de diseño

function Navbar() {
    // Creamos el estado del menú
    const [menuAbierto, setMenuAbierto] = useState(false);

    //Función para abrir y cerrar
    const cambiarMenu = () => {
        setMenuAbierto(!menuAbierto);
    };

    return ( // Envuelve todo el HTML (JSX) que se va a mostrar en pantalla
        <nav className='navbar'>
            {/* 1. SECCIÓN DEL LOGO */}
            <di className='navbar-logo'>
                <h2>TechCare</h2>
            </di>

            {/* Esta parte solo se vera en telefonos */}
            <div className='menu-icon' onClick={cambiarMenu}>
                {/* Si está abierto muestra una X, si está cerrada muestra ≡ */}
                {menuAbierto ? "x" : "≡"}
            </div>

            {/* 2. SECCIÓN DE LOS ENLACES */}
            <ul className={menuAbierto ? "navbar-links activo" : "navbar-links"}>
                {/* La propiedad 'to' le dice a React a qué ruta de App.jsx debe ir al hacer clic */}
                <li><Link to="./">Resumen</Link></li>
                <li><Link to="/reparaciones">Reparaciones</Link></li>
                <li><Link to="/servicios">Servicios</Link></li>
                <li><Link to="/clientes">Clientes</Link></li>
                <li><Link to="/tecnicos">Técnicos</Link></li>
                <li><Link to="/inventario">Inventario</Link></li>
                <li><Link to="/proveedores">Proveedores</Link></li>
                <li><Link to="/cotizaciones">Cotizaciones</Link></li>
            </ul>

            {/* 3. SECCIÓN DE USUARIO */}
            <div className='navbar-user'>
                <span>Edwin - Admin</span>
                <button className='btn-logout'>Cerrar Sesión</button>
            </div>
        </nav>
    );
}

// Exportamos el componente para que otras partes del proyecto puedan usarlo
export default Navbar;