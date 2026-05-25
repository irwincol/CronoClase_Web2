import React, { useState, useEffect } from 'react';
import { end_points } from '../services/api';
import { alertaGeneral, redirectAlert } from '../helpers/alerts';
import { getLocalStorage, saveLocalStorage } from '../helpers/local-storage';
import NavBarEstudiante from '../components/NavBarEstudiante';
import { Footer } from '../components/Footer';
import "../styles/StyleLogInEstudiante.css";

export default function ConfiguracionEstudiante() {
    const stored = getLocalStorage("estudiante");
    let student = null;
    try {
        student = stored ? JSON.parse(stored) : null;
    } catch (e) {
        student = null;
    }

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [documentoID, setDocumentoID] = useState('');
    const [password, setPassword] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');

    const [gruposDisponibles, setGruposDisponibles] = useState([]);
    const [gruposIniciales, setGruposIniciales] = useState([]);
    const [gruposSeleccionados, setGruposSeleccionados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!student || !student.id) {
            redirectAlert("Acceso Denegado", "Debes iniciar sesión para configurar tu perfil.", "/", "error");
            return;
        }

        // Cargar datos actuales del estudiante
        fetch(`${end_points.estudiantes}/${student.id}`)
            .then(res => res.json())
            .then(data => {
                setNombre(data.nombre || '');
                setEmail(data.email || '');
                setDocumentoID(data.documentoID || '');
                setPassword(data.password || ''); // Aunque usualmente no se retorna, lo manejamos si viene
                setTelefono(data.telefono || '');
                setDireccion(data.direccion || '');
            })
            .catch(err => console.error("Error al cargar perfil", err));

        // Cargar todos los grupos disponibles
        const p1 = fetch(end_points.grupos).then(res => res.json());

        // Cargar grupos en los que ya está inscrito
        const p2 = fetch(end_points.grupoEstudiante(student.id)).then(res => res.json());

        Promise.all([p1, p2])
            .then(([todosGrupos, misGrupos]) => {
                setGruposDisponibles(todosGrupos);
                const misIds = misGrupos.map(g => g.id);
                setGruposIniciales(misIds);
                setGruposSeleccionados(misIds);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar grupos", err);
                setLoading(false);
            });
    }, []);

    function handleCheckboxChange(groupId) {
        if (gruposSeleccionados.includes(groupId)) {
            setGruposSeleccionados(gruposSeleccionados.filter(id => id !== groupId));
        } else {
            setGruposSeleccionados([...gruposSeleccionados, groupId]);
        }
    }

    function handleSave(e) {
        e.preventDefault();

        if (!nombre || !email || !documentoID) {
            return alertaGeneral("Error", "Por favor completa todos los campos obligatorios (*).", "warning");
        }

        if (gruposSeleccionados.length === 0) {
            return alertaGeneral("Grupos obligatorios", "Debes estar inscrito en al menos un grupo/curso.", "warning");
        }

        setSaving(true);

        const studentPayload = {
            nombre,
            email,
            documentoID,
            password: password || student.password || 'password123',
            telefono,
            direccion
        };

        // 1. Actualizar datos básicos del estudiante
        fetch(`${end_points.estudiantes}/${student.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentPayload)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || "Error al actualizar perfil"); });
            }
            return response.json();
        })
        .then(updatedStudent => {
            // Calcular diferencias de inscripciones
            const aInscribir = gruposSeleccionados.filter(id => !gruposIniciales.includes(id));
            const aDesinscribir = gruposIniciales.filter(id => !gruposSeleccionados.includes(id));

            // Promesas para inscribir
            const inscripciones = aInscribir.map(groupId => {
                return fetch(end_points.grupoInscribir, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ grupoId: groupId, estudianteId: student.id })
                });
            });

            // Promesas para desinscribir
            const desinscripciones = aDesinscribir.map(groupId => {
                return fetch(end_points.grupoDesinscribir, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ grupoId: groupId, estudianteId: student.id })
                });
            });

            return Promise.all([...inscripciones, ...desinscripciones]).then(() => {
                // Actualizar estudiante en localStorage
                saveLocalStorage("estudiante", updatedStudent);
                setSaving(false);
                redirectAlert(
                    "Perfil Guardado",
                    "Tus datos personales e inscripciones de materias se han actualizado correctamente.",
                    "/calendario-estudiante",
                    "success"
                );
            });
        })
        .catch(err => {
            setSaving(false);
            alertaGeneral("Error en Actualización", err.message, "error");
        });
    }

    if (loading) {
        return (
            <div className="page-container bg-[#DAD2FF] min-h-screen">
                <NavBarEstudiante />
                <div className="flex-1 flex items-center justify-center py-20">
                    <p className="text-lg text-indigo-900 font-bold italic">Cargando tus datos de perfil...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="page-container bg-[#DAD2FF] min-h-screen">
            <NavBarEstudiante />
            <main className="flex-1 flex items-center justify-center p-6 mt-16">
                <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-lg">
                    <h2 className="text-center text-3xl font-extrabold mb-6 text-gray-800">
                        Configuración de Perfil
                    </h2>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Nombre Completo *</label>
                                <input
                                    className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm bg-white"
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Correo Electrónico *</label>
                                <input
                                    className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm bg-white"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Documento ID *</label>
                                <input
                                    className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm bg-white"
                                    type="text"
                                    value={documentoID}
                                    onChange={(e) => setDocumentoID(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Contraseña *</label>
                                <input
                                    className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm bg-white"
                                    type="password"
                                    value={password}
                                    placeholder="Nueva contraseña"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Teléfono</label>
                                <input
                                    className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm bg-white"
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Dirección de Residencia</label>
                                <input
                                    className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm bg-white"
                                    type="text"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Listado de materias/grupos disponibles */}
                        <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
                            <h3 className="font-bold text-sm mb-2 text-gray-700">Gestiona tus materias/grupos inscritos *</h3>
                            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                {gruposDisponibles.map(grupo => (
                                    <label key={grupo.id} className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-100 p-1.5 rounded transition">
                                        <input
                                            type="checkbox"
                                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                            checked={gruposSeleccionados.includes(grupo.id)}
                                            onChange={() => handleCheckboxChange(grupo.id)}
                                        />
                                        <span className="font-medium text-gray-800">{grupo.nombre}</span>
                                        <span className="text-gray-500">({grupo.dia})</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2 flex flex-col gap-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 bg-[#493d9e] hover:bg-[#322880] text-white font-bold rounded-lg shadow transition-colors duration-200 disabled:opacity-50"
                            >
                                {saving ? "Guardando..." : "Guardar Cambios"}
                            </button>
                            <button
                                type="button"
                                className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200"
                                onClick={() => window.location.href = "/calendario-estudiante"}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
