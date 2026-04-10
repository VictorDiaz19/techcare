/* Resumen operativo */
import React, { useState } from 'react';
import './Dashboard.css';

function Dashboard() {
    // 1. DATOS DE ALERTAS (Simulando lo que vendrá de la tabla Inventario)
    const [alertasInventario, /*setAlertasInventario*/] = useState(3);

    // 2. DATOS DE KIPs SUPERIORES (Simulando consultas totales)
    const [kpis, /*setKpis*/] = useState({
        equiposRecibidos: 24,
        serviciosCompletados: 18,
        ingresosTotales: 35500,
        tiempoPromedio: 3.2
    });

    // 3. LISTAS DE EQUIPOS (Simulando un SELECT a la tabla de Reparaciones)
    const [equiposUrgentes, /*setEquiposUrgentes*/] = useState([
        { folio: 1024, equipo: 'Laptop HP', cliente: 'Victor', estado: 'Retrasado'},
        { folio: 1028, equipo: 'iPhone', cliente: 'Ana', estado: 'Esperando Refacción'},
        { folio: 1030, equipo: 'Tablet', cliente: 'Luis', estado: 'Grave'}
    ]);

    const [equiposEnProceso, /*setEquiposEnProceso*/] = useState ([
        { folio: 1025, equipo: 'Xbox', cliente: 'Carlos', estado: 'En Diagnóstico'},
        { folio: 1027, equipo: 'Dell PC', cliente: 'María', estado: 'En Reparación'},
        { folio: 1029, equipo: 'Samsung S21', cliente: 'José', estado: 'Esperando Refacción'},
    ]);

    const [equiposListos, /*setEquiposListos*/] = useState ([
        { folio: 1020, equipo: 'iPad Air', cliente: 'Elena', estado: 'Terminado' },
        { folio: 1023, equipo: 'Mando', cliente: 'Pedro', estado: 'Terminado' },
        { folio: 1026, equipo: 'Macbook', cliente: 'Sofía', estado: 'Terminado' }
    ]);

    // --- HTML ---
    return (
        <div className="dashboard-container">
            {/* --- BANNER DE ALERTA (Solo se muestra si hay más de 0 alertas) --- */}
            {alertasInventario > 0 && (
                <div className="banner-alerta">
                    <p>🔔 <strong>ALERTA DE INVENTARIO:</strong> {alertasInventario} productos con stock bajo (Ver inventario)</p>
                </div>
            )}

            {/* --- ENCABEZADO --- */}
            <header className="dashboard-header">
                <h1>RESUMEN OPERATIVO - MARZO 2026</h1>
            </header>

            {/* --- 4 KPIs SUPERIORES (Usando las variables del estado kpis) --- */}
            <section className="kpis-superiores">
                <div className="kpi-mini-card">
                    <p>Equipos Recibidos (Mes)</p>
                    <h3>{kpis.equiposRecibidos}</h3>
                </div>
                <div className="kpi-mini-card">
                    <p>Servicios completados</p>
                    <h3>{kpis.serviciosCompletados}</h3>
                </div>
                <div className="kpi-mini-card">
                    <p>Ingresos totales (Mes)</p>
                    <h3>${kpis.ingresosTotales.toLocaleString()} MXN</h3>
                </div>
                <div className="kpi-mini-card">
                    <p>Tiempo Promedio Reparación</p>
                    <h3>{kpis.tiempoPromedio} días</h3>
                </div>
            </section>

            {/* --- LAS 3 COLUMNAS DEL SEMÁFORO */}
            <section className="semaforo-columnas">

                {/* COLUMNA ROJA */}
                <div className="columna-card roja">
                    <h2 className="columna-titulo">URGENTE / RETRASADO</h2>
                    <p className="columna-sub">({equiposUrgentes.length} equipos)</p>

                    {/* Aquí usamos .map() para imprimir la lista dinámica */}
                    <div className="lista-equipos">
                        {equiposUrgentes.map(item => (
                            <div key={item.folio} className="equipo-item">
                                <div className="equipo-info">
                                    <strong>{item.folio} - {item.equipo}</strong>
                                    <span>{item.cliente}</span>
                                </div>
                                <div className="equipo-estado">{item.estado}</div>
                            </div>
                        ))}
                    </div>
                    <button className="btn-detalles">Ver Detalles</button>
                </div>

                {/* COLUMNA AMARILLA */}
                <div className="columna-card amarilla">
                    <h2 className="columna-titulo">EN PROCESO</h2>
                    <p className="columna-sub">({equiposEnProceso.length} equipos)</p>

                    <div className="lista-equipos">
                        {equiposEnProceso.map(item => (
                            <div key={item.folio} className="equipo-item">
                                <div className="equipo-info">
                                    <strong>{item.folio} - {item.equipo}</strong>
                                    <span>{item.cliente}</span>
                                </div>
                                <div className="equipo-estado">{item.estado}</div>
                            </div>
                        ))}
                    </div>
                    <button className="btn-detalles">Ver Detalles</button>
                </div>

                {/* COLUMNA VERDE */}
                <div className="columna-card verde">
                    <h2 className="columna-titulo">LISTO PARA ENTREGA</h2>
                    <p className="columna-sub">({equiposListos.length} equipos)</p>

                    <div className="lista-equipos">
                        {equiposListos.map(item => (
                            <div key={item.folio} className="equipo-item">
                                <div className="equipo-info">
                                    <strong>{item.folio} - {item.equipo}</strong>
                                    <span>{item.cliente}</span>
                                </div>
                                <div className="equipo-estado">{item.estado}</div>
                            </div>
                        ))}
                    </div>
                    <button className="btn-detalles">Ver Detalles</button>
                </div>
            </section>
        </div>
    );
}


export default Dashboard;