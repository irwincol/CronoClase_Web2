import React, { useState, useEffect } from "react";
import { getLocalStorage } from "../helpers/local-storage";
import { end_points } from "../services/api";
import { alertaGeneral } from "../helpers/alerts";
import NavBarEstudiante from "../components/NavBarEstudiante";
import { Footer } from "../components/Footer";

export default function MisEntregas() {
  const stored = getLocalStorage("estudiante");
  let estudiante = null;
  try {
    estudiante = stored ? JSON.parse(stored) : null;
  } catch (e) {
    estudiante = null;
  }

  const [grupos, setGrupos] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState({}); // grupoId -> [evaluaciones]
  const [entregas, setEntregas] = useState([]);
  const [notasFinales, setNotasFinales] = useState({}); // grupoId -> notaFinal
  const [loading, setLoading] = useState(true);

  // Estados del modal de entrega
  const [selectedEv, setSelectedEv] = useState(null);
  const [archivoUrl, setArchivoUrl] = useState("");
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!estudiante || !estudiante.id) {
      window.location.href = "/";
      return;
    }
    cargarDatos();
  }, []);

  function cargarDatos() {
    setLoading(true);
    // 1. Cargar grupos del estudiante
    fetch(end_points.grupoEstudiante(estudiante.id))
      .then((res) => res.json())
      .then((gruposData) => {
        setGrupos(gruposData);

        // 2. Cargar todas las entregas del estudiante
        const fetchEntregas = fetch(end_points.entregaEstudiante(estudiante.id)).then((r) => r.json());

        // 3. Cargar las evaluaciones de cada grupo
        const fetchEvaluaciones = gruposData.map((g) => {
          return fetch(end_points.evaluacionGrupo(g.id))
            .then((r) => r.json())
            .then((evalList) => {
              setEvaluaciones((prev) => ({
                ...prev,
                [g.id]: evalList,
              }));
            });
        });

        // 4. Cargar notas finales acumuladas de cada grupo
        const fetchNotasFinales = gruposData.map((g) => {
          return fetch(`${end_points.grupos}/${g.id}/estudiante/${estudiante.id}/nota-final`)
            .then((r) => r.json())
            .then((notaData) => {
              setNotasFinales((prev) => ({
                ...prev,
                [g.id]: notaData.notaFinal,
              }));
            })
            .catch(() => {
              setNotasFinales((prev) => ({
                ...prev,
                [g.id]: 0.0,
              }));
            });
        });

        Promise.all([fetchEntregas, ...fetchEvaluaciones, ...fetchNotasFinales])
          .then(([entregasData]) => {
            setEntregas(entregasData);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error al cargar entregas", err);
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error("Error al cargar grupos", err);
        setLoading(false);
      });
  }

  // Abrir Modal de Entrega
  function openEntregaModal(ev) {
    setSelectedEv(ev);
    const entregaPrevia = entregas.find((en) => en.evaluacionId === ev.id);
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
      return alertaGeneral("Enlace requerido", "Por favor ingresa la URL de tu entregable.", "warning");
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
        cargarDatos(); // Recargar todos los datos y notas acumuladas
      })
      .catch((err) => {
        alertaGeneral("Error", err.message, "error");
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  if (loading) {
    return (
      <div className="page-container bg-gray-50 min-h-screen">
        <NavBarEstudiante />
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-lg text-indigo-950 font-bold italic">Cargando tus actividades y calificaciones...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-container bg-gray-50 min-h-screen">
      <NavBarEstudiante />

      <main className="panel-container p-6 max-w-6xl mx-auto mt-16 flex-1">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
          Mi Historial de Actividades y Calificaciones
        </h1>
        <p className="text-gray-500 mb-8">
          Revisa el estado de todas tus actividades programadas, comentarios de profesores y tus notas acumuladas.
        </p>

        {grupos.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-600 font-medium mb-2">No estás inscrito en ningún grupo actualmente.</p>
            <p className="text-sm text-gray-500">Dirígete a tu perfil haciendo clic en tu nombre en la barra de navegación para inscribirte en materias.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {grupos.map((grupo) => {
              const evs = evaluaciones[grupo.id] || [];
              const notaFinal = notasFinales[grupo.id] != null ? notasFinales[grupo.id] : 0.0;

              return (
                <div key={grupo.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  {/* Encabezado de Materia y Nota Final */}
                  <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100 gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{grupo.nombre}</h2>
                      <p className="text-sm text-gray-500 font-medium">Clase: {grupo.dia}</p>
                    </div>
                    <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-indigo-100 w-fit">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Nota Ponderada Acumulada</span>
                      <span className={`text-2xl font-black ${notaFinal >= 3.0 ? "text-green-600" : "text-red-500"}`}>
                        {notaFinal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Cuerpo - Tabla de Actividades de la Materia */}
                  <div className="p-6 overflow-x-auto">
                    {evs.length === 0 ? (
                      <p className="text-sm text-gray-400 italic text-center py-4">No hay evaluaciones programadas para este grupo.</p>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 font-bold text-gray-600">Evaluación</th>
                            <th className="px-4 py-3 font-bold text-gray-600">Tipo</th>
                            <th className="px-4 py-3 font-bold text-gray-600">Porcentaje</th>
                            <th className="px-4 py-3 font-bold text-gray-600">Fecha Límite</th>
                            <th className="px-4 py-3 font-bold text-gray-600">Estado</th>
                            <th className="px-4 py-3 font-bold text-gray-600">Nota</th>
                            <th className="px-4 py-3 font-bold text-gray-600">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {evs.map((ev) => {
                            const en = entregas.find((e) => e.evaluacionId === ev.id);
                            return (
                              <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-4">
                                  <div className="font-semibold text-gray-900">{ev.titulo}</div>
                                  {ev.descripcion && (
                                    <div className="text-xs text-gray-400 max-w-xs truncate" title={ev.descripcion}>
                                      {ev.descripcion}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-4 uppercase font-bold text-gray-500 text-xs">{ev.tipo}</td>
                                <td className="px-4 py-4 text-gray-700 font-medium">{ev.porcentaje}%</td>
                                <td className="px-4 py-4 text-gray-600">{ev.fechaEntrega}</td>
                                <td className="px-4 py-4">
                                  <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase ${
                                    en?.estado === "CALIFICADO" ? "bg-green-100 text-green-800" :
                                    en?.estado === "TARDE" ? "bg-orange-100 text-orange-800" :
                                    en?.estado === "ENTREGADO" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                                  }`}>
                                    {en ? en.estado : "PENDIENTE"}
                                  </span>
                                  {en?.archivoUrl && (
                                    <a href={en.archivoUrl} target="_blank" rel="noreferrer" className="block text-[11px] text-indigo-600 hover:underline mt-1">
                                      Ver archivo 🔗
                                    </a>
                                  )}
                                  {en?.comentario && (
                                    <div className="text-[10px] text-gray-400 italic max-w-xs truncate" title={en.comentario}>
                                      "{en.comentario}"
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-4 font-black text-gray-800">
                                  {en?.nota != null ? en.nota.toFixed(1) : "-"}
                                </td>
                                <td className="px-4 py-4">
                                  <button
                                    onClick={() => openEntregaModal(ev)}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded text-xs transition"
                                  >
                                    {en ? "Sobrescribir" : "Entregar"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

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

            <form onSubmit={handleEnviarEntrega} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Enlace del entregable (Drive, GitHub, etc.) *</label>
                <input
                  type="url"
                  className="w-full h-10 border border-gray-300 px-3 rounded-lg text-xs bg-white"
                  placeholder="https://example.com/mi-entregable"
                  value={archivoUrl}
                  onChange={(e) => setArchivoUrl(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Comentario para el profesor</label>
                <textarea
                  className="w-full border border-gray-300 p-3 rounded-lg text-xs h-16 resize-none bg-white"
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

      <Footer />
    </div>
  );
}
