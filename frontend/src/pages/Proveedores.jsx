import React, { useState, useEffect } from 'react';
import './Proveedores.css';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

function Proveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [notificacion, setNotificacion] = useState(null);
    const [confirmacion, setConfirmacion] = useState(null);

    const API_URL = "http://localhost:8082/proveedores";

    useEffect(() => {
        cargarProveedores();
    }, []);

    const cargarProveedores = async () => {
        try {
            const respuesta = await fetch(API_URL);
            if (respuesta.ok) {
                const datos = await respuesta.json();
                setProveedores(Array.isArray(datos) ? datos : []);
            }
        } catch (error) { console.error(error); } finally { setCargando(false); }
    };

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);

    const [formulario, setFormulario] = useState({ empresa: '', nombreContacto: '', telefonoContacto: '', emailProveedor: '', categoria: '', tiempoEntrega: '' });

    const manejarInput = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

    const guardarProveedor = async () => {
        try {
            const metodo = modoEdicion ? 'PUT' : 'POST';
            const url = modoEdicion ? `${API_URL}/${idEditando}` : API_URL;
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formulario)
            });
            if (res.ok) { 
                await cargarProveedores(); 
                setModalAbierto(false); 
                setNotificacion({ mensaje: `Proveedor ${modoEdicion ? 'actualizado' : 'registrado'} con éxito`, tipo: 'success' });
            } else {
                setNotificacion({ mensaje: "Error al guardar proveedor", tipo: 'error' });
            }
        } catch (error) { 
            setNotificacion({ mensaje: "Error de conexión", tipo: 'error' });
        }
    };

    const solicitarEliminar = (id) => {
        setConfirmacion({
            mensaje: "¿Deseas eliminar este proveedor permanentemente?",
            onConfirm: () => ejecutarEliminacion(id)
        });
    };

    const ejecutarEliminacion = async (id) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await cargarProveedores();
                setNotificacion({ mensaje: "Proveedor eliminado correctamente", tipo: 'success' });
            } else {
                setNotificacion({ mensaje: "No se pudo eliminar el proveedor", tipo: 'error' });
            }
        } catch (error) {
            setNotificacion({ mensaje: "Error de conexión", tipo: 'error' });
        } finally {
            setConfirmacion(null);
        }
    };

    const filtrados = proveedores.filter(p => (p.empresa || "").toLowerCase().includes(busqueda.toLowerCase()));

    return (
        <div className="proveedores-container">
            {notificacion && <Toast {...notificacion} onClose={() => setNotificacion(null)} />}
            {confirmacion && <ConfirmModal {...confirmacion} onCancel={() => setConfirmacion(null)} />}

            <div className="proveedores-header">
                <h1>DIRECTORIO DE PROVEEDORES</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Buscar empresa..." className="input-buscador" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                    <button className="btn-nuevo-proveedor" onClick={() => { setModoEdicion(false); setFormulario({empresa:'', nombreContacto:'', telefonoContacto:'', emailProveedor:'', categoria:'', tiempoEntrega:''}); setModalAbierto(true); }}>+ NUEVO PROVEEDOR</button>
                </div>
            </div>
            <div className="tabla-container">
                {cargando ? <p style={{textAlign:'center'}}>Cargando...</p> : (
                    <table className="tabla-proveedores">
                        <thead>
                            <tr><th>ID</th><th>Empresa</th><th>Contacto</th><th>Categoría</th><th>Teléfono / Email</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {filtrados.map(p => (
                                <tr key={p.idProveedor}>
                                    <td>{p.idProveedor}</td>
                                    <td><strong>{p.empresa}</strong></td>
                                    <td>{p.nombreContacto || 'N/A'}</td>
                                    <td><span className="categoria-pill">{p.categoria || 'Gral'}</span></td>
                                    <td>{p.telefonoContacto}<br/>{p.emailProveedor}</td>
                                    <td className="acciones-celda">
                                        <button className="btn-editar" onClick={() => { setModoEdicion(true); setIdEditando(p.idProveedor); setFormulario(p); setModalAbierto(true); }}>✏️</button>
                                        <button className="btn-eliminar" onClick={() => solicitarEliminar(p.idProveedor)}>🗑️</button>
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
                        <h2>{modoEdicion ? 'ACTUALIZAR' : 'NUEVO'} PROVEEDOR</h2>
                        <div className="form-grupo"><label>Empresa:</label><input type="text" name="empresa" value={formulario.empresa} onChange={manejarInput} /></div>
                        <div className="form-fila-doble">
                            <div className="form-grupo"><label>Contacto:</label><input type="text" name="nombreContacto" value={formulario.nombreContacto} onChange={manejarInput} /></div>
                            <div className="form-grupo"><label>Categoría:</label><input type="text" name="categoria" value={formulario.categoria} onChange={manejarInput} /></div>
                        </div>
                        <div className="form-fila-doble">
                            <div className="form-grupo"><label>Teléfono:</label><input type="text" name="telefonoContacto" value={formulario.telefonoContacto} onChange={manejarInput} /></div>
                            <div className="form-grupo"><label>Email:</label><input type="email" name="emailProveedor" value={formulario.emailProveedor} onChange={manejarInput} /></div>
                        </div>
                        <div className="modal-botones"><button className="btn-guardar" onClick={guardarProveedor}>Guardar</button><button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Proveedores;