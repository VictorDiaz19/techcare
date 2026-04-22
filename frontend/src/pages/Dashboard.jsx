import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard() {
    const [stats, setStats] = useState({
        totalClientes: 0,
        totalProveedores: 0,
        totalReparaciones: 0,
        totalCotizaciones: 0,
        totalServicios: 0,
        totalInventario: 0
    });

    const [equiposUrgentes, setEquiposUrgentes] = useState([]);
    const [equiposEnProceso, setEquiposEnProceso] = useState([]);
    const [equiposListos, setEquiposListos] = useState([]);
    const [cargando, setCargando] = useState(true);

    // --- NUEVOS ESTADOS PARA EL REPORTE ---
    const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
    const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

    const API_BASE = "http://localhost:8082";

    useEffect(() => {
        const cargarDashboard = async () => {
            try {
                const resStats = await fetch(`${API_BASE}/dashboard/stats`);
                if (resStats.ok) setStats(await resStats.json());

                const resRep = await fetch(`${API_BASE}/reparaciones`);
                if (resRep.ok) {
                    const reparaciones = await resRep.json();
                    setEquiposUrgentes(reparaciones.filter(r => r.estadoActual === 'En espera'));
                    setEquiposEnProceso(reparaciones.filter(r => r.estadoActual === 'En proceso'));
                    setEquiposListos(reparaciones.filter(r => r.estadoActual === 'Terminado'));
                }
            } catch (error) {
                console.error("Error al conectar con el servidor:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarDashboard();
    }, []);

    // FUNCIÓN DE DESCARGA ACTUALIZADA CON PARÁMETROS ELIGIBLES
    const descargarReporteProductividad = () => {
        window.open(`${API_BASE}/pdf/reportes/productividad?mes=${mesSeleccionado}&anio=${anioSeleccionado}`, '_blank');
    };

    return (
        <div className="dashboard-container">
            {stats.totalInventario < 5 && stats.totalInventario > 0 && (
                <div className="banner-alerta">
                    <p>🔔 <strong>ALERTA:</strong> El inventario global es bajo ({stats.totalInventario} piezas). Revisa tus existencias.</p>
                </div>
            )}

            <header className="dashboard-header">
                <h1>PANEL DE CONTROL TECHCARE</h1>
                <p>Resumen operativo en tiempo real</p>
            </header>

            <section className="kpis-superiores">
                <div className="kpi-mini-card">
                    <p>Clientes Registrados</p>
                    <h3>{stats.totalClientes}</h3>
                </div>
                <div className="kpi-mini-card">
                    <p>Órdenes de Reparación</p>
                    <h3>{stats.totalReparaciones}</h3>
                </div>
                <div className="kpi-mini-card">
                    <p>Servicios en Catálogo</p>
                    <h3>{stats.totalServicios}</h3>
                </div>
                <div className="kpi-mini-card">
                    <p>Proveedores Activos</p>
                    <h3>{stats.totalProveedores}</h3>
                </div>
            </section>

            <section className="semaforo-columnas">
                <div className="columna-card roja">
                    <h2 className="columna-titulo">URGENTE / EN ESPERA</h2>
                    <p className="columna-sub">({equiposUrgentes.length} equipos)</p>
                    <div className="lista-equipos">
                        {equiposUrgentes.map(o => (
                            <div key={o.idReparacion} className="equipo-item">
                                <div className="equipo-info">
                                    <strong>REP-{String(o.idReparacion).padStart(4, '0')}</strong>
                                    <span>{o.equipo}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="columna-card amarilla">
                    <h2 className="columna-titulo">EN TRABAJO</h2>
                    <p className="columna-sub">({equiposEnProceso.length} equipos)</p>
                    <div className="lista-equipos">
                        {equiposEnProceso.map(o => (
                            <div key={o.idReparacion} className="equipo-item">
                                <div className="equipo-info">
                                    <strong>REP-{String(o.idReparacion).padStart(4, '0')}</strong>
                                    <span>{o.equipo}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="columna-card verde">
                    <h2 className="columna-titulo">LISTO PARA ENTREGA</h2>
                    <p className="columna-sub">({equiposListos.length} equipos)</p>
                    <div className="lista-equipos">
                        {equiposListos.map(o => (
                            <div key={o.idReparacion} className="equipo-item">
                                <div className="equipo-info">
                                    <strong>REP-{String(o.idReparacion).padStart(4, '0')}</strong>
                                    <span>{o.equipo}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- SECCIÓN DE REPORTES CON SELECTORES --- */}
            <section className="dashboard-acciones-rapidas" style={{marginTop:'30px'}}>
                <h2 style={{fontSize:'1.5rem', color:'#2c3e50', marginBottom:'15px'}}>Reportes y Administración</h2>
                <div style={{display:'flex', gap:'15px', alignItems:'center', background:'#f8f9fa', padding:'20px', borderRadius:'8px'}}>
                    
                    <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                        <label style={{fontSize:'0.9rem', fontWeight:'bold'}}>Mes:</label>
                        <select 
                            value={mesSeleccionado} 
                            onChange={(e) => setMesSeleccionado(e.target.value)}
                            style={{padding:'8px', borderRadius:'4px', border:'1px solid #ddd'}}
                        >
                            <option value="1">Enero</option>
                            <option value="2">Febrero</option>
                            <option value="3">Marzo</option>
                            <option value="4">Abril</option>
                            <option value="5">Mayo</option>
                            <option value="6">Junio</option>
                            <option value="7">Julio</option>
                            <option value="8">Agosto</option>
                            <option value="9">Septiembre</option>
                            <option value="10">Octubre</option>
                            <option value="11">Noviembre</option>
                            <option value="12">Diciembre</option>
                        </select>
                    </div>

                    <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                        <label style={{fontSize:'0.9rem', fontWeight:'bold'}}>Año:</label>
                        <select 
                            value={anioSeleccionado} 
                            onChange={(e) => setAnioSeleccionado(e.target.value)}
                            style={{padding:'8px', borderRadius:'4px', border:'1px solid #ddd'}}
                        >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>
                    </div>

                    <button 
                        className="btn-nuevo-cliente" 
                        onClick={descargarReporteProductividad}
                        style={{background:'#e67e22', border:'none', padding:'12px 25px', marginTop:'22px', cursor:'pointer', fontWeight:'bold'}}
                    >
                        📊 DESCARGAR REPORTE MENSUAL
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Dashboard;