# Bitácora de cambios

## Racha de práctica por perfil

- **Inicio** y **Progreso** muestran la racha de la cuenta o del invitado. El primer acierto registrado inicia la racha. Cada día consecutivo suma una vez, aunque se practiquen varias letras y números.
- La racha aprovecha las fechas ya guardadas. Las señas aprendidas admiten nuevos aciertos en los días siguientes para mantenerla.
- Se comprobaron el primer día, el avance de un día consecutivo, el reinicio tras una pausa y la separación entre cuentas.

## Inicio de sesión y progreso por perfil

- Se habilitaron el registro, el inicio y el cierre de sesión en el navegador. Sigue disponible el modo invitado.
- El inicio muestra el nombre de la cuenta y **Progreso** muestra el historial de letras y números del perfil activo. Los datos de ejemplo se retiraron y se conservó el historial de invitado.
- En Edge se verificaron el registro en ancho móvil, la sesión tras recargar, el cierre y el reingreso, la contraseña incorrecta y la separación del progreso.
- Se recompiló el ejecutable del foro con el inicio de sesión y se actualizó el video con navegación real. El MP4 conserva los subtítulos y queda en silencio para que la persona que presenta grabe su propia voz.

## Material de demostración para el foro

- Se preparó un ejecutable de Windows que abre en el navegador el prototipo de la rama `Manuel` (`eb18390`). Los medios y los modelos de cámara y dictado están incluidos.
- Se grabó un recorrido de las pantallas y se montó un MP4 con narración y subtítulos. Las demostraciones de reconocimiento con material de referencia de la UABCS y de dictado con voz sintética se identifican en el video.

## Alcance de las pruebas para la presentación

- Se acordó usar la HP ProBook 445 G8 y el Samsung Galaxy A57, con la cámara y el dictado ya probados en ambos equipos. Las pruebas adicionales se retoman después de la presentación.

## Prueba local en HP ProBook 445 G8

- Un integrante del equipo completó la prueba local del dictado en **Deletrear** y de la práctica con cámara en una HP ProBook 445 G8.
- Queda por medir la precisión de ambas funciones y el tiempo de la primera carga del modelo de dictado.

## 23 de noviembre de 2026 · Prueba móvil en Galaxy A57

- Un integrante del equipo probó el dictado de **Deletrear** y la práctica con cámara del **Abecedario** en Chrome para Android y confirmó que ambas funciones operaron en su Galaxy A57.
- El prototipo se abrió en `http://localhost:8765` en el teléfono mediante el reenvío USB de ADB hacia la computadora.

## Dictado local en español

- El deletreador transcribe el audio en el dispositivo mediante Vosk. La app carga el modelo de español desde su propio servidor al activar el dictado.
- En Edge se transcribió un audio de prueba en español y se verificaron los permisos, la cancelación, la liberación del micrófono y la escritura manual si el motor falla.
- Queda pendiente probar la precisión y el tiempo de carga con micrófonos físicos en computadora y teléfono.

## Deletreo con el abecedario de SignWriting

- **Deletrear** utiliza las 27 letras del abecedario manual de LSM, incluida la Ñ. El resultado muestra cada palabra letra por letra y las imágenes se incluyen dentro de Conecta LSM.
- Las fichas del abecedario incorporan su grafía. La ruta anterior del traductor abre el deletreador.
- En Edge se verificaron las 27 grafías, el manejo de acentos y el ajuste a 320 píxeles.

## Escritura en SignWriting para el traductor

- El Traductor muestra seis grafías de LSM tomadas del diccionario de SignPuddle Online. Se incluyen como imágenes locales acreditadas.
- Se reemplazó el resultado de glosas por la escritura en SignWriting. Las expresiones sin grafía documentada quedan pendientes en el catálogo.
- En Edge se verificaron a 320 píxeles las imágenes, el aviso sin coincidencia y la navegación a las prácticas relacionadas.

## Traductor de glosas de LSM

- El Traductor consulta 13 expresiones del catálogo y muestra su glosa escrita. Cada resultado lleva a la ficha de práctica dentro de Conecta LSM.
- Se incorporaron ejemplos de consulta, variantes de escritura y un aviso para expresiones pendientes. En Edge se verificó el flujo a 320 píxeles.

## Cambio de nombre a Conecta LSM

- La aplicación adopta el nombre **Conecta LSM** en el encabezado, la pestaña, los avisos y la documentación vigente. El historial de práctica sigue disponible en el mismo navegador y dirección.

## Prácticas de frases y comunicación básica

- Se añadieron **Presentarse**, **Pedir ayuda** e **Invitar a participar** con situaciones para ensayar, fotos de las señas de apoyo y cámara en espejo.
- Presentarse incluye acceso al abecedario para deletrear el nombre. Pedir ayuda reutiliza la ficha local de «Por favor». La unidad se recorre dentro de LinguaPlay con **Practicar siguiente seña**.
- En Edge se verificaron a 320 píxeles las fotos, la navegación entre las tres prácticas y el apagado de la cámara al cambiar de ficha.

## Primeras expresiones cotidianas y referencias locales

