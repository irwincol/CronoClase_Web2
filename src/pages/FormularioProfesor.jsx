import React, { useState } from 'react';
import { end_points } from '../services/api';
import { alertaGeneral, redirectAlert } from '../helpers/alerts';
import "../styles/StyleLogIn.css";

export function FormularioProfesor() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [documentoID, setDocumentoID] = useState('');
    const [password, setPassword] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [biografia, setBiografia] = useState('');
    const [oficina, setOficina] = useState('');
    const [especialidad, setEspecialidad] = useState('');

    function handleRegister(e) {
        e.preventDefault();

        if (!nombre || !email || !documentoID || !password || !especialidad) {
            return alertaGeneral("Error", "Por favor completa todos los campos obligatorios (*).", "warning");
        }

        if (password.length < 6) {
            return alertaGeneral("Advertencia", "La contraseña debe tener al menos 6 caracteres.", "warning");
        }

        const payload = {
            nombre,
            email,
            documentoID,
            password,
            activo: true,
            telefono,
            direccion,
            biografia,
            oficina,
            especialidad
        };

        fetch(end_points.profesores, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || "Error al registrar profesor"); });
            }
            return response.json();
        })
        .then(() => {
            redirectAlert(
                "Registro Exitoso",
                "¡Bienvenido! Profesor registrado con éxito. Redirigiendo a inicio de sesión...",
                "/inicio-sesion-profesor",
                "success"
            );
        })
        .catch(err => {
            alertaGeneral("Error en Registro", err.message, "error");
        });
    }

    return (
        <div className="log-in-estudainte-style">
            <div className="min-h-screen w-full flex items-center justify-center p-4 m-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
                <div id="form-container" className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl w-full max-w-lg">
                    <h2 className="text-center text-3xl font-bold mb-6 text-gray-800">
                        Registro de Profesor
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
                                placeholder="Correo Institucional *"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm"
                                placeholder="Documento ID / CC *"
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm"
                                placeholder="Especialidad *"
                                type="text"
                                value={especialidad}
                                onChange={(e) => setEspecialidad(e.target.value)}
                                required
                            />
                            <input
                                className="w-full h-11 border border-gray-400 px-3 rounded-lg text-sm"
                                placeholder="Oficina / Cubículo"
                                type="text"
                                value={oficina}
                                onChange={(e) => setOficina(e.target.value)}
                            />
                        </div>

                        <textarea
                            className="w-full border border-gray-400 p-3 rounded-lg text-sm h-20 resize-none"
                            placeholder="Biografía o Resumen de Perfil Académico"
                            value={biografia}
                            onChange={(e) => setBiografia(e.target.value)}
                        />

                        <div className="pt-2 space-y-3">
                            <button
                                type="submit"
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow transition-colors duration-200"
                            >
                                Registrarse
                            </button>
                            <button
                                type="button"
                                className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors duration-200"
                                onClick={() => window.location.href = "/inicio-sesion-profesor"}
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
