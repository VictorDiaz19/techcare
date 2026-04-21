import React, { useState, useEffect } from 'react';
import './Clientes.css';

function Clientes() {
    // 1. ESTADO DE LA TABLA (Ahora inicia vacía)
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);

    // URL base de tu API
    const API_URL = "http://localhost:8082/clientes";

    // 2. EFECTO PARA CARGAR DATOS AL INICIAR
    useEffect(() => {
        obtenerClientes();
    }, []);

    const obtenerClientes = async () => {
        try {
            const respuesta = await fetch(API_URL);
            if (respuesta.ok) {
                const datos = await respuesta.json();
                setClientes(datos);
            }
        } catch (error) {
            console.error("Error al obtener clientes:", error);
        } finally {
            setCargando(false);
        }
    };

    // 3. ESTADOS MODAL
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [clienteEditandoId, setClienteEditandoId] = useState(null);

    // 4. ESTADO DEL FORMULARIO (Mapeado a los nombres de tu Modelo Java)
    const [formulario, setFormulario] = useState({
        nombreCli: '',
        telefono: '',
        email: '',
        direccion: ''
    });

    const manejarInput = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setClienteEditandoId(null);
        setFormulario({ nombreCli: '', telefono: '', email: '', direccion: '' });
        setModalAbierto(true);
    }

    const abrirModalEditar = (cliente) => {
        setModoEdicion(true);
        setClienteEditandoId(cliente.id_cliente);
        setFormulario({ 
            nombreCli: cliente.nombreCli, 
            telefono: cliente.telefono || '', 
            email: cliente.email || '', 
            direccion: cliente.direccion || ''
        });
        setModalAbierto(true);
    };

    // 5. FUNCIÓN PARA ELIMINAR REAL
    const eliminarCliente = async (id) => {
        const confirmar = window.confirm("¿Estás seguro de que desea eliminar a este cliente?");
        if (confirmar) {
            try {
                const respuesta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (respuesta.ok) {
                    setClientes(clientes.filter(c => c.id_cliente !== id));
                } else {
                    alert("No se pudo eliminar el cliente.");
                }
            } catch (error) {
                console.error("Error al eliminar:", error);
            }
        }
    };

    // 6. FUNCIÓN PARA GUARDAR REAL (Crear o Editar)
    const guardarCliente = async () => {
        // Validación básica
        if (!formulario.nombreCli) {
            alert("El nombre es obligatorio");
            return;
        }

        const datosAEnviar = {
            ...formulario,
            telefono: formulario.telefono ? parseInt(formulario.telefono) : null
        };

        try {
            let respuesta;
            if (modoEdicion) {
                // ACTUALIZAR (PUT)
                respuesta = await fetch(`${API_URL}/${clienteEditandoId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosAEnviar)
                });
            } else {
                // CREAR (POST)
                respuesta = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosAEnviar)
                });
            }

            if (respuesta.ok) {
                // Si todo salió bien, recargamos la lista para ver los cambios reales
                await obtenerClientes();
                setModalAbierto(false);
            } else {
                const errorText = await respuesta.text();
                alert("Error al guardar: " + errorText);
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error de conexión con el servidor");
        }
    };

    return (
        <div className="clientes-container">

            {/* --- BARRA SUPERIOR --- */}
            <div className="clientes-header">
                <h1>DIRECTORIO DE CLIENTES</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Buscar cliente..." className="input-buscador"/>
                    <button className="btn-nuevo-cliente" onClick={abrirModalCrear}>
                        + NUEVO CLIENTE
                    </button>
                </div>
            </div>

            {/* --- TABLA DE DATOS --- */}
            <div className="tabla-container">
                {cargando ? (
                    <div className="cargando">Cargando datos del servidor...</div>
                ) : (
                    <table className='tabla-clientes'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre Completo</th>
                                <th>Teléfono</th>
                                <th>Correo Electronico</th>
                                <th>Dirección</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientes.length > 0 ? (
                                clientes.map((cliente) => (
                                    <tr key={cliente.id_cliente}>
                                        <td>{cliente.id_cliente}</td>
                                        <td><strong>{cliente.nombreCli}</strong></td>
                                        <td>{cliente.telefono}</td>
                                        <td>{cliente.email}</td>
                                        <td>{cliente.direccion}</td>
                                        <td className="acciones-celda">
                                            <button className="btn-editar" title="Editar" onClick={() => abrirModalEditar(cliente)}>✏️</button>
                                            <button className="btn-eliminar" title="Eliminar" onClick={() => eliminarCliente(cliente.id_cliente)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{textAlign: 'center'}}>No hay clientes registrados en la base de datos.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- PANTALLA EMERGENTE (MODAL) --- */}
            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{modoEdicion ? 'ACTUALIZAR CLIENTE' : 'NUEVO CLIENTE'}</h2>

                        <div className="form-grupo">
                            <label>Nombre Completo:</label>
                            <input type="text" name="nombreCli" value={formulario.nombreCli} onChange={manejarInput} placeholder="Ej. Juan Pérez"/>
                        </div>

                        <div className="form-grupo">
                            <label>Teléfono:</label>
                            <input type="number" name="telefono" value={formulario.telefono} onChange={manejarInput} placeholder="7551234567"/>
                        </div>

                        <div className="form-grupo">
                            <label>Correo Electrónico:</label>
                            <input type="email" name="email" value={formulario.email} onChange={manejarInput} placeholder="correo@ejemplo.com"/>
                        </div>

                        <div className="form-grupo">
                            <label>Dirección:</label>
                            <textarea name="direccion" value={formulario.direccion} onChange={manejarInput} rows="2" placeholder="Calle, Número, Colonia..."/>
                        </div>

                        <div className="modal-botones">
                            <button className="btn-guardar" onClick={guardarCliente}>Guardar Datos</button>
                            <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Clientes;