import React, { useState, useEffect } from 'react';
import './Servicios.css';

function Servicios() {
    const [servicios, setServicios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    const API_URL = "http://localhost:8082/servicios";

    useEffect(() => {
        cargarServicios();
    }, []);

    const cargarServicios = async () => {
        try {
            const respuesta = await fetch(`${API_URL}/listar`);
            if (respuesta.ok) {
                const datos = await respuesta.json();
                setServicios(Array.isArray(datos) ? datos : []);
            }
        } catch (error) {
            console.error("Error al cargar servicios:", error);
        } finally {
            setCargando(false);
        }
    };

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);
    const [formulario, setFormulario] = useState({
        nombreServicio: '',
        descripcion: '',
        precioBase: ''
    });

    const manejarInput = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormulario({ nombreServicio: '', descripcion: '', precioBase: '' });
        setModalAbierto(true);
    };

    const abrirModalEditar = (s) => {
        setModoEdicion(true);
        setIdEditando(s.id_servicio);
        setFormulario({
            nombreServicio: s.nombreServicio,
            descripcion: s.descripcion || '',
            precioBase: s.precioBase
        });
        setModalAbierto(true);
    };

    // CORRECCIÓN EN GUARDAR (ACTUALIZAR)
    const guardarServicio = async () => {
        if (!formulario.nombreServicio || !formulario.precioBase) {
            alert("Nombre y Precio son obligatorios");
            return;
        }

        // Construimos el objeto EXACTO que espera CatalogoServicios en Java
        const payload = {
            nombreServicio: formulario.nombreServicio,
            descripcion: formulario.descripcion,
            precioBase: parseFloat(formulario.precioBase)
        };

        // Si es edición, le inyectamos el ID al cuerpo también para mayor seguridad
        if (modoEdicion) {
            payload.id_servicio = idEditando;
        }

        try {
            const url = modoEdicion ? `${API_URL}/${idEditando}` : `${API_URL}/Servicio`;
            const metodo = modoEdicion ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await cargarServicios();
                setModalAbierto(false);
            } else {
                const errorTexto = await res.text();
                alert("Error del servidor: " + errorTexto);
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("No se pudo conectar con el servidor.");
        }
    };

    const eliminarServicio = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
            try {
                const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    cargarServicios();
                }
            } catch (error) {
                console.error("Error al eliminar:", error);
            }
        }
    };

    const serviciosFiltrados = servicios.filter(s => 
        s.nombreServicio?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="servicios-container">
            <div className="servicios-header">
                <h1>CATÁLOGO DE SERVICIOS</h1>
                <div className="header-acciones">
                    <input 
                        type="text" 
                        placeholder="Buscar servicio..." 
                        className="input-buscador"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <button className="btn-nuevo-servicio" onClick={abrirModalCrear}>
                        + AGREGAR SERVICIO
                    </button>
                </div>
            </div>

            <div className="tabla-contenedor">
                {cargando ? (
                    <p style={{textAlign: 'center', padding: '20px'}}>Conectando...</p>
                ) : (
                    <table className="tabla-servicios">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre de servicio</th>
                                <th>Descripción</th>
                                <th>Precio Base</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {serviciosFiltrados.length > 0 ? (
                                serviciosFiltrados.map((s) => (
                                    <tr key={s.id_servicio}>
                                        <td>{s.id_servicio}</td>
                                        <td><strong>{s.nombreServicio}</strong></td>
                                        <td>{s.descripcion}</td>
                                        <td>${parseFloat(s.precioBase).toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                                        <td className="acciones-celda">
                                            <button className="btn-editar" onClick={() => abrirModalEditar(s)}>✏️</button>
                                            <button className="btn-eliminar" onClick={() => eliminarServicio(s.id_servicio)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No se encontraron registros.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{modoEdicion ? 'ACTUALIZAR SERVICIO' : 'NUEVO SERVICIO'}</h2>
                        <div className="form-grupo">
                            <label>Nombre del Servicio:</label>
                            <input type="text" name="nombreServicio" value={formulario.nombreServicio} onChange={manejarInput} />
                        </div>
                        <div className="form-grupo">
                            <label>Descripción:</label>
                            <textarea name="descripcion" value={formulario.descripcion} onChange={manejarInput} rows="3" />
                        </div>
                        <div className="form-grupo">
                            <label>Precio Base ($):</label>
                            <input type="number" name="precioBase" value={formulario.precioBase} onChange={manejarInput} />
                        </div>
                        <div className="modal-botones">
                            <button className="btn-guardar" onClick={guardarServicio}>Guardar Cambios</button>
                            <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Servicios;