import React, { useState, useEffect } from 'react';
import './Proveedores.css';

function Proveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [cargando, setCargando] = useState(true);
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
            console.error("Error al cargar proveedores:", error);
        } finally {
            setCargando(false);
        }
    };

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [proveedorEditandoId, setProveedorEditandoId] = useState(null);

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
        setProveedorEditandoId(p.idProveedor);
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

    const eliminarProveedor = async (id) => {
        if (window.confirm("¿Eliminar este proveedor?")) {
            try {
                const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (res.ok) cargarProveedores();
            } catch (error) { console.error(error); }
        }
    };

    const guardarProveedor = async () => {
        try {
            const metodo = modoEdicion ? 'PUT' : 'POST';
            const url = modoEdicion ? `${API_URL}/${proveedorEditandoId}` : API_URL;
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formulario)
            });
            if (res.ok) {
                cargarProveedores();
                setModalAbierto(false);
            }
        } catch (error) { console.error(error); }
    };

    return (
        <div className="proveedores-container">
            <div className="proveedores-header">
                <h1>DIRECTORIO DE PROVEEDORES</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Buscar empresa..." className="input-buscador" />
                    <button className="btn-nuevo-proveedor" onClick={abrirModalCrear}>+ NUEVO PROVEEDOR</button>
                </div>
            </div>

            <div className="tabla-container">
                {cargando ? <p style={{textAlign:'center'}}>Cargando proveedores...</p> : (
                    <table className="tabla-proveedores">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Empresa / Razón Social</th>
                                <th>Contacto</th>
                                <th>Tipo de Insumos</th>
                                <th>Tiempo de Entrega</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proveedores.length > 0 ? proveedores.map((p) => (
                                <tr key={p.idProveedor}>
                                    <td>{p.idProveedor}</td>
                                    <td><strong>{p.empresa}</strong></td>
                                    <td>
                                        <div className="info-contacto">
                                            <span>📞 {p.telefonoContacto}</span>
                                            <span>✉️ {p.emailProveedor}</span>
                                        </div>
                                    </td>
                                    <td><span className="categoria-pill">{p.categoria}</span></td>
                                    <td>⏱️ {p.tiempoEntrega}</td>
                                    <td className="acciones-celda">
                                        <button className="btn-editar" onClick={() => abrirModalEditar(p)}>✏️</button>
                                        <button className="btn-eliminar" onClick={() => eliminarProveedor(p.idProveedor)}>🗑️</button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="6" style={{textAlign:'center'}}>No hay proveedores registrados.</td></tr>}
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
                                <label>Teléfono:</label>
                                <input type="text" name="telefonoContacto" value={formulario.telefonoContacto} onChange={manejarInput} />
                            </div>
                            <div className="form-grupo">
                                <label>Email:</label>
                                <input type="email" name="emailProveedor" value={formulario.emailProveedor} onChange={manejarInput} />
                            </div>
                        </div>
                        <div className="form-grupo">
                            <label>Categoría:</label>
                            <select name="categoria" value={formulario.categoria} onChange={manejarInput} className="input-select">
                                <option value="">Seleccione...</option>
                                <option value="General">General</option>
                                <option value="Pantallas">Pantallas</option>
                                <option value="Baterías">Baterías</option>
                                <option value="Consumibles">Consumibles</option>
                            </select>
                        </div>
                        <div className="form-grupo">
                            <label>Tiempo Entrega:</label>
                            <input type="text" name="tiempoEntrega" value={formulario.tiempoEntrega} onChange={manejarInput} />
                        </div>
                        <div className="modal-botones">
                            <button className="btn-guardar" onClick={guardarProveedor}>Guardar Proveedor</button>
                            <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Proveedores;