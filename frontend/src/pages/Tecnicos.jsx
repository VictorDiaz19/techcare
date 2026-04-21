import React, { useState, useEffect } from 'react';
import './Tecnicos.css';

function Tecnicos() {
    const [tecnicos, setTecnicos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const API_URL = "http://localhost:8082/tecnicos";

    useEffect(() => {
        cargarTecnicos();
    }, []);

    const cargarTecnicos = async () => {
        try {
            const respuesta = await fetch(API_URL);
            if (respuesta.ok) {
                const datos = await respuesta.json();
                // MAPEO DEFENSIVO: Buscamos cualquier variante del nombre del campo
                const formateados = Array.isArray(datos) ? datos.map(t => ({
                    idReal: t.idTecnicos || t.ID_tecnicos || t.id_tecnicos,
                    nombreReal: t.nombreTecnico || t.NombreTecnico || t.nombre_tecnico,
                    especialidadReal: t.especialidad || t.Especialidad,
                    telefonoReal: t.telefono || t.Telefono || '',
                    estadoReal: t.estado || t.Estado || 'Activo'
                })) : [];
                setTecnicos(formateados);
            }
        } catch (error) {
            console.error("Error al cargar técnicos:", error);
        } finally {
            setCargando(false);
        }
    };

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [tecnicoEditandoId, setTecnicoEditandoId] = useState(null);

    const [formulario, setFormulario] = useState({
        nombreTecnico: '',
        especialidad: '',
        telefono: '',
        estado: 'Activo'
    });

    const manejarInput = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormulario({ nombreTecnico: '', especialidad: '', telefono: '', estado: 'Activo' });
        setModalAbierto(true);
    };

    const abrirModalEditar = (tecnico) => {
        setModoEdicion(true);
        setTecnicoEditandoId(tecnico.idReal);
        setFormulario({
            nombreTecnico: tecnico.nombreReal,
            especialidad: tecnico.especialidadReal,
            telefono: tecnico.telefonoReal,
            estado: tecnico.estadoReal
        });
        setModalAbierto(true);
    };

    const eliminarTecnico = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este técnico?")) {
            try {
                const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (res.ok) cargarTecnicos();
            } catch (error) { console.error(error); }
        }
    };

    const guardarTecnico = async () => {
        try {
            const metodo = modoEdicion ? 'PUT' : 'POST';
            const url = modoEdicion ? `${API_URL}/${tecnicoEditandoId}` : API_URL;
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formulario)
            });
            if (res.ok) {
                cargarTecnicos();
                setModalAbierto(false);
            }
        } catch (error) { console.error(error); }
    };

    return (
        <div className="tecnicos-container">
            <div className="tecnicos-header">
                <h1>TÉCNICOS</h1>
                <div className="header-acciones">
                    <input type="text" placeholder="Buscar técnico..." className="input-buscador"/>
                    <button className="btn-nuevo-tecnico" onClick={abrirModalCrear}>+ NUEVO TÉCNICO</button>
                </div>
            </div>

            <div className="tabla-container">
                {cargando ? <p style={{textAlign:'center'}}>Conectando con el servidor...</p> : (
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
                            {tecnicos.length > 0 ? tecnicos.map((t) => (
                                <tr key={t.idReal}>
                                    <td>{t.idReal}</td>
                                    <td><strong>{t.nombreReal}</strong></td>
                                    <td>{t.especialidadReal}</td>
                                    <td>{t.telefonoReal}</td>
                                    <td>
                                        <span className={`estado-pill ${t.estadoReal === 'Activo' ? 'pill-activo' : 'pill-inactivo'}`}>
                                            {t.estadoReal}
                                        </span>
                                    </td>
                                    <td className="acciones-celda">
                                        <button className="btn-editar" onClick={() => abrirModalEditar(t)}>✏️</button>
                                        <button className="btn-eliminar" onClick={() => eliminarTecnico(t.idReal)}>🗑️</button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="6" style={{textAlign:'center'}}>No hay técnicos registrados en la base de datos.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- MODAL --- */}
            {modalAbierto && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{modoEdicion ? 'ACTUALIZAR TÉCNICO' : 'NUEVO TÉCNICO'}</h2>
                        <div className="form-grupo">
                            <label>Nombre Completo:</label>
                            <input type="text" name="nombreTecnico" value={formulario.nombreTecnico} onChange={manejarInput} />
                        </div>
                        <div className="form-grupo">
                            <label>Especialidad Principal:</label>
                            <input type="text" name="especialidad" value={formulario.especialidad} onChange={manejarInput} />
                        </div>
                        <div className="form-grupo">
                            <label>Teléfono:</label>
                            <input type="text" name="telefono" value={formulario.telefono} onChange={manejarInput} />
                        </div>
                        <div className="form-grupo">
                            <label>Estado:</label>
                            <select name="estado" value={formulario.estado} onChange={manejarInput} className="input-select">
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
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