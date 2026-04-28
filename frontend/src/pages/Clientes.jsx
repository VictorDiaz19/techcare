import React, { useState, useEffect } from 'react';
import './Clientes.css';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [notificacion, setNotificacion] = useState(null);
    const [confirmacion, setConfirmacion] = useState(null);

    const API_URL = "http://localhost:8082/clientes";

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        try {
            const respuesta = await fetch(API_URL);
            if (respuesta.ok) {
                const datos = await respuesta.json();
                setClientes(Array.isArray(datos) ? datos : []);
            }
        } catch (error) { console.error(error); } finally { setCargando(false); }
    };

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);

    const [formulario, setFormulario] = useState({ nombreCli: '', telefono: '', email: '', direccion: '' });

    const manejarInput = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

    const guardarCliente = async () => {
        try {
            const metodo = modoEdicion ? 'PUT' : 'POST';
            const url = modoEdicion ? `${API_URL}/${idEditando}` : API_URL;
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formulario)
            });
            if (res.ok) { 
                await cargarClientes(); 
                setModalAbierto(false); 
                setNotificacion({ mensaje: `Cliente ${modoEdicion ? 'actualizado' : 'registrado'} con éxito`, tipo: 'success' });
            } else {
                setNotificacion({ mensaje: "Error al guardar cliente", tipo: 'error' });
            }
        } catch (error) { 
            setNotificacion({ mensaje: "Error de conexión", tipo: 'error' });
        }
    };

    const solicitarEliminar = (id) => {
        setConfirmacion({
            mensaje: "¿Estás seguro de que deseas eliminar este cliente? Se borrarán sus datos permanentemente.",
            onConfirm: () => ejecutarEliminacion(id)
        });
    };

    const ejecutarEliminacion = async (id) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await cargarClientes();
                setNotificacion({ mensaje: "Cliente eliminado correctamente", tipo: 'success' });
            } else {
                setNotificacion({ mensaje: "No se pudo eliminar al cliente", tipo: 'error' });
            }
        } catch (error) {
            setNotificacion({ mensaje: "Error de conexión", tipo: 'error' });
        } finally {
            setConfirmacion(null);
        }
    };

    const imprimirFicha = (id) => window.open(`http://localhost:8082/pdf/clientes/${id}`, '_blank');

    const filtrados = clientes.filter(c => 
        (c.nombreCli || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        String(c.id_cliente || c.ID_cliente || "").includes(busqueda)
    );

    return (
        <div className="clientes-container">
            {notificacion && <Toast {...notificacion} onClose={() => setNotificacion(null)} />}
            {confirmacion && <ConfirmModal {...confirmacion} onCancel={() => setConfirmacion(null)} />}

            <div className="clientes-header">
                <h1>DIRECTORIO DE CLIENTES</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Buscar por nombre o ID..." className="input-buscador" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                    <button className="btn-nuevo-cliente" onClick={() => { setModoEdicion(false); setFormulario({nombreCli:'', telefono:'', email:'', direccion:''}); setModalAbierto(true); }}>+ NUEVO CLIENTE</button>
                </div>
            </div>

            <div className="tabla-container">
                {cargando ? <p style={{textAlign:'center'}}>Cargando...</p> : (
                    <table className="tabla-clientes">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Contacto</th>
                                <th>Dirección</th>
                                <th>Miembro desde</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map(c => (
                                <tr key={c.id_cliente || c.ID_cliente}>
                                    <td>{c.id_cliente || c.ID_cliente}</td>
                                    <td><strong>{c.nombreCli}</strong></td>
                                    <td>{c.telefono}<br/>{c.email}</td>
                                    <td>{c.direccion || 'Sin dirección'}</td>
                                    <td>{c.fechaRegistro || 'Reciente'}</td>
                                    <td className="acciones-celda">
                                        <button className="btn-editar" onClick={() => imprimirFicha(c.id_cliente || c.ID_cliente)} title="Ficha">📑</button>
                                        <button className="btn-editar" onClick={() => { setModoEdicion(true); setIdEditando(c.id_cliente || c.ID_cliente); setFormulario(c); setModalAbierto(true); }} title="Editar">✏️</button>
                                        <button className="btn-eliminar" onClick={() => solicitarEliminar(c.id_cliente || c.ID_cliente)}>🗑️</button>
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
                        <h2>{modoEdicion ? 'EDITAR' : 'NUEVO'} CLIENTE</h2>
                        <div className="form-grupo"><label>Nombre:</label><input type="text" name="nombreCli" value={formulario.nombreCli} onChange={manejarInput} /></div>
                        <div className="form-fila-doble">
                            <div className="form-grupo"><label>Teléfono:</label><input type="text" name="telefono" value={formulario.telefono} onChange={manejarInput} /></div>
                            <div className="form-grupo"><label>Email:</label><input type="email" name="email" value={formulario.email} onChange={manejarInput} /></div>
                        </div>
                        <div className="form-grupo"><label>Dirección:</label><input type="text" name="direccion" value={formulario.direccion} onChange={manejarInput} /></div>
                        <div className="modal-botones"><button className="btn-guardar" onClick={guardarCliente}>Guardar</button><button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Clientes;