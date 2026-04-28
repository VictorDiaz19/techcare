import React, { useState } from 'react';
import './LandingPage.css';

// Recibimos una función como "prop" desde App.jsx para avisarle que el login fue exitoso
function LandingPage({ onLoginExitoso }) {
    
    const [mostrarLogin, setMostrarLogin] = useState(false);
    const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
    const [errorAcceso, setErrorAcceso] = useState('');

    const manejarInput = (e) => {
        setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
        setErrorAcceso(''); 
    };

    // LÓGICA DE LOGIN REAL (BCRYPT + ROLES)
    const intentarLogin = async (e) => {
        e.preventDefault(); 
        setErrorAcceso('');

        try {
            const respuesta = await fetch("http://localhost:8082/auth/login", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: credenciales.usuario, 
                    password: credenciales.password 
                })
            });

            if (respuesta.ok) {
                const datosUsuario = await respuesta.json();
                // Guardamos los datos de sesión reales del Backend
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', datosUsuario.rol);
                localStorage.setItem('userName', datosUsuario.nombre);
                onLoginExitoso(); 
            } else {
                setErrorAcceso('Usuario o contraseña incorrectos. Acceso denegado.');
            }
        } catch (err) {
            setErrorAcceso('No se pudo conectar con el servidor de seguridad.');
        }
    };

    return (
        <div className="landing-container">
        
        {/* BARRA DE NAVEGACIÓN PÚBLICA */}
        <nav className="landing-nav">
            <div className="landing-logo">TechCare <span>Solutions</span></div>
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

        {/* --- MODAL DE SEGURIDAD (LOGIN) --- DISEÑO ORIGINAL PRESERVADO */}
        {mostrarLogin && (
            <div className="modal-overlay">
            <div className="modal-content login-modal">
                <button className="btn-cerrar-login" onClick={() => setMostrarLogin(false)}>✖</button>
                
                <h2>Acceso Administrativo</h2>
                <p className="login-sub">Ingresa tus credenciales de empleado</p>
                
                <form onSubmit={intentarLogin}>
                <div className="form-grupo">
                    <label style={{fontSize: '14px'}}>Usuario:</label>
                    <input 
                    type="text" 
                    name="usuario" 
                    value={credenciales.usuario} 
                    onChange={manejarInput} 
                    placeholder="Ej. admin"
                    required
                    style={{fontSize: '14px'}}
                    />
                </div>
                <div className="form-grupo">
                    <label style={{fontSize: '14px'}}>Contraseña:</label>
                    <input 
                    type="password" 
                    name="password" 
                    value={credenciales.password} 
                    onChange={manejarInput} 
                    placeholder="••••••••"
                    required
                    style={{fontSize: '14px'}}
                    />
                </div>
                
                {errorAcceso && <div className="mensaje-error" style={{fontSize: '14px', color: '#e74c3c'}}>{errorAcceso}</div>}

                <button type="submit" className="btn-login-submit" style={{fontSize: '16px', padding: '12px'}}>
                    Ingresar al Sistema
                </button>
                </form>
            </div>
            </div>
        )}

        </div>
    );
}

export default LandingPage;