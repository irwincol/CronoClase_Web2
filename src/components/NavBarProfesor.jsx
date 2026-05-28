import React from 'react';
import { getLocalStorage, removeLocalStorage } from "../helpers/local-storage";
import { redirectAlert } from "../helpers/alerts";
import { Link } from "react-router-dom";
import "../styles/NavBar.css";

import vistaEstudiantesImg from "../assets/images/graduado.png";
import calendarioImg from "../assets/images/calendario.png";
import panelCargaImg from "../assets/images/acortar.png";
import cerrarSesionImg from "../assets/images/lock-fill.svg";

export default function NavBarProfesor() {
  const stored = getLocalStorage("profesor");
  let userProfesor = null;

  try {
    userProfesor = stored ? JSON.parse(stored) : null;
  } catch (e) {
    userProfesor = null;
  }

  function logOut() {
    removeLocalStorage("profesor");
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
        <Link to="/configuracion-profesor" className="nav-button" title="Editar Perfil">
          <img src={vistaEstudiantesImg} alt="Editar Perfil" />
          {userProfesor ? `Prof. ${userProfesor.nombre}` : "Profesor"}
        </Link>

        <Link to="/panel-profesor" className="nav-button" title="Mis Grupos">
          <img src={calendarioImg} alt="Mis Grupos" />
          Mis Grupos
        </Link>

        <Link to="/panel-carga-actividades" className="nav-button">
          <img src={panelCargaImg} alt="Carga de Actividades" />
          Carga de Actividades
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
