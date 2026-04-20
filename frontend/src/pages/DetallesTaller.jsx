import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DetallesTaller.css';

function DetallesTaller() {
    // ACTIVAMOS EL NAVEGADOR
    const navigate = useNavigate();

    // 1. DATOS DEL FOLIO (Datos simulados de lo que pasaría en la pantalla de reparaciones)
    const folioActual = {
        id: 1024,
        cliente: 'Victor Diaz',
        equipo: 'Laptop HP Pavilon x360',
        serie: 'SN123456789',
        diagnosticoInicial: 'No enciende, posible falla en centro de carga o tarjeta madre.',
        estadoActual: 'En proceso'
    };

    // 2. INVENTARIO DISPONIBLE (Simulando consulta para el buscador de refacciones)
    const inventarioDisp = [
        { id: 4001, nombre: 'Batería Laptop HP', precio: 1200, stock: 5 },
        { id: 4002, nombre: 'Ventilador', precio: 350, stock: 12 },
        { id: 4005, nombre: 'Centro de Carga Tipo C', precio: 250, stock: 8 }
    ];

    // 3. ESTADOS DEL TALLER
    const [diagnosticoFinal, setDiagnosticoFinal] = useState('');
    const [actividades, setActividades] = useState('');

    // Refacciones seleccionadas para esta reparación
    const [refaccionesUsadas, setRefaccionesUsadas] = useState([
        { id: 4001, nombre: 'Batería Laptop HP', cantidad: 1, precioU: 1200 },
        { id: 4002, nombre: 'Ventilador', cantidad: 2, precioU: 350 }
    ]);

    const [busquedaRefaccion, setBusquedaRefaccion] = useState('');
    const [nuevoEstado, setNuevoEstado] = useState('Amarillo'); // Rojo, Amarillo, Verde

    // 4. FUNCIONES DE INTERACCIÓN
    const agregarRefaccion = (item) => {
        // Verificamos si ya está en la lista para sumarle 1 a la cantidad
        const existe = refaccionesUsadas.find(r => r.id === item.id);
        if (existe) {
            setRefaccionesUsadas(refaccionesUsadas.map(r =>
                r.id === item.id ? { ...r, cantidad: r.cantidad + 1 } : r
            ));
        } else {
            setRefaccionesUsadas([...refaccionesUsadas, { ...item, cantidad: 1, precioU: item.precio }]);
        }
        setBusquedaRefaccion(''); // Limpiamos buscador
    };

    const quitarRefaccion = (id) => {
        setRefaccionesUsadas(refaccionesUsadas.filter(r => r.id !== id));
    };

    const guardarDetalles = () => {
        alert(`¡Reparación del Folio #${folioActual.id} actualizada con éxito!\nEstado guardado: ${nuevoEstado}`);
        // Aquí va la logica para mandarlo a la base de datos
    };

    // Filtro de búsqueda para el mini-inventario
    const resultadosBusqueda = inventarioDisp.filter(item =>
        item.nombre.toLowerCase().includes(busquedaRefaccion.toLowerCase())
    );

    return (
        <div className="detalles-container">

            <div className="detalles-header">
                <h1>DETALLE / TALLER (Actualizar Reaparación)</h1>
            </div>

            <div className="taller-grid">

                {/* COLUMNA IZQUIERDA: Info fija del equipo */}
                <div className="taller-info-tarjeta">
                    <div className="info-cabecera">
                        <h2>Detalle de Reaparación - FOLIO #{folioActual.id}</h2>
                    </div>

                    <div className="info-datos">
                        <div className="dato-fila">
                            <strong>Cliente:</strong> <span>{folioActual.cliente}</span>
                        </div>
                        <div className="dato-fila">
                            <strong>Equipo:</strong> <span>{folioActual.equipo}</span>
                        </div>
                        <div className="dato-fila">
                            <strong>Número de serie:</strong> <span>{folioActual.serie}</span>
                        </div>
                        <div className="dato-fila diagnostico-ini">
                            <strong>Diagnóstico Inicial:</strong>
                            <p>{folioActual.diagnosticoInicial}</p>
                        </div>

                        <div className="semaforo-actual">
                            <div className="bolitas-semaforo">
                                <span className="bolita roja"></span>
                                <span className="bolita amarilla activa"></span>
                                <span className="bolita verde"></span>
                            </div>
                            <span className="estado-texto">Urgente / Retrasado 🛠️</span>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: Zona de Trabajo del Técnico */}
                <div className="taller-zona-trabajo">

                    {/* Cuadro 1: Diagnóstico Final */}
                    <div className="cuadro-trabajo">
                        <h3>Diagnóstico Técnico Final 🛠️</h3>
                        <textarea
                            placeholder="Ingresa la evaluación técnica detallada aquí..."
                            value={diagnosticoFinal}
                            onChange={(e) => setDiagnosticoFinal(e.target.value)}
                        />
                    </div>

                    {/* Cuadro 2: Buscador de Refacciones */}
                    <div className="cuadro-trabajo">
                        <h3>Uso de Refacciones 📦</h3>

                        <div className="buscador-mini">
                            <span>🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar refacción..."
                                value={busquedaRefaccion}
                                onChange={(e) => setBusquedaRefaccion(e.target.value)}
                            />
                        </div>

                        {/* Solo mostramos resultados si el usuario escribió algo */}
                        {busquedaRefaccion && (
                            <div className="resultados-mini">
                                {resultadosBusqueda.map(item => (
                                    <div key={item.id} className="item-resultado" onClick={() => agregarRefaccion(item)}>
                                        {item.nombre} - ${item.precio} <span className="sumar">+</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Lista de lo que ya se entregó */}
                        <div className="lista-usadas">
                            {refaccionesUsadas.map(item => (
                                <div key={item.id} className="item-usado">
                                    <span>{item.cantidad}x {item.nombre} (${item.precioU})</span>
                                    <button onClick={() => quitarRefaccion(item.id)}>❌</button>
                                </div>
                            ))}
                            {setRefaccionesUsadas.length === 0 && <p className="texto-vacio">Sin refacciones asignadas</p>}
                        </div>
                    </div>

                    {/* Cuadro 3: Actividades */}
                    <div className="cuadro-trabajo">
                        <h3>Actividades realizadas 🛠️</h3>
                        <textarea
                            placeholder="Ej. Limpieza Interna, Cambio de Pasta..."
                            value={actividades}
                            onChange={(e) => setActividades(e.target.value)}
                        />
                    </div>

                    {/* Cuadro 4: Guardar y Semáforo */}
                    <div className="cuadro-trabajo panel-guardar">
                        <h3>Actualización de Estado 🚦</h3>

                        <div className="selector-semaforo">
                            <button
                                className={`btn-luz roja ${nuevoEstado === 'Rojo' ? 'seleccionado' : ''}`}
                                onClick={() => setNuevoEstado('Rojo')}
                            ></button>
                            <button 
                                className={`btn-luz amarilla ${nuevoEstado === 'Amarillo' ? 'seleccionado' : ''}`}
                                onClick={() => setNuevoEstado('Amarillo')}
                            ></button>
                            <button 
                                className={`btn-luz verde ${nuevoEstado === 'Verde' ? 'seleccionado' : ''}`}
                                onClick={() => setNuevoEstado('Verde')}
                            ></button>
                        </div>

                        <div className="texto-semaforo-cambio">
                            <p>Actual: <strong style={{color: '#eab308'}}>En proceso</strong></p>
                            <p>Actualizar a: <strong>{nuevoEstado}</strong></p>
                        </div>

                        <div className="botones-accion-taller">
                            <button className="btn-guardar-taller" onClick={guardarDetalles}>Guardar Cambios</button>
                            <button className="btn-cancelar-taller" onClick={() => navigate(-1)}>Cancelar</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default DetallesTaller;