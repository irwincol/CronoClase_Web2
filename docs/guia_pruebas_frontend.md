# 📚 Guía Paso a Paso: Pruebas del Frontend React y API CronoClase

Esta guía detalla el flujo completo para probar la interacción y el consumo de la API de CronoClase desde la aplicación del cliente Frontend en React (`CronoClase_Web2`).

---

## 🚀 1. Preparación e Inicio del Entorno

Asegúrate de tener activos tanto el servidor de la API como el servidor del cliente web.

### 🍃 Paso A: Iniciar la API (Spring Boot)
1. Abre tu terminal en la carpeta del backend.
2. Ejecuta el servidor:
   ```bash
   cd "C:\Users\LENOVO\Desktop\cronoclase-grupo-5"
   ./mvnw spring-boot:run
   ```
> [!NOTE]
> Al iniciar, la API sembrará automáticamente dos profesores de pruebas y sus respectivos grupos predeterminados en la base de datos si esta se encuentra vacía:
> * **Profesor Luis Perez** (`luisperez@cronoclase.com`) con asignaturas Lunes, Miércoles y Viernes.
> * **Profesora Maria Torres** (`mariatorres@cronoclase.com`) con asignatura los Jueves.

### ⚛️ Paso B: Iniciar el Frontend (React / Vite)
1. Abre otra terminal en la carpeta del frontend.
2. Ejecuta el servidor de desarrollo:
   ```bash
   cd "C:\Users\LENOVO\Desktop\CronoClase_Web2"
   # En Windows (si tienes políticas de restricción de scripts):
   powershell -ExecutionPolicy Bypass -Command "npm run dev"
   # O de manera estándar (CMD):
   npm run dev
   ```
3. Abre tu navegador e ingresa a la URL local indicada (ej. `http://localhost:5173`).

---

## 🎓 2. Flujo de Pruebas: Rol Profesor

El profesor se encarga de visualizar sus grupos asignados, consultar los estudiantes matriculados, definir y editar las evaluaciones/tareas, y calificar los trabajos enviados.

### Paso 1: Autenticación del Profesor (Luis Perez o Maria Torres)
1. En la pantalla principal ("Escoge tu rol"), haz clic en el botón **Profesor**.
2. Se te redirigirá a la pantalla de login del profesor, donde podrás observar los botones alineados y traducidos a `"Entrar"` y `"Registrarse"`.
3. Ingresa las credenciales del docente Luis Perez sembrado por defecto:
   * **Email**: `luisperez@cronoclase.com`
   * **Password**: `password123`
4. Pulsa **Entrar**. Tras la bienvenida, ingresarás a tu panel principal.
   *(Nota: Puedes cerrar sesión e iniciar con `mariatorres@cronoclase.com` / `password123` para validar que su grupo se asigne el día Jueves).*

### Paso 2: Visualizar Grupos y Alumnos
1. En el panel principal del profesor, verás listados los grupos asignados (ej. *Bases de Datos - Grupo A*).
2. Haz clic en el botón **Ver Alumnos** en la tarjeta del grupo.
3. Se desplegará una tabla interactiva que lista a todos los estudiantes inscritos en ese grupo específico con su nombre, documento, correo y teléfono (en este momento, la tabla estará vacía porque aún no hemos registrado alumnos).

### Paso 3: Registrar un nuevo Profesor
1. Haz clic en **Cerrar Sesión** en el Navbar para volver a la pantalla de login.
2. Haz clic en el botón **Registrarse**.
3. Rellena todos los campos obligatorios del formulario.
4. Haz clic en **Registrarse**. Una alerta flotante exitosa te redirigirá de nuevo a la pantalla de inicio de sesión.
5. Inicia sesión con el nuevo profesor creado para validar su perfil.

### Paso 4: Gestionar Evaluaciones (Crear, Editar y Eliminar)
1. Haz clic en el enlace **Carga de Actividades** del Navbar (con textos y fuentes ampliadas para mejor legibilidad).
2. Selecciona uno de tus grupos en el listado superior.
3. **Crear Actividad**:
   * Rellena el formulario de la columna izquierda con título, tipo (Parcial, Taller, etc.), porcentaje (ej. *30%*), fecha límite e instrucciones.
   * Haz clic en **Asignar a Grupo**. La evaluación se añadirá dinámicamente en la columna derecha.
