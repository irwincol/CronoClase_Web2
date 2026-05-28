import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLocalStorage } from "../helpers/local-storage";
import { end_points } from "../services/api";
import { alertaGeneral, redirectAlert } from "../helpers/alerts";
import NavBarProfesor from "../components/NavBarProfesor";
import { Footer } from "../components/Footer";
import Swal from "sweetalert2";
import "../styles/PanelCargaActividades.css";

export function PanelCargaActividades() {
  const location = useLocation();
  const initialGrupoId = location.state?.initialGrupoId || '';

  const stored = getLocalStorage("profesor");
  let profesor = null;
  try {
    profesor = stored ? JSON.parse(stored) : null;
  } catch (e) {
    profesor = null;
  }

  const [grupos, setGrupos] = useState([]);
  const [selectedGrupoId, setSelectedGrupoId] = useState(initialGrupoId);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [entregas, setEntregas] = useState({}); // Mapea evaluacionId -> lista de entregas

  // Estados del Formulario de Crear/Editar Evaluación
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('TALLER');
  const [porcentaje, setPorcentaje] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');

  // Estado de edición
  const [editingEvaluacion, setEditingEvaluacion] = useState(null);

  // Estados de Calificaciones
  const [calificacionesTmp, setCalificacionesTmp] = useState({}); // Mapea entregaId -> valor de nota

  // 1. Cargar grupos del profesor
  useEffect(() => {
    if (profesor && profesor.id) {
      fetch(end_points.grupoProfesor(profesor.id))
        .then(res => res.json())
        .then(data => {
          setGrupos(data);
          if (!selectedGrupoId && data.length > 0) {
            setSelectedGrupoId(data[0].id);
          }
        })
        .catch(err => console.error("Error al cargar grupos", err));
    }
  }, []);

  // 2. Cargar evaluaciones del grupo seleccionado
  useEffect(() => {
    if (selectedGrupoId) {
      cargarEvaluacionesYEntregas(selectedGrupoId);
      cancelarEdicion();
    } else {
      setEvaluaciones([]);
      setEntregas({});
      cancelarEdicion();
    }
  }, [selectedGrupoId]);

  function cargarEvaluacionesYEntregas(grupoId) {
    fetch(end_points.evaluacionGrupo(grupoId))
      .then(res => res.json())
      .then(data => {
        setEvaluaciones(data);
        // Para cada evaluación, cargar sus entregas
        data.forEach(ev => {
          fetch(end_points.entregaEvaluacion(ev.id))
            .then(r => r.json())
            .then(entList => {
              setEntregas(prev => ({
                ...prev,
                [ev.id]: entList
              }));
            })
            .catch(e => console.error(`Error al cargar entregas de evaluacion ${ev.id}`, e));
        });
      })
      .catch(err => console.error("Error al cargar evaluaciones", err));
  }

  // 3. Crear o Editar Evaluación
  function handleCrearEvaluacion(e) {
    e.preventDefault();

    if (!titulo || !porcentaje || !fechaEntrega) {
      return alertaGeneral("Campos requeridos", "Por favor completa el título, porcentaje y fecha límite.", "warning");
    }

    const pct = parseFloat(porcentaje);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      return alertaGeneral("Porcentaje inválido", "El porcentaje debe ser un número entre 0 y 100.", "warning");
    }

    // Validar suma acumulada excluyendo la evaluación actual si es edición
    const sumaOtros = evaluaciones
      .filter(ev => !editingEvaluacion || ev.id !== editingEvaluacion.id)
      .reduce((sum, ev) => sum + ev.porcentaje, 0);

    if (sumaOtros + pct > 100.0) {
      return alertaGeneral(
        "Límite Excedido",
        `La suma de porcentajes del grupo no puede superar el 100%. Las otras evaluaciones suman: ${sumaOtros}%. Intentas asignar: ${pct}%. Total: ${sumaOtros + pct}%.`,
        "warning"
      );
    }

    const payload = {
      titulo,
      descripcion,
      tipo,
      porcentaje: pct,
      fechaEntrega,
      grupoId: parseInt(selectedGrupoId)
    };

    const url = editingEvaluacion 
      ? end_points.evaluacionId(editingEvaluacion.id) 
      : end_points.evaluaciones;

    const method = editingEvaluacion ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.message || "Error al procesar la evaluación"); });
        }
        return res.json();
      })
      .then(() => {
        alertaGeneral(
          "Éxito", 
          editingEvaluacion ? "Evaluación actualizada correctamente." : "Evaluación académica creada correctamente.", 
          "success"
        );
        cancelarEdicion();
        cargarEvaluacionesYEntregas(selectedGrupoId);
      })
      .catch(err => {
        alertaGeneral("Error", err.message, "error");
      });
  }

  // Activar modo edición
  function iniciarEdicion(ev) {
    setEditingEvaluacion(ev);
    setTitulo(ev.titulo);
    setDescripcion(ev.descripcion || '');
    setTipo(ev.tipo);
    setPorcentaje(ev.porcentaje.toString());
    setFechaEntrega(ev.fechaEntrega);

    // Scroll suave hasta el formulario
    const formElement = document.getElementById("formulario-evaluacion-box");
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Cancelar modo edición
  function cancelarEdicion() {
    setEditingEvaluacion(null);
    setTitulo('');
    setDescripcion('');
    setTipo('TALLER');
    setPorcentaje('');
    setFechaEntrega('');
  }

  // 4. Eliminar Evaluación
  function handleEliminarEvaluacion(evalId) {
    Swal.fire({
      title: '¿Eliminar evaluación?',
      text: '¿Estás seguro de que deseas eliminar esta evaluación? También se borrarán todas las entregas asociadas de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#493d9e',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(end_points.evaluacionId(evalId), {
          method: 'DELETE'
        })
          .then(res => {
            if (!res.ok) throw new Error("Error al eliminar evaluación");
            alertaGeneral("Eliminado", "La evaluación ha sido eliminada.", "success");
            if (editingEvaluacion && editingEvaluacion.id === evalId) {
              cancelarEdicion();
            }
            cargarEvaluacionesYEntregas(selectedGrupoId);
          })
          .catch(err => alertaGeneral("Error", err.message, "error"));
      }
    });
  }

  // 5. Calificar Entrega (vía JSON Body)
  function handleCalificarEntrega(e, entregaId, evaluacionId) {
    e.preventDefault();
    const nota = parseFloat(calificacionesTmp[entregaId]);

    if (isNaN(nota) || nota < 0.0 || nota > 5.0) {
      return alertaGeneral("Nota inválida", "La calificación debe ser un valor decimal entre 0.0 y 5.0.", "warning");
    }

    fetch(end_points.entregaCalificar(entregaId), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nota })
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al calificar entrega");
        return res.json();
      })
      .then(() => {
        alertaGeneral("Calificado", "La nota se ha guardado correctamente.", "success");
        // Recargar entregas
        fetch(end_points.entregaEvaluacion(evaluacionId))
          .then(r => r.json())
          .then(entList => {
            setEntregas(prev => ({
              ...prev,
              [evaluacionId]: entList
            }));
          });
      })
      .catch(err => alertaGeneral("Error", err.message, "error"));
  }

  return (
    <div className="page-container bg-gray-50 min-h-screen">
      <NavBarProfesor />

      <main className="panel-container p-6 max-w-6xl mx-auto mt-16">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Carga y Calificación de Actividades
        </h1>
        <p className="text-base text-gray-500 mb-8">
          Crea y edita tareas/exámenes para tus estudiantes y califica los archivos entregados.
        </p>

        {/* 1. Seleccionar Grupo */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
          <label className="block text-base font-bold text-gray-700 mb-2">Selecciona un Grupo de Clase:</label>
          <select
            className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:border-indigo-500 bg-white"
            value={selectedGrupoId}
            onChange={(e) => setSelectedGrupoId(e.target.value)}
          >
            <option value="">-- Elige un grupo --</option>
            {grupos.map(g => (
              <option key={g.id} value={g.id}>{g.nombre} ({g.dia})</option>
            ))}
          </select>
        </div>

        {selectedGrupoId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario de Carga/Edición (Columna Izquierda) */}
            <div id="formulario-evaluacion-box" className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-fit">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                {editingEvaluacion ? "✏️ Editar Evaluación" : "Nueva Evaluación"}
              </h2>
              <form onSubmit={handleCrearEvaluacion} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Título de la actividad *</label>
                  <input
                    type="text"
                    className="w-full h-10 border border-gray-300 px-3 rounded-lg text-sm bg-white"
                    placeholder="Ej. Parcial 1"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Tipo de Actividad *</label>
                  <select
                    className="w-full h-10 border border-gray-300 px-3 rounded-lg text-sm bg-white"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                  >
                    <option value="TAREA">Tarea</option>
                    <option value="PARCIAL">Parcial</option>
                    <option value="QUIZ">Quiz</option>
                    <option value="PROYECTO">Proyecto</option>
                    <option value="TALLER">Taller</option>
                    <option value="EXAMEN_FINAL">Examen Final</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Porcentaje de Nota *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full h-10 border border-gray-300 px-3 rounded-lg text-sm bg-white"
                    placeholder="Ej. 25"
                    value={porcentaje}
                    onChange={(e) => setPorcentaje(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Fecha de Entrega Límite *</label>
                  <input
                    type="date"
                    className="w-full h-10 border border-gray-300 px-3 rounded-lg text-sm bg-white"
                    value={fechaEntrega}
                    onChange={(e) => setFechaEntrega(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Instrucciones o Descripción</label>
                  <textarea
                    className="w-full border border-gray-300 p-3 rounded-lg text-sm h-20 resize-none bg-white"
                    placeholder="Describe los requerimientos..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm shadow-sm transition"
                  >
                    {editingEvaluacion ? "Guardar Cambios" : "Asignar a Grupo"}
                  </button>
                  {editingEvaluacion && (
                    <button
                      type="button"
                      onClick={cancelarEdicion}
                      className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg text-sm transition"
                    >
                      Cancelar Edición
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Listado de Evaluaciones y Calificaciones (Columna Derecha) */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Evaluaciones Cargadas ({evaluaciones.length})</h2>

              {evaluaciones.length === 0 ? (
                <p className="text-gray-500 italic text-center py-8 bg-white rounded-xl shadow text-base">No hay evaluaciones programadas para este grupo.</p>
              ) : (
                evaluaciones.map(ev => {
                  const items = entregas[ev.id] || [];
                  return (
                    <div key={ev.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-4">
                      <div className="flex justify-between items-start border-b pb-3">
                        <div>
                          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded text-xs uppercase">{ev.tipo}</span>
                          <h3 className="text-xl font-bold text-gray-800 mt-1">{ev.titulo}</h3>
                          <p className="text-sm text-gray-500">Valor: <b className="text-indigo-600">{ev.porcentaje}%</b> | Fecha Límite: <b>{ev.fechaEntrega}</b></p>
                          {ev.descripcion && <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2.5 rounded-lg">{ev.descripcion}</p>}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition text-base"
                            onClick={() => iniciarEdicion(ev)}
                            title="Editar Actividad"
                          >
                            ✏️
                          </button>
                          <button
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition text-base"
                            onClick={() => handleEliminarEvaluacion(ev.id)}
                            title="Eliminar Actividad"
                          >
                            ❌
                          </button>
                        </div>
                      </div>

                      {/* Sección de Entregas Recibidas */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Entregas de Estudiantes ({items.length})</h4>
                        {items.length === 0 ? (
                          <p className="text-sm text-gray-400 italic">Ningún estudiante ha subido esta entrega aún.</p>
                        ) : (
                          <div className="space-y-3">
                            {items.map(en => (
                              <div key={en.id} className="p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-gray-800 text-base">{en.estudianteNombre}</span>
                                    <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase ${
                                      en.estado === 'CALIFICADO' ? 'bg-green-100 text-green-800' :
                                      en.estado === 'TARDE' ? 'bg-orange-100 text-orange-800' :
                                      en.estado === 'ENTREGADO' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}>{en.estado}</span>
                                  </div>
                                  {en.archivoUrl && (
                                    <p className="mt-1 text-sm">
                                      Archivo: <a href={en.archivoUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:underline">Ver Entregable 🔗</a>
                                    </p>
                                  )}
                                  {en.comentario && <p className="text-gray-500 italic mt-1 text-xs">"{en.comentario}"</p>}
                                </div>

                                {/* Formulario para colocar nota */}
                                <form onSubmit={(e) => handleCalificarEntrega(e, en.id, ev.id)} className="flex items-center bg-white rounded-lg border border-gray-300 overflow-hidden flex-shrink-0">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    placeholder="Nota"
                                    className="w-14 h-8 text-center border-0 focus:ring-0 font-semibold text-gray-800 bg-transparent text-xs"
                                    defaultValue={en.nota != null ? en.nota : ''}
                                    onChange={(e) => setCalificacionesTmp(prev => ({
                                      ...prev,
                                      [en.id]: e.target.value
                                    }))}
                                    required
                                  />
                                  <button
                                    type="submit"
                                    className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition text-sm leading-none"
                                  >
                                    ✓
                                  </button>
                                </form>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}