# CronoClase Web2

CronoClase Web2 es una aplicación web para la gestión de actividades académicas, pensada para dos perfiles principales: estudiante y profesor. Permite iniciar sesión, administrar materias, revisar calendarios, registrar entregas y gestionar evaluaciones desde una interfaz construida con React y Vite.

## Funcionalidades principales

- Inicio de sesión diferenciado para estudiante y profesor.
- Paneles separados según el rol del usuario.
- Calendario académico para estudiantes.
- Gestión de materias, entregas y configuración del perfil del estudiante.
- Panel del profesor para carga y seguimiento de actividades.
- Consumo de una API local para autenticación y operaciones académicas.

## Tecnologías usadas

- React 19
- Vite 7
- React Router DOM 7
- Bootstrap 5
- Tailwind CSS 4
- SweetAlert2

## Requisitos

Antes de ejecutar el proyecto, verifica tener instalado lo siguiente:

- Node.js 18 o superior
- npm 9 o superior
- La API de CronoClase ejecutándose localmente en `http://localhost:8080`

## Instalación y ejecución

1. Clona el repositorio.
2. Entra a la carpeta del proyecto.
3. Instala las dependencias.
4. Inicia el servidor de desarrollo.

```bash
git clone <URL_DEL_REPOSITORIO>
cd CronoClase_Web2
npm install
npm run dev
```

Luego abre la URL que indique Vite, normalmente `http://localhost:5173`.

## Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## API local

El frontend consume la API definida en `src/services/api.js`, por lo que el backend debe estar disponible en `http://localhost:8080/api`.

## Rutas principales

- `/` Inicio de selección de rol
- `/inicio-sesion-estudiante` Login de estudiante
- `/inicio-sesion-profesor` Login de profesor
- `/calendario-estudiante` Calendario del estudiante
- `/mis-entregas` Vista de entregas del estudiante
- `/configuracion-estudiante` Configuración del perfil del estudiante
- `/panel-profesor` Panel principal del profesor
- `/panel-carga-actividades` Carga de actividades del profesor

## Nota de acceso

Para las pruebas locales, algunas vistas usan datos de ejemplo o credenciales cargadas desde la API o los archivos del proyecto. En el login de estudiante, el correo corresponde al correo del estudiante y la contraseña puede coincidir con el documento o el valor configurado en los datos de prueba.

## Documentación de pruebas

Si necesitas un flujo paso a paso para validar el frontend, revisa [docs/guia_pruebas_frontend.md](docs/guia_pruebas_frontend.md).

## Estructura general

```text
src/
  components/
  data/
  helpers/
  pages/
  routes/
  services/
  styles/
```

## Autores

| Nombre | Usuario de GitHub |
| --- | --- |
| Paula Gil | [@GGP113](https://github.com/GGP113) |
| Irwin Colmenarez | [@irwincol](https://github.com/irwincol) |
| Carlos Martinez | [@CMARTINEZ-95](https://github.com/CMARTINEZ-95) |
| Estiben Manco | [@Estibenmanco31](https://github.com/Estibenmanco31) |
| Victor Berrio | [@Vastrocode72](https://github.com/Vastrocode72) |
| Sebastian Hernandez | [@Sebas-1013](https://github.com/Sebas-1013) |
