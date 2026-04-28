import React, { useState, useEffect } from 'react';
import './Reparaciones.css';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

function Reparaciones() {
    const [ordenes, setOrdenes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [cotizaciones, setCotizaciones] = useState([]);
    const [inventario, setInventario] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [notificacion, setNotificacion] = useState(null);
    const [confirmacion, setConfirmacion] = useState(null);

    const API_BASE = "http://localhost:8082";

    useEffect(() => { cargarTodo(); }, []);

    const cargarTodo = async () => {
        try {
            const [resRep, resTec, resCot, resInv, resCli] = await Promise.all([
                fetch(`${API_BASE}/reparaciones`), fetch(`${API_BASE}/tecnicos`),
                fetch(`${API_BASE}/cotizaciones`), fetch(`${API_BASE}/inventario`),
                fetch(`${API_BASE}/clientes`)
            ]);
            if (resRep.ok) setOrdenes(await resRep.json());
            if (resTec.ok) setTecnicos(await resTec.json());
            if (resCot.ok) setCotizaciones(await resCot.json());
            if (resInv.ok) setInventario(await resInv.json());
            if (resCli.ok) setClientes(await resCli.json());
        } catch (error) { console.error(error); } finally { setCargando(false); }
    };

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);

    const [formulario, setFormulario] = useState({
        equipo: '', problema: '', numSerie: '', 
        fechaEntrada: new Date().toISOString().split('T')[0],
        estadoActual: 'En espera', costoTotal: 0, tecnicoId: '', cotizacionId: '', productoId: '', clienteId: ''
    });

    const manejarInput = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormulario({
            equipo: '', problema: '', numSerie: '',
            fechaEntrada: new Date().toISOString().split('T')[0],
            estadoActual: 'En espera', tecnicoId: '', cotizacionId: '', productoId: '', clienteId: ''
        });
        setModalAbierto(true);
    };

    const abrirModalEditar = (o) => {
        setModoEdicion(true);
        setIdEditando(o.idReparacion);
        setFormulario({
            equipo: o.equipo,
            problema: o.problema,
            numSerie: o.numSerie || '',
            fechaEntrada: o.fechaEntrada,
            estadoActual: o.estadoActual,
            costoTotal: o.costoTotal,
            tecnicoId: o.tecnico?.idTecnicos || '',
            cotizacionId: o.cotizacion?.id_cotizacion || o.cotizacion?.ID_cotizacion || '',
            productoId: o.producto?.idProducto || '',
            clienteId: o.cliente?.id_cliente || o.cliente?.ID_cliente || ''
        });
        setModalAbierto(true);
    };

    const guardarOrden = async () => {
        if (!formulario.clienteId || !formulario.equipo || !formulario.numSerie) {
            setNotificacion({ mensaje: "Error: Faltan datos obligatorios", tipo: 'error' });
            return;
        }
        const payload = {
            ...formulario,
            numSerie: parseInt(formulario.numSerie),
            tecnico: formulario.tecnicoId ? { idTecnicos: parseInt(formulario.tecnicoId) } : null,
            cotizacion: formulario.cotizacionId ? { id_cotizacion: parseInt(formulario.cotizacionId) } : null,
            producto: formulario.productoId ? { idProducto: parseInt(formulario.productoId) } : null,
            cliente: formulario.clienteId ? { id_cliente: parseInt(formulario.clienteId) } : null
        };
        try {
            const metodo = modoEdicion ? 'PUT' : 'POST';
            const url = modoEdicion ? `${API_BASE}/reparaciones/${idEditando}` : `${API_BASE}/reparaciones`;
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) { await cargarTodo(); setModalAbierto(false); setNotificacion({ mensaje: "Guardado correctamente", tipo: 'success' }); }
            else { setNotificacion({ mensaje: await res.text(), tipo: 'error' }); }
        } catch (error) { setNotificacion({ mensaje: 'Error de conexión', tipo: 'error' }); }
    };

    const solicitarEliminar = (id) => {
        setConfirmacion({
            mensaje: "¿Deseas eliminar esta orden?",
            onConfirm: async () => {
                const res = await fetch(`${API_BASE}/reparaciones/${id}`, { method: 'DELETE' });
                if (res.ok) { await cargarTodo(); setNotificacion({ mensaje: "Orden eliminada", tipo: 'success' }); }
                setConfirmacion(null);
            }
        });
    };

    const imprimirComprobante = (id) => window.open(`${API_BASE}/pdf/comprobante/${id}`, '_blank');

    const obtenerClaseEstado = (estado) => {
        switch(estado) {
            case 'En proceso': return 'pill-amarillo';
            case 'En espera': return 'pill-rojo';
            case 'Terminado': return 'pill-verde';
            case 'Esp. Refacción': return 'pill-naranja';
            case 'Entregado': return 'pill-negro';
            default: return 'pill-gris';
        }
    };

    const filtradas = ordenes.filter(o => {
        const query = busqueda.toLowerCase().trim();
        if (!query) return true;

        // Formatos de Folio para búsqueda
        const idSimple = String(o.idReparacion || "");
        const idFormateado = `rep-${idSimple.padStart(4, '0')}`.toLowerCase();
        
        const equipo = (o.equipo || "").toLowerCase();
        const cliente = (o.cliente?.nombreCli || "").toLowerCase();
        const serie = String(o.numSerie || "").toLowerCase();

        return idSimple.includes(query) || 
               idFormateado.includes(query) || 
               equipo.includes(query) || 
               cliente.includes(query) || 
               serie.includes(query);
    });

    return (
        <div className="reparaciones-container">
            {notificacion && <Toast {...notificacion} onClose={() => setNotificacion(null)} />}
            {confirmacion && <ConfirmModal {...confirmacion} onCancel={() => setConfirmacion(null)} />}

            <div className="reparaciones-header">
                <h1>ÓRDENES DE REPARACIÓN</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Folio, cliente o serie..." className="input-buscador" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                    <button className="btn-nueva-orden" onClick={abrirModalCrear}>+ NUEVA ORDEN</button>
                </div>
            </div>

            <div className="tabla-contenedor">
                {cargando ? <p style={{textAlign:'center'}}>Cargando...</p> : (
                    <table className="tabla-reparaciones">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Fecha Entrada</th>
                                <th>Cliente</th>
                                <th>Equipo</th>
                                <th>No. Serie</th>
                                <th>Problema</th>
                                <th>Refacción</th>
                                <th>Técnico</th> {/* NUEVA COLUMNA SOLICITADA */}
                                <th>Estado</th>
                                <th>Costo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.map(o => (
                                <tr key={o.idReparacion}>
                                    <td><strong>REP-{String(o.idReparacion).padStart(4, '0')}</strong></td>
                                    <td>{o.fechaEntrada}</td>
                                    <td>{o.cliente?.nombreCli || 'Particular'}</td>
                                    <td>{o.equipo}</td>
                                    <td><code>{o.numSerie}</code></td>
                                    <td style={{fontSize:'12px', maxWidth:'150px'}}>{o.problema}</td>
                                    <td>{o.producto?.nombrePieza || 'N/A'}</td>
                                    <td><strong>{o.tecnico?.nombreTecnico || 'Sin asignar'}</strong></td> {/* DATO DEL TÉCNICO */}
                                    <td><span className={`estado-pill ${obtenerClaseEstado(o.estadoActual)}`}>{o.estadoActual}</span></td>
                                    <td>${parseFloat(o.costoTotal || 0).toFixed(2)}</td>
                                    <td className="acciones-celda">
                                        <button onClick={() => imprimirComprobante(o.idReparacion)} title="Ticket">🖨️</button>
                                        <button onClick={() => abrirModalEditar(o)} title="Editar">✏️</button>
                                        <button onClick={() => solicitarEliminar(o.idReparacion)} title="Eliminar">🗑️</button>
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
                        <h2>{modoEdicion ? 'GESTIONAR' : 'REGISTRAR'} REPARACIÓN</h2>
                        <div className="form-grupo">
                            <label>Cliente:</label>
                            <select name="clienteId" value={formulario.clienteId} onChange={manejarInput} className="input-select">
                                <option value="">Seleccionar cliente...</option>
                                {clientes.map(c => <option key={c.id_cliente || c.ID_cliente} value={c.id_cliente || c.ID_cliente}>{c.nombreCli}</option>)}
                            </select>
                        </div>
                        <div className="form-fila-doble">
                            <div className="form-grupo"><label>Equipo:</label><input type="text" name="equipo" value={formulario.equipo} onChange={manejarInput} /></div>
                            <div className="form-grupo"><label>No. de Serie:</label><input type="number" name="numSerie" value={formulario.numSerie} onChange={manejarInput} /></div>
                        </div>
                        <div className="form-grupo">
                            <label>Problema reportado:</label>
                            <textarea name="problema" value={formulario.problema} onChange={manejarInput} rows="2" />
                        </div>
                        <div className="form-fila-doble">
                            <div className="form-grupo">
                                <label>Técnico:</label>
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
                                    <option value="Esp. Refacción">Esp. Refacción</option>
                                    <option value="Terminado">Terminado</option>
                                    <option value="Entregado">Entregado</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-fila-doble">
                            <div className="form-grupo">
                                <label>Cotización:</label>
                                <select name="cotizacionId" value={formulario.cotizacionId} onChange={manejarInput} className="input-select">
                                    <option value="">N/A</option>
                                    {cotizaciones.map(c => <option key={c.id_cotizacion || c.ID_cotizacion} value={c.id_cotizacion || c.ID_cotizacion}>COT-{String(c.id_cotizacion || c.ID_cotizacion).padStart(4, '0')}</option>)}
                                </select>
                            </div>
                            <div className="form-grupo">
                                <label>Refacción:</label>
                                <select name="productoId" value={formulario.productoId} onChange={manejarInput} className="input-select">
                                    <option value="">Ninguna...</option>
                                    {inventario.map(p => <option key={p.idProducto} value={p.idProducto}>{p.nombrePieza}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-grupo"><label>Costo Total ($):</label><input type="number" name="costoTotal" value={formulario.costoTotal} onChange={manejarInput} /></div>
                        <div className="modal-botones"><button className="btn-guardar" onClick={guardarOrden}>Guardar Registro</button><button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reparaciones;