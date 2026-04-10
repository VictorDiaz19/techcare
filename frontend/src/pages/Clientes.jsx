import React, { useState } from 'react';
import './Clientes.css';

function Clientes() {
    // 1. ESTADO DE LA TABLA
    const [clientes, setClientes] = useState([
        {id: 3001, nombre: 'Victor', telefono: '755-194-1664', correo: 'victor21@gmail.com', direccion: 'La puerta'},
        {id: 3002, nombre: 'Edwin', telefono: '755-234-4567', correo: 'Edwin23@gmail.com', direccion: 'La correa'},
        {id: 3003, nombre: 'Irving', telefono: '755-578-7654', correo: 'Irving29@gmail.com', direccion: 'Petatlan'}
    ]);

    // 2. ESTADOS MODAL
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [clienteEditandoId, setClienteEditandoId] = useState(null);

    // 3. ESTADO DEL FORMULARIO
    const [formulario, setFormulario] = useState({
        nombre: '',
        telefono: '',
        correo: '',
        direccion: ''
    });

    const manejarInput = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    // 4. FUNCIONES PARA ABRIR EL MODAL
    const abrirModalCrear = () => {
        setModoEdicion(false);
        setClienteEditandoId(null);
        setFormulario({ nombre: '', telefono: '', correo: '', direccion: '' });
        setModalAbierto(true);
    }

    const abrirModalEditar = (cliente) => {
        setModoEdicion(true);
        setClienteEditandoId(cliente.id);
        setFormulario({ nombre: cliente.nombre, telefono: cliente.telefono, correo: cliente.correo, direccion: cliente.direccion});
        setModalAbierto(true);
    };

    // 5. FUNCIÓN PARA ELIMINAR
    const eliminarCliente = (id) => {
        const confirmar = window.confirm("¿Estás seguro de que desea eliminar a este cliente?");
        if (confirmar) {
            const nuevosClientes = clientes.filter(cliente => cliente.id !== id);
            setClientes(nuevosClientes);
        }
    };

    // 6. FUNCIÓN PARA GUARDAR (Crear o Editar)
    const guardarCliente = () => {
        if (modoEdicion) {
            const clientesActualizados = clientes.map(cliente => {
                if (cliente.id === clienteEditandoId) {
                    return {
                        ...cliente,
                        nombre: formulario.nombre,
                        telefono: formulario.telefono,
                        correo: formulario.correo,
                        direccion: formulario.direccion
                    };
                }
                return cliente;
            });
            setClientes(clientesActualizados)
        } else {
            const nuevoCliente = {
                id: Math.floor(Math.random() * 900) + 3000, // IDs falsos empezando en 3000
                nombre: formulario.nombre,
                telefono: formulario.telefono,
                correo: formulario.correo,
                direccion: formulario.direccion
            };
            setClientes([nuevoCliente, ...clientes]);
        }

        setFormulario({ nombre: '', telefono: '', correo: '', direccion: ''});
        setModalAbierto(false);
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
                        {clientes.map((cliente) => (
                            <tr key={cliente.id}>
                                <td>{cliente.id}</td>
                                <td><strong>{cliente.nombre}</strong></td>
                                <td>{cliente.telefono}</td>
                                <td>{cliente.correo}</td>
                                <td>{cliente.direccion}</td>
                                <td className="acciones-celda">
                                    <button className="btn-editar" title="Editar" onClick={() => abrirModalEditar(cliente)}>✏️</button>
                                    <button className="btn-eliminar" title="Eliminar" onClick={() => eliminarCliente(cliente.id)}>🗑️</button>
                                </td>
                            </tr>
                        ))};
                    </tbody>
                </table>
            </div>

            {/* --- PANTALLA EMERGENTE (MODAL) --- */}
            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{modoEdicion ? 'ACTUALIZAR CLIENTE' : 'NUEVO CLIENTE'}</h2>

                        <div className="form-grupo">
                            <label>Nombre Completo:</label>
                            <input type="text" name="nombre" value={formulario.nombre} onChange={manejarInput}/>
                        </div>

                        <div className="form-grupo">
                            <label>Teléfono:</label>
                            <input type="text" name="telefono" value={formulario.telefono} onChange={manejarInput}/>
                        </div>

                        <div className="form-grupo">
                            <label>Correo Electrónico:</label>
                            <input type="email" name="correo" value={formulario.correo} onChange={manejarInput}/>
                        </div>

                        <div className="form-grupo">
                            <label>Dirección:</label>
                            <textarea name="direccion" value={formulario.direccion} onChange={manejarInput} rows="2"/>
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