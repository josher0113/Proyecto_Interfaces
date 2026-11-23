# Propuesta de solución · Borrador del reporte

Conecta LSM propone una ruta de estudio y práctica para personas que empiezan a aprender Lengua de Señas Mexicana. El piloto permite consultar y practicar con cámara las 27 letras del alfabeto manual, los números del 1 al 10, seis fichas de Saludos básicos, cinco de Expresiones cotidianas y tres prácticas de Frases y comunicación básica en LSM. El abecedario también incluye un ejercicio de identificación de A, B y C.

## Pruebas con la asociación en Xalapa

El 21 de noviembre de 2026, un integrante del equipo visitó a la Asociación de Sordos del Estado de Veracruz, en Xalapa, Veracruz, para probar el prototipo de Conecta LSM. Durante la visita recibió propuestas para ampliar los contenidos. El registro se basa en las notas de la visita y deja por documentar las tareas que se probaron y sus resultados.

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

### Saludos básicos y Expresiones cotidianas

Saludos básicos incluye **Hola**, **Buenos días**, **Buenas tardes**, **Buenas noches**, **¿Cómo estás?** y **Adiós**. Se retiró «Hasta luego» hasta disponer de una secuencia fotográfica que se pueda incorporar a la aplicación. Expresiones cotidianas comienza con **Gracias**, **Por favor**, **Perdón**, **De nada** y **Con permiso**. Las cinco fichas de esta unidad usan ocho recortes de las páginas 155 a 157 del glosario de la UdeG. Las fichas de ambas unidades conservan los créditos y la licencia CC BY-NC-SA 4.0.

Cada práctica muestra las fotos, las indicaciones y la vista en espejo. La persona activa la cámara, compara su ejecución con la seña y repite a su ritmo. Las dos unidades comparten la misma vista. La evaluación automática y la validación con personas usuarias de LSM quedan pendientes.

Los materiales de las fichas se incluyen en la aplicación. Los créditos se muestran en texto y la documentación de los archivos conserva las referencias de origen. Las próximas unidades seguirán el formato de referencia local y práctica directa.

En Edge, `node tests/greetings-browser.cjs` recorrió las 11 fichas y sus prácticas a 320 píxeles. Comprobó la carga de las fotos, la navegación interna, la ausencia de cuestionarios, el regreso al índice desde las rutas retiradas y la liberación de la cámara al cambiar de expresión.

### Frases y comunicación básica

La unidad propone tres situaciones de conversación. **Presentarse** muestra «¿Cómo te llamas?» y «Mucho gusto» y enlaza al abecedario para deletrear el nombre. **Pedir ayuda** reutiliza la ficha de «Por favor» y añade «Ayudar». **Invitar a participar** emplea «Querer» y «Actividad». Cada situación muestra sus señas de apoyo con instrucciones y abre la práctica con la cámara en espejo.

Se incorporaron 12 recortes del glosario de la UdeG (pp. 163, 164, 213, 236 y 278) bajo CC BY-NC-SA 4.0. Las fotos y los créditos se incluyen en la app. Las consignas proponen ensayos, y las señas se presentan como apoyos individuales. Queda pendiente validar con la asociación ejemplos completos de peticiones e invitaciones y las variantes que se usan en Xalapa.

La prueba `node tests/greetings-browser.cjs` recorrió las 14 fichas de Saludos, Expresiones y Frases en Edge a 320 píxeles. Comprobó las fotos de cada práctica, la consulta del abecedario desde Presentarse, la navegación interna sin cuestionarios y el apagado de la cámara simulada al cambiar de situación.

### Frutas y Colores en una próxima actualización

