import React, { useState } from 'react';
import './Servicios.css';

function Servicios() {
    // 1. ESTADO DE LA TABLA
    const [servicios, setServicios] = useState([
        { id: 2001, nombre: 'Formateo de PC', descripcion: 'Incluye respaldos de 50GB e instalación de paquetería', precio: 200 },
        { id: 2002, nombre: 'Cambio de Display', descripcion: 'Descripcion', precio: 1800},
        { id: 2003, nombre: 'Mantenimiento', descripcion: 'Descripcion', precio: 500}
    ]);

    // 2. ESTADO DEL MODAL
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [servicioEditandoId, setServicioEditandoId] = useState(null);

    // 3. ESTADO DEL FORMULARIO
    const [formulario, setFormulario] = useState({
        nombre: '',
        descripcion: '',
        precio: ''
    });

    const manejarInput = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    // 4. FUNCIONES PARA ABRIR EL MODAL
    const abrirModalCrear = () => {
        setModoEdicion(false);
        setServicioEditandoId(null);
        setFormulario({ nombre: '', descripcion: '', precio: '' });
        setModalAbierto(true);
    };

    const abrirModalEditar = (servicio) => {
        setModoEdicion(true);
        setServicioEditandoId(servicio.id);
        setFormulario({ nombre: servicio.nombre, descripcion: servicio.descripcion, precio: servicio.precio });
        setModalAbierto(true);
    };

    // 5. FUNCIÓN PARA ELIMINAR
    const eliminarServicio = (id) => {
        const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este servicio del catálogo?");
        if (confirmar) {
            const nuevoServicio = servicios.filter(servicio => servicio.id !== id);
            setServicios(nuevoServicio);
        }
    };

    // 6. FUNCIÓN PARA GUARDAR
    const guardarServicio = () => {
        if (modoEdicion) {
            const serviciosActualizados = servicios.map(servicio => {
                if (servicio.id === servicioEditandoId) {
                    return {
                        ...servicio,
                        nombre: formulario.nombre,
                        descripcion: formulario.descripcion,
                        precio: parseFloat(formulario.precio) || 0 // Aseguramos que sea un número
                    };
                }
                return servicio;
            });
            setServicios(serviciosActualizados);
        } else {
            const nuevoServicio = {
                id: Math.floor(Math.random() * 900) + 2000, // Genera un ID falso empezando en 2000
                nombre: formulario.nombre,
                descripcion: formulario.descripcion,
                precio: parseFloat(formulario.precio) || 0
            };
            setServicios([nuevoServicio, ...servicios]);
        }

        setFormulario({ nombre: '', descripcion: '', precio: '' });
        setModalAbierto(false);
    };

    return (
        <div className="servicios-container">

            {/* --- BARRA SUPERIOR --- */}
            <div className="servicios-header">
                <h1>CATÁLOGO DE SERVICIOS</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Buscar servicio..." className="input-buscador"/>
                    <button className="btn-nuevo-servicio" onClick={abrirModalCrear}>
                        + AGREGAR SERVICIO
                    </button>
                </div>
            </div>

            {/* --- TABLA DE DATOS --- */}
            <div className="tabla-contenedor">
                <table className="tabla-servicios">
                    <thead>
                        <tr>
                            <th>ID (Folio)</th>
                            <th>Nombre de servicio</th>
                            <th>Descripción</th>
                            <th>Precio Base</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servicios.map((servicio) => (
                            <tr key={servicio.id}>
                                <td>{servicio.id}</td>
                                <td>{servicio.nombre}</td>
                                <td>{servicio.descripcion}</td>
                                {/* Formateamos el precio para que se vea como moneda ($0.00 MXN) */}
                                <td>${servicio.precio.toLocaleString('es-MX')} MXN</td>
                                <td className="acciones-celda">
                                    <button className="btn-editar" title="Editar" onClick={() => abrirModalEditar(servicio)}>✏️</button>
                                    <button className="btn-eliminar" title="Eliminar" onClick={() => eliminarServicio(servicio.id)}>🗑️</button>
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
                        <h2>{modoEdicion ? 'ACTUALIZAR DATOS' : 'INGRESAR DATOS'}</h2>

                        <div className="form-grupo">
                            <label>Nombre de servicio:</label>
                            <input type="text" name="nombre" value={formulario.nombre} onChange={manejarInput} />
                        </div>

                        <div className="form-grupo">
                            <label>Descripción:</label>
                            {/* Cambiamos el input por un textarea para que quepa más texto */}
                            <textarea name="descripcion" value={formulario.descripcion} onChange={manejarInput} rows="3" />
                        </div>

                        <div className="form-grupo">
                            <label>Precio Base:</label>
                            <input type="number" name="precio" value={formulario.precio} onChange={manejarInput} />
                        </div>

                        <div className="modal-botones">
                            <button className="btn-guardar" onClick={guardarServicio}>Guardar Cambios</button>
                            <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Servicios;