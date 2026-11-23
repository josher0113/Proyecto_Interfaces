# Manual de usuario · Prototipo de interfaces

Este borrador describe el prototipo de Conecta LSM en `Manuel`, incluido el dictado de la revisión `dadb59a`.

| Pantalla | Cómo usarla |
| --- | --- |
| Bienvenida | Selecciona **Comenzar** para entrar a Inicio. |
| Inicio | Usa **Explorar abecedario** para entrar al índice o **Abrir traductor** para ir a la consulta. |
| Aprender | Selecciona **Explorar números** para consultar las fichas del 1 al 10 o **Explorar abecedario** para consultar las letras. Selecciona **Explorar saludos**, **Explorar expresiones** o **Explorar frases** para ver las fichas y practicar. |
| Abecedario | Elige cualquiera de las 27 letras. La etiqueta **Foto** o **Video** indica el tipo de demostración. Desde el índice también puedes abrir el **Ejercicio de A, B y C**. |
| Lección | Usa **Anterior** y **Siguiente** para cambiar de ficha. El enlace situado arriba del título vuelve al índice de su unidad. |
| Ejercicio | Selecciona una letra por cada configuración de la mano y pulsa **Comprobar respuestas**. Puedes corregir tus opciones o usar **Repasar desde A**. |
| Práctica | Consulta la referencia junto a tu cámara. En Abecedario y Números, registra un acierto cuando la seña coincida. En Saludos, Expresiones y Frases, usa la cámara como espejo para comparar tu ejecución. Selecciona **Volver a la lección** para regresar a la ficha. |
| Traductor | Escribe o dicta una frase en español. Revisa el texto y pulsa **Traducir** para ver cómo se escribe en SignWriting una expresión del catálogo. |
| Progreso | Consulta el avance del abecedario y de Números. Selecciona una ficha para volver a practicar. Las estadísticas generales son de ejemplo. |

En escritorio, los apartados principales aparecen en la barra lateral. En móvil, aparecen en la barra inferior. Usa **Tab** y **Mayús + Tab** para recorrer los controles. Al principio de la página, **Saltar al contenido** lleva al área principal. Al cambiar de pantalla, el foco pasa al contenido de la nueva vista.

## Comprobación de navegación

Se ejecutó una prueba automatizada en Microsoft Edge con anchos de 320, 390, 800, 801 y 1280 píxeles. Se comprobó que las siete vistas se cargaran sin desbordamiento horizontal y que cada vista interna tuviera una sección de navegación activa. También se probaron el enlace de salto con Tab y Enter, el foco tras entrar en Inicio y la apertura y el retorno de las cuatro unidades de vista previa.

Quedan pendientes las pruebas con lector de pantalla, con un dispositivo táctil y la revisión visual de contraste.

## Completar la lección piloto

Recorre las fichas de A, B y C con **Siguiente**. En la letra C o en el índice, selecciona **Ejercicio de A, B y C**. El formulario pide una respuesta por imagen y permite volver a intentar tras ver el resultado. Al acertar las tres, aparece **Lección completada** y puedes volver a la ruta. Durante esa visita, la unidad muestra **Piloto completado**. Recargar la página reinicia este estado.

En Edge se comprobaron la carga de las tres fotos, la validación de respuestas obligatorias, el reintento tras un error, la finalización y el regreso a Aprender. También se verificó que el ejercicio se cargara sin desplazamiento horizontal en los cinco anchos indicados arriba.

Se comprobó además que se abren las 27 fichas desde el índice, cargan las 21 fotografías y se reproducen los videos de J, Ñ, P, Q, X y Z en Edge.

## Practicar Números con la cámara

1. En **Aprender**, selecciona **Explorar números** y elige una ficha del **1 al 10**. Observa las fotos en orden y lee las indicaciones.
2. Selecciona **Ir a práctica con cámara** y pulsa **Activar cámara**. Mantén la posición para las señas del 1 al 8. En el 9 y el 10, coloca la mano en la posición inicial, pulsa **Evaluar movimiento** y haz la seña completa cuando se muestre **Evaluando…**.
3. Cuando la app confirme una coincidencia con la ficha, pulsa **Registrar práctica**. Si el resultado es incierto o corresponde a otro número, revisa la referencia y vuelve a intentar. Si aparece el aviso de que debes recargar la página, actualízala y vuelve a activar la cámara.

El verde **Aprendido** se obtiene al registrar un acierto por número en tres fechas locales distintas. Puedes saltarte días. La práctica se guarda en ese navegador y dirección. Puedes consultar las fotos al abrir `index.html` directamente. Usa HTTPS o `localhost` para activar el reconocimiento y guardar el progreso.

## Practicar Saludos y Expresiones con la cámara

Para usar la cámara, abre el prototipo desde HTTPS o `localhost`.