4. **Editar Actividad**:
   * Haz clic en el botón de lápiz (**✏️**) de la evaluación recién creada.
   * Observa que el formulario del panel izquierdo se convierte en `"Editar Evaluación"` y se precargan todos los datos actuales. El botón cambia a `"Guardar Cambios"` y aparece una opción de `"Cancelar Edición"`.
   * Modifica el porcentaje o descripción y pulsa **Guardar Cambios**.
   > ⚠️ **Regla de Negocio**: Al editar, la API verifica en caliente que la suma de porcentajes acumulados del grupo (excluyendo el registro actual) más el nuevo valor ingresado no supere el `100.0%`.
5. **Eliminar Actividad**:
   * Haz clic en el botón de eliminación (**❌**).
   * Se abrirá una modal confirmatoria interactiva de **SweetAlert2** en lugar de una ventana emergente genérica del navegador. Confirma la acción para borrar la evaluación.

---

## 👨‍🎓 3. Flujo de Pruebas: Rol Estudiante

El estudiante puede matricularse, actualizar su perfil, autogestionar sus materias, visualizar evaluaciones en un calendario ampliado mediante íconos interactivos y verificar su boletín de calificaciones acumuladas.

### Paso 5: Registro e Inscripción Dinámica del Estudiante
1. Cierra sesión e ingresa al rol **Estudiante** (`/inicio-sesion-estudiante`).
2. Haz clic en **Registrarse**.
3. En el formulario, ingresa tus datos. En la sección inferior, selecciona las materias deseadas marcando los checkboxes (ej. *Bases de Datos - Grupo A* y *Matemáticas Avanzadas - Grupo D*).
4. Haz clic en **Registrarse e Inscribirse**.

### Paso 6: Verificación de Calendario Semanal Ampliado
1. Inicia sesión con las credenciales del estudiante registrado.
2. Ingresarás al **Calendario Estudiantil Semanal**, el cual se visualiza en tamaño ampliado ocupando la mayor parte del espacio central.
3. Observarás que:
   * Las filas se generan para tus materias inscritas.
   * En el día límite fijado por el profesor, se dibuja **únicamente un ícono circular/emoticono** (📝 para pendientes, 📥 para entregados, ⚠️ para entregas tarde, ✅ para calificados) para evitar que la celda se descuadre.
   * Al pasar el ratón por encima del círculo, un tooltip detallado te indicará el tipo, título y porcentaje de la evaluación.

### Paso 7: Modificar Datos y Autogestión de Cursos (Perfil)
1. En el Navbar, haz clic en el botón que lleva **tu nombre**.
2. Te redirigirá a la nueva página **Configuración de Perfil** (`/configuracion-estudiante`).
3. Modifica tu contraseña, teléfono o dirección, y **marca/desmarca los checkboxes de materias** para inscribirte en un nuevo grupo o retirarte de uno existente.
4. Presiona **Guardar Cambios**. Una alerta de SweetAlert2 confirmará la actualización y te redirigirá al calendario semanal, donde verás los cambios en las filas reflejados al instante.

### Paso 8: Subir una Entrega Académica
1. En el calendario, haz clic en el ícono amarillo (**📝**) de tu evaluación.
2. En el modal, introduce la URL del entregable y un comentario. Pulsa **Enviar Entrega**.
3. El ícono del calendario cambiará dinámicamente a color azul con el símbolo de una bandeja de entrada (**📥**) indicando estado *ENTREGADO*.

### Paso 9: Nueva Página "Mis Entregas" y Notas Ponderadas
1. Haz clic en **Mis Entregas** en el Navbar (que ahora está estilizado igual que el navbar del docente).
2. Se te redirigirá a la página completa de boletín de calificaciones (`/mis-entregas`).
3. Podrás visualizar cada materia en la que estás matriculado y su **Nota Ponderada Acumulada** real (ej. `1.35` si se sacó 4.5 en una tarea del 30%, calculada por la API).
4. Podrás hacer entregas y sobrescribir tus trabajos directamente desde las tablas de esta página.

---

## 🏆 4. Calificación y Cierre del Ciclo Académico

### Paso 10: Calificación por parte del Profesor
1. Ingresa nuevamente como profesor (`luisperez@cronoclase.com` / `password123`).
2. Dirígete a **Carga de Actividades**, selecciona la asignatura y localiza la tarea.
3. Observarás al estudiante con su estado `ENTREGADO`. Escribe la nota (ej. `4.5`) y presiona el botón **Calificar** (estilizado y alineado correctamente).
4. El estado del alumno cambiará automáticamente a **CALIFICADO**.

### Paso 11: Comprobación Final del Estudiante
1. Regresa al perfil del estudiante.
2. Ingresa a **Mis Entregas**.
3. Valida que tu estado marca **CALIFICADO** y visualiza tu nota definitiva asignada, afectando de forma positiva el promedio ponderado de esa materia.
4. ¡El ciclo extremo a extremo ha finalizado con éxito!
