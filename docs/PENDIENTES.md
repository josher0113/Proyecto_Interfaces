# Pendientes del proyecto

## Interfaz y contenidos

- [x] Comprobar las siete pantallas en Edge a 320, 390, 800, 801 y 1280 px y verificar que no haya desplazamiento horizontal.
- [x] Comprobar con teclado el salto al contenido y el foco al entrar desde la bienvenida. Verificar la apertura y el regreso de las unidades de vista previa.
- [x] Alinear las etiquetas y los botones de las unidades que se pueden abrir en vista previa.
- [ ] Revisar visualmente el contraste y los mensajes de estado, y probar el recorrido con lector de pantalla y dispositivo táctil.
- [x] Definir el objetivo del piloto y documentar la fuente y la licencia de sus fotografías para A, B y C.
- [x] Incorporar las demostraciones fotográficas del piloto y probar el ejercicio con reintento y finalización.
- [x] Incorporar el índice de 27 letras de la UABCS, con 21 fotografías, seis videos y créditos del material.
- [x] Verificar en Edge la carga de las 27 fichas, la reproducción de los seis videos y la adaptación del índice a cinco anchos de pantalla.
- [x] Realizar una primera visita para probar el prototipo y recibir retroalimentación de la asociación de Xalapa el 21 de noviembre de 2026. [Registro y análisis](PROPUESTA_SOLUCION.md#pruebas-con-la-asociación-en-xalapa).
- [x] Definir el alcance acordado después de la visita. Tiempo se refiere a las horas del reloj. El tema de lugares y estados se retiró del plan.
- [x] Implementar y probar la unidad inicial de frutas y colores con referencias y tres situaciones de repaso.
- [ ] Definir objetivos, ejemplos y fuentes de LSM para comida, animales y muebles.
- [ ] Preparar la unidad de horas con ejemplos para preguntar y decir la hora.
- [ ] Acordar con la asociación qué operaciones matemáticas introducir a partir de la unidad de Números.
- [ ] Revisar las señas y variantes locales antes de producir las fichas, y registrar las tareas, los resultados y los ajustes de la siguiente ronda de pruebas.

## Funciones y pruebas

- [x] Integrar dictado en español de México con revisión del texto y manejo de permisos, errores y cancelación.
- [x] Comprobar el dictado simulado en Edge y el envío por escritura cuando la API no está disponible.
- [ ] Validar el dictado con micrófono físico y comprobar precisión, permisos y disponibilidad del servicio en escritorio y teléfono.
- [x] Integrar la vista previa de cámara sin audio, con activación por permiso y apagado al salir.
- [x] Verificar en Edge con una cámara simulada la activación, el rechazo de permiso, la cancelación y la liberación del video al detenerlo o salir.
- [ ] Probar la vista en una cámara física, tanto en computadora como en teléfono.
- [x] Incorporar MediaPipe Hand Landmarker localmente y comprobar en Edge el seguimiento de una mano.
- [x] Implementar el reconocimiento experimental de las 21 letras estáticas y las seis letras con movimiento.
- [x] Verificar ambos clasificadores y el flujo de cámara simulada en Edge con fotos y videos de la UABCS.
- [x] Guardar el avance del abecedario por fecha en el navegador. Verificar que los reintentos del mismo día no sumen y que la tercera fecha marque la letra en verde incluso después de recargar.
- [ ] Validar las 27 letras con diferentes personas usuarias de LSM y cámaras físicas. Registrar aciertos, confusiones y abstenciones con distintas condiciones de luz, encuadre y velocidad.
- [ ] Revisar con el equipo si conservar el criterio de tres fechas o ajustar la frecuencia de práctica.
- [ ] Definir el catálogo de expresiones validadas para el traductor educativo y el estado que se mostrará cuando una consulta no tenga coincidencia.
- [ ] Guardar el avance de las otras unidades, las lecciones completadas y los logros. Calcular la racha a partir de actividades completadas en días consecutivos.
- [ ] Definir cómo se integrarán las cuentas y el perfil del usuario.

## Entrega académica

- [ ] Documentar el problema con un storyboard y describir a las personas usuarias con evidencia.
- [x] Iniciar la [propuesta de solución](PROPUESTA_SOLUCION.md) con requisitos, arquitectura del piloto e infraestructura prevista para voz y gestos.
- [x] Documentar la elección de `getUserMedia` para la captura, la elección de MediaPipe para el seguimiento y los resultados de las pruebas de cámara simulada.
- [x] Redactar el [borrador del manual de usuario](MANUAL_USUARIO.md) con la navegación, el abecedario, el ejercicio de A, B y C y la vista previa de cámara.
- [x] Documentar la arquitectura, las pruebas, el uso del reconocimiento del abecedario y el criterio para marcar letras como aprendidas.
- [x] Documentar la elección de Web Speech, el manejo del audio por parte del navegador y el flujo de dictado en el manual.
- [ ] Añadir bocetos y completar la descripción de voz y gestos cuando se implementen y prueben ambas modalidades.
- [ ] Actualizar el manual con las funciones restantes y redactar las conclusiones del reporte.
- [ ] Preparar la presentación y revisar el prototipo con la rúbrica de usabilidad y el requisito de dos tipos de interacción adicionales a la interfaz gráfica.
- [ ] Empaquetar el prototipo, el reporte y la presentación para la entrega.
