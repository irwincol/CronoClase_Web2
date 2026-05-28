import React, { useState } from "react";
import "../styles/StyleLogInEstudiante.css";
import { end_points } from "../services/api";
import { alertaGeneral, redirectAlert } from "../helpers/alerts";
import { saveLocalStorage } from "../helpers/local-storage";
import { Link } from "react-router-dom";

export function LogInProfesor() {
  const [emailProfesor, setEmailProfesor] = useState("");
  const [passwordProfesor, setPasswordProfesor] = useState("");

  function signInProfesor(e) {
    e.preventDefault();

    if (emailProfesor === "" || passwordProfesor === "") {
      return alertaGeneral("Error", "Contraseña o email vacío", "warning");
    }

    const payload = {
      email: emailProfesor,
      password: passwordProfesor
    };

    fetch(end_points.profesorLogin, {
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
        saveLocalStorage("profesor", user);
        redirectAlert(
          `Hola Prof. ${user.nombre}`,
          "Bienvenido, será redireccionado a su panel de control",
          "/panel-profesor",
          "success"
        );
      })
      .catch((error) => {
        alertaGeneral("Error de Credenciales", error.message, "error");
      });
  }

  return (
    <div className="log-in-estudainte-style">
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 p-4 m-0">
        <div className="relative">
          <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 shadow-lg animate-pulse"></div>

          <div
            id="form-container"
            className="bg-white p-10 sm:p-12 rounded-xl shadow-2xl w-80 sm:w-96 relative z-10"
          >
            <Link
              to="/"
              className="inline-flex items-center text-[#493d9e] hover:text-indigo-800 font-semibold text-sm mb-4 transition-colors"
              title="Volver a selección de rol"
            >
              <span className="text-xl mr-1">←</span> Volver
            </Link>

            <h2 className="text-center text-3xl font-extrabold mb-8 text-gray-800">
              Profesor
            </h2>

            <form onSubmit={signInProfesor} className="space-y-4">
              <input
                className="w-full h-12 border border-gray-400 px-3 rounded-lg text-sm bg-white"
                placeholder="Email Institucional"
                id="email"
                name="email"
                type="email"
                value={emailProfesor}
                onChange={(e) => setEmailProfesor(e.target.value)}
                required
              />

              <input
                className="w-full h-12 border border-gray-400 px-3 rounded-lg text-sm bg-white"
                placeholder="Contraseña"
                id="password"
                name="password"
                type="password"
                value={passwordProfesor}
                onChange={(e) => setPasswordProfesor(e.target.value)}
                required
              />

              <button
                type="submit"
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center text-base"
              >
                Entrar
              </button>

              <Link
                to="/formulario-profesor"
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
    </div>
  );
}