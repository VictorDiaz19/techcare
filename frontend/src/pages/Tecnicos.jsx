import React, { useState, useEffect } from 'react';
import './Tecnicos.css';

function Tecnicos() {
    // 1. ESTADO DE LA TABLA (Conectada al Backend)
    const [tecnicos, setTecnicos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [errorConexion, setErrorConexion] = useState(null);

    const API_URL = "http://localhost:8082/tecnicos";

    // 2. CARGA DE DATOS AL INICIAR
    useEffect(() => {
        cargarTecnicos();
    }, []);

    const cargarTecnicos = async () => {
        setCargando(true);
        try {
            const respuesta = await fetch(API_URL);
            if (respuesta.ok) {
                const datos = await respuesta.json();
                setTecnicos(Array.isArray(datos) ? datos : []);
                setErrorConexion(null);
            } else {
                setErrorConexion("Error del servidor (Status: " + respuesta.status + ")");
            }
        } catch (error) {
            console.error("Error al cargar técnicos:", error);
            setErrorConexion("No se pudo conectar al Backend.");
        } finally {
            setCargando(false);
        }
    };

    // 3. ESTADOS DEL MODAL Y FORMULARIO
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEditando, setIdEditando] = useState(null);

    // Mapeo exacto con los nombres de Java (GestionTecnicos.java)
    const [formulario, setFormulario] = useState({
        nombreTecnico: '',
        especialidad: '',
        telefono: '',
        estado: 'Activo'
    });

    const manejarInput = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    // 4. FUNCIONES CRUD
    const abrirModalCrear = () => {
        setModoEdicion(false);
        setIdEditando(null);
        setFormulario({ nombreTecnico: '', especialidad: '', telefono: '', estado: 'Activo' });
        setModalAbierto(true);
    };

    const abrirModalEditar = (t) => {
        setModoEdicion(true);
        setIdEditando(t.idTecnicos); // Nombre exacto de la base de datos
        setFormulario({
            nombreTecnico: t.nombreTecnico || '',
            especialidad: t.especialidad || '',
            telefono: t.telefono || '',
            estado: t.estado || 'Activo'
        });
        setModalAbierto(true);
    };

    const guardarTecnico = async () => {
        if (!formulario.nombreTecnico) {
            alert("El nombre completo es obligatorio.");
            return;
        }

        try {
            const metodo = modoEdicion ? 'PUT' : 'POST';
            const url = modoEdicion ? `${API_URL}/${idEditando}` : API_URL;
            
            const payload = {
                nombreTecnico: formulario.nombreTecnico,
                especialidad: formulario.especialidad,
                telefono: formulario.telefono,
                estado: formulario.estado
            };

            // En edición, por seguridad enviamos también el ID
            if (modoEdicion) {
                payload.idTecnicos = idEditando;
            }

            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await cargarTecnicos();
                setModalAbierto(false);
            } else {
                const errorTexto = await res.text();
                alert("Error al guardar el técnico en el servidor: " + errorTexto);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    };

    const eliminarTecnico = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este técnico permanentemente?")) {
            try {
                const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    cargarTecnicos();
                }
            } catch (error) {
                console.error("Error al eliminar:", error);
            }
        }
    };

    // 5. FILTRADO PARA BÚSQUEDA
    const tecnicosFiltrados = tecnicos.filter(t => {
        const busquedaNormalizada = busqueda.toLowerCase().trim();
        const nombreTexto = (t.nombreTecnico || "").toLowerCase();
        const idTexto = String(t.idTecnicos || "");
        
        return nombreTexto.includes(busquedaNormalizada) || idTexto.includes(busquedaNormalizada);
    });

    return (
        <div className="tecnicos-container">
        
            {/* --- BARRA SUPERIOR CON BÚSQUEDA --- */}
            <div className="tecnicos-header">
                <h1>TÉCNICOS</h1>
                <div className="header-acciones">
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o ID..." 
                        className="input-buscador"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <button className="btn-nuevo-tecnico" onClick={abrirModalCrear}>
                        + NUEVO TÉCNICO
                    </button>
                    <button className="btn-refrescar" onClick={cargarTecnicos} title="Actualizar Datos">🔄</button>
                </div>
            </div>

            {errorConexion && (
                <div className="error-mensaje" style={{color: 'red', textAlign: 'center', marginBottom: '10px'}}>
                    ⚠️ {errorConexion}
                </div>
            )}

            {/* --- TABLA DE DATOS --- */}
            <div className="tabla-container">
                {cargando ? (
                    <p style={{textAlign: 'center', padding: '20px'}}>Conectando con la base de datos...</p>
                ) : (
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
                            {tecnicosFiltrados.length > 0 ? (
                                tecnicosFiltrados.map((t) => (
                                    <tr key={t.idTecnicos}>
                                        {/* CORRECCIÓN CRÍTICA: Usamos los nombres exactos del Backend */}
                                        <td>{t.idTecnicos}</td>
                                        <td><strong>{t.nombreTecnico}</strong></td>
                                        <td>{t.especialidad || 'N/A'}</td>
                                        <td>{t.telefono || 'N/A'}</td>
                                        <td>
                                            <span className={`estado-pill ${t.estado === 'Activo' ? 'pill-activo' : 'pill-inactivo'}`}>
                                                {t.estado || 'Activo'}
                                            </span>
                                        </td>
                                        <td className="acciones-celda">
                                            <button className="btn-editar" title="Editar" onClick={() => abrirModalEditar(t)}>✏️</button>
                                            <button className="btn-eliminar" title="Eliminar" onClick={() => eliminarTecnico(t.idTecnicos)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{textAlign: 'center', padding: '30px'}}>
                                        No se encontraron técnicos registrados.
                                    </td>
                                </tr>
                            )}
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
                            <input type="text" name="nombreTecnico" value={formulario.nombreTecnico} onChange={manejarInput} placeholder="Ej. Ana García" />
                        </div>

                        <div className="form-grupo">
                            <label>Especialidad Principal:</label>
                            <input type="text" name="especialidad" value={formulario.especialidad} onChange={manejarInput} placeholder="Ej. Hardware, Redes..." />
                        </div>

                        <div className="form-grupo">
                            <label>Teléfono de Contacto:</label>
                            <input type="text" name="telefono" value={formulario.telefono} onChange={manejarInput} placeholder="Ej. 555-1234" />
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