El alcance de la entrega actual retira ambas prácticas de Aprender y Progreso. El prototipo de Frutas (manzana, plátano y pera) y Colores (rojo, amarillo y verde) queda registrado en `4a5dc90` y `b5550bf` de `Manuel`. [Diccionario Wikisigns de LSM](https://www.wikisigns.org/list/es/lsm)

Para reincorporarlas, cada tema tendrá su propia práctica, con una muestra en video por seña y evaluación con cámara. El estado **Aprendida** se marcará en verde después de registrar un acierto por seña en cada uno de tres días consecutivos. Queda pendiente confirmar las variantes con la asociación y medir el reconocimiento con distintas personas y cámaras físicas.

### Evidencia y seguimiento

Antes de publicar nuevas fichas, confirmar las señas, las variantes pertinentes en Xalapa y el permiso para usar cualquier grabación. Para la siguiente ronda, registrar las tareas realizadas y las observaciones de las personas participantes con su consentimiento. Las notas de esta sesión permiten identificar temas de interés y orientar el trabajo de contenidos.

## Requisitos y estado

| Requisito | Criterio de comprobación | Estado |
| --- | --- | --- |
| Consultar demostraciones de las señas | Cada ficha presenta una referencia visual y el crédito de la fuente. | Implementado en Abecedario, Números, Saludos básicos, Expresiones cotidianas y Frases y comunicación básica. |
| Recibir retroalimentación | La práctica con cámara comunica la coincidencia o pide reintentar. El ejercicio de A, B y C muestra el número de aciertos. | Implementado. |
| Iniciar sesión y separar el historial | Cada cuenta recupera su propio progreso al volver a entrar. Se conserva el avance de invitado. | Implementado y comprobado en Edge. |
| Retomar y consultar el avance | La aplicación recupera los aciertos por seña después de recargar. La tercera fecha distinta marca la ficha aprendida en verde. | Implementado en Abecedario y Números. |
| Mantener una racha de práctica | La racha suma cada fecha local consecutiva con al menos un acierto registrado en letras o números. | Implementado por perfil e invitado. |
| Deletrear con SignWriting de LSM | Cada letra del texto se muestra con su grafía local y se conserva la separación por palabras. | Implementado para las 27 letras. |
| Introducir una consulta mediante voz | El dictado local añade la frase en español al campo editable, con avisos para permisos, errores y cancelación. | Implementado. Pruebas funcionales con un archivo de audio y con micrófonos físicos en un Galaxy A57 y una HP ProBook 445 G8. |
| Practicar con la cámara | La aplicación muestra la referencia junto a la imagen de la persona. Abecedario y Números ofrecen reconocimiento experimental. Saludos, Expresiones y Frases permiten comparar la ejecución en espejo. | Implementado. Pruebas funcionales con cámara en un Galaxy A57 y una HP ProBook 445 G8. Evaluación con participantes pendiente. |

## Arquitectura e infraestructura

El piloto usa HTML, CSS, JavaScript y archivos multimedia locales. La navegación por fragmentos de URL abre cada ficha y su práctica en un navegador de escritorio o móvil. El ejercicio piloto de A, B y C comprueba las respuestas en el dispositivo. El prototipo incluye las fotos y los videos del abecedario y las fotos de Números, Saludos básicos, Expresiones cotidianas y Frases y comunicación básica.

El prototipo incorpora dos modalidades adicionales a la interfaz gráfica. El **dictado** usa un micrófono para introducir consultas en español y la **práctica gestual** usa la cámara para ensayar letras, números del 1 al 10, saludos, expresiones cotidianas y situaciones de conversación. El 23 de noviembre de 2026, un integrante del equipo confirmó el funcionamiento del dictado y de la práctica con cámara del abecedario en un Samsung Galaxy A57 con Chrome para Android. El teléfono accedió al servidor de la computadora por USB mediante ADB. El equipo realizó también una prueba local de dictado y práctica con cámara en una HP ProBook 445 G8. Queda pendiente evaluar la precisión de ambas modalidades con participantes.

### Cuenta y progreso local

El inicio de sesión permite elegir un perfil para guardar los aciertos de letras y números de cada persona. La aplicación persiste la sesión y el identificador del perfil en el almacenamiento del navegador. Web Crypto deriva un verificador de contraseña con PBKDF2 y una sal aleatoria por cuenta. Se conservaron las claves de progreso anteriores para el modo invitado. Las cuentas y el avance abarcan el mismo navegador y la misma dirección de la aplicación.

La prueba `node tests/profile-browser.cjs` comprobó en Edge el registro a 320 píxeles, la sesión tras recargar, el cierre y el reingreso, el rechazo de una contraseña incorrecta y la separación entre los historiales del invitado y la cuenta.

### Deletreador del abecedario en SignWriting

El deletreador representa el texto letra por letra mediante el abecedario manual de LSM. Genera una secuencia visual por palabra y deja la letra latina debajo de cada grafía como referencia. Las fichas del abecedario usan los mismos archivos. La ruta anterior `#traductor` abre el deletreador.

Las 27 grafías son recortes de entradas de SignPuddle Online publicadas en *Lengua de Señas Mexicana, 3 de mayo de 2025*. Se incluye una variante por letra y se conservan las marcas de movimiento presentes en esa variante. Las grabaciones de la UABCS pueden mostrar otras variantes. El detalle de páginas, créditos y licencia CC BY-SA 3.0 está en `assets/signwriting/README.md` de `Manuel`.

La conversión pasa el texto a mayúsculas y usa la vocal base para las vocales acentuadas y la Ü. La Ñ conserva su grafía propia. Las imágenes son locales, y el resultado se puede consultar sin instalar fuentes ni llamar a servicios externos.

La prueba `node tests/signwriting-browser.cjs` verificó las 27 grafías y fichas en Edge a 320 píxeles. Cubrió la Ñ, la separación por palabras, las vocales acentuadas y los caracteres omitidos.

### Decisión técnica para el dictado

El primer prototipo usó Web Speech por su integración con el navegador. Durante las pruebas surgió un error de conexión con el proveedor de voz. Elegimos Vosk para procesar el audio en el dispositivo y evitar que la transcripción dependa de la conexión con un proveedor externo. El modelo incluido es de español general.

El navegador pide permiso al micrófono mediante `getUserMedia`. Un `AudioWorklet` agrupa las muestras y Vosk las procesa con WebAssembly en un trabajador. El texto se añade al campo editable. El dictado requiere un navegador compatible y acceso por HTTPS o `localhost`. El modelo comprimido pesa unos 40 MB y se carga desde el mismo origen que la aplicación al iniciar el primer dictado.

La prueba `node tests/dictation-browser.cjs` verificó en Edge la captura simulada, los permisos, la cancelación, la liberación del micrófono y la escritura manual cuando el motor no está disponible. Con un WAV generado con voz sintética de español de México, transcribió «Buenos días, esto es una prueba de dictado». Queda pendiente medir el tiempo de la primera carga y evaluar la precisión con distintas voces y micrófonos.

### Decisión técnica para la práctica con cámara

Se consideraron tres criterios: funcionar en el navegador sin instalaciones adicionales para el usuario, mantener el video en el dispositivo y poder probar cada componente por separado. Para la captura se eligió `getUserMedia`, que solicita el permiso al navegador y permite liberar el video al abandonar la vista. Para el seguimiento se eligió **MediaPipe Hand Landmarker**: ofrece un modelo web que entrega 21 puntos por mano y permite cargar el modelo y WebAssembly junto con la aplicación. Una API de análisis remoto requeriría enviar imágenes de la cámara y depender de un servicio en cada sesión. Una aplicación nativa implicaría empaquetar y mantener versiones para cada plataforma. [Captura en navegador](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) · [MediaPipe para web](https://developers.google.com/edge/mediapipe/solutions/setup_web) · [Hand Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker?tab=Web)

El prototipo carga MediaPipe Tasks Vision 0.10.21 y el modelo Hand Landmarker en un Web Worker dedicado, con un fotograma en proceso a la vez. El hilo de la interfaz conserva la vista previa, dibuja los puntos de la mano y muestra la retroalimentación. Los fotogramas se procesan en el dispositivo y se liberan después del análisis.

Para las **21 letras estáticas** elegimos comparar la geometría con referencias de las fotos de la UABCS. El clasificador mide distancias entre articulaciones normalizadas por el tamaño de la palma y da más peso a las puntas de los dedos y al pulgar. Usa la orientación en pantalla como indicador complementario. La interfaz confirma una letra tras tres muestras consecutivas compatibles y se abstiene si falta encuadre o si las clases candidatas tienen resultados demasiado cercanos.

Para **J, Ñ, P, Q, X y Z** elegimos comparar secuencias porque un fotograma aislado pierde la trayectoria. Durante un intento guiado se sigue una mano y se comparan tramos de la captura con referencias extraídas de los videos de la UABCS. Se combinan la trayectoria de la palma y los dedos y la forma tridimensional. Se rechazan periodos sin movimiento suficiente y cambios abruptos que se parezcan a saltos entre dos poses. Los puntos se usan durante el intento.

### Criterio de progreso por letra

El primer acierto acredita el primer día de práctica. El equipo podrá revisar el umbral provisional de **tres fechas distintas** después de probar el flujo. La persona confirma cada registro con un botón, y repetirlo en la misma fecha sirve como repaso. El criterio mantiene visible el avance entre visitas y evita equiparar un intento aislado con el objetivo de la unidad.

La racha de práctica se deriva de las fechas que ya se guardan por seña. Se unen los historiales de letras y números de la cuenta activa o del invitado. El conteo empieza en la fecha actual si tiene un acierto registrado y desde ayer si todavía falta la práctica de hoy. Avanza hacia atrás hasta el primer día sin registro. Repasar una seña aprendida puede sumar a la racha en una nueva fecha.

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
