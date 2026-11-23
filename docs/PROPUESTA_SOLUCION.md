# Propuesta de solución · Borrador del reporte

LinguaPlay LSM propone una ruta de estudio y práctica para personas que empiezan a aprender Lengua de Señas Mexicana. El piloto permite consultar y practicar con cámara las 27 letras del alfabeto manual, los números del 1 al 10 y siete expresiones de Saludos básicos en LSM. El abecedario también incluye un ejercicio de identificación de A, B y C.

## Pruebas con la asociación en Xalapa

El 21 de noviembre de 2026, un integrante del equipo visitó a la Asociación de Sordos del Estado de Veracruz, en Xalapa, Veracruz, para probar el prototipo de LinguaPlay LSM. Durante la visita recibió propuestas para ampliar los contenidos. El registro se basa en las notas de la visita y deja por documentar las tareas que se probaron y sus resultados.

| Recomendación recibida | Propuesta de incorporación del equipo |
| --- | --- |
| Frutas y comida | Preparar una práctica independiente para Frutas en una próxima actualización y definir los contenidos de Comida. |
| Colores | Preparar una práctica independiente para Colores en una próxima actualización. |
| Animales y muebles | Preparar grupos de vocabulario separados. Seleccionar ejemplos conocidos y confirmar las señas con la asociación. |
| Lugares y estados | Tema sugerido durante la visita y retirado del alcance por decisión del equipo. |
| Tiempo | El equipo precisó que se refiere a las horas del reloj. La unidad abordará cómo preguntar y decir la hora. |
| Operaciones matemáticas | Usar la unidad de Números como base. Acordar qué operaciones y ejemplos introducir primero y cómo expresarlos en LSM. |

### Práctica de Números

