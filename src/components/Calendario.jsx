import React, { useState, useEffect } from "react";
import { getLocalStorage } from "../helpers/local-storage";
import { end_points } from "../services/api";
import { alertaGeneral } from "../helpers/alerts";
import "../styles/StyleCalendarStudents.css";

export function Calendario() {
  const stored = getLocalStorage("estudiante");
  let estudiante = null;
  try {
    estudiante = stored ? JSON.parse(stored) : null;
  } catch (e) {
    estudiante = null;
  }

  const [grupos, setGrupos] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState({}); // Mapea grupoId -> lista de evaluaciones
  const [entregasEstudiante, setEntregasEstudiante] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado del Modal de Entrega
  const [selectedEv, setSelectedEv] = useState(null);
  const [archivoUrl, setArchivoUrl] = useState("");
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 1. Calcular días de la semana actual (Lunes a Viernes)
  const weekDays = getDaysOfCurrentWeek();
  const currentMonthName = getMonthName(new Date());

  useEffect(() => {
    if (estudiante && estudiante.id) {
      cargarCalendario();
    } else {
      setLoading(false);
    }
  }, []);

  function cargarCalendario() {
    setLoading(true);
    // Cargar grupos del estudiante
    fetch(end_points.grupoEstudiante(estudiante.id))
      .then((res) => res.json())
      .then((gruposData) => {
        setGrupos(gruposData);

        // Cargar entregas del estudiante para ver estados
        fetch(end_points.entregaEstudiante(estudiante.id))
          .then((r) => r.json())
          .then((entregasData) => {
            setEntregasEstudiante(entregasData);
          });

        // Cargar las evaluaciones de cada grupo
        const evalPromises = gruposData.map((g) => {
          return fetch(end_points.evaluacionGrupo(g.id))
            .then((r) => r.json())
            .then((evalList) => {
              setEvaluaciones((prev) => ({
                ...prev,
                [g.id]: evalList,
              }));
            });
        });

        Promise.all(evalPromises).then(() => {
          setLoading(false);
        });
      })
      .catch((err) => {
        console.error("Error al cargar calendario estudiantil", err);
        setLoading(false);
      });
  }

  // Helper para ver si hay una evaluación de un grupo en un día específico
  function getEvaluacionForDay(grupoId, dateString) {
    const evList = evaluaciones[grupoId] || [];
    return evList.find((ev) => ev.fechaEntrega === dateString);
  }

  // Abrir Modal de Entrega
  function openEntregaModal(ev) {
    setSelectedEv(ev);
    // Ver si el estudiante ya tiene una entrega previa para esta evaluación
    const entregaPrevia = entregasEstudiante.find((en) => en.evaluacionId === ev.id);
    if (entregaPrevia) {
      setArchivoUrl(entregaPrevia.archivoUrl || "");
      setComentario(entregaPrevia.comentario || "");
    } else {
      setArchivoUrl("");
      setComentario("");
    }
  }

  // Enviar Entrega
  function handleEnviarEntrega(e) {
    e.preventDefault();
    if (!archivoUrl) {
      return alertaGeneral("Enlace requerido", "Por favor ingresa la URL de tu entregable (GitHub, Drive, etc.).", "warning");
    }

    setSubmitting(true);
    const payload = {
      archivoUrl,
      comentario,
      estudianteId: estudiante.id,
      evaluacionId: selectedEv.id,
    };

    fetch(end_points.entregas, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al enviar la entrega");
        return res.json();
      })
      .then(() => {
        alertaGeneral("Entrega Enviada", "Tu trabajo se ha subido/sobrescrito con éxito.", "success");
        setSelectedEv(null);
        cargarCalendario(); // Recargar datos
      })
      .catch((err) => {
        alertaGeneral("Error", err.message, "error");
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  if (loading) {
    return <p className="text-center text-gray-500 italic py-10">Cargando tu calendario semanal...</p>;
  }

  return (
    <div className="mainCalendar w-[95%] max-w-6xl mx-auto p-4 bg-white rounded-xl shadow-lg border">
      {/* Header del Calendario */}
      <div className="diaCal mesCal font-bold text-[#493d9e]">
        <h2>{currentMonthName}</h2>
      </div>

      {weekDays.map((day) => (
        <div key={day.dateString} className="diaCal font-semibold text-gray-700">
          <h2>{day.name}</h2>
        </div>
      ))}

      {/* Renglones Dinámicos para cada materia/grupo */}
      {grupos.length === 0 ? (
        <div className="col-span-6 p-6 text-center text-gray-400 italic bg-gray-50 rounded-lg">
          No estás matriculado en ninguna materia actualmente.
        </div>
      ) : (
        grupos.map((grupo) => {
          return (
            <React.Fragment key={grupo.id}>
              {/* Celda del Grupo */}
              <div className="matCal font-bold bg-indigo-50 border-r border-indigo-100 flex items-center justify-center p-2 text-center text-xs truncate" title={grupo.nombre}>
                <h2>{grupo.nombre.length > 20 ? grupo.nombre.substring(0, 18) + "..." : grupo.nombre}</h2>
              </div>

              {/* Celdas para cada día de la semana */}
              {weekDays.map((day) => {
                const ev = getEvaluacionForDay(grupo.id, day.dateString);
                const entrega = ev ? entregasEstudiante.find((en) => en.evaluacionId === ev.id) : null;

                return (
                  <div key={day.dateString} className="cellCal flex items-center justify-center p-1 relative border hover:bg-indigo-50/20 transition-all">
                    {ev && (
                      <button
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-base transition shadow-sm hover:scale-110 cursor-pointer ${
                          entrega?.estado === 'CALIFICADO' ? 'bg-green-100 hover:bg-green-200 border border-green-300 text-green-800' :
                          entrega?.estado === 'TARDE' ? 'bg-orange-100 hover:bg-orange-200 border border-orange-300 text-orange-850' :
                          entrega?.estado === 'ENTREGADO' ? 'bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-800' :
                          'bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 text-yellow-800 animate-pulse'
                        }`}
                        onClick={() => openEntregaModal(ev)}
                        title={`${ev.tipo}: ${ev.titulo} (${ev.porcentaje}%) — ${entrega ? `Estado: ${entrega.estado}` : 'Pendiente 📝'}`}
                      >
                        {entrega?.estado === 'CALIFICADO' ? '✅' :
                         entrega?.estado === 'TARDE' ? '⚠️' :
                         entrega?.estado === 'ENTREGADO' ? '📥' : '📝'}
                      </button>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })
      )}

      {/* Modal de Detalle de Evaluación y Subida de Entrega */}
      {selectedEv && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded text-xxs uppercase">{selectedEv.tipo}</span>
              <button
                className="p-1 hover:bg-gray-100 rounded text-gray-500 font-bold"
                onClick={() => setSelectedEv(null)}
              >
                ✕
              </button>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-1">{selectedEv.titulo}</h3>
            <p className="text-xs text-gray-500 mb-4">Valor: <b>{selectedEv.porcentaje}%</b> | Fecha Límite: <b>{selectedEv.fechaEntrega}</b></p>

            {selectedEv.descripcion && (
              <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-600 mb-5">
                <h4 className="font-bold text-gray-700 text-xs mb-1">Instrucciones:</h4>
                <p className="italic">"{selectedEv.descripcion}"</p>
              </div>
            )}

            {/* Ver estado de entrega previa si existe */}
            {(() => {
              const prev = entregasEstudiante.find(en => en.evaluacionId === selectedEv.id);
              if (prev) {
                return (
                  <div className="mb-5 p-3 rounded-lg border border-green-200 bg-green-50 text-xs">
                    <h4 className="font-bold text-green-800 mb-1">Subido anteriormente</h4>
                    <p className="text-green-700">Estado: <b>{prev.estado}</b></p>
                    {prev.nota != null && <p className="text-green-800 text-sm mt-1">Calificación asignada: <b>{prev.nota.toFixed(1)} / 5.0</b></p>}
                  </div>
                );
              }
              return null;
            })()}

            <form onSubmit={handleEnviarEntrega} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Enlace del entregable (Drive, GitHub, etc.) *</label>
                <input
                  type="url"
                  className="w-full h-10 border border-gray-300 px-3 rounded-lg text-xs"
                  placeholder="https://example.com/mi-entregable"
                  value={archivoUrl}
                  onChange={(e) => setArchivoUrl(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Comentario para el profesor</label>
                <textarea
                  className="w-full border border-gray-300 p-3 rounded-lg text-xs h-16 resize-none"
                  placeholder="Comentarios adicionales..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  className="w-1/2 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg text-xs transition"
                  onClick={() => setSelectedEv(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 bg-[#493d9e] hover:bg-[#322880] text-white font-bold rounded-lg text-xs shadow transition disabled:opacity-55"
                >
                  {submitting ? "Enviando..." : "Enviar Entrega"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers de fechas del calendario ────────────────────────────────────────

function getDaysOfCurrentWeek() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const mondayDiff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Ajustar si es Domingo

  const weekDays = [];
  const dayNames = ["Lu", "Ma", "Mi", "Ju", "Vi"];

  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayDiff + i);
    // Formato exacto YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    weekDays.push({
      name: `${d.getDate()} ${dayNames[i]}`,
      dateString: dateStr,
    });
  }
  return weekDays;
}

function getMonthName(date) {
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return monthNames[date.getMonth()];
}