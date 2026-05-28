import React, { useState, useEffect } from 'react';
import { end_points } from '../services/api';
import { alertaGeneral, redirectAlert } from '../helpers/alerts';
import { getLocalStorage, saveLocalStorage } from '../helpers/local-storage';
import NavBarProfesor from '../components/NavBarProfesor';
import { Footer } from '../components/Footer';
import "../styles/StyleLogInEstudiante.css";

export default function ConfiguracionProfesor() {
    const stored = getLocalStorage("profesor");
    let professor = null;
    try {
        professor = stored ? JSON.parse(stored) : null;
    } catch (e) {
        professor = null;
    }

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [documentoID, setDocumentoID] = useState('');
    const [password, setPassword] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [oficina, setOficina] = useState('');
    const [biografia, setBiografia] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!professor || !professor.id) {
            redirectAlert("Acceso Denegado", "Debes iniciar sesión para configurar tu perfil.", "/", "error");
            return;
        }

        // Cargar datos actuales del profesor
        fetch(`${end_points.profesores}/${professor.id}`)
            .then(res => res.json())
            .then(data => {
                setNombre(data.nombre || '');
                setEmail(data.email || '');
                setDocumentoID(data.documentoID || '');
                // Dejamos la contraseña en blanco inicialmente para que solo se actualice si la cambian
                setPassword('');
                setTelefono(data.telefono || '');
                setDireccion(data.direccion || '');
                setEspecialidad(data.especialidad || '');
                setOficina(data.oficina || '');
                setBiografia(data.biografia || '');
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar perfil", err);
                setLoading(false);
            });
    }, []);

    function handleSave(e) {
        e.preventDefault();

        if (!nombre || !email || !documentoID || !especialidad) {
            return alertaGeneral("Error", "Por favor completa todos los campos obligatorios (*).", "warning");
        }

        // Si ingresaron contraseña, validar longitud
        if (password && password.length < 6) {
            return alertaGeneral("Advertencia", "La nueva contraseña debe tener al menos 6 caracteres.", "warning");
        }

        setSaving(true);

        const professorPayload = {
            nombre,
            email,
            documentoID,
            // Si la contraseña está vacía, se mantiene la actual (enviamos la almacenada originalmente)
            password: password || professor.password || 'password123',
            activo: true,
            telefono,
            direccion,
            especialidad,
            oficina,
            biografia
        };

        // Actualizar datos del profesor
        fetch(`${end_points.profesores}/${professor.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(professorPayload)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || "Error al actualizar perfil"); });
            }
            return response.json();
        })
        .then(updatedProfessor => {
            // Actualizar profesor en localStorage
            saveLocalStorage("profesor", updatedProfessor);
            setSaving(false);
            redirectAlert(
                "Perfil Guardado",
                "Tus datos personales y académicos se han actualizado correctamente.",
                "/panel-profesor",
                "success"
            );
        })
        .catch(err => {
            setSaving(false);
            alertaGeneral("Error en Actualización", err.message, "error");
        });
    }

    if (loading) {
        return (
            <div className="page-container bg-gradient-to-br from-indigo-900 via-purple-900 to-black min-h-screen text-white">
                <NavBarProfesor />
                <div className="flex-1 flex items-center justify-center py-20">
                    <p className="text-lg font-bold italic">Cargando tus datos de perfil...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="page-container bg-gradient-to-br from-indigo-900 via-purple-900 to-black min-h-screen">
            <NavBarProfesor />
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
                                <label className="block text-xs font-bold text-gray-600 mb-1">Correo Institucional *</label>
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
                                <label className="block text-xs font-bold text-gray-600 mb-1">Documento ID / CC *</label>
                                <input
                                    className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm bg-white"
                                    type="text"
                                    value={documentoID}
                                    onChange={(e) => setDocumentoID(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Nueva Contraseña</label>
                                <input
                                    className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm bg-white"
                                    type="password"
                                    value={password}
                                    placeholder="Dejar en blanco si no deseas cambiarla"
                                    onChange={(e) => setPassword(e.target.value)}
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Especialidad *</label>
                                <input
                                    className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm bg-white"
                                    type="text"
                                    value={especialidad}
                                    onChange={(e) => setEspecialidad(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Oficina / Cubículo</label>
                                <input
                                    className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm bg-white"
                                    type="text"
                                    value={oficina}
                                    onChange={(e) => setOficina(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Biografía o Resumen de Perfil Académico</label>
                            <textarea
                                className="w-full border border-gray-400 p-3 rounded-lg text-sm h-20 resize-none bg-white"
                                placeholder="Cuéntanos un poco sobre ti..."
                                value={biografia}
                                onChange={(e) => setBiografia(e.target.value)}
                            />
                        </div>

                        <div className="pt-2 flex flex-col gap-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow transition-colors duration-200 disabled:opacity-50"
                            >
                                {saving ? "Guardando..." : "Guardar Cambios"}
                            </button>
                            <button
                                type="button"
                                className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200"
                                onClick={() => window.location.href = "/panel-profesor"}
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
