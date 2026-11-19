# Bitácora de cambios

## Dictado en español

- En `Manuel` (`dadb59a`), Traductor incorpora dictado en español de México. Al finalizar, la transcripción se agrega al texto que ya estaba escrito y se puede corregir antes de consultar.
- Se añadieron avisos de permiso, servicio y conexión, y se cancela la escucha al salir de Traductor.
- En Edge se verificaron el dictado simulado, la edición, la cancelación y el acceso por teclado cuando la función no está disponible. Queda pendiente probar la transcripción con micrófono físico.

## Práctica del abecedario y progreso por días

- En `Manuel` (`c45788d`), la práctica con cámara cubre las 27 letras. Las estáticas se comparan mientras mantienes la posición. J, Ñ, P, Q, X y Z usan una evaluación guiada del movimiento.
- La práctica de cada letra se puede registrar una vez por fecha local (`bbc989b`). Tras tres aciertos en fechas distintas, el abecedario y Progreso muestran la letra en verde como **Aprendida**.
- Pasaron 14 pruebas unitarias y las dos pruebas de integración en Edge con cámara simulada. La validación con más personas y cámaras físicas sigue pendiente.

## Reconocimiento experimental de A, B y C

- En `Manuel` (`373feb2`), se incorporaron el motor web y el modelo Hand Landmarker de MediaPipe como archivos locales.
- En `Manuel` (`cd34839`), Práctica dibuja los puntos de una mano y compara una predicción estable con la letra de referencia. Las demás fichas conservan la vista previa de cámara.
- Pasaron las cuatro pruebas unitarias y la prueba de integración en Edge con cámara simulada. Queda pendiente la validación con cámaras físicas y diferentes personas usuarias de LSM.

## Seguimiento de pendientes

- Se actualizaron las casillas de navegación, abecedario, cámara y documentación para distinguir lo comprobado de las pruebas e integraciones que faltan.

## Vista previa de cámara

- En `Manuel` (`80bcd15`), Práctica muestra la cámara junto a la referencia de la letra. La cámara se activa a petición y se libera al detenerla o salir de la vista.
- Se comprobaron los estados del permiso y el apagado con una cámara simulada en Edge. Se documentó la decisión de usar MediaPipe para la próxima etapa de seguimiento.

## Ampliación del abecedario

- En `Manuel` (`6639e92`), se añadió un índice de las 27 letras del recurso de la UABCS. Las fichas incluyen 21 fotografías y seis videos de movimiento (J, Ñ, P, Q, X y Z).
- Los archivos se incluyen en el prototipo. Se redimensionaron las fotos y se conservaron los videos originales y la atribución.
- En Edge se verificaron las 27 fichas, la reproducción de los seis videos, el índice en cinco anchos de pantalla y el ejercicio de A, B y C.

## 2026-11-19 · Lección piloto de Abecedario

- En `Manuel` (`5c6f082`), se añadieron fichas de A, B y C con fotografías de la Biblioteca Universitaria UABCS, atribución y descripciones.
- Se añadió un ejercicio de tres preguntas, con comprobación, reintento y un estado de finalización que se conserva durante la visita.
- Se probó el recorrido en Microsoft Edge y se documentaron los requisitos y las dos modalidades de interacción previstas para la entrega.

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
