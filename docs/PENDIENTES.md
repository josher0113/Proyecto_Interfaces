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
- [ ] Revisar el piloto con personas usuarias de LSM y definir fuentes y objetivos para las demás unidades.
- [ ] Obtener retroalimentación de personas usuarias y registrar los ajustes derivados de las pruebas.

## Funciones y pruebas

- [ ] Integrar dictado en español y contemplar permisos, errores y corrección del texto.
- [x] Integrar la vista previa de cámara sin audio, con activación por permiso y apagado al salir.
- [x] Verificar en Edge con una cámara simulada la activación, el rechazo de permiso, la cancelación y la liberación del video al detenerlo o salir.
- [ ] Probar la vista en una cámara física, tanto en computadora como en teléfono.
- [x] Incorporar MediaPipe Hand Landmarker localmente y comprobar en Edge el seguimiento de una mano.
- [x] Implementar el reconocimiento experimental de A, B y C con retroalimentación de coincidencia, letra diferente y resultado incierto.
- [x] Verificar el clasificador con pruebas unitarias y el flujo completo con cámara simulada y el modelo real.
- [ ] Validar A, B y C con diferentes personas usuarias de LSM y cámaras físicas. Registrar aciertos, confusiones y casos sin resultado bajo distintas condiciones de luz y encuadre.
- [ ] Definir el catálogo de expresiones validadas para el traductor educativo y el estado que se mostrará cuando una consulta no tenga coincidencia.
- [ ] Guardar el progreso, las lecciones completadas, los logros y los días de práctica. Calcular la racha a partir de actividades completadas en días consecutivos.
- [ ] Definir cómo se integrarán las cuentas y el perfil del usuario.

## Entrega académica

- [ ] Documentar el problema con un storyboard y describir a las personas usuarias con evidencia.
- [x] Iniciar la [propuesta de solución](PROPUESTA_SOLUCION.md) con requisitos, arquitectura del piloto e infraestructura prevista para voz y gestos.
- [x] Documentar la elección de `getUserMedia` para la captura, la elección de MediaPipe para el seguimiento y los resultados de las pruebas de cámara simulada.
- [x] Redactar el [borrador del manual de usuario](MANUAL_USUARIO.md) con la navegación, el abecedario, el ejercicio de A, B y C y la vista previa de cámara.
- [x] Documentar la arquitectura, las pruebas y el uso del reconocimiento experimental de A, B y C.
- [ ] Añadir bocetos y completar la descripción de voz y gestos cuando se implementen y prueben ambas modalidades.
- [ ] Actualizar el manual con las funciones restantes y redactar las conclusiones del reporte.
- [ ] Preparar la presentación y revisar el prototipo con la rúbrica de usabilidad y el requisito de dos tipos de interacción adicionales a la interfaz gráfica.
- [ ] Empaquetar el prototipo, el reporte y la presentación para la entrega.
