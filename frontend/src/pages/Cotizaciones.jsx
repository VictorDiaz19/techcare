import React, { useState, useEffect } from 'react';
import './Cotizaciones.css';

function Cotizaciones() {
    const [cotizaciones, setCotizaciones] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    const API_BASE = "http://localhost:8082";

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [resCot, resCli, resSer] = await Promise.all([
                fetch(`${API_BASE}/cotizaciones`),
                fetch(`${API_BASE}/clientes`),
                fetch(`${API_BASE}/servicios/listar`)
            ]);
            if (resCot.ok) setCotizaciones(await resCot.json());
            if (resCli.ok) setClientes(await resCli.json());
            if (resSer.ok) setServicios(await resSer.json());
        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {
            setCargando(false);
        }
    };

    const [modalAbierto, setModalAbierto] = useState(false);
    const [formulario, setFormulario] = useState({
        clienteId: '',
        servicioId: '',
        descripcion: '',
        total: '',
        estadoCotiz: 'Pendiente'
    });

    const manejarInput = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    const abrirModalCrear = () => {
        setFormulario({ clienteId: '', servicioId: '', descripcion: '', total: '', estadoCotiz: 'Pendiente' });
        setModalAbierto(true);
    };

    const guardarCotizacion = async () => {
        const payload = {
            fecha: new Date().toISOString().split('T')[0],
            equipoCotiz: formulario.descripcion,
            estadoCotiz: formulario.estadoCotiz,
            total: parseFloat(formulario.total || 0),
            descripcion: formulario.descripcion,
            cliente: { id_cliente: parseInt(formulario.clienteId) },
            servicio: formulario.servicioId ? { id_servicio: parseInt(formulario.servicioId) } : null
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
            }
        } catch (error) { console.error(error); }
    };

    const eliminarCotizacion = async (id) => {
        if (window.confirm("¿Eliminar cotización?")) {
            await fetch(`${API_BASE}/cotizaciones/${id}`, { method: 'DELETE' });
            cargarDatos();
        }
    };

    const filtradas = cotizaciones.filter(c => {
        const query = busqueda.toLowerCase().trim();
        const id = c.id_cotizacion || c.ID_cotizacion;
        const idTexto = String(id).toLowerCase();
        const folioFormateado = `cot-${idTexto.padStart(4, '0')}`.toLowerCase();
        const clienteNom = (c.cliente?.nombreCli || "").toLowerCase();
        return clienteNom.includes(query) || idTexto.includes(query) || folioFormateado.includes(query);
    });

    return (
        <div className="cotizaciones-container">
            <div className="cotizaciones-header">
                <h1>GESTOR DE COTIZACIONES</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Buscar..." className="input-buscador" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                    <button className="btn-nueva-coti" onClick={abrirModalCrear}>+ NUEVA COTIZACIÓN</button>
                </div>
            </div>

            <div className="tabla-container">
                {cargando ? <p style={{textAlign: 'center'}}>Cargando...</p> : (
                    <table className="tabla-cotizaciones">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Servicio Solicitado</th>
                                <th>Estado</th>
                                <th>Total</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.map(c => (
                                <tr key={c.id_cotizacion || c.ID_cotizacion}>
                                    <td><strong>COT-{String(c.id_cotizacion || c.ID_cotizacion).padStart(4, '0')}</strong></td>
                                    <td>{c.fecha || c.Fecha}</td>
                                    <td>{c.cliente?.nombreCli || 'Sin asignar'}</td>
                                    <td><strong>{c.servicio?.nombreServicio || 'General / Varios'}</strong></td>
                                    <td><span className="estado-coti">{c.estadoCotiz || c.EstadoCotiz}</span></td>
                                    <td>${parseFloat(c.total || c.Total || 0).toFixed(2)}</td>
                                    <td className="acciones-celda">
                                        <button className="btn-eliminar" onClick={() => eliminarCotizacion(c.id_cotizacion || c.ID_cotizacion)}>🗑️</button>
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
                        <h2>NUEVA COTIZACIÓN</h2>
                        <div className="form-grupo">
                            <label>Cliente:</label>
                            <select name="clienteId" value={formulario.clienteId} onChange={manejarInput} className="input-select">
                                <option value="">Seleccionar...</option>
                                {clientes.map(cli => <option key={cli.id_cliente} value={cli.id_cliente}>{cli.nombreCli}</option>)}
                            </select>
                        </div>
                        <div className="form-grupo">
                            <label>Servicio:</label>
                            <select name="servicioId" value={formulario.servicioId} onChange={manejarInput} className="input-select">
                                <option value="">Sin servicio específico</option>
                                {servicios.map(s => <option key={s.id_servicio} value={s.id_servicio}>{s.nombreServicio}</option>)}
                            </select>
                        </div>
                        <div className="form-grupo">
                            <label>Descripción:</label>
                            <input type="text" name="descripcion" value={formulario.descripcion} onChange={manejarInput} />
                        </div>
                        <div className="form-fila-doble">
                            <div className="form-grupo">
                                <label>Monto:</label>
                                <input type="number" name="total" value={formulario.total} onChange={manejarInput} />
                            </div>
                            <div className="form-grupo">
                                <label>Estado:</label>
                                <select name="estadoCotiz" value={formulario.estadoCotiz} onChange={manejarInput} className="input-select">
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Aprobado">Aprobado</option>
                                    <option value="Rechazado">Rechazado</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-botones">
                            <button className="btn-guardar" onClick={guardarCotizacion}>Guardar</button>
                            <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cotizaciones;