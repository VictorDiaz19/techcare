import React, { useState, useEffect } from 'react';
import './Servicios.css';

function Servicios() {
    const [servicios, setServicios] = useState([]);
    const [cargando, setCargando] = useState(true);

    const API_URL = "http://localhost:8082/servicios/listar";

    useEffect(() => {
        cargarServicios();
    }, []);

    const cargarServicios = async () => {
        try {
            const respuesta = await fetch(API_URL);
            if (respuesta.ok) {
                const rawData = await respuesta.json();
                
                const formateados = Array.isArray(rawData) ? rawData.map(s => ({
                    id: s.id_servicio || s.ID_servicio || s.idServicio || s.id,
                    nombre: s.nombreServicio || s.NombreServicio || s.nombre,
                    descripcion: s.descripcion || s.Descripcion || '',
                    precio: parseFloat(s.precioBase || s.PrecioBase || 0)
                })) : [];
                
                setServicios(formateados);
            }
        } catch (error) {
            console.error("Error al cargar servicios:", error);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="servicios-container">
            <div className="servicios-header">
                <h1>CATÁLOGO DE SERVICIOS</h1>
            </div>

            <div className="tabla-contenedor">
                {cargando ? <p style={{textAlign:'center'}}>Cargando servicios del taller...</p> : (
                    <table className="tabla-servicios">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Servicio</th>
                                <th>Descripción</th>
                                <th>Precio Base</th>
                            </tr>
                        </thead>
                        <tbody>
                            {servicios.length > 0 ? servicios.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.id}</td>
                                    <td><strong>{s.nombre}</strong></td>
                                    <td>{s.descripcion}</td>
                                    <td>${s.precio.toLocaleString('es-MX')} MXN</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" style={{textAlign:'center'}}>No hay servicios en el catálogo.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Servicios;