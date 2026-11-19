# Propuesta de solución · Borrador del reporte

LinguaPlay LSM propone una ruta de estudio y práctica para personas que empiezan a aprender Lengua de Señas Mexicana. El objetivo del piloto es que la persona pueda observar y distinguir las configuraciones de A, B y C del alfabeto manual, y comprobar su identificación en un ejercicio breve.

## Requisitos y estado

| Requisito | Criterio de comprobación | Estado |
| --- | --- | --- |
| Consultar demostraciones del abecedario | Cada una de las 27 fichas muestra una foto o un video local y el crédito de la fuente. | Implementado. |
| Recibir retroalimentación | El ejercicio solicita tres respuestas, comunica los aciertos, permite reintentar y confirma la finalización. | Implementado en el piloto. |
| Retomar y consultar el avance | La aplicación recupera el progreso después de regresar o recargar. | Pendiente. La finalización del piloto se conserva durante la visita. |
| Introducir una consulta mediante voz | La frase dictada aparece en español en un campo editable, con estados para permisos y errores. | Pendiente. |
| Practicar con una interacción gestual | El sistema sigue una mano y ofrece retroalimentación al practicar A, B y C. | Piloto implementado y probado con cámara simulada. Validación con participantes pendiente. |

## Arquitectura e infraestructura

El piloto usa HTML, CSS, JavaScript y archivos multimedia locales. La navegación por fragmentos de URL abre cada ficha y el ejercicio en un navegador de escritorio o móvil. El formulario comprueba las respuestas en el dispositivo. Las imágenes y videos se guardan junto con el prototipo para poder estudiar las fichas sin conexión.

Para cumplir el requisito académico de dos interacciones adicionales, el **dictado** usará un micrófono para introducir consultas en español. La **práctica gestual** ya usa la cámara para ensayar tres configuraciones con retroalimentación experimental. Ambas modalidades se evaluarán por separado.

### Decisión técnica para la práctica con cámara

Se consideraron tres criterios: funcionar en el navegador sin instalaciones adicionales para el usuario, mantener el video en el dispositivo y poder probar cada componente por separado. Para la captura se eligió `getUserMedia`, que solicita el permiso al navegador y permite liberar el video al abandonar la vista. Para el seguimiento se eligió **MediaPipe Hand Landmarker**: ofrece un modelo web que entrega 21 puntos por mano y permite cargar el modelo y WebAssembly junto con la aplicación. Una API de análisis remoto requeriría enviar imágenes de la cámara y depender de un servicio en cada sesión. Una aplicación nativa implicaría empaquetar y mantener versiones para cada plataforma. [Captura en navegador](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) · [MediaPipe para web](https://developers.google.com/edge/mediapipe/solutions/setup_web) · [Hand Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker?tab=Web)

El prototipo carga MediaPipe Tasks Vision 0.10.21 y el modelo Hand Landmarker en un Web Worker dedicado, con un fotograma en proceso a la vez. El hilo de la interfaz conserva la vista previa, dibuja los puntos de la mano y muestra la retroalimentación. Los fotogramas se procesan en el dispositivo y se liberan después del análisis.

Para el piloto se eligieron reglas geométricas porque A, B y C son configuraciones estáticas que pueden distinguirse por la flexión de los dedos, la separación y la posición del pulgar. El clasificador normaliza medidas de los puntos 3D por el tamaño de la palma y usa las coordenadas de la imagen para descartar manos muy pequeñas o recortadas. La pantalla confirma una letra después de tres resultados consecutivos compatibles y se abstiene ante resultados ambiguos. Los límites se calibraron con las fotos de la UABCS. Su desempeño con personas y condiciones distintas se evaluará con ejemplos nuevos.

### Pruebas del prototipo de reconocimiento

Los comandos se ejecutan en `Manuel`. La integración se verificó con Node.js 24 y Microsoft Edge. Para usar otra instalación de Edge, indica su ejecutable en la variable `BROWSER_PATH`.

| Prueba | Resultado |
| --- | --- |
| `node --test tests/sign-classifier.test.mjs` | Cuatro pruebas pasaron. Cubren A, B y C, rechazo de otras posturas, invariancia geométrica y puntos ausentes o fuera de cuadro. |
| `node tests/gesture-browser.cjs` | Pasó en Edge con el modelo y WebAssembly reales. La cámara simulada reprodujo fotos de la UABCS para comprobar coincidencias, una letra distinta a la ficha, una postura desconocida, dos manos y encuadre vacío. También se verificaron el dibujo y la limpieza de los puntos, la liberación de la cámara, el permiso denegado y la disponibilidad de la vista previa cuando falta el modelo. |

Durante la calibración en modo video se evaluaron 84 muestras de 21 fotos de la UABCS, con sus variantes de espejo y rotación. El clasificador reconoció las 12 muestras de A, B y C y se abstuvo en las 72 de otras letras estáticas. Son comprobaciones sobre el material de calibración. Quedan pendientes las pruebas con cámaras físicas, distintos participantes y dispositivos móviles.

## Material del piloto

Las fotos y los videos proceden del recurso educativo abierto *LSM Biblioteca: Alfabeto de Lengua de Señas Mexicana*, de la Biblioteca Universitaria UABCS (2025). La fuente acredita el material del alfabeto a Yahilyn Rodriguez, Michelle Bocanegra y Kenya Sanchez e informa que contó con asesoría de profesionales y de la comunidad sorda. Se redimensionaron las 21 fotografías y se conservó el formato original de los seis videos. El material conserva su licencia CC BY-SA 4.0. [Recurso original](https://biblio.uabcs.mx/recursosedu/lsm/) · [Licencia](https://creativecommons.org/licenses/by-sa/4.0/)

### Sustitución por material del equipo

En `Manuel`, los archivos están en `assets/abecedario/` y se identifican por letra. Al incorporar una toma propia, registrar quién la realizó, quién revisó la seña y qué permiso tiene el proyecto para publicarla. Ajustar el crédito de esa ficha y conservar la atribución de los archivos de la UABCS que sigan en uso. Si una letra cambia de foto a video o viceversa, actualizar el conjunto `motionLetters` en `app.js`. Verificar la visualización en móvil y escritorio y, cuando cambien A, B o C, comprobar también el ejercicio.
