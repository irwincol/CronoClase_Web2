import React, { useState, useEffect } from 'react';
import { end_points } from '../services/api';
import { alertaGeneral, redirectAlert } from '../helpers/alerts';
import "../styles/StyleLogInEstudiante.css";

export default function FormularioEstudiante() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [documentoID, setDocumentoID] = useState('');
    const [password, setPassword] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');

    const [gruposDisponibles, setGruposDisponibles] = useState([]);
    const [gruposSeleccionados, setGruposSeleccionados] = useState([]);

    useEffect(() => {
        // Cargar los grupos disponibles para inscripción
        fetch(end_points.grupos)
            .then(res => res.json())
            .then(data => {
                setGruposDisponibles(data);
            })
            .catch(err => {
                console.error("Error al cargar grupos", err);
            });
    }, []);

    function handleCheckboxChange(groupId) {
        if (gruposSeleccionados.includes(groupId)) {
            setGruposSeleccionados(gruposSeleccionados.filter(id => id !== groupId));
        } else {
            setGruposSeleccionados([...gruposSeleccionados, groupId]);
        }
    }

    function handleRegister(e) {
        e.preventDefault();

        if (!nombre || !email || !documentoID || !password) {
            return alertaGeneral("Error", "Por favor completa todos los campos obligatorios (*).", "warning");
        }

        if (gruposSeleccionados.length === 0) {
            return alertaGeneral("Grupos obligatorios", "Por favor selecciona al menos un grupo o materia en la que deseas participar.", "warning");
        }

        const studentPayload = {
            nombre,
            email,
            documentoID,
            password,
            telefono,
            direccion
        };

        // 1. Registrar al estudiante
        fetch(end_points.estudiantes, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentPayload)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || "Error al registrar estudiante"); });
            }
            return response.json();
        })
        .then(newStudent => {
            // 2. Inscribir al estudiante en cada grupo seleccionado
            const enrollments = gruposSeleccionados.map(groupId => {
                return fetch(end_points.grupoInscribir, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        grupoId: groupId,
                        estudianteId: newStudent.id
                    })
                });
            });

            return Promise.all(enrollments).then(() => {
                redirectAlert(
                    "Registro Exitoso",
                    `¡Bienvenido ${nombre}! Estudiante registrado e inscrito con éxito en tus materias. Redirigiendo a inicio de sesión...`,
                    "/inicio-sesion-estudiante",
                    "success"
                );
            });
        })
        .catch(err => {
            alertaGeneral("Error en Registro", err.message, "error");
        });
    }

    return (
        <div className="log-in-estudainte-style">
            <div 
                className="min-h-screen w-full flex items-center justify-center p-4 m-0" 
                style={{ backgroundColor: '#CBC2F5' }}
            >
                <div id="form-container" className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl w-full max-w-lg">
                    <h2 className="text-center text-3xl font-bold mb-6 text-gray-800">
                        Registro de Estudiante
                    </h2>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm"
                                placeholder="Nombre Completo *"
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                            <input
                                className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm"
                                placeholder="Correo Estudiante *"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm"
                                placeholder="Documento ID *"
                                type="text"
                                value={documentoID}
                                onChange={(e) => setDocumentoID(e.target.value)}
                                required
                            />
                            <input
                                className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm"
                                placeholder="Contraseña *"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm"
                                placeholder="Teléfono"
                                type="tel"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                            />
                            <input
                                className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm"
                                placeholder="Dirección de Residencia"
                                type="text"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                            />
                        </div>

                        {/* Listado de materias/grupos disponibles */}
                        <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
                            <h3 className="font-semibold text-sm mb-2 text-gray-700">Selecciona las materias/grupos en que participarás *</h3>
                            {gruposDisponibles.length === 0 ? (
                                <p className="text-xs text-gray-500 italic">Cargando materias disponibles...</p>
                            ) : (
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
                            )}
                        </div>

                        <div className="pt-2 space-y-3">
                            <button
                                type="submit"
                                className="w-full py-3 bg-[#493d9e] hover:bg-[#322880] text-white font-bold rounded-lg shadow transition-colors duration-200"
                            >
                                Registrarse e Inscribirse
                            </button>
                            <button
                                type="button"
                                className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors duration-200"
                                onClick={() => window.location.href = "/inicio-sesion-estudiante"}
                            >
                                ¿Ya tienes una cuenta? Iniciar Sesión
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}