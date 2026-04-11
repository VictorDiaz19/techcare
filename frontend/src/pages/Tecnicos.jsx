import React, { useState } from 'react';
import './Tecnicos.css';

function Tecnicos() {
    // 1. ESTADO DE LA TABLA
    const [tecnicos, setTecnicos] = useState([
        { id: 5001, nombre: 'Edwin (Admin)', especialidad: 'Jefe', telefono: '555-000-1111', estado: 'Activo' },
        { id: 5002, nombre: 'Irving', especialidad: 'Micro-soldadura (Hardware)', telefono: '555-222-3333', estado: 'Activo' },
        { id:5003, nombre: 'Carlos', especialidad: 'Especialista Apple', telefono: '555-444-5555', estado: 'Inactivo' }
    ]);

    // 2. ESTADOS DEL MODAL
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [tecnicoEditandoId, setTecnicoEditandoId] = useState(null);

    // 3. ESTADO DEL FORMULARIO
    const [formulario, setFormulario] = useState({
        nombre: '',
        especialidad: '',
        telefono: '',
        estado: 'Activo' // Por defecto, un técnico nuevo entra como activo
    });

    const manejarInput = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    // 4. FUNCIONES PAERA ABRIR EL MODAL
    const abrirModalCrear = () => {
        setModoEdicion(false);
        setTecnicoEditandoId(null);
        setFormulario({ nombre: '', especialidad: '', telefono: '', estado: 'Activo' });
        setModalAbierto(true);
    };

    const abrirModalEditar = (tecnico) => {
        setModoEdicion(true);
        setTecnicoEditandoId(tecnico.id);
        setFormulario({
            nombre: tecnico.nombre,
            especialidad: tecnico.especialidad,
            telefono: tecnico.telefono,
            estado: tecnico.estado
        });
        setModalAbierto(true);
    };

    // 5. FUNCIÓN PARA ELIMINAR
    const eliminarTecnico = (id) => {
        const confirmar = window.confirm("¿Estás seguro de que deseas eliminar a este técnico del sistema?");
        if (confirmar) {
            const nuevosTecnicos = tecnicos.filter(t => t.id !== id);
            setTecnicos(nuevosTecnicos);
        }
    };

    // 6. FUNCIÓN PARA GUARDAR
    const guardarTecnico = () => {
        if (modoEdicion) {
            const tecnicosActualizados = tecnicos.map(t => {
                if (t.id === tecnicoEditandoId) {
                    return {
                        ...t,
                        nombre: formulario.nombre,
                        especialidad: formulario.especialidad,
                        telefono: formulario.telefono,
                        estado: formulario.estado
                    };
                }
                return t;
            });
            setTecnicos(tecnicosActualizados);
        } else {
            const nuevoTecnico = {
                id: Math.floor(Math.random() * 900) + 5000,
                nombre: formulario.nombre,
                especialidad: formulario.especialidad,
                telefono: formulario.telefono,
                estado: formulario.estado
            };
            setTecnicos([nuevoTecnico, ...tecnicos]);
        }
        setModalAbierto(false);
    };

    return (
        <div className="tecnicos-container">

            <div className="tecnicos-header">
                <h1>TÉCNICOS</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Buscar técnico..." className="input-buscador"/>
                    <button className="btn-nuevo-tecnico" onClick={abrirModalCrear}>
                        + NUEVO TÉCNICO
                    </button>
                </div>
            </div>

            <div className="tabla-container">
                <table className="tabla-tecnicos">
                    <thead>
                        <tr>
                            <th>ID Empleado</th>
                            <th>Nombre Completo</th>
                            <th>Especialidad</th>
                            <th>Teléfono</th>
                            <th>Estado Actual</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tecnicos.map((tecnico) => (
                            <tr key={tecnico.id}>
                                <td>{tecnico.id}</td>
                                <td><strong>{tecnico.nombre}</strong></td>
                                <td>{tecnico.especialidad}</td>
                                <td>{tecnico.telefono}</td>
                                <td>
                                    <span className={`estado-pill ${tecnico.estado === 'Activo' ? 'pill-activo' : 'pill-inactivo'}`}>
                                        {tecnico.estado}
                                    </span>
                                </td>
                                <td className="acciones-celda">
                                    <button className="btn-editar" title="Editar" onClick={() => abrirModalEditar(tecnico)}>✏️</button>
                                    <button className="btn-eliminar" title="Eliminar" onClick={() => eliminarTecnico(tecnico.id)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- PANTALLA EMERGENTE --- */}
            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{modoEdicion ? 'ACTUALIZAR TÉCNICO' : 'NUEVO TÉCNICO'}</h2>

                        <div className="form-grupo">
                            <label>Nombre Completo:</label>
                            <input type="text" name="nombre" value={formulario.nombre} onChange={manejarInput} />
                        </div>

                        <div className="form-grupo">
                            <label>Especialidad Principal:</label>
                            <input type="text" name="especialidad" value={formulario.especialidad} onChange={manejarInput} placeholder="Ej. Hardware, Software, Redes..." />
                        </div>

                        <div className="form-grupo">
                            <label>Teléfono de Contacto:</label>
                            <input type="text" name="telefono" value={formulario.telefono} onChange={manejarInput} />
                        </div>

                        <div className="form-grupo">
                            <label>Estado Laboral:</label>
                            <select name="estado" value={formulario.estado} onChange={manejarInput} className="input-select">
                                <option value="Activo">Activo (Disponible para trabajar)</option>
                                <option value="Inactivo">Inactivo (Vacaciones, Baja, etc.)</option>
                            </select>
                        </div>

                        <div className="modal-botones">
                            <button className="btn-guardar" onClick={guardarTecnico}>Guardar Registro</button>
                            <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tecnicos;