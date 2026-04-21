import React, { useState, useEffect } from 'react';
import './Cotizaciones.css';

function Cotizaciones() {
    // 1. ESTADO DE LA TABLA PRINCIPAL
    const [cotizaciones, setCotizaciones] = useState([]);

    // DATOS DINÁMICOS DESDE EL BACKEND
    const [listaClientes, setListaClientes] = useState([]);
    const [clientesData, setClientesData] = useState([]); 
    const [listaItems, setListaItems] = useState([]);

    const API_BASE = "http://localhost:8082";

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            // Cargar Cotizaciones
            const resCot = await fetch(`${API_BASE}/cotizaciones`);
            if (resCot.ok && resCot.status !== 204) {
                const dataCot = await resCot.json();
                // Jackson suele devolver ID_cotizacion como id_cotizacion o idcotizacion. 
                // Mapeamos defensivamente.
                const formateadas = Array.isArray(dataCot) ? dataCot.map(c => ({
                    id: c.id_cotizacion || c.ID_cotizacion || c.idCotizacion,
                    fecha: c.fecha || c.Fecha, 
                    cliente: c.cliente ? (c.cliente.nombreCli || c.cliente.nombre_cli) : 'Desconocido',
                    descripcion: c.descripcion || c.equipoCotiz || 'Sin descripción',
                    total: parseFloat(c.total || c.Total) || 0,
                    estado: c.estadoCotiz || c.EstadoCotiz || 'Pendiente'
                })) : [];
                setCotizaciones(formateadas);
            }

            // Cargar Clientes para el combo box
            const resCli = await fetch(`${API_BASE}/clientes`);
            if (resCli.ok && resCli.status !== 204) {
                const dataCli = await resCli.json();
                setClientesData(dataCli);
                setListaClientes(dataCli.map(c => c.nombreCli || c.nombre_cli));
            }

            // Cargar Servicios e Inventario
            const [resSer, resInv] = await Promise.all([
                fetch(`${API_BASE}/servicios/listar`),
                fetch(`${API_BASE}/inventario`)
            ]);

            let itemsCombinados = [];
            if (resSer.ok && resSer.status !== 204) {
                const servicios = await resSer.json();
                itemsCombinados = [...itemsCombinados, ...servicios.map(s => ({
                    tipo: 'Servicio', nombre: s.nombreServicio, precio: parseFloat(s.precioBase)
                }))];
            }
            if (resInv.ok && resInv.status !== 204) {
                const inventario = await resInv.json();
                itemsCombinados = [...itemsCombinados, ...inventario.map(i => ({
                    tipo: 'Refacción', nombre: i.nombrePieza, precio: parseFloat(i.precioUnitario)
                }))];
            }
            setListaItems(itemsCombinados);

        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    };


    // 2. ESTADOS DEL MODAL
    const [modalAbierto, setModalAbierto] = useState(false);

    // 3. ESTADOS DEL FORMULARIO
    const [formulario, setFormulario] = useState({ cliente: '', descripcion: '', descuento: 0, impuesto: 16 });
    const [partidas, setPartidas] = useState([]); 

    // 4. ESTADO PARA LA NUEVA FILA
    const [itemSeleccionado, setItemSeleccionado] = useState('');
    const [cantidadInput, setCantidadInput] = useState(1);

    // --- FUNCIONES MATEMÁTICAS ---
    const calcularSubtotal = () => partidas.reduce((suma, item) => suma + item.total, 0);
    const calcularDescuento = () => calcularSubtotal() * (formulario.descuento / 100);
    const calcularImpuesto = () => (calcularSubtotal() - calcularDescuento()) * (formulario.impuesto / 100);
    const calcularTotalFinal = () => calcularSubtotal() - calcularDescuento() + calcularImpuesto();

    // --- FUNCIONES DE INTERACCIÓN ---
    const manejarInputFormulario = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    const manejarSeleccionItem = (e) => {
        setItemSeleccionado(e.target.value);
    }

    const agregarPartida = () => {
        if (!itemSeleccionado) return alert("Selecciona un concepto primero.");
        const infoItem = listaItems.find(i => i.nombre === itemSeleccionado);
        if(!infoItem) return;
        const precioU = infoItem.precio;
        const totalFila = precioU * cantidadInput;
        const nuevaFila = {
            concepto: infoItem.nombre,
            tipo: infoItem.tipo,
            cantidad: cantidadInput,
            precioUnitario: precioU,
            total: totalFila
        };
        setPartidas([...partidas, nuevaFila]);
        setItemSeleccionado('');
        setCantidadInput(1);
    };

    const eliminarPartida = (index) => {
        const nuevasPartidas = partidas.filter((_, i) => i !== index);
        setPartidas(nuevasPartidas);
    };

    const guardarCotizacion = async () => {
        if(partidas.length === 0) return alert("Agrega al menos una partida a la cotización.");
        if(!formulario.cliente) return alert("Selecciona un cliente.");

        const clienteSeleccionado = clientesData.find(c => (c.nombreCli || c.nombre_cli) === formulario.cliente);
        
        const payload = {
            fecha: new Date().toISOString().split('T')[0], 
            equipoCotiz: formulario.descripcion,
            estadoCotiz: 'Pendiente',
            total: calcularTotalFinal(),
            descripcion: formulario.descripcion,
            cliente: clienteSeleccionado ? { id_cliente: clienteSeleccionado.id_cliente || clienteSeleccionado.ID_cliente } : null
        };

        try {
            const res = await fetch(`${API_BASE}/cotizaciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                await cargarDatos();
                setModalAbierto(false);
            } else {
                alert("Error al guardar la cotización");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const abrirModalNuevo = () => {
        setFormulario({ cliente: '', descripcion: '', descuento: 0, impuesto: 16 });
        setPartidas([]);
        setModalAbierto(true);
    };

    return (
        <div className="cotizaciones-container">
            <div className="cotizaciones-header">
                <h1>GESTOR DE COTIZACIONES</h1>
                <button className="btn-nueva-coti" onClick={abrirModalNuevo}>+ NUEVA COTIZACION</button>
            </div>

            <div className="tabla-container">
                <table className="tabla-cotizaciones">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Descripcion</th>
                            <th>Estado</th>
                            <th>Total Gral.</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cotizaciones.length > 0 ? cotizaciones.map((coti) => (
                            <tr key={coti.id}>
                                <td>{coti.id}</td>
                                <td>{coti.fecha}</td>
                                <td><strong>{coti.cliente}</strong></td>
                                <td>{coti.descripcion}</td>
                                <td><span className="estado-coti">{coti.estado}</span></td>
                                <td><strong>${coti.total.toLocaleString('es-MX', {minimumFractionDigits: 2})}</strong></td>
                                <td className="acciones-celda">
                                    <button className="btn-ver-detalles" title="Ver / Imprimir">🖨️</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="7" style={{textAlign:'center'}}>No hay cotizaciones registradas.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal-content modal-coti">
                        <h2>DISEÑADOR DE COTIZACIÓN</h2>
                        <div className="form-fila-doble">
                            <div className="form-grupo">
                                <label>Cliente:</label>
                                <select name="cliente" value={formulario.cliente} onChange={manejarInputFormulario} className="input-select">
                                    <option value="">Seleccione...</option>
                                    {listaClientes.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="form-grupo">
                                <label>Nombre de la cotización:</label>
                                <input type="text" name="descripcion" value={formulario.descripcion} onChange={manejarInputFormulario} placeholder="Ej. Reparación PC Gamer" />
                            </div>
                        </div>
                        <hr className="separador"/>
                        <div className="caja-agregar-partida">
                            <div className="form-grupo w-50">
                                <label>Servicio / Refacción:</label>
                                <select value={itemSeleccionado} onChange={manejarSeleccionItem} className="input-select">
                                    <option value="">Buscar concepto...</option>
                                    {listaItems.map(item => (
                                        <option key={item.nombre} value={item.nombre}>[{item.tipo}] {item.nombre} - ${item.precio}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-grupo w-20">
                                <label>Cantidad:</label>
                                <input type="number" min="1" value={cantidadInput} onChange={(e) => setCantidadInput(e.target.value)} />
                            </div>
                            <div className="form-grupo w-boton">
                                <label>&nbsp;</label>
                                <button className="btn-agregar-fila" onClick={agregarPartida}>+ Añadir</button>
                            </div>
                        </div>
                        <div className="tabla-partidas-contenedor">
                            <table className="tabla-partidas">
                                <thead>
                                    <tr>
                                        <th>Concepto</th>
                                        <th>Cant.</th>
                                        <th>P. Unitario</th>
                                        <th>Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {partidas.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.concepto}</td>
                                            <td>{item.cantidad}</td>
                                            <td>${item.precioUnitario.toFixed(2)}</td>
                                            <td>${item.total.toFixed(2)}</td>
                                            <td><button className="btn-eliminar-fila" onClick={() => eliminarPartida(index)}>❌</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="totales-contenedor">
                            <div className="controles-globales">
                                <div className="form-grupo">
                                    <label>Descuento (%):</label>
                                    <input type="number" name="descuento" value={formulario.descuento} onChange={manejarInputFormulario} min="0" max="100"/>
                                </div>
                                <div className="form-grupo">
                                    <label>Impuesto (%):</label>
                                    <input type="number" name="impuesto" value={formulario.impuesto} onChange={manejarInputFormulario} min="0" max="100"/>
                                </div>
                            </div>
                            <div className="resumen-matematico">
                                <p>Subtotal: <span>${calcularSubtotal().toFixed(2)}</span></p>
                                <p>Descuento: <span className="rojo">-${calcularDescuento().toFixed(2)}</span></p>
                                <p>Impuesto (IVA): <span>+${calcularImpuesto().toFixed(2)}</span></p>
                                <h3>Total Neto: <span>${calcularTotalFinal().toFixed(2)}</span></h3>
                            </div>
                        </div>
                        <div className="modal-botones">
                            <button className="btn-guardar" onClick={guardarCotizacion}>Guardar Cotización</button>
                            <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cotizaciones;