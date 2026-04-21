import React, { useState, useEffect } from 'react';
import './Inventario.css';

function Inventario() {
    const [productos, setProductos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    const API_URL = "http://localhost:8082/inventario";
    const API_PROV = "http://localhost:8082/proveedores";

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const [resProd, resProv] = await Promise.all([
                fetch(API_URL),
                fetch(API_PROV)
            ]);
            if (resProd.ok) setProductos(await resProd.json());
            if (resProv.ok) setProveedores(await resProv.json());
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
        nombreProducto: '',
        categoria: '',
        cantidad: '',
        costo: '',
        proveedorId: ''
    });

    const manejarInput = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormulario({ nombreProducto: '', categoria: '', cantidad: '', costo: '', proveedorId: '' });
        setModalAbierto(true);
    };

    const abrirModalEditar = (item) => {
        setModoEdicion(true);
        setIdEditando(item.idProducto);
        setFormulario({
            nombreProducto: item.nombrePieza,
            categoria: item.categoria || '',
            cantidad: item.stockActual,
            costo: item.precioUnitario,
            proveedorId: item.proveedor?.idProveedor || ''
        });
        setModalAbierto(true);
    };

    const guardarItem = async () => {
        const payload = {
            nombreProducto: formulario.nombreProducto,
            cantidad: parseInt(formulario.cantidad),
            costo: parseFloat(formulario.costo),
            categoria: formulario.categoria,
            proveedorId: formulario.proveedorId ? parseInt(formulario.proveedorId) : null
        };
        try {
            const metodo = modoEdicion ? 'PUT' : 'POST';
            const url = modoEdicion ? `${API_URL}/${idEditando}` : API_URL;
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                await cargarDatos();
                setModalAbierto(false);
            }
        } catch (error) { console.error(error); }
    };

    const eliminarItem = async (id) => {
        if (window.confirm("¿Eliminar producto?")) {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            cargarDatos();
        }
    };

    const filtrados = productos.filter(p => 
        (p.nombrePieza || "").toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="inventario-container">
            <div className="inventario-header">
                <h1>GESTIÓN DE INVENTARIO</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Buscar pieza..." className="input-buscador" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                    <button className="btn-nuevo-item" onClick={abrirModalCrear}>+ NUEVA PIEZA</button>
                </div>
            </div>

            <div className="tabla-container">
                {cargando ? <p style={{textAlign:'center'}}>Cargando...</p> : (
                    <table className="tabla-inventario">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Refacción</th>
                                <th>Categoría</th>
                                <th>Proveedor</th>
                                <th>Stock</th>
                                <th>Precio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map(item => (
                                <tr key={item.idProducto}>
                                    <td>{item.idProducto}</td>
                                    <td><strong>{item.nombrePieza}</strong></td>
                                    <td>{item.categoria}</td>
                                    <td>{item.proveedor?.empresa || 'N/A'}</td>
                                    <td><span className="stock-numero">{item.stockActual}</span></td>
                                    <td>${parseFloat(item.precioUnitario || 0).toFixed(2)}</td>
                                    <td className="acciones-celda">
                                        <button className="btn-editar" onClick={() => abrirModalEditar(item)}>✏️</button>
                                        <button className="btn-eliminar" onClick={() => eliminarItem(item.idProducto)}>🗑️</button>
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
                        <h2>{modoEdicion ? 'ACTUALIZAR PIEZA' : 'NUEVA PIEZA'}</h2>
                        <div className="form-grupo">
                            <label>Nombre:</label>
                            <input type="text" name="nombreProducto" value={formulario.nombreProducto} onChange={manejarInput} />
                        </div>
                        <div className="form-grupo">
                            <label>Categoría:</label>
                            <input type="text" name="categoria" value={formulario.categoria} onChange={manejarInput} />
                        </div>
                        <div className="form-fila-doble">
                            <div className="form-grupo">
                                <label>Stock:</label>
                                <input type="number" name="cantidad" value={formulario.cantidad} onChange={manejarInput} />
                            </div>
                            <div className="form-grupo">
                                <label>Precio:</label>
                                <input type="number" name="costo" value={formulario.costo} onChange={manejarInput} />
                            </div>
                        </div>
                        <div className="form-grupo">
                            <label>Proveedor:</label>
                            <select name="proveedorId" value={formulario.proveedorId} onChange={manejarInput} className="input-select">
                                <option value="">Seleccionar proveedor...</option>
                                {proveedores.map(p => <option key={p.idProveedor} value={p.idProveedor}>{p.empresa}</option>)}
                            </select>
                        </div>
                        <div className="modal-botones">
                            <button className="btn-guardar" onClick={guardarItem}>Guardar</button>
                            <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Inventario;