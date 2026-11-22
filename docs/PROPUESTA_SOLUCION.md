# Propuesta de solución · Borrador del reporte

LinguaPlay LSM propone una ruta de estudio y práctica para personas que empiezan a aprender Lengua de Señas Mexicana. El piloto permite consultar y practicar las 27 letras del alfabeto manual y, en un ejercicio breve, comprobar la identificación de A, B y C.

## Pruebas con la asociación en Xalapa

El 21 de noviembre de 2026, un integrante del equipo visitó a la Asociación de Sordos del Estado de Veracruz, en Xalapa, Veracruz, para probar el prototipo de LinguaPlay LSM. Durante la visita recibió propuestas para ampliar los contenidos. El registro se basa en las notas de la visita y deja por documentar las tareas que se probaron y sus resultados.

| Recomendación recibida | Propuesta de incorporación del equipo |
| --- | --- |
| Frutas y comida | Crear una unidad de alimentación con frutas como grupo propio. Usar alimentos cotidianos como ejemplos. |
| Colores | Añadir una actividad para reconocer colores y usarlos al describir alimentos u objetos. |
| Animales y muebles | Preparar grupos de vocabulario separados. Seleccionar ejemplos conocidos y confirmar las señas con la asociación. |
| Lugares y estados | Tema sugerido durante la visita y retirado del alcance por decisión del equipo. |
| Tiempo | El equipo precisó que se refiere a las horas del reloj. La unidad abordará cómo preguntar y decir la hora. |
| Operaciones matemáticas | Usar la unidad de Números como base. Acordar qué operaciones y ejemplos introducir primero y cómo expresarlos en LSM. |

El prototipo tiene una unidad de Números en vista previa que puede servir de base para Horas y Operaciones matemáticas.

### Prácticas de Frutas y Colores