La unidad activa cubre del 1 al 10 y lleva de cada ficha a la práctica con cámara. Cada ficha incluye una foto para la seña estática o dos posiciones y una instrucción para la seña en movimiento. Las referencias proceden de los recortes de fotografías de Servando Alvarado Cisneros en el glosario, bajo CC BY-NC-SA 4.0. [Glosario universitario de Lengua de Señas Mexicana](https://riudg.udg.mx/handle/20.500.12104/111344) · [Licencia](https://creativecommons.org/licenses/by-nc-sa/4.0/)

MediaPipe sigue la mano desde el navegador. Para las señas del 1 al 8, el comparador contrasta la geometría y la orientación con las fotos. Para el 9 y el 10, considera también la secuencia de movimiento. En las pruebas cruzadas, las posturas de referencia de 2, 3 y 4 produjeron V, W y B al evaluarlas desde el abecedario. Se separaron las entradas a los dos clasificadores. Cada ficha inicia el reconocimiento de su unidad, y una versión incompatible del módulo pide recargar la página. El registro se habilita con una coincidencia en la ficha actual.

El historial usa claves por número y fecha local independientes del abecedario. Tras tres fechas distintas con acierto registrado, la ficha aparece en verde como **Aprendido** en Números y Progreso. El reconocimiento es experimental y deberá validarse con participantes y cámaras físicas.

Las pruebas unitarias usaron posturas y transiciones de referencia para comprobar las señas del 1 al 8, las repeticiones del 9 y el giro del 10. También verificaron el registro por fecha. En Edge, `node tests/numbers-browser.cjs` usó MediaPipe y una cámara simulada. La misma imagen se identificó como V en Abecedario y como 2 en Números. Al cambiar de unidad se liberó la cámara anterior. Se verificaron el regreso al índice desde las rutas de números retirados, el rechazo de las posturas inmóviles del 9 y el 10 y la persistencia del progreso tras tres fechas distintas.

Las decenas del 20 al 100 y las centenas del 200 al 1000 quedan para una próxima actualización. Sus fichas y referencias permanecen en el historial de `Manuel` (`bca086d`). Se conservan los registros previos que ya tuviera el navegador.

### Saludos básicos

La unidad presenta **Hola**, **¿Cómo estás?**, **Buenos días**, **Buenas tardes**, **Buenas noches**, **Adiós** y **Hasta luego**. Las seis fichas con fotografías usan recortes del glosario de la UdeG, con licencia CC BY-NC-SA 4.0. **Hasta luego** enlaza al video de Carlos Gonzalez publicado para Wikisigns. Cada ficha incluye indicaciones sobre el movimiento o cómo observar la referencia. [Glosario de la UdeG](https://riudg.udg.mx/handle/20.500.12104/111344) · [Hasta luego en Wikisigns](https://www.wikisigns.org/es/lsm/hasta%20luego)

La práctica guiada muestra la referencia junto a la vista en espejo. La persona activa la cámara, compara su ejecución con la seña y repite el movimiento a su ritmo. La evaluación automática y la validación con personas usuarias de LSM quedan pendientes. El enlace anterior al repaso abre el índice de Saludos básicos.

Saludos básicos y Números adoptan el formato de ficha de referencia y práctica directa de cada seña. Las próximas unidades seguirán el mismo formato.

En Edge, `node tests/greetings-browser.cjs` comprobó las siete fichas, la carga de las 19 fotografías, el enlace al video y el recorrido desde los enlaces anteriores. Con una cámara simulada a 320 píxeles, verificó la vista en espejo, la activación voluntaria, la captura exclusiva de video y la liberación al detenerla o pasar a otro saludo. También comprobó el acceso directo a la práctica en Números.

### Frutas y Colores en una próxima actualización

El alcance de la entrega actual retira ambas prácticas de Aprender y Progreso. El prototipo de Frutas (manzana, plátano y pera) y Colores (rojo, amarillo y verde) queda registrado en `4a5dc90` y `b5550bf` de `Manuel`. [Diccionario Wikisigns de LSM](https://www.wikisigns.org/list/es/lsm)

Para reincorporarlas, cada tema tendrá su propia práctica, con una muestra en video por seña y evaluación con cámara. El estado **Aprendida** se marcará en verde después de registrar un acierto por seña en cada uno de tres días consecutivos. Queda pendiente confirmar las variantes con la asociación y medir el reconocimiento con distintas personas y cámaras físicas.

### Evidencia y seguimiento

Antes de publicar nuevas fichas, confirmar las señas, las variantes pertinentes en Xalapa y el permiso para usar cualquier grabación. Para la siguiente ronda, registrar las tareas realizadas y las observaciones de las personas participantes con su consentimiento. Las notas de esta sesión permiten identificar temas de interés y orientar el trabajo de contenidos.

## Requisitos y estado

| Requisito | Criterio de comprobación | Estado |
| --- | --- | --- |
| Consultar demostraciones de las señas | Cada ficha presenta una referencia visual y el crédito de la fuente. | Implementado en Abecedario, Números y Saludos básicos. |
| Recibir retroalimentación | La práctica con cámara comunica la coincidencia o pide reintentar. El ejercicio de A, B y C muestra el número de aciertos. | Implementado. |
| Retomar y consultar el avance | La aplicación recupera los aciertos por seña después de recargar. La tercera fecha distinta marca la ficha aprendida en verde. | Implementado en Abecedario y Números. |
| Introducir una consulta mediante voz | La frase se añade en español de México al campo editable, con estados para permisos, errores y cancelación. | Implementado y probado con reconocimiento simulado. Validación con micrófono físico pendiente. |
| Practicar con la cámara | La aplicación muestra la referencia junto a la imagen de la persona. Abecedario y Números ofrecen reconocimiento experimental. Saludos básicos permite comparar la ejecución en espejo. | Implementado. Validación con participantes pendiente. |

## Arquitectura e infraestructura

El piloto usa HTML, CSS, JavaScript y archivos multimedia locales. La navegación por fragmentos de URL abre cada ficha y su práctica en un navegador de escritorio o móvil. El ejercicio piloto de A, B y C comprueba las respuestas en el dispositivo. El prototipo incluye las fotos y los videos del abecedario y las fotos de Números y Saludos básicos. El video de Hasta luego se consulta en su sitio de origen.

El prototipo incorpora dos modalidades adicionales a la interfaz gráfica. El **dictado** usa un micrófono para introducir consultas en español y la **práctica gestual** usa la cámara para ensayar letras, números del 1 al 10 y los saludos. Las pruebas con participantes y dispositivos físicos se harán por separado.

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
