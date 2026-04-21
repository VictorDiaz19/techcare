import React, { useState, useEffect } from 'react';
import './Inventario.css';

function Inventario() {
    const [inventario, setInventario] = useState([]);
    const [cargando, setCargando] = useState(true);
    const API_URL = "http://localhost:8082/inventario";

    useEffect(() => {
        cargarInventario();
    }, []);

    const cargarInventario = async () => {
        try {
            const respuesta = await fetch(API_URL);
            if (respuesta.ok) {
                const datos = await respuesta.json();
                // MAPEO DEFENSIVO
                const formateados = Array.isArray(datos) ? datos.map(item => ({
                    idReal: item.idProducto || item.ID_producto || item.id_producto,
                    nombreReal: item.nombrePieza || item.NombrePieza || item.nombre_pieza,
                    categoriaReal: item.categoria || item.Categoria || 'Otros',
                    stockActualReal: item.stockActual || item.StockActual || 0,
                    stockMinimoReal: item.stockMinimo || item.StockMinimo || 2,
                    precioReal: parseFloat(item.precioUnitario || item.PrecioUnitario || 0)
                })) : [];
                setInventario(formateados);
            }
        } catch (error) {
            console.error("Error al cargar inventario:", error);
        } finally {
            setCargando(false);
        }
    };

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [itemEditandoId, setItemEditandoId] = useState(null);

    const [formulario, setFormulario] = useState({
        nombreProducto: '',
        categoria: '',
        cantidad: '',
        costo: ''
    });

    const manejarInput = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormulario({ nombreProducto: '', categoria: '', cantidad: '', costo: '' });
        setModalAbierto(true);
    };

    const abrirModalEditar = (item) => {
        setModoEdicion(true);
        setItemEditandoId(item.idReal);
        setFormulario({
            nombreProducto: item.nombreReal,
            categoria: item.categoriaReal,
            cantidad: item.stockActualReal,
            costo: item.precioReal
        });
        setModalAbierto(true);
    };

    const eliminarItem = async (id) => {
        if (window.confirm("¿Eliminar este producto?")) {
            try {
                const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (res.ok) cargarInventario();
            } catch (error) { console.error(error); }
        }
    };

    const guardarItem = async () => {
        try {
            const metodo = modoEdicion ? 'PUT' : 'POST';
            const url = modoEdicion ? `${API_URL}/${itemEditandoId}` : API_URL;
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formulario)
            });
            if (res.ok) {
                cargarInventario();
                setModalAbierto(false);
            }
        } catch (error) { console.error(error); }
    };

    return (
        <div className="inventario-container">
            <div className="inventario-header">
                <h1>GESTIÓN DE INVENTARIO</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Buscar refacción..." className="input-buscador"/>
                    <button className="btn-nuevo-item" onClick={abrirModalCrear}>+ NUEVA REFACCIÓN</button>
                </div>
            </div>

            <div className="tabla-container">
                {cargando ? <p style={{textAlign:'center'}}>Conectando...</p> : (
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
                            {inventario.length > 0 ? inventario.map((item) => (
                                <tr key={item.idReal}>
                                    <td>{item.idReal}</td>
                                    <td><strong>{item.nombreReal}</strong></td>
                                    <td><span className="categoria-pill">{item.categoriaReal}</span></td>
                                    <td>
                                        <span className={`stock-numero ${item.stockActualReal <= item.stockMinimoReal ? 'alerta-roja' : 'stock-sano'}`}>
                                            {item.stockActualReal} pzas.
                                        </span>
                                    </td>
                                    <td>${item.precioReal.toLocaleString('es-MX')} MXN</td>
                                    <td className="acciones-celda">
                                        <button className="btn-editar" onClick={() => abrirModalEditar(item)}>✏️</button>
                                        <button className="btn-eliminar" onClick={() => eliminarItem(item.idReal)}>🗑️</button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="6" style={{textAlign:'center'}}>No hay productos registrados.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>

            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{modoEdicion ? 'ACTUALIZAR INVENTARIO' : 'NUEVA REFACCIÓN'}</h2>
                        <div className="form-grupo">
                            <label>Nombre de la pieza:</label>
                            <input type="text" name="nombreProducto" value={formulario.nombreProducto} onChange={manejarInput} />
                        </div>
                        <div className="form-grupo">
                            <label>Categoría:</label>
                            <select name="categoria" value={formulario.categoria} onChange={manejarInput} className="input-select">
                                <option value="">Seleccione...</option>
                                <option value="Pantallas">Pantallas</option>
                                <option value="Baterías">Baterías</option>
                                <option value="Consumibles">Consumibles</option>
                            </select>
                        </div>
                        <div className="form-fila-doble">
                            <div className="form-grupo">
                                <label>Stock Actual:</label>
                                <input type="number" name="cantidad" value={formulario.cantidad} onChange={manejarInput} />
                            </div>
                            <div className="form-grupo">
                                <label>Precio Unitario:</label>
                                <input type="number" name="costo" value={formulario.costo} onChange={manejarInput} />
                            </div>
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