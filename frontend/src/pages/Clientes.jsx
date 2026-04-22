import React, { useState, useEffect } from 'react';
import './Clientes.css';

function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");

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
            if (res.ok) { await cargarClientes(); setModalAbierto(false); }
        } catch (error) { console.error(error); }
    };

    const eliminarCliente = async (id) => {
        if (window.confirm("¿Eliminar cliente?")) {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            cargarClientes();
        }
    };

    const imprimirFicha = (id) => window.open(`http://localhost:8082/pdf/clientes/${id}`, '_blank');

    // BUSQUEDA MEJORADA (FOLIO Y NOMBRE)
    const filtrados = clientes.filter(c => {
        const query = busqueda.toLowerCase().trim();
        const id = String(c.id_cliente || c.ID_cliente || "").toLowerCase();
        const nombre = (c.nombreCli || "").toLowerCase();
        return nombre.includes(query) || id.includes(query);
    });

    return (
        <div className="clientes-container">
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
                            <tr><th>ID</th><th>Nombre</th><th>Contacto</th><th>Miembro desde</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {filtrados.map(c => (
                                <tr key={c.id_cliente || c.ID_cliente}>
                                    <td>{c.id_cliente || c.ID_cliente}</td>
                                    <td><strong>{c.nombreCli}</strong></td>
                                    <td>{c.telefono}<br/>{c.email}</td>
                                    <td>{c.fechaRegistro || 'Reciente'}</td>
                                    <td className="acciones-celda">
                                        <button className="btn-editar" onClick={() => imprimirFicha(c.id_cliente || c.ID_cliente)} title="Ficha">📑</button>
                                        <button className="btn-editar" onClick={() => { setModoEdicion(true); setIdEditando(c.id_cliente || c.ID_cliente); setFormulario(c); setModalAbierto(true); }} title="Editar">✏️</button>
                                        <button className="btn-eliminar" onClick={() => eliminarCliente(c.id_cliente || c.ID_cliente)}>🗑️</button>
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
                        <div className="modal-botones"><button className="btn-guardar" onClick={guardarCliente}>Guardar</button><button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Clientes;