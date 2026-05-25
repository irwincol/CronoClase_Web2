import React, { useState, useEffect } from 'react';
import { getLocalStorage } from "../helpers/local-storage";
import { end_points } from "../services/api";
import { Link } from "react-router-dom";
import NavBarProfesor from "../components/NavBarProfesor";
import { Footer } from "../components/Footer";
import "../styles/CardProfesor.css";

export function PanelProfesor() {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGrupoId, setExpandedGrupoId] = useState(null);

  const stored = getLocalStorage("profesor");
  let profesor = null;
  try {
    profesor = stored ? JSON.parse(stored) : null;
  } catch (e) {
    profesor = null;
  }

  useEffect(() => {
    if (profesor && profesor.id) {
      fetch(end_points.grupoProfesor(profesor.id))
        .then(res => res.json())
        .then(data => {
          setGrupos(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error al cargar grupos del profesor", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  function toggleExpand(grupoId) {
    if (expandedGrupoId === grupoId) {
      setExpandedGrupoId(null);
    } else {
      setExpandedGrupoId(grupoId);
    }
  }

  return (
    <div className="page-container">
      <NavBarProfesor />

      <main className="panel-container p-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
            Panel de Profesor
          </h1>
          <p className="text-gray-500 mb-8">
            Visualiza tus grupos asignados, el listado de estudiantes y gestiona sus evaluaciones académicas.
          </p>

          {loading ? (
            <p className="text-center text-gray-500 italic">Cargando grupos asignados...</p>
          ) : grupos.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow text-center">
              <p className="text-gray-600 font-medium mb-4">No tienes grupos asignados actualmente.</p>
              <p className="text-sm text-gray-500">Comunícate con el administrador para que te asigne grupos de clase.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {grupos.map(grupo => {
                const isExpanded = expandedGrupoId === grupo.id;
                return (
                  <div key={grupo.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-xl">
                    <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">{grupo.nombre}</h2>
                        <p className="text-sm text-indigo-600 font-medium">Clases: {grupo.dia}</p>
                      </div>
                      <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                        <button
                          className="px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-sm font-semibold rounded-lg transition-colors duration-200"
                          onClick={() => toggleExpand(grupo.id)}
                        >
                          {isExpanded ? "Ocultar Alumnos" : `Ver Alumnos (${grupo.estudiantes?.length || 0})`}
                        </button>
                        <Link
                          to="/panel-carga-actividades"
                          state={{ initialGrupoId: grupo.id }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors duration-200"
                        >
                          Cargar Actividades
                        </Link>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-6 border-t border-gray-100 bg-white">
                        <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Estudiantes Inscritos ({grupo.estudiantes?.length || 0})</h3>
                        {(!grupo.estudiantes || grupo.estudiantes.length === 0) ? (
                          <p className="text-sm text-gray-500 italic">No hay estudiantes matriculados en este grupo todavía.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2.5 font-semibold text-gray-600">Nombre</th>
                                  <th className="px-4 py-2.5 font-semibold text-gray-600">Documento ID</th>
                                  <th className="px-4 py-2.5 font-semibold text-gray-600">Correo Electrónico</th>
                                  <th className="px-4 py-2.5 font-semibold text-gray-600">Teléfono</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {grupo.estudiantes.map(estudiante => (
                                  <tr key={estudiante.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">{estudiante.nombre}</td>
                                    <td className="px-4 py-3 text-gray-500">{estudiante.documentoID}</td>
                                    <td className="px-4 py-3 text-gray-600">{estudiante.email}</td>
                                    <td className="px-4 py-3 text-gray-500">{estudiante.telefono || "N/D"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}