En la revisión `4a5dc90` de `Manuel`, Frutas presenta manzana, plátano y pera. Colores presenta rojo, amarillo y verde. Cada ficha incluye una demostración en video de Wikisigns, su crédito y una evaluación con cámara. [Diccionario Wikisigns de LSM](https://www.wikisigns.org/list/es/lsm)

La evaluación toma una secuencia de puntos de una o ambas manos con MediaPipe. El comparador contrasta la trayectoria y las distancias entre articulaciones con el video de referencia, y devuelve una coincidencia solo si el resultado es suficientemente claro. El modelo usa ejemplos de Wikisigns. Queda pendiente medir su precisión con otras personas y corroborar con la asociación las variantes que se emplean en Xalapa.

El primer acierto confirmado y registrado en cada fecha cuenta para la seña correspondiente. Se exige una racha de tres fechas locales consecutivas, independiente por seña. El historial usa el almacenamiento del navegador y el color verde va acompañado de la etiqueta **Aprendida**. Las pruebas unitarias comprueban los saltos de día, el cambio de mes, los registros duplicados y la conservación del estado aprendido. En Manuel, el comando `node tests/vocabulary-browser.cjs` prueba las seis muestras en Edge con cámara simulada, una seña distinta a la ficha y el paso a verde en la tercera fecha.

### Evidencia y seguimiento

Antes de publicar nuevas fichas, confirmar las señas, las variantes pertinentes en Xalapa y el permiso para usar cualquier grabación. Para la siguiente ronda, registrar las tareas realizadas y las observaciones de las personas participantes con su consentimiento. Las notas de esta sesión permiten identificar temas de interés y orientar el trabajo de contenidos.

## Requisitos y estado

| Requisito | Criterio de comprobación | Estado |
| --- | --- | --- |
| Consultar demostraciones del abecedario | Cada una de las 27 fichas muestra una foto o un video local y el crédito de la fuente. | Implementado. |
| Recibir retroalimentación | El ejercicio solicita tres respuestas, comunica los aciertos, permite reintentar y confirma la finalización. | Implementado en el piloto. |
| Retomar y consultar el avance | La aplicación recupera las fechas registradas por letra después de recargar. La tercera fecha distinta marca la letra como aprendida. | Implementado para el abecedario. |
| Introducir una consulta mediante voz | La frase se añade en español de México al campo editable, con estados para permisos, errores y cancelación. | Implementado y probado con reconocimiento simulado. Validación con micrófono físico pendiente. |
| Practicar con una interacción gestual | El sistema sigue la mano y ofrece retroalimentación para las 27 letras estáticas y con movimiento. | Implementado y probado con cámara simulada. Validación con participantes pendiente. |

## Arquitectura e infraestructura

El piloto usa HTML, CSS, JavaScript y archivos multimedia locales. La navegación por fragmentos de URL abre cada ficha y el ejercicio en un navegador de escritorio o móvil. El formulario comprueba las respuestas en el dispositivo. Las imágenes y videos se guardan junto con el prototipo para poder estudiar las fichas sin conexión.

El prototipo incorpora dos modalidades adicionales a la interfaz gráfica. El **dictado** usa un micrófono para introducir consultas en español y la **práctica gestual** usa la cámara para ensayar el abecedario. Las pruebas con participantes y dispositivos físicos se harán por separado.

### Decisión técnica para el dictado

Se eligió la API Web Speech porque permite incorporar una entrada por voz en la aplicación web existente. `SpeechRecognition` y su variante `webkitSpeechRecognition` permiten solicitar el micrófono desde la acción de la persona y devolver texto sin que el equipo tenga que operar un servicio propio de reconocimiento. El prototipo solicita `es-MX`, recibe una frase corta y agrega los resultados finales al campo editable. La persona confirma el envío de la consulta después de revisar el texto. [Especificación de Web Speech](https://wicg.github.io/speech-api/)

Para usarlo se necesita un navegador compatible, permiso de micrófono y acceso al servicio que ofrezca ese navegador. El servicio puede requerir conexión y enviar el audio al proveedor. Por ejemplo, Microsoft documenta el uso de Azure Cognitive Services en Edge. La interfaz informa de ese tratamiento y ofrece el campo de escritura cuando el servicio falla o no está disponible. Al salir de la vista se cancela la sesión de voz. [Política de reconocimiento de voz de Edge](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-browser-policies/speechrecognitionenabled)

La prueba `node tests/dictation-browser.cjs` usa un servicio de voz simulado en Edge para comprobar `es-MX`, transcripción final, edición, límite de texto, permiso denegado, fallos de conexión, cancelación y escritura sin la API. La evaluación con dispositivos físicos deberá verificar la transcripción de frases en español de México y la disponibilidad real del servicio.

### Decisión técnica para la práctica con cámara

Se consideraron tres criterios: funcionar en el navegador sin instalaciones adicionales para el usuario, mantener el video en el dispositivo y poder probar cada componente por separado. Para la captura se eligió `getUserMedia`, que solicita el permiso al navegador y permite liberar el video al abandonar la vista. Para el seguimiento se eligió **MediaPipe Hand Landmarker**: ofrece un modelo web que entrega 21 puntos por mano y permite cargar el modelo y WebAssembly junto con la aplicación. Una API de análisis remoto requeriría enviar imágenes de la cámara y depender de un servicio en cada sesión. Una aplicación nativa implicaría empaquetar y mantener versiones para cada plataforma. [Captura en navegador](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) · [MediaPipe para web](https://developers.google.com/edge/mediapipe/solutions/setup_web) · [Hand Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker?tab=Web)

El prototipo carga MediaPipe Tasks Vision 0.10.21 y el modelo Hand Landmarker en un Web Worker dedicado, con un fotograma en proceso a la vez. El hilo de la interfaz conserva la vista previa, dibuja los puntos de la mano y muestra la retroalimentación. Los fotogramas se procesan en el dispositivo y se liberan después del análisis.

Para las **21 letras estáticas** elegimos comparar la geometría con referencias de las fotos de la UABCS. El clasificador mide distancias entre articulaciones normalizadas por el tamaño de la palma y da más peso a las puntas de los dedos y al pulgar. Usa la orientación en pantalla como indicador complementario. La interfaz confirma una letra tras tres muestras consecutivas compatibles y se abstiene si falta encuadre o si las clases candidatas tienen resultados demasiado cercanos.

Para **J, Ñ, P, Q, X y Z** elegimos comparar secuencias porque un fotograma aislado pierde la trayectoria. Durante un intento guiado se sigue una mano y se comparan tramos de la captura con referencias extraídas de los videos de la UABCS. Se combinan la trayectoria de la palma y los dedos y la forma tridimensional. Se rechazan periodos sin movimiento suficiente y cambios abruptos que se parezcan a saltos entre dos poses. Los puntos se usan durante el intento.

### Criterio de progreso por letra

El primer acierto acredita el primer día de práctica. El equipo podrá revisar el umbral provisional de **tres fechas distintas** después de probar el flujo. La persona confirma cada registro con un botón, y repetirlo en la misma fecha sirve como repaso. El criterio mantiene visible el avance entre visitas y evita equiparar un intento aislado con el objetivo de la unidad.

Se almacena una clave en `localStorage` por letra y fecha local. Esta granularidad evita que dos pestañas se sobrescriban al guardar prácticas distintas. El historial se mantiene en el navegador y en el mismo origen del sitio. Si falla el almacenamiento, la aplicación conserva los registros sin guardar en memoria durante la visita. [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

### Pruebas del prototipo de reconocimiento

Los comandos se ejecutan en `Manuel`. La integración se verificó con Node.js 24 y Microsoft Edge. Para usar otra instalación de Edge, indica su ejecutable en la variable `BROWSER_PATH`.

| Prueba | Resultado |
| --- | --- |
| `node --test tests/sign-classifier.test.mjs tests/sign-motion.test.mjs tests/letter-progress.test.mjs` | Pasaron 14 pruebas. Cubren las 21 letras estáticas con 63 muestras, los seis movimientos, poses inmóviles e interrupciones, fechas distintas, duplicados y recuperación del historial. |
| `node tests/gesture-browser.cjs` | Pasó en Edge con las fotos de la UABCS como cámara simulada, MediaPipe y WebAssembly reales. Se comprobó el reconocimiento estático, la letra incorrecta, dos manos, encuadre vacío, el apagado y los errores del navegador. Se simularon tres fechas y se verificó el cambio a verde y la persistencia tras recargar. |
| `node tests/gesture-browser.cjs --motion` | Pasó en Edge con los seis videos de la UABCS como cámara simulada. Se comprobó que activar la cámara no habilita el registro hasta identificar el movimiento y que el primer acierto solo acredita el primer día. |

Las simulaciones provienen del material de la UABCS y algunas repiten las fuentes de calibración con transformaciones de tamaño, espejo y giro. Quedan pendientes la medición con participantes nuevos, cámaras físicas y teléfonos, y la revisión de señas parecidas o movimientos capturados con pocos fotogramas.

## Material del piloto

Las fotos y los videos proceden del recurso educativo abierto *LSM Biblioteca: Alfabeto de Lengua de Señas Mexicana*, de la Biblioteca Universitaria UABCS (2025). La fuente acredita el material del alfabeto a Yahilyn Rodriguez, Michelle Bocanegra y Kenya Sanchez e informa que contó con asesoría de profesionales y de la comunidad sorda. Se redimensionaron las 21 fotografías y se conservó el formato original de los seis videos. El material conserva su licencia CC BY-SA 4.0. [Recurso original](https://biblio.uabcs.mx/recursosedu/lsm/) · [Licencia](https://creativecommons.org/licenses/by-sa/4.0/)

### Sustitución por material del equipo

En `Manuel`, los archivos están en `assets/abecedario/` y se identifican por letra. Al incorporar una toma propia, registrar quién la realizó, quién revisó la seña y qué permiso tiene el proyecto para publicarla. Ajustar el crédito de esa ficha y conservar la atribución de los archivos de la UABCS que sigan en uso. Las referencias de reconocimiento se mantienen en `assets/gestos/static-reference-poses.mjs` y `sign-motion-references.mjs`. Actualizar las referencias cuando la nueva toma aporte una variante revisada y usar muestras de otras personas para medir el resultado. Verificar las fichas en móvil y escritorio y, cuando cambien A, B o C, comprobar también el ejercicio.
