import React, { useState } from 'react';
import './Cotizaciones.css';

function Cotizaciones() {
    // DATOS SIMULADOS
    const listaClientes = ['Victor', 'Edwin', 'Carlos', 'Christian'];
    const listaItems = [
        { tipo: 'Servicio', nombre: 'Formateo de PC', precio: 200 },
        { tipo: 'Servicio', nombre: 'Cambio de Display', precio: 1800},
        { tipo: 'Refacción', nombre: 'Batería Laptop HP', precio: 1200}
    ];

    // 1. ESTADO DE LA TABLA PRINCIPAL
    const [cotizaciones, setCotizaciones] = useState([
        { id: 7001, fecha: '11/04/2026', cliente: 'Irving Manuel', descripcion: 'Reparación Laptop HP', total: 1624.00, estado: 'Pendiente' }
    ]);

    // 2. ESTADOS DEL MODAL
    const [modalAbierto, setModalAbierto] = useState(false);

    // 3. ESTADOS DEL FORMULARIO DE LA COTIZACIÓN
    const [formulario, setFormulario] = useState({ cliente: '', descripcion: '', descuento: 0, impuesto: 16 });
    const [partidas, setPartidas] = useState([]); // Aquí guardaremos las filas de servicios/refacciones

    // 4. ESTADO PARA LA NUEVA FILA QUE EL USUARIO ESTA AGREGANDO
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

    // Cuando el usuario elige un servicio de la lista, buscamos su precio original
    const manejarSeleccionItem = (e) => {
        setItemSeleccionado(e.target.value);
    }

    const agregarPartida = () => {
        if (!itemSeleccionado) return alert("Selecciona un concepto primero.");

        // Buscamos los datos del item seleccionado en nuestra lista falsa
        const infoItem = listaItems.find(i => i.nombre === itemSeleccionado);
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
        // Limpiamos los inputs pequeños para la siguiente fila
        setItemSeleccionado('');
        setCantidadInput(1);
    };

    const eliminarPartida = (index) => {
        const nuevasPartidas = partidas.filter((_, i) => i !== index);
        setPartidas(nuevasPartidas);
    };

    const guardarCotizacion = () => {
        if(partidas.length === 0) return alert("Agrega al menos una partida a la cotización.");

        const nuevaCotizacion = {
            id: Math.floor(Math.random() * 900) + 7000,
            fecha: new Date().toLocaleDateString('es-MX'),
            cliente: formulario.cliente,
            descripcion: formulario.descripcion,
            total: calcularTotalFinal(),
            estado: 'Pendiente'
        };

        setCotizaciones([nuevaCotizacion, ...cotizaciones]);
        setModalAbierto(false);
    };

    const abrirModalNuevo = () => {
        setFormulario({ cliente: '', descripcion: '', descuento: 0, impuestos: 16 });
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
                        {cotizaciones.map((coti) => (
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
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- EL SUPER MODAL DE COTIZACIONES --- */}
            {modalAbierto && (
                <div className="modal-overlay">
                    {/* Fíjate que le pusimos una clase extra "modal-coti" para hacerlo más ancho */}
                    <div className="modal-content modal-coti">
                        <h2>DISEÑADOR DE COTIZACIÓN</h2>

                        {/* 1. DATOS GENERALES */}
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

                        {/* 2. AGREGAR PARTIDAS (Cajita gris para armar la fila) */}
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
                                <label>&nbsp;</label> {/* Espacio vacío para alinear el botón */}
                                <button className="btn-agregar-fila" onClick={agregarPartida}>+ Añadir</button>
                            </div>
                        </div>

                        {/* 3. TABLITA DE PARTIDAS AGREGADAS */}
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

                        {/* 4. TOTALES MATEMÁTICOS */}
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