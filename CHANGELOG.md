# Bitácora de cambios

## 2026-11-18 · Navegación del prototipo

- En `Manuel` (`f989b59`), las unidades con contenido de muestra ahora se identifican como vistas previas y se abren con «Ver unidad».
- Se ajustaron el foco al cambiar de pantalla, el indicador de la sección activa y el espacio para navegar con la barra inferior.
- Se verificaron las siete pantallas en Edge a cinco anchos de ventana. Los pasos y el alcance de la prueba quedaron en el [borrador del manual](docs/MANUAL_USUARIO.md).

## 2026-11-18 · Documentación inicial

- Se creó la rama local `main` a partir del prototipo de `Manuel`.
- Se agregó el README para explicar el propósito, el enfoque de desarrollo y cómo probar el prototipo.
- Se abrió esta bitácora y se registraron los pendientes de implementación y de la entrega académica.

## 2026-11-17 · Primer prototipo

- Se implementaron las pantallas de bienvenida, inicio, ruta de aprendizaje, lección, práctica con cámara, traductor y perfil.
- Se conectaron las vistas y se incorporaron datos de ejemplo para el progreso y la racha.
- Se añadieron espacios reservados para demostraciones, cámara y dictado. El traductor muestra el estado de la consulta sin generar una traducción.
- Se verificaron la navegación y el formulario de demostración con Node.js. El prototipo quedó registrado en el commit `dd973ed`.
