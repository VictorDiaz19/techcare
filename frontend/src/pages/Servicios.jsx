import React, { useState, useEffect } from 'react';
import './Servicios.css';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

function Servicios() {
    const [servicios, setServicios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [notificacion, setNotificacion] = useState(null);
    const [confirmacion, setConfirmacion] = useState(null);

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
        } catch (error) { console.error(error); } finally { setCargando(false); }
    };

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);
    const [formulario, setFormulario] = useState({ nombreServicio: '', descripcion: '', precioBase: '' });

    const manejarInput = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

    const guardarServicio = async () => {
        const payload = { ...formulario, precioBase: parseFloat(formulario.precioBase) };
        if (modoEdicion) payload.id_servicio = idEditando;

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
                setNotificacion({ mensaje: `Servicio ${modoEdicion ? 'actualizado' : 'registrado'} con éxito`, tipo: 'success' });
            } else {
                setNotificacion({ mensaje: "Error al guardar servicio", tipo: 'error' });
            }
        } catch (error) { 
            setNotificacion({ mensaje: "Error de conexión", tipo: 'error' });
        }
    };

    const solicitarEliminar = (id) => {
        setConfirmacion({
            mensaje: "¿Deseas eliminar este servicio permanentemente del catálogo?",
            onConfirm: () => ejecutarEliminacion(id)
        });
    };

    const ejecutarEliminacion = async (id) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await cargarServicios();
                setNotificacion({ mensaje: "Servicio eliminado con éxito", tipo: 'success' });
            } else {
                setNotificacion({ mensaje: "No se pudo eliminar el servicio", tipo: 'error' });
            }
        } catch (error) {
            setNotificacion({ mensaje: "Error de conexión", tipo: 'error' });
        } finally {
            setConfirmacion(null);
        }
    };

    const filtrados = servicios.filter(s => {
        const query = busqueda.toLowerCase().trim();
        const id = String(s.id_servicio || s.ID_servicio || "").toLowerCase();
        const nombre = (s.nombreServicio || "").toLowerCase();
        return nombre.includes(query) || id.includes(query);
    });

    return (
        <div className="servicios-container">
            {notificacion && <Toast {...notificacion} onClose={() => setNotificacion(null)} />}
            {confirmacion && <ConfirmModal {...confirmacion} onCancel={() => setConfirmacion(null)} />}

            <div className="servicios-header">
                <h1>CATÁLOGO DE SERVICIOS</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Buscar por nombre o ID..." className="input-buscador" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                    <button className="btn-nuevo-servicio" onClick={() => { setModoEdicion(false); setFormulario({nombreServicio:'', descripcion:'', precioBase:''}); setModalAbierto(true); }}>+ AGREGAR SERVICIO</button>
                </div>
            </div>
            <div className="tabla-contenedor">
                {cargando ? <p style={{textAlign:'center'}}>Cargando...</p> : (
                    <table className="tabla-servicios">
                        <thead>
                            <tr><th>ID</th><th>Servicio</th><th>Descripción</th><th>Precio Base</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {filtrados.map(s => (
                                <tr key={s.id_servicio}>
                                    <td>{s.id_servicio}</td>
                                    <td><strong>{s.nombreServicio}</strong></td>
                                    <td>{s.descripcion}</td>
                                    <td>${parseFloat(s.precioBase).toLocaleString('es-MX')}</td>
                                    <td className="acciones-celda">
                                        <button className="btn-editar" onClick={() => { setModoEdicion(true); setIdEditando(s.id_servicio); setFormulario(s); setModalAbierto(true); }}>✏️</button>
                                        <button className="btn-eliminar" onClick={() => solicitarEliminar(s.id_servicio)}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{modoEdicion ? 'ACTUALIZAR' : 'NUEVO'} SERVICIO</h2>
                        <div className="form-grupo"><label>Nombre:</label><input type="text" name="nombreServicio" value={formulario.nombreServicio} onChange={manejarInput} /></div>
                        <div className="form-grupo"><label>Descripción:</label><textarea name="descripcion" value={formulario.descripcion} onChange={manejarInput} /></div>
                        <div className="form-grupo"><label>Precio:</label><input type="number" name="precioBase" value={formulario.precioBase} onChange={manejarInput} /></div>
                        <div className="modal-botones"><button className="btn-guardar" onClick={guardarServicio}>Guardar</button><button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Servicios;