- Se retiró «Hasta luego» de Saludos básicos hasta contar con fotos reutilizables dentro de la app. Los enlaces anteriores de esa ficha abren el índice.
- Se quitaron los enlaces externos de las fichas. Los créditos de las fotos y su licencia se muestran como texto.
- Se añadieron **Gracias**, **Por favor**, **Perdón**, **De nada** y **Con permiso** con fotos de la UdeG y práctica con cámara en espejo.
- La prueba en Edge recorrió las seis fichas de Saludos y las cinco de Expresiones a 320 píxeles. Verificó la carga de fotos, la ausencia de enlaces externos y el apagado de la cámara al cambiar de ficha.

## Ampliación de Saludos y práctica directa

- Saludos básicos incorpora **¿Cómo estás?**, **Buenas tardes**, **Buenas noches** y **Adiós** con referencias del glosario de la UdeG.
- Se retiraron las preguntas de repaso de Saludos básicos. Cada ficha lleva a una práctica que muestra la referencia junto a la cámara en espejo. El enlace al repaso anterior abre el índice de la unidad.
- Las fichas de referencia y la práctica directa son el formato de Saludos básicos, Números y las próximas unidades.
- Pasaron las 21 pruebas unitarias. La prueba de Números en Edge verificó las diez fichas, el reconocimiento separado del abecedario, la evaluación del movimiento para el 9 y el 10, y el progreso tras tres fechas distintas.
- La prueba de Saludos en Edge verificó las siete fichas, el recorrido a 320 píxeles y el apagado de la cámara simulada al detenerla o cambiar de ficha.

## Ajustes en Números e inicio de Saludos básicos

- La unidad de Números queda disponible del 1 al 10. Las decenas y centenas pasan a [Pendientes](docs/PENDIENTES.md), con el prototipo anterior en `bca086d` de `Manuel`.
- Se separó la entrada al reconocimiento de cada unidad. Al abrir una práctica numérica se inicia el clasificador de números, incluso cuando una postura se parece a una letra.
- Se inició **Saludos básicos** con fichas de **Hola**, **Buenos días** y **Hasta luego**, y un repaso para elegir la expresión adecuada a cada situación. En Edge se verificaron a 320 píxeles las referencias y el reintento del repaso.
- Pasaron 21 pruebas unitarias. En Edge se comprobó que una misma postura recibe la etiqueta de su unidad, que las rutas de números retirados vuelven al índice y que el progreso de tres días persiste al recargar.

## Práctica de Números con cámara

- En `Manuel`, Números incorpora 28 fichas del 1 al 10, las decenas del 20 al 100 y las centenas del 200 al 1000. Sustituye el ejercicio inicial del 1 al 3 por práctica con la cámara y referencias del glosario de la UdeG.
- Se reutilizaron MediaPipe y el flujo del abecedario para reconocer posturas y movimientos. El 1000 se realiza con ambas manos.
- Se guarda un acierto por número y fecha. Después de tres fechas distintas, la ficha cambia a verde y muestra **Aprendido** en Números y Progreso.
- Pasaron 21 pruebas unitarias. En Edge se comprobó la práctica del 2, el progreso después de recargar y que sostener inmóvil la postura inicial del 1000 no acredita el intento.

## Primer ejercicio de Números y alcance de la entrega

- En `Manuel`, se retiraron Frutas y Colores de Aprender y Progreso (`07f5917`). Las prácticas separadas, sus videos y el criterio de tres días consecutivos quedan en el historial y en [Pendientes](docs/PENDIENTES.md) para una próxima actualización.
- La unidad de Números incorpora las señas del 1 al 3 con fotografías del glosario de la Universidad de Guadalajara y un ejercicio de identificación con retroalimentación y reintento.
- En Edge se verificaron la carga de las tres fichas, el formulario, la finalización y el diseño a 320 píxeles. Pasaron las 14 pruebas unitarias del abecedario.

## Prácticas separadas de Frutas y Colores

- En `Manuel` (`4a5dc90`), Frutas y Colores tienen accesos y fichas propias. Cada ficha incluye un video local de Wikisigns y evaluación del movimiento con cámara.
- Una coincidencia habilita el registro de la práctica. El verde «Aprendida» requiere un acierto registrado por seña en cada uno de tres días consecutivos.
- En Edge se comprobaron las seis muestras con cámara simulada, el rechazo de una seña distinta y la tercera fecha en verde. Las pruebas unitarias cubren rachas, cambio de mes y registros duplicados.

## Unidad de frutas y colores

- El equipo precisó que «tiempo» se refiere a las horas del reloj y retiró lugares y estados del alcance.
- En `Manuel` (`a5c01cd`), Aprender incorpora la unidad **Frutas y colores** con referencias institucionales y tres situaciones de repaso con retroalimentación.
- En Edge se comprobó la navegación, la validación del formulario, el reintento y la vista de 320 px.

## 21 de noviembre de 2026 · Pruebas con la asociación en Xalapa

- Un integrante del equipo acudió a la Asociación de Sordos del Estado de Veracruz, en Xalapa, para probar LinguaPlay LSM y recibir retroalimentación.
- La asociación sugirió agregar operaciones matemáticas, frutas, comida, colores, animales, muebles, lugares y estados, y tiempo.
- Se registraron las sugerencias y los puntos por aclarar en la [propuesta de solución](docs/PROPUESTA_SOLUCION.md) y en los [pendientes](docs/PENDIENTES.md).

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
