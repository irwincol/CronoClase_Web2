const URL_BASE = 'http://localhost:8080/api';

/* Configuración de todos los endpoints de la API Cronoclase */
export const end_points = {
    // Profesores
    profesores: `${URL_BASE}/profesor`,
    profesorLogin: `${URL_BASE}/profesor/login`,

    // Estudiantes
    estudiantes: `${URL_BASE}/estudiante`,
    estudianteLogin: `${URL_BASE}/estudiante/login`,

    // Grupos
    grupos: `${URL_BASE}/grupo`,
    grupoInscribir: `${URL_BASE}/grupo/inscribir`,
    grupoDesinscribir: `${URL_BASE}/grupo/desinscribir`,
    grupoProfesor: (profesorId) => `${URL_BASE}/grupo/profesor/${profesorId}`,
    grupoEstudiante: (estudianteId) => `${URL_BASE}/grupo/estudiante/${estudianteId}`,
    grupoNotaFinal: `${URL_BASE}/grupo/nota-final`,

    // Evaluaciones
    evaluaciones: `${URL_BASE}/evaluacion`,
    evaluacionGrupo: (grupoId) => `${URL_BASE}/evaluacion/grupo/${grupoId}`,
    evaluacionId: (id) => `${URL_BASE}/evaluacion/${id}`,

    // Entregas
    entregas: `${URL_BASE}/entrega`,
    entregaCalificar: (entregaId) => `${URL_BASE}/entrega/${entregaId}/calificar`,
    entregaEstudiante: (estudianteId) => `${URL_BASE}/entrega/estudiante/${estudianteId}`,
    entregaEvaluacion: (evaluacionId) => `${URL_BASE}/entrega/evaluacion/${evaluacionId}`,
    entregaGrupo: (grupoId) => `${URL_BASE}/entrega/grupo/${grupoId}`
};