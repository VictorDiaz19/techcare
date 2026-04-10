import React, { useState } from 'react';
import './Reparaciones.css';

function Reparaciones() {
    // 1. ESTADO DE LA TABLA
    const [ordenes, setOrdenes] = useState([
        { folio: 1024, fecha: '08/03/2026 10:30', equipo: 'HP Pavilion', problema: 'No enciende', estado: 'En proceso', costo: 0 },
        { folio: 1025, fecha: '08/03/2026 11:15', equipo: 'iPhone 13 Pro', problema: 'Pantalla rota', estado: 'En espera', costo: 0 },
        { folio: 1026, fecha: '08/03/2026 16:40', equipo: 'Dell Inspiron', problema: 'Lento', estado: 'Terminado', costo: 0 }
    ]);

    // 2. ESTADOS DEL MODAL
    const [modalAbierto, setModalAbierto] = useState(false);
    
    // NUEVO: Saber si estamos editando o creando
    const [modoEdicion, setModoEdicion] = useState(false); 
    // NUEVO: Guardar el ID de la orden que estamos editando
    const [ordenEditandoId, setOrdenEditandoId] = useState(null); 

    // 3. ESTADO DEL FORMULARIO
    const [formulario, setFormulario] = useState({
        equipo: '',
        problema: ''
    });

    const manejarInput = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    };

    // 4. FUNCIONES PARA ABRIR EL MODAL CORRECTAMENTE
    const abrirModalCrear = () => {
        setModoEdicion(false); // Le decimos que es un registro nuevo
        setOrdenEditandoId(null);
        setFormulario({ equipo: '', problema: '' }); // Limpiamos inputs
        setModalAbierto(true);
    };

    const abrirModalEditar = (orden) => {
        setModoEdicion(true); // Le decimos que vamos a editar
        setOrdenEditandoId(orden.folio); // Guardamos qué folio vamos a alterar
        setFormulario({ equipo: orden.equipo, problema: orden.problema }); // Llenamos los inputs
        setModalAbierto(true);
    };

    // 5. FUNCIÓN PARA ELIMINAR (Con confirmación de seguridad)
    const eliminarOrden = (folio) => {
        // window.confirm saca una alerta nativa del navegador para evitar clics por accidente
        const confirmar = window.confirm("¿Estás seguro de que deseas cancelar/eliminar esta orden?");
        if (confirmar) {
        // Filtramos: "Quédate con todas las órdenes, EXCEPTO la que tenga este folio"
        const nuevasOrdenes = ordenes.filter(orden => orden.folio !== folio);
        setOrdenes(nuevasOrdenes);
        }
    };

    // 6. FUNCIÓN MEJORADA PARA GUARDAR (Sirve para Crear y Editar)
    const guardarOrden = () => {
        
        if (modoEdicion) {
        // SI ESTAMOS EDITANDO: 
        // Recorremos la lista. Si el folio coincide, le cambiamos los datos. Si no, lo dejamos igual.
        const ordenesActualizadas = ordenes.map(orden => {
            if (orden.folio === ordenEditandoId) {
            return { ...orden, equipo: formulario.equipo, problema: formulario.problema };
            }
            return orden;
        });
        setOrdenes(ordenesActualizadas);
        
        } else {
        // SI ES NUEVA ORDEN (Lo que ya teníamos):
        const nuevaOrden = {
            folio: Math.floor(Math.random() * 9000) + 1000,
            fecha: new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }),
            equipo: formulario.equipo,
            problema: formulario.problema,
            estado: 'En proceso',
            costo: 0
        };
        setOrdenes([nuevaOrden, ...ordenes]);
        }

        // Al final, cerramos y limpiamos
        setFormulario({ equipo: '', problema: '' });
        setModalAbierto(false);
    };

    const obtenerClaseEstado = (estado) => {
        switch(estado) {
        case 'En proceso': return 'pill-amarillo';
        case 'En espera': return 'pill-rojo';
        case 'Terminado': return 'pill-verde';
        default: return 'pill-gris';
        }
    };

    return (
        <div className="reparaciones-container">
        
        <div className="reparaciones-header">
            <h1>ÓRDENES DE REPARACIÓN</h1>
            <div className="header-acciones">
            <input type="text" placeholder="Buscar por folio..." className="input-buscador"/>
            {/* Cambiamos el onClick para usar nuestra nueva función */}
            <button className="btn-nueva-orden" onClick={abrirModalCrear}>
                + NUEVA ORDEN
            </button>
            </div>
        </div>

        <div className="tabla-contenedor">
            <table className="tabla-reparaciones">
            <thead>
                <tr>
                <th>ID (Folio)</th>
                <th>Fecha Entrada</th>
                <th>Equipo</th>
                <th>Problema</th>
                <th>Estado Actual</th>
                <th>Costo Total</th>
                <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {ordenes.map((orden) => (
                <tr key={orden.folio}>
                    <td>{orden.folio}</td>
                    <td>{orden.fecha}</td>
                    <td>{orden.equipo}</td>
                    <td>{orden.problema}</td>
                    <td><span className={`estado-pill ${obtenerClaseEstado(orden.estado)}`}>{orden.estado}</span></td>
                    <td>${orden.costo.toFixed(2)}</td>
                    
                    {/* NUEVA COLUMNA DE ACCIONES */}
                    <td className="acciones-celda">
                    <button className="btn-ver-detalles" title="Ver Detalles">👁️</button>
                    {/* Botón de Editar le pasamos TODA la orden para que llene el formulario */}
                    <button className="btn-editar" title="Editar" onClick={() => abrirModalEditar(orden)}>✏️</button>
                    {/* Botón de Eliminar le pasamos solo el folio para buscarlo y borrarlo */}
                    <button className="btn-eliminar" title="Eliminar" onClick={() => eliminarOrden(orden.folio)}>🗑️</button>
                    </td>

                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {modalAbierto && (
            <div className="modal-overlay">
            <div className="modal-content">
                {/* El título cambia mágicamente dependiendo de la acción */}
                <h2>{modoEdicion ? 'EDITAR ORDEN' : 'NUEVA ORDEN DE REPARACIÓN'}</h2>
                
                <div className="form-grupo">
                <label>Equipo (Marca y Modelo):</label>
                <input 
                    type="text" 
                    name="equipo" 
                    value={formulario.equipo} 
                    onChange={manejarInput} 
                    placeholder="Ej. Laptop HP Pavilion"
                />
                </div>

                <div className="form-grupo">
                <label>Problema reportado:</label>
                <input 
                    type="text" 
                    name="problema" 
                    value={formulario.problema} 
                    onChange={manejarInput} 
                    placeholder="Ej. No enciende la pantalla"
                />
                </div>

                <div className="modal-botones">
                <button className="btn-guardar" onClick={guardarOrden}>
                    {modoEdicion ? 'Actualizar Cambios' : 'Guardar Orden'}
                </button>
                <button className="btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
                </div>
            </div>
            </div>
        )}

        </div>
    );
    }

    export default Reparaciones;