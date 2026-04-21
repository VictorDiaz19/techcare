import React, { useState, useEffect } from 'react';
import './Reparaciones.css';

function Reparaciones() {
    const [ordenes, setOrdenes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mensajeError, setMensajeError] = useState("");

    const API_URL = "http://localhost:8082/reparaciones";

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const respuesta = await fetch(API_URL);
            if (respuesta.ok) {
                const rawData = await respuesta.json();
                
                // MAPEAMOS DEFENSIVAMENTE CUALQUIER VARIANTE DE NOMBRE QUE VENGA DEL BACKEND
                const formateadas = Array.isArray(rawData) ? rawData.map(o => ({
                    id: o.idReparacion || o.id_reparacion || o.id,
                    fecha: o.fechaEntrada || o.fecha_entrada || o.fecha,
                    equipo: o.equipo || o.Equipo || 'N/A',
                    problema: o.problema || o.Problema || 'N/A',
                    estado: o.estadoActual || o.estado_actual || o.estado || 'En espera',
                    costo: parseFloat(o.costoTotal || o.costo_total || 0)
                })) : [];
                
                setOrdenes(formateadas);
                setMensajeError("");
            } else {
                setMensajeError("El servidor respondió con un error (Status: " + respuesta.status + ")");
            }
        } catch (error) {
            setMensajeError("No se pudo conectar al Backend (¿Está prendido IntelliJ?)");
        } finally {
            setCargando(false);
        }
    };

    const obtenerClaseEstado = (estado) => {
        switch(estado) {
            case 'En proceso': return 'pill-amarillo';
            case 'En espera': return 'pill-rojo';
            case 'Terminado': return 'pill-verde';
            default: return 'pill-gris';
        }
    };

    return (
        <div className="reparaciones-container">
            <div className="reparaciones-header">
                <h1>ÓRDENES DE REPARACIÓN</h1>
                <div className="header-acciones">
                    <button className="btn-nueva-orden" onClick={() => alert("Función Crear vinculada al backend")}>+ NUEVA ORDEN</button>
                    <button className="btn-refrescar" onClick={cargarDatos}>🔄</button>
                </div>
            </div>

            {mensajeError && <p style={{color: 'red', textAlign: 'center'}}>{mensajeError}</p>}

            <div className="tabla-contenedor">
                {cargando ? <p style={{textAlign: 'center'}}>Cargando...</p> : (
                    <table className="tabla-reparaciones">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Fecha Entrada</th>
                                <th>Equipo</th>
                                <th>Problema</th>
                                <th>Estado Actual</th>
                                <th>Costo Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordenes.length > 0 ? ordenes.map((o) => (
                                <tr key={o.id}>
                                    <td>REP-{String(o.id).padStart(4, '0')}</td>
                                    <td>{o.fecha}</td>
                                    <td><strong>{o.equipo}</strong></td>
                                    <td>{o.problema}</td>
                                    <td><span className={`estado-pill ${obtenerClaseEstado(o.estado)}`}>{o.estado}</span></td>
                                    <td>${o.costo.toFixed(2)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" style={{textAlign: 'center'}}>No hay órdenes en la base de datos.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Reparaciones;