import React, { useState, useEffect } from 'react';
import './Tecnicos.css';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

function Tecnicos() {
    const [tecnicos, setTecnicos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [notificacion, setNotificacion] = useState(null);
    const [confirmacion, setConfirmacion] = useState(null);

    const API_URL = "http://localhost:8082/tecnicos";

    useEffect(() => {
        cargarTecnicos();
    }, []);

    const cargarTecnicos = async () => {
        try {
            const respuesta = await fetch(API_URL);
            if (respuesta.ok) {
                const datos = await respuesta.json();
                setTecnicos(Array.isArray(datos) ? datos : []);
            }
        } catch (error) { console.error(error); } finally { setCargando(false); }
    };

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);

    const [formulario, setFormulario] = useState({ nombreTecnico: '', especialidad: '', telefono: '', estado: 'Activo' });

    const manejarInput = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormulario({ nombreTecnico: '', especialidad: '', telefono: '', estado: 'Activo' });
        setModalAbierto(true);
    };

    const abrirModalEditar = (t) => {
        setModoEdicion(true);
        setIdEditando(t.idTecnicos);
        setFormulario({
            nombreTecnico: t.nombreTecnico || '',
            especialidad: t.especialidad || '',
            telefono: t.telefono || '',
            estado: t.estado || 'Activo'
        });
        setModalAbierto(true);
    };

    const guardarTecnico = async () => {
        try {
            const metodo = modoEdicion ? 'PUT' : 'POST';
            const url = modoEdicion ? `${API_URL}/${idEditando}` : API_URL;
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formulario)
            });
            if (res.ok) { 
                await cargarTecnicos(); 
                setModalAbierto(false); 
                setNotificacion({ mensaje: `Técnico ${modoEdicion ? 'actualizado' : 'registrado'} con éxito`, tipo: 'success' });
            } else {
                setNotificacion({ mensaje: "Error al guardar técnico", tipo: 'error' });
            }
        } catch (error) { 
            setNotificacion({ mensaje: "Error de conexión", tipo: 'error' });
        }
    };

    const solicitarEliminar = (id) => {
        setConfirmacion({
            mensaje: "¿Deseas eliminar a este técnico del sistema?",
            onConfirm: () => ejecutarEliminacion(id)
        });
    };

    const ejecutarEliminacion = async (id) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await cargarTecnicos();
                setNotificacion({ mensaje: "Técnico eliminado con éxito", tipo: 'success' });
            } else {
                setNotificacion({ mensaje: "No se pudo eliminar al técnico", tipo: 'error' });
            }
        } catch (error) {
            setNotificacion({ mensaje: "Error de conexión", tipo: 'error' });
        } finally {
            setConfirmacion(null);
        }
    };

    const filtrados = tecnicos.filter(t => {
        const query = busqueda.toLowerCase().trim();
        const id = String(t.idTecnicos || "").toLowerCase();
        const nombre = (t.nombreTecnico || "").toLowerCase();
        return nombre.includes(query) || id.includes(query);
    });

    return (
        <div className="tecnicos-container">
            {notificacion && <Toast {...notificacion} onClose={() => setNotificacion(null)} />}
            {confirmacion && <ConfirmModal {...confirmacion} onCancel={() => setConfirmacion(null)} />}

            <div className="tecnicos-header">
                <h1>TÉCNICOS</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Buscar por nombre o ID..." className="input-buscador" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                    <button className="btn-nuevo-tecnico" onClick={abrirModalCrear}>+ NUEVO TÉCNICO</button>
                </div>
            </div>
            <div className="tabla-container">
                {cargando ? <p style={{textAlign:'center'}}>Cargando...</p> : (
                    <table className="tabla-tecnicos">
                        <thead>
                            <tr><th>ID</th><th>Nombre Completo</th><th>Especialidad</th><th>Teléfono</th><th>Estado</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {filtrados.map(t => (
                                <tr key={t.idTecnicos}>
                                    <td>{t.idTecnicos}</td>
                                    <td><strong>{t.nombreTecnico}</strong></td>
                                    <td>{t.especialidad}</td>
                                    <td>{t.telefono}</td>
                                    <td><span className="estado-pill">{t.estado}</span></td>
                                    <td className="acciones-celda">
                                        <button className="btn-editar" onClick={() => abrirModalEditar(t)}>✏️</button>
                                        <button className="btn-eliminar" onClick={() => solicitarEliminar(t.idTecnicos)}>🗑️</button>
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
                        <h2>{modoEdicion ? 'ACTUALIZAR' : 'NUEVO'} TÉCNICO</h2>
                        <div className="form-grupo"><label>Nombre:</label><input type="text" name="nombreTecnico" value={formulario.nombreTecnico} onChange={manejarInput} /></div>
                        <div className="form-grupo"><label>Especialidad:</label><input type="text" name="especialidad" value={formulario.especialidad} onChange={manejarInput} /></div>
                        <div className="form-grupo"><label>Teléfono:</label><input type="text" name="telefono" value={formulario.telefono} onChange={manejarInput} /></div>
                        <div className="form-grupo">
                            <label>Estado:</label>
                            <select name="estado" value={formulario.estado} onChange={manejarInput} className="input-select">
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                        <div className="modal-botones"><button className="btn-guardar" onClick={guardarTecnico}>Guardar</button><button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tecnicos;