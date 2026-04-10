import React, { useState } from 'react';
import './Inventario.css';

function Inventario() {
    // 1. ESTADO DE LA TABLA
    const [inventario, setInventario] = useState([
        { id: 4001, nombre: 'Pantalla iPhone 13', categoria: 'Pantallas', stockActual: 1, stockMinimo: 3, precio: 1500 },
        { id: 4002, nombre: 'Batería Samsung S21', categoria: 'Baterías', stockActual: 5, stockMinimo: 2, precio: 400 },
        { id: 4003, nombre: 'Pasta Térmica', categoria: 'Consumibles', stockActual: 0, stockMinimo: 5, precio: 150}
    ]);

    // 2. ESTADOS DEL MODAL
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [itemEditandoId, setItemEditandoId] = useState(null);

    //3. ESTADO DEL FORMULARIO
    const [formulario, setFormulario] = useState({
        nombre: '',
        categoria: '',
        stockActual: '',
        stockMinimo: '',
        precio: ''
    });

    const manejarInput = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    // 4. FUNCIONES PARA ABRIR EL MODAL
    const abrirModalCrear = () => {
        setModoEdicion(false);
        setItemEditandoId(null);
        setFormulario({ nombre: '', categoria: '', stockActual: '', stockMinimo: '', precio: '' });
        setModalAbierto(true);
    };

    const abrirModalEditar = (item) => {
        setModoEdicion(true);
        setItemEditandoId(item.id);
        setFormulario({
            nombre: item.nombre,
            categoria: item.categoria,
            stockActual: item.stockActual,
            stockMinimo: item.stockMinimo,
            precio: item.precio
        });
        setModalAbierto(true);
    };

    // 5. FUNCIÓN PARA ELIMINAR
    const eliminarItem = (id) => {
        const confirmar = window.confirm("¿Estás seguro de que deseas eliminar esta refacción del inventario?");
        if (confirmar) {
            const nuevoInventario = inventario.filter(item => item.id !== id);
            setInventario(nuevoInventario);
        }
    };

    // 6. FUNCIÓN PARA GUARDAR
    const guardarItem = () => {
        if (modoEdicion) {
            const inventarioActualizado = inventario.map(item => {
                if (item.id === itemEditandoId) {
                    return {
                        ...item,
                        nombre: formulario.nombre,
                        categoria: formulario.categoria,
                        stockActual: parseInt(formulario.stockActual) || 0,
                        stockMinimo: parseInt(formulario.stockMinimo) || 0,
                        precio: parseFloat(formulario.precio) || 0
                    };
                }
                return item;
            });
            setInventario(inventarioActualizado);
        } else {
            const nuevoItem = {
                id: Math.floor(Math.random() * 900) + 4000,
                nombre: formulario.nombre,
                categoria: formulario.categoria,
                stockActual: parseInt(formulario.stockActual) || 0,
                stockMinimo: parseInt(formulario.stockMinimo) || 0,
                precio: parseFloat(formulario.precio) || 0
            };
            setInventario([nuevoItem, ...inventario]);
        }

        setModalAbierto(false);
    };

    return (
        <div className="inventario-container">

            <div className="inventario-header">
                <h1>GESTIÓN DE INVENTARIO</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Buscar refacción..." className="input-buscador"/>
                    <button className="btn-nuevo-item" onClick={abrirModalCrear}>
                    + NUEVA REFACCIÓN
                    </button>
                </div>
            </div>

            <div className="tabla-container">
                <table className="tabla-inventario">
                    <thead>
                        <tr>
                            <th>ID (SKU)</th>
                            <th>Refacción / Insumo</th>
                            <th>Categoría</th>
                            <th>Stock Actual</th>
                            <th>Precio Unitario</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventario.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td><strong>{item.nombre}</strong></td>
                                <td><span className="categoria-pill">{item.categoria}</span></td>

                                {/* LOGICA DE ALERTA DE STOCK */}
                                <td>
                                    <span className={`stock-numero ${item.stockActual <= item.stockMinimo ? 'alerta-roja' : 'stock-sano'}`}>
                                        {item.stockActual} pzas.
                                    </span>
                                </td>

                                <td>${item.precio.toLocaleString('es-MX')} MXN</td>
                                <td className="acciones-celda">
                                    <button className="btn-editar" title="Editar" onClick={() => abrirModalEditar(item)}>✏️</button>
                                    <button className="btn-eliminar" title="Eliminar" onClick={() => eliminarItem(item.id)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- PANTALLA EMERGENTE (MODAL) --- */}
            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{modoEdicion ? 'ACTUALIZAR INVENTARIO' : 'NUEVA REFACCIÓN'}</h2>

                        <div className="form-grupo">
                            <label>Nombre de la pieza/insumo:</label>
                            <input type="text" name="nombre" value={formulario.nombre} onChange={manejarInput} />
                        </div>

                        <div className="form-grupo">
                            <label>Categoría:</label>
                            <select name="categoria" value={formulario.categoria} onChange={manejarInput} className="input-select">
                                <option value="">Selecciona una opción...</option>
                                <option value="Pantallas">Pantallas</option>
                                <option value="Baterías">Baterías</option>
                                <option value="Teclados">Teclados</option>
                                <option value="Consumibles">Consumibles (Pastas, alcohol, etc)</option>
                                <option value="Carcasas">Carcasas</option>
                                <option value="Otros">Otros</option>
                            </select>
                        </div>

                        {/* Agrupamos los dos stocks en una sola fila para que se vea profesional */}
                        <div className="form-fila-doble">
                            <div className="form-grupo">
                                <label>Stock Actual:</label>
                                <input type="number" name="stockActual" value={formulario.stockActual} onChange={manejarInput} />
                            </div>
                            <div className="form-grupo">
                                <label>Stock Mínimo (Alerta):</label>
                                <input type="number" name="stockMinimo" value={formulario.stockMinimo} onChange={manejarInput} />
                            </div>
                        </div>

                        <div className="form-grupo">
                            <label>Precio Unitario:</label>
                            <input type="number" name="precio" value={formulario.precio} onChange={manejarInput} />
                        </div>

                        <div className="modal-botones">
                            <button className="btn-guardar" onClick={guardarItem}>Guardar Refacción</button>
                            <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Inventario;