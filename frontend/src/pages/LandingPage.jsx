import React, { useState } from 'react';
import './LandingPage.css';

// Recibimos una función como "prop" desde App.jsx para avisarle que el login fue exitoso
function LandingPage({ onLoginExitoso }) {
    
    const [mostrarLogin, setMostrarLogin] = useState(false);
    const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
    const [errorAcceso, setErrorAcceso] = useState('');

    const manejarInput = (e) => {
        setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
        setErrorAcceso(''); // Limpiamos el error si el usuario vuelve a escribir
    };

    const intentarLogin = (e) => {
        e.preventDefault(); // Evita que la página se recargue al enviar el formulario

        // Leemos las variables secretas de Vite
        const usuarioReal = import.meta.env.VITE_USUARIO_ADMIN;
        const passwordReal = import.meta.env.VITE_PASSWORD_ADMIN;

        // SIMULACIÓN DE SEGURIDAD (Esto en el futuro lo validará tu Backend)
        if (credenciales.usuario === usuarioReal && credenciales.password === passwordReal) {
        onLoginExitoso(); // Le avisamos a App.jsx que nos deje pasar!
        } else {
        setErrorAcceso('Usuario o contraseña incorrectos. Acceso denegado.');
        }
    };

    return (
        <div className="landing-container">
        
        {/* BARRA DE NAVEGACIÓN PÚBLICA */}
        <nav className="landing-nav">
            <div className="landing-logo">TechCare <span>Solutions</span></div>
            {/* Botón discreto para los empleados */}
            <button className="btn-acceso-admin" onClick={() => setMostrarLogin(true)}>
            Portal Empleados 🔒
            </button>
        </nav>

        {/* SECCIÓN PRINCIPAL (HERO) */}
        <header className="landing-hero">
            <div className="hero-texto">
            <h1>Reparación profesional para tus equipos tecnológicos</h1>
            <p>
                En TechCare somos expertos en devolverle la vida a tus laptops, smartphones y consolas. 
                Diagnósticos precisos, refacciones originales y tiempos de entrega inigualables.
            </p>
            <button className="btn-hero-cta">Conoce nuestros servicios</button>
            </div>
            <div className="hero-imagen">
            {/* Imagen ilustrativa de reparación */}
            <img src="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80" alt="Reparación de PC" />
            </div>
        </header>

        {/* SECCIÓN DE CARACTERÍSTICAS */}
        <section className="landing-features">
            <div className="feature-card">
            <h3>⚡ Servicio Exprés</h3>
            <p>Reparaciones de pantalla y batería el mismo día para modelos seleccionados.</p>
            </div>
            <div className="feature-card">
            <h3>🛡️ Garantía Total</h3>
            <p>Todas nuestras reparaciones cuentan con 90 días de garantía por escrito.</p>
            </div>
            <div className="feature-card">
            <h3>🔍 Diagnóstico Transparente</h3>
            <p>Te explicamos exactamente el problema antes de proceder. Sin cobros sorpresa.</p>
            </div>
        </section>

        {/* --- MODAL DE SEGURIDAD (LOGIN) --- */}
        {mostrarLogin && (
            <div className="modal-overlay">
            <div className="modal-content login-modal">
                <button className="btn-cerrar-login" onClick={() => setMostrarLogin(false)}>✖</button>
                
                <h2>Acceso Administrativo</h2>
                <p className="login-sub">Ingresa tus credenciales de empleado</p>
                
                <form onSubmit={intentarLogin}>
                <div className="form-grupo">
                    <label>Usuario:</label>
                    <input 
                    type="text" 
                    name="usuario" 
                    value={credenciales.usuario} 
                    onChange={manejarInput} 
                    placeholder="Ej. admin"
                    required
                    />
                </div>
                <div className="form-grupo">
                    <label>Contraseña:</label>
                    <input 
                    type="password" 
                    name="password" 
                    value={credenciales.password} 
                    onChange={manejarInput} 
                    placeholder="••••••••"
                    required
                    />
                </div>
                
                {errorAcceso && <div className="mensaje-error">{errorAcceso}</div>}

                <button type="submit" className="btn-login-submit">Ingresar al Sistema</button>
                </form>
            </div>
            </div>
        )}

        </div>
    );
}

export default LandingPage;