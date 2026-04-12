import React, { useState } from 'react';
import './Proveedores.css';

function Proveedores() {
    // 1. ESTADO DE LA TABLA
    const [proveedores, setProveedores] = useState([
        { id: 6001, empresa: 'TechParts Mx', telefono: '555-123-4567', correo: 'ventas@techparts.mx', categoria: 'General', tiempoEntrega: '2 a 3 días' },
        { id: 6002, empresa: 'Pantallas OEM Original', telefono: '555-987-6543', correo: 'contacto@oempantallas.com', categoria: 'Pantallas', tiempoEntrega: '5 a 7 días' },
        { id: 6003, empresa: 'Pilas y Baterías Cert', telefono: '555-456-7890', correo: 'info@baterias.com', categoria: 'Baterías', tiempoEntrega: '1 a 2 días' }
    ]);

    // 2. ESTADO DEL MODAL
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [proveedorEditandoId, setProveedorEditandoId] = useState(null);

    // 3. ESTADO DEL FORMULARIO
    const [formulario, setFormulario] = useState({
        empresa: '',
        telefono: '',
        correo: '',
        categoria: '',
        tiempoEntrega: ''
    });

    const manejarInput = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    // 4. FUNCIONES PARA ABRIR EL MODAL
    const abrirModalCrear = () => {
        setModoEdicion(false);
        setProveedorEditandoId(null);
        setFormulario({ empresa: '', telefono: '', correo: '', categoria: '', tiempoEntrega: '' });
        setModalAbierto(true);
    };

    const abrirModalEditar = (proveedor) => {
        setModoEdicion(true);
        setProveedorEditandoId(proveedor.id);
        setFormulario({
            empresa: proveedor.empresa,
            telefono: proveedor.telefono,
            correo: proveedor.correo,
            categoria: proveedor.categoria,
            tiempoEntrega: proveedor.tiempoEntrega
        });
        setModalAbierto(true);
    };

    // 5. FUNCIÓN PARA ELIMINAR
    const eliminarProveedor = (id) => {
        const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este proveedor?");
        if (confirmar) {
            const nuevosProveedores = proveedores.filter(p => p.id !== id);
            setProveedores(nuevosProveedores);
        }
    };

    // 6. FUNCIÓN PARA GUARDAR
    const guardarProveedor = () => {
        if (modoEdicion) {
            const proveedoresActualizados = proveedores.map(p => {
                if (p.id === proveedorEditandoId) {
                    return {
                        ...p,
                        empresa: formulario.empresa,
                        telefono: formulario.telefono,
                        correo: formulario.correo,
                        categoria: formulario.categoria,
                        tiempoEntrega: formulario.tiempoEntrega
                    };
                }
                return p;
            });
            setProveedores(proveedoresActualizados);
        } else {
            const nuevoProveedor = {
                id: Math.floor(Math.random() * 900) + 6000,
                empresa: formulario.empresa,
                telefono: formulario.telefono,
                correo: formulario.correo,
                categoria: formulario.categoria,
                tiempoEntrega: formulario.tiempoEntrega
            };
            setProveedores([nuevoProveedor, ...proveedores]);
        }
        setModalAbierto(false);
    };

    return (
        <div className="proveedores-container">
            <div className="proveedores-header">
                <h1>DIRECTORIO DE PROVEEDORES</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Buscar empresa..." className="input-buscador" />
                    <button className="btn-nuevo-proveedor" onClick={abrirModalCrear}>
                        + NUEVO PROVEEDOR
                    </button>
                </div>
            </div>

            <div className="tabla-container">
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
                        {proveedores.map((proveedor) => (
                            <tr key={proveedor.id}>
                                <td>{proveedor.id}</td>
                                <td><strong>{proveedor.empresa}</strong></td>
                                <td>
                                    <div className="info-contacto">
                                        <span>📞 {proveedor.telefono}</span>
                                        <span>✉️ {proveedor.correo}</span>
                                    </div>
                                </td>
                                <td><span className="categoria-pill">{proveedor.categoria}</span></td>
                                <td>⏱️ {proveedor.tiempoEntrega}</td>
                                <td className="acciones-celda">
                                    <button className="btn-editar" title="Editar" onClick={() => abrirModalEditar(proveedor)}>✏️</button>
                                    <button className="btn-eliminar" title="Eliminar" onClick={() => eliminarProveedor(proveedor.id)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- PANTALLA EMERGENTE --- */}
            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{modoEdicion ? 'ACTUALIZAR PROVEEDOR' : 'NUEVO PROVEEDOR'}</h2>

                        <div className="form-grupo">
                            <label>Empresa o Razón Social:</label>
                            <input type="text" name="empresa" value={formulario.empresa} onChange={manejarInput} />
                        </div>

                        <div className="form-fila-doble">
                            <div className="form-grupo">
                                <label>Teléfono:</label>
                                <input type="text" name="telefono" value={formulario.telefono} onChange={manejarInput} />
                            </div>
                            <div className="form-grupo">
                                <label>Correo Electrónico:</label>
                                <input type="email" name="correo" value={formulario.correo} onChange={manejarInput} />
                            </div>
                        </div>

                        <div className="form-grupo">
                            <label>Categoría principal que surten:</label>
                            <select name="categoria" value={formulario.categoria} onChange={manejarInput} className="input-select">
                                <option value="">Selecciona una categoría...</option>
                                <option value="General">General (Múltiples refacciones)</option>
                                <option value="Pantallas">Pantallas y Displays</option>
                                <option value="Baterías">Baterías</option>
                                <option value="Consumibles">Consumibles y Herramientas</option>
                            </select>
                        </div>

                        <div className="form-grupo">
                            <label>Tiempo estimado de entrega:</label>
                            <input type="text" name="tiempoEntrega" value={formulario.tiempoEntrega} onChange={manejarInput} placeholder="Ej. 2 a 3 días hábiles" />
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