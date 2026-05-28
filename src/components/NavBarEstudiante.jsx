import React from "react";
import { getLocalStorage, removeLocalStorage } from "../helpers/local-storage";
import { redirectAlert } from "../helpers/alerts";
import { Link } from "react-router-dom";
import "../styles/NavBar.css";

import vistaEstudiantesImg from "../assets/images/graduado.png";
import calendarioImg from "../assets/images/calendario.png";
import panelCargaImg from "../assets/images/acortar.png";
import cerrarSesionImg from "../assets/images/lock-fill.svg";

export default function NavBarEstudiante() {
  const stored = getLocalStorage("estudiante");
  let userEstudiante = null;

  try {
    userEstudiante = stored ? JSON.parse(stored) : null;
  } catch (e) {
    userEstudiante = null;
  }

  function logOut() {
    removeLocalStorage("estudiante");
    redirectAlert(
      "Cerrar sesión",
      "Será redirigido a la página de inicio",
      "/",
      "info"
    );
  }

  return (
    <nav className="navCalendar">
      <div className="nav-buttons">
        <Link to="/configuracion-estudiante" className="nav-button" title="Configurar Perfil">
          <img src={vistaEstudiantesImg} alt="Mi Perfil" />
          {userEstudiante?.nombre ?? "Estudiante"}
        </Link>

        <Link to="/calendario-estudiante" className="nav-button" title="Ver Calendario Semanal">
          <img src={calendarioImg} alt="Calendario" />
          Calendario
        </Link>

        <Link to="/mis-entregas" className="nav-button">
          <img src={panelCargaImg} alt="Actividades Pendientes" />
          Mis Entregas
        </Link>

        <a
          href="#"
          className="nav-button"
          onClick={(e) => {
            e.preventDefault();
            logOut();
          }}
        >
          <img src={cerrarSesionImg} alt="Cerrar sesión" />
          Cerrar sesión
        </a>
      </div>
    </nav>
  );
}