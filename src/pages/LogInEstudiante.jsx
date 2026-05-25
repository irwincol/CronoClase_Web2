import React, { useState } from "react";
import "../styles/StyleLogInEstudiante.css";
import { end_points } from "../services/api";
import { alertaGeneral, redirectAlert } from "../helpers/alerts";
import { saveLocalStorage } from "../helpers/local-storage";
import { Link } from "react-router-dom";

export function LogInEstudiante() {
  const [emailEstudiante, setEmailEstudiante] = useState("");
  const [passwordEstudiante, setPasswordEstudiante] = useState("");

  function signInEstudiante(e) {
    e.preventDefault();

    if (emailEstudiante === "" || passwordEstudiante === "") {
      return alertaGeneral("Error", "Contraseña o email vacío", "warning");
    }

    const payload = {
      email: emailEstudiante,
      password: passwordEstudiante
    };

    fetch(end_points.estudianteLogin, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Contraseña o email inválidos");
        }
        return response.json();
      })
      .then((user) => {
        saveLocalStorage("estudiante", user);
        redirectAlert(
          `Hola ${user.nombre}`,
          "Bienvenido, será redireccionado a su calendario",
          "/calendario-estudiante",
          "success"
        );
      })
      .catch((error) => {
        alertaGeneral("Error de Credenciales", error.message, "error");
      });
  }

  return (
    <div className="log-in-estudainte-style">
      <div 
        className="min-h-screen w-full flex items-center justify-center p-4 m-0 bg-[#DAD2FF]" 
      >
        <div
          id="form-container"
          className="bg-white p-10 sm:p-12 rounded-xl shadow-xl w-80 sm:w-96"
        >
          <h2 className="text-center text-3xl font-extrabold mb-8 text-gray-800">
            Estudiante
          </h2>

          <form onSubmit={signInEstudiante} className="space-y-4">
            <input
              className="w-full h-12 border border-gray-400 px-3 rounded-lg text-sm bg-white"
              placeholder="Correo Electrónico"
              id="email"
              name="email"
              type="email"
              value={emailEstudiante}
              onChange={(e) => setEmailEstudiante(e.target.value)}
              required
            />

            <input
              className="w-full h-12 border border-gray-400 px-3 rounded-lg text-sm bg-white"
              placeholder="Contraseña"
              id="password"
              name="password"
              type="password"
              value={passwordEstudiante}
              onChange={(e) => setPasswordEstudiante(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center text-base"
            >
              Entrar
            </button>

            <Link
              to="/formulario-estudiante"
              className="w-full h-12 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center text-base"
            >
              Registrarse
            </Link>

            <div className="text-center pt-2">
              <a className="text-[#493d9e] hover:underline text-sm font-semibold" href="#">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
