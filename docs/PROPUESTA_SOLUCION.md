# Propuesta de solución · Borrador del reporte

LinguaPlay LSM propone una ruta de estudio y práctica para personas que empiezan a aprender Lengua de Señas Mexicana. El piloto permite consultar y practicar las 27 letras del alfabeto manual y, en un ejercicio breve, comprobar la identificación de A, B y C.

## Requisitos y estado

| Requisito | Criterio de comprobación | Estado |
| --- | --- | --- |
| Consultar demostraciones del abecedario | Cada una de las 27 fichas muestra una foto o un video local y el crédito de la fuente. | Implementado. |
| Recibir retroalimentación | El ejercicio solicita tres respuestas, comunica los aciertos, permite reintentar y confirma la finalización. | Implementado en el piloto. |
| Retomar y consultar el avance | La aplicación recupera las fechas registradas por letra después de recargar. La tercera fecha distinta marca la letra como aprendida. | Implementado para el abecedario. |
| Introducir una consulta mediante voz | La frase dictada aparece en español en un campo editable, con estados para permisos y errores. | Pendiente. |
| Practicar con una interacción gestual | El sistema sigue la mano y ofrece retroalimentación para las 27 letras estáticas y con movimiento. | Implementado y probado con cámara simulada. Validación con participantes pendiente. |

## Arquitectura e infraestructura

El piloto usa HTML, CSS, JavaScript y archivos multimedia locales. La navegación por fragmentos de URL abre cada ficha y el ejercicio en un navegador de escritorio o móvil. El formulario comprueba las respuestas en el dispositivo. Las imágenes y videos se guardan junto con el prototipo para poder estudiar las fichas sin conexión.

Para cumplir el requisito académico de dos interacciones adicionales, el **dictado** usará un micrófono para introducir consultas en español. La **práctica gestual** usa la cámara para ensayar el abecedario con retroalimentación experimental. Ambas modalidades se evaluarán por separado.

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
