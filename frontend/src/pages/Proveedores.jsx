import React, { useState, useEffect } from 'react';
import './Proveedores.css';

function Proveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");

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
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setCargando(false);
        }
    };

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);

    const [formulario, setFormulario] = useState({
        empresa: '',
        nombreContacto: '',
        telefonoContacto: '',
        emailProveedor: '',
        categoria: '',
        tiempoEntrega: ''
    });

    const manejarInput = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormulario({ empresa: '', nombreContacto: '', telefonoContacto: '', emailProveedor: '', categoria: '', tiempoEntrega: '' });
        setModalAbierto(true);
    };

    const abrirModalEditar = (p) => {
        setModoEdicion(true);
        setIdEditando(p.idProveedor);
        setFormulario({
            empresa: p.empresa,
            nombreContacto: p.nombreContacto || '',
            telefonoContacto: p.telefonoContacto || '',
            emailProveedor: p.emailProveedor || '',
            categoria: p.categoria || '',
            tiempoEntrega: p.tiempoEntrega || ''
        });
        setModalAbierto(true);
    };

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
            }
        } catch (error) { console.error(error); }
    };

    const eliminarProveedor = async (id) => {
        if (window.confirm("¿Eliminar?")) {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            cargarProveedores();
        }
    };

    const filtrados = proveedores.filter(p => 
        (p.empresa || "").toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="proveedores-container">
            <div className="proveedores-header">
                <h1>DIRECTORIO DE PROVEEDORES</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Buscar empresa..." className="input-buscador" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                    <button className="btn-nuevo-proveedor" onClick={abrirModalCrear}>+ NUEVO PROVEEDOR</button>
                </div>
            </div>

            <div className="tabla-container">
                {cargando ? <p style={{textAlign:'center'}}>Cargando...</p> : (
                    <table className="tabla-proveedores">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Empresa</th>
                                <th>Persona de Contacto</th>
                                <th>Categoría</th>
                                <th>Teléfono / Email</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map(p => (
                                <tr key={p.idProveedor}>
                                    <td>{p.idProveedor}</td>
                                    <td><strong>{p.empresa}</strong></td>
                                    <td>{p.nombreContacto || 'N/A'}</td>
                                    <td><span className="categoria-pill">{p.categoria || 'Gral'}</span></td>
                                    <td>
                                        <div style={{fontSize: '0.85em'}}>
                                            📞 {p.telefonoContacto}<br/>
                                            ✉️ {p.emailProveedor}
                                        </div>
                                    </td>
                                    <td className="acciones-celda">
                                        <button className="btn-editar" onClick={() => abrirModalEditar(p)}>✏️</button>
                                        <button className="btn-eliminar" onClick={() => eliminarProveedor(p.idProveedor)}>🗑️</button>
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
                        <h2>{modoEdicion ? 'ACTUALIZAR PROVEEDOR' : 'NUEVO PROVEEDOR'}</h2>
                        <div className="form-grupo">
                            <label>Empresa:</label>
                            <input type="text" name="empresa" value={formulario.empresa} onChange={manejarInput} />
                        </div>
                        <div className="form-fila-doble">
                            <div className="form-grupo">
                                <label>Persona de Contacto:</label>
                                <input type="text" name="nombreContacto" value={formulario.nombreContacto} onChange={manejarInput} />
                            </div>
                            <div className="form-grupo">
                                <label>Categoría:</label>
                                <input type="text" name="categoria" value={formulario.categoria} onChange={manejarInput} />
                            </div>
                        </div>
                        <div className="form-fila-doble">
                            <div className="form-grupo">
                                <label>Teléfono:</label>
                                <input type="text" name="telefonoContacto" value={formulario.telefonoContacto} onChange={manejarInput} />
                            </div>
                            <div className="form-grupo">
                                <label>Email:</label>
                                <input type="email" name="emailProveedor" value={formulario.emailProveedor} onChange={manejarInput} />
                            </div>
                        </div>
                        <div className="modal-botones">
                            <button className="btn-guardar" onClick={guardarProveedor}>Guardar</button>
                            <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Proveedores;