# Pendientes del proyecto

## Alcance de la presentación

- La presentación usará la HP ProBook 445 G8 y el Samsung Galaxy A57. En ambos ya se realizó la prueba funcional de dictado y práctica con cámara.
- Se prepararon para el foro un ejecutable local para Windows con cuentas locales y un video de navegación con subtítulos en español, listo para grabar la voz de la presentación.
- Las pruebas adicionales quedan para después de la presentación. El reporte, la presentación y el ZIP de la entrega académica se preparan por separado.

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
- [x] Incorporar las fichas del 1 al 3 y verificar en Edge el ejercicio de identificación, su retroalimentación y el reintento.
- [x] Limitar la unidad activa de Números a las fichas del 1 al 10 y conservar el registro por fecha.
- [x] Separar la entrada al reconocimiento de letras y números para que cada ficha evalúe su propio tipo de seña.
- [x] Ampliar Saludos básicos a siete fichas, incorporar la práctica guiada con cámara en espejo y retirar el cuestionario de la unidad.
- [x] Definir las fichas de referencia y la práctica directa de señas como formato para Números, Saludos básicos y las próximas unidades.
- [x] Retirar «Hasta luego» de Saludos básicos y quitar los enlaces de salida de las fichas. Incluir los materiales de práctica dentro de Conecta LSM.
- [x] Incorporar cinco fichas de Expresiones cotidianas con fotos locales y práctica guiada con cámara en espejo.
- [x] Incorporar prácticas para presentarse, pedir ayuda e invitar a participar, con fotos locales, señas de apoyo y cámara en espejo.
- [ ] Validar con la asociación ejemplos completos de peticiones e invitaciones en LSM. Incorporar demostraciones locales que muestren la conversación y sus variantes.
- [ ] Conseguir una secuencia fotográfica en LSM de «Hasta luego» con permiso de redistribución para reincorporar la ficha.
- [ ] Validar los seis saludos activos y las cinco expresiones con la asociación. Revisar sus variantes y definir cómo evaluar y registrar su ejecución con cámara.
- [ ] Probar del 1 al 10 con la asociación y con cámaras físicas de escritorio y teléfono. Revisar las posturas que coinciden con letras, los resultados entre números parecidos y los movimientos del 9 y del 10.
- [ ] Retomar las decenas del 20 al 100 y las centenas del 200 al 1000 en una próxima actualización. Usar el prototipo de `bca086d` de `Manuel` como punto de partida y validar los movimientos, incluido el 1000 con dos manos.
- [ ] Incorporar ejemplos cotidianos de uso de los números y revisar con la asociación variantes y formas de expresar cantidades intermedias.
- [ ] En una próxima actualización, reincorporar **Frutas** y **Colores** como dos prácticas separadas, con un video de referencia por seña, validación con cámara y estado verde **Aprendida** después de tres días consecutivos de aciertos por seña. El prototipo anterior se conserva en `4a5dc90` y `b5550bf` de `Manuel`.
- [ ] Antes de reincorporar Frutas y Colores, validar sus seis señas con la asociación y cámaras físicas. Medir aciertos, confusiones y abstenciones con diferentes personas y encuadres.
- [ ] Definir objetivos, ejemplos y fuentes de LSM para comida, animales y muebles.
- [ ] Preparar la unidad de horas con ejemplos para preguntar y decir la hora.
- [ ] Acordar con la asociación qué operaciones matemáticas introducir a partir de la unidad de Números.
- [ ] Revisar las señas y variantes locales antes de producir las fichas, y registrar las tareas, los resultados y los ajustes de la siguiente ronda de pruebas.

## Funciones y pruebas

- [x] Integrar dictado local con Vosk y un modelo de español general. El texto se puede editar antes de deletrear.
- [x] Transcribir en Edge un WAV en español y verificar permisos, cancelación, liberación del micrófono y escritura manual cuando el motor no está disponible.
- [x] Comprobar el flujo de dictado con el micrófono físico de un Samsung Galaxy A57 en Chrome para Android.
- [x] Probar el dictado con micrófono físico en una HP ProBook 445 G8.
- [ ] Medir el tiempo de la primera carga del modelo y revisar la precisión del dictado con hablantes de español de México.
- [x] Integrar la vista previa de cámara sin audio, con activación por permiso y apagado al salir.
- [x] Verificar en Edge con una cámara simulada la activación, el rechazo de permiso, la cancelación y la liberación del video al detenerlo o salir.
- [x] Comprobar el flujo de práctica con la cámara física de un Samsung Galaxy A57 en Chrome para Android.
- [x] Probar la práctica con cámara física en una HP ProBook 445 G8.
- [x] Incorporar MediaPipe Hand Landmarker localmente y comprobar en Edge el seguimiento de una mano.
- [x] Implementar el reconocimiento experimental de las 21 letras estáticas y las seis letras con movimiento.
- [x] Verificar ambos clasificadores y el flujo de cámara simulada en Edge con fotos y videos de la UABCS.
- [x] Guardar el avance del abecedario por fecha en el navegador. Verificar que los reintentos del mismo día no sumen y que la tercera fecha marque la letra en verde incluso después de recargar.
- [ ] Validar las 27 letras con diferentes personas usuarias de LSM y cámaras físicas. Registrar aciertos, confusiones y abstenciones con distintas condiciones de luz, encuadre y velocidad.
- [ ] Revisar con el equipo si conservar el criterio de tres fechas o ajustar la frecuencia de práctica.
- [x] Incorporar las 27 letras del abecedario manual de LSM en SignWriting en el deletreador y en sus fichas. Verificar las imágenes locales, la Ñ y el ajuste en móvil.
- [ ] Revisar con personas usuarias de LSM las variantes de las letras en SignPuddle y su correspondencia con las referencias de práctica de la UABCS.
- [ ] Guardar el avance de las otras unidades, las lecciones completadas y los logros. Calcular la racha a partir de actividades completadas en días consecutivos.
- [x] Habilitar cuentas locales, inicio y cierre de sesión y avance separado por perfil e invitado.

## Entrega académica

- [ ] Documentar el problema con un storyboard y describir a las personas usuarias con evidencia.
- [x] Iniciar la [propuesta de solución](PROPUESTA_SOLUCION.md) con requisitos, arquitectura del piloto e infraestructura prevista para voz y gestos.
- [x] Documentar la elección de `getUserMedia` para la captura, la elección de MediaPipe para el seguimiento y los resultados de las pruebas de cámara simulada.
- [x] Redactar el [borrador del manual de usuario](MANUAL_USUARIO.md) con la navegación, el abecedario, el ejercicio de A, B y C y la vista previa de cámara.
- [x] Documentar la arquitectura, las pruebas, el uso del reconocimiento del abecedario y el criterio para marcar letras como aprendidas.
- [x] Documentar la elección de Vosk, el procesamiento local del audio y el flujo de dictado en el manual.
- [ ] Añadir bocetos y completar la descripción de voz y gestos cuando se implementen y prueben ambas modalidades.
- [ ] Actualizar el manual con las funciones restantes y redactar las conclusiones del reporte.
- [ ] Preparar la presentación y revisar el prototipo con la rúbrica de usabilidad y el requisito de dos tipos de interacción adicionales a la interfaz gráfica.
- [ ] Empaquetar el prototipo, el reporte y la presentación para la entrega.
