import React from "react";
import NavBarEstudiante from "../components/NavBarEstudiante";
import { Footer } from "../components/Footer";
import "../styles/PageMaterias.css";

import { useState, useEffect } from "react";
import { end_points } from "../services/api";

export default function PageMaterias() {
  const [estudiantes, setUserEstudiantes] = useState([]);

  function getEstudiantes() {
    fetch(end_points.estudiantes)
      .then((response) => response.json())
      .then((data) => {
        setUserEstudiantes(data);
      })
      .catch((error) => console.log(error));
  }

  useEffect(() => {
    getEstudiantes();
  }, []);

  return (
    <div className="page-container">
      <NavBarEstudiante />

      <main className="mainViewContainer">
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md border mt-10 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sección de Materias</h2>
          <p className="text-gray-500 text-sm">Tu carga horaria semanal y materias asignadas están sincronizadas directamente en tu calendario estudiantil principal.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
