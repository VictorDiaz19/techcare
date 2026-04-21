import React, { useState, useEffect } from 'react';
import './Reparaciones.css';

function Reparaciones() {
    const [ordenes, setOrdenes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [cotizaciones, setCotizaciones] = useState([]);
    const [inventario, setInventario] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    const API_BASE = "http://localhost:8082";

    useEffect(() => {
        cargarTodo();
    }, []);

    const cargarTodo = async () => {
        try {
            const [resRep, resTec, resCot, resInv] = await Promise.all([
                fetch(`${API_BASE}/reparaciones`),
                fetch(`${API_BASE}/tecnicos`),
                fetch(`${API_BASE}/cotizaciones`),
                fetch(`${API_BASE}/inventario`)
            ]);
            if (resRep.ok) setOrdenes(await resRep.json());
            if (resTec.ok) setTecnicos(await resTec.json());
            if (resCot.ok) setCotizaciones(await resCot.json());
            if (resInv.ok) setInventario(await resInv.json());
        } catch (error) { 
            console.error("Error al sincronizar datos:", error); 
        } finally { 
            setCargando(false); 
        }
    };

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);

    const [formulario, setFormulario] = useState({
        equipo: '',
        problema: '',
        fechaEntrada: new Date().toISOString().split('T')[0],
        estadoActual: 'En espera',
        costoTotal: 0,
        tecnicoId: '',
        cotizacionId: '',
        productoId: ''
    });

    const manejarInput = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormulario({
            equipo: '', problema: '', costoTotal: 0,
            fechaEntrada: new Date().toISOString().split('T')[0],
            estadoActual: 'En espera', tecnicoId: '', cotizacionId: '', productoId: ''
        });
        setModalAbierto(true);
    };

    const abrirModalEditar = (o) => {
        setModoEdicion(true);
        setIdEditando(o.idReparacion);
        setFormulario({
            equipo: o.equipo,
            problema: o.problema,
            fechaEntrada: o.fechaEntrada,
            estadoActual: o.estadoActual,
            costoTotal: o.costoTotal,
            tecnicoId: o.tecnico?.idTecnicos || '',
            cotizacionId: o.cotizacion?.id_cotizacion || o.cotizacion?.ID_cotizacion || '',
            productoId: o.producto?.idProducto || ''
        });
        setModalAbierto(true);
    };

    const guardarOrden = async () => {
        const payload = {
            ...formulario,
            tecnico: formulario.tecnicoId ? { idTecnicos: parseInt(formulario.tecnicoId) } : null,
            cotizacion: formulario.cotizacionId ? { id_cotizacion: parseInt(formulario.cotizacionId) } : null,
            producto: formulario.productoId ? { idProducto: parseInt(formulario.productoId) } : null
        };

        try {
            const metodo = modoEdicion ? 'PUT' : 'POST';
            const url = modoEdicion ? `${API_BASE}/reparaciones/${idEditando}` : `${API_BASE}/reparaciones`;
            
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await cargarTodo();
                setModalAbierto(false);
            }
        } catch (error) { console.error(error); }
    };

    const imprimirComprobante = (id) => window.open(`${API_BASE}/pdf/comprobante/${id}`, '_blank');

    const filtradas = ordenes.filter(o => 
        (o.equipo || "").toLowerCase().includes(busqueda.toLowerCase()) || 
        String(o.idReparacion).includes(busqueda)
    );

    return (
        <div className="reparaciones-container">
            <div className="reparaciones-header">
                <h1>ÓRDENES DE REPARACIÓN</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Folio o equipo..." className="input-buscador" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                    <button className="btn-nueva-orden" onClick={abrirModalCrear}>+ NUEVA ORDEN</button>
                </div>
            </div>

            <div className="tabla-contenedor">
                {cargando ? <p style={{textAlign:'center'}}>Conectando...</p> : (
                    <table className="tabla-reparaciones">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Entrada</th>
                                <th>Equipo</th>
                                <th>Problema</th>
                                <th>Técnico</th>
                                <th>Cotiz. Vinculada</th>
                                <th>Refacción</th>
                                <th>Estado</th>
                                <th>Costo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.map(o => (
                                <tr key={o.idReparacion}>
                                    <td>REP-{String(o.idReparacion).padStart(4, '0')}</td>
                                    <td>{o.fechaEntrada}</td>
                                    <td><strong>{o.equipo}</strong></td>
                                    <td>{o.problema}</td>
                                    <td>{o.tecnico?.nombreTecnico || 'S/A'}</td>
                                    <td>{o.cotizacion ? `COT-${String(o.cotizacion.id_cotizacion || o.cotizacion.ID_cotizacion).padStart(4, '0')}` : 'N/A'}</td>
                                    <td>{o.producto?.nombrePieza || 'Ninguna'}</td>
                                    <td><span className="estado-pill">{o.estadoActual}</span></td>
                                    <td>${parseFloat(o.costoTotal || 0).toFixed(2)}</td>
                                    <td className="acciones-celda">
                                        <button className="btn-editar" onClick={() => imprimirComprobante(o.idReparacion)} title="Ticket">🖨️</button>
                                        <button className="btn-editar" onClick={() => abrirModalEditar(o)} title="Editar">✏️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- MODAL AMPLIADO CON TODAS LAS RELACIONES --- */}
            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{modoEdicion ? 'GESTIONAR' : 'REGISTRAR'} REPARACIÓN</h2>
                        
                        <div className="form-grupo">
                            <label>Nombre del Equipo:</label>
                            <input type="text" name="equipo" value={formulario.equipo} onChange={manejarInput} />
                        </div>

                        <div className="form-grupo">
                            <label>Problema reportado:</label>
                            <textarea name="problema" value={formulario.problema} onChange={manejarInput} rows="2" />
                        </div>

                        <div className="form-fila-doble">
                            <div className="form-grupo">
                                <label>Técnico Asignado:</label>
                                <select name="tecnicoId" value={formulario.tecnicoId} onChange={manejarInput} className="input-select">
                                    <option value="">Sin técnico...</option>
                                    {tecnicos.map(t => <option key={t.idTecnicos} value={t.idTecnicos}>{t.nombreTecnico}</option>)}
                                </select>
                            </div>
                            <div className="form-grupo">
                                <label>Estado:</label>
                                <select name="estadoActual" value={formulario.estadoActual} onChange={manejarInput} className="input-select">
                                    <option value="En espera">En espera</option>
                                    <option value="En proceso">En proceso</option>
                                    <option value="Terminado">Terminado</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-fila-doble">
                            <div className="form-grupo">
                                <label>Vincular Cotización:</label>
                                <select name="cotizacionId" value={formulario.cotizacionId} onChange={manejarInput} className="input-select">
                                    <option value="">N/A</option>
                                    {cotizaciones.map(c => (
                                        <option key={c.id_cotizacion || c.ID_cotizacion} value={c.id_cotizacion || c.ID_cotizacion}>
                                            COT-{c.id_cotizacion || c.ID_cotizacion} - {c.cliente?.nombreCli}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-grupo">
                                <label>Refacción Usada:</label>
                                <select name="productoId" value={formulario.productoId} onChange={manejarInput} className="input-select">
                                    <option value="">Ninguna...</option>
                                    {inventario.map(p => <option key={p.idProducto} value={p.idProducto}>{p.nombrePieza}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-grupo">
                            <label>Costo Total Final ($):</label>
                            <input type="number" name="costoTotal" value={formulario.costoTotal} onChange={manejarInput} />
                        </div>

                        <div className="modal-botones">
                            <button className="btn-guardar" onClick={guardarOrden}>Guardar Registro</button>
                            <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reparaciones;