1. En **Aprender**, selecciona **Explorar saludos** para practicar **Hola**, **Buenos días**, **Buenas tardes**, **Buenas noches**, **¿Cómo estás?** y **Adiós**. En **Explorar expresiones** encontrarás **Gracias**, **Por favor**, **Perdón**, **De nada** y **Con permiso**.
2. Lee las indicaciones y observa las fotos de referencia en orden. Cada ficha incluye su material dentro de la aplicación.
3. Selecciona **Ir a práctica con cámara**, pulsa **Activar cámara** y acepta el permiso. Repite la seña a tu ritmo y compara tu imagen en espejo con la referencia. Ajusta la posición y el movimiento antes de volver a intentarlo.
4. Selecciona **Practicar siguiente seña** para continuar. En la última ficha puedes volver al índice de la unidad. Usa **Detener cámara** en cualquier momento. La cámara se apaga al salir de la práctica.

## Practicar Frases y comunicación básica

1. En **Aprender**, selecciona **Explorar frases** y elige **Presentarse**, **Pedir ayuda** o **Invitar a participar**.
2. Lee la situación y practica las señas de apoyo con sus fotos e indicaciones. En **Presentarse**, usa **Consultar el abecedario** si necesitas repasar cómo deletrear tu nombre.
3. Selecciona **Ir a práctica con cámara** y pulsa **Activar cámara**. Usa la vista en espejo para comparar tu ejecución y ensayar la situación a tu ritmo.
4. Selecciona **Practicar siguiente seña** para cambiar de práctica. Al salir de la vista, la cámara se apaga.

## Probar la cámara

Abre el prototipo en una dirección HTTPS o desde `localhost`. Para una prueba local, si ya tienes Python, ejecuta `python -m http.server 8000 --bind 127.0.0.1` desde la carpeta del proyecto en `Manuel` y abre `http://localhost:8000`.

1. Entra en **Explorar abecedario**, abre una letra y selecciona **Ir a práctica con cámara**.
2. Pulsa **Activar cámara** y acepta el permiso del navegador. Verás el encuadre en espejo junto a la referencia.
3. Pulsa **Detener cámara** o sal de Práctica para apagarla. Si denegaste el permiso, revisa la configuración del sitio y vuelve a intentar.

La vista previa usa solo video local. En Edge con una cámara simulada se comprobó la activación sin audio, el apagado manual, la salida de Práctica, el cierre de la página, el rechazo del permiso y la liberación del video si llega después de cancelar. La prueba con cámara física y en un teléfono sigue pendiente.

### Practicar con reconocimiento

1. Abre la práctica de cualquier letra y activa la cámara. Coloca una sola mano completa dentro del encuadre.
2. Para una letra con foto, mantén la posición hasta recibir el resultado. En **J, Ñ, P, Q, X y Z**, pulsa **Evaluar movimiento**, coloca la mano en la posición inicial y haz el movimiento una vez cuando aparezca **Evaluando…**. Mantén la mano visible durante los 3.5 segundos de evaluación.
3. Si el resultado coincide con la ficha, pulsa **Registrar práctica**. Si aparece otra letra o un resultado incierto, revisa la referencia y vuelve a intentar.

El piloto usa los archivos incluidos en la aplicación. Si el modelo falla al cargar, puedes seguir viendo la cámara y reintentar apagándola y encendiéndola.

### Aprender una letra en días distintos

Se registra como máximo un acierto por letra y fecha local. Tras el primer o segundo día verás **1/3 días** o **2/3 días**. El tercer día de práctica correcta, la letra aparece en verde con la etiqueta **Aprendida** en Abecedario y Progreso. Las fechas pueden ser consecutivas o estar separadas. Puedes repasar en cualquier momento.

El avance se guarda en el mismo navegador y desde la misma dirección del sitio. Por ejemplo, `localhost` y `127.0.0.1` mantienen historiales separados. Si el navegador bloquea el almacenamiento, la pantalla avisa que la práctica queda en la visita actual.

## Consultar SignWriting en el traductor

1. En **Traductor**, escribe una expresión en español y selecciona **Traducir**. En **Expresiones disponibles** puedes elegir **Hola**, **Buenos días**, **¿Cómo estás?**, **Adiós**, **Gracias** o **Perdón**.
2. En el recuadro **SignWriting** verás la grafía y su crédito. Usa **Ver práctica relacionada** para consultar las fotos e indicaciones de la expresión dentro de Conecta LSM. La escritura corresponde a la variante del diccionario de SignPuddle.
3. Si la consulta queda fuera del catálogo, el traductor te avisa y puedes elegir una expresión disponible.

Las grafías están incluidas como imágenes locales. Puedes consultarlas por texto al abrir `index.html` directamente.

## Dictar una frase en el traductor

1. Abre Conecta LSM en HTTPS o desde `localhost`. En **Traductor**, pulsa **Dictar en español** y permite el micrófono cuando el navegador lo solicite.
2. Cuando aparezca **Escuchando**, di una frase corta. Puedes pulsar **Detener dictado** para pedir que se procese lo dicho. Mientras esperas el acceso al micrófono, **Cancelar dictado** interrumpe la solicitud.
3. El texto dictado se añade al final del campo. Puedes editarlo y pulsar **Traducir** cuando esté listo. Si la expresión está en el catálogo, verás su escritura en SignWriting y el acceso a la práctica relacionada.

Si el servicio no está disponible, puedes escribir en el mismo campo. Salir de Traductor cancela la escucha. Conecta LSM recibe el texto y el navegador puede enviar audio a su proveedor de reconocimiento. [API de reconocimiento de voz](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
