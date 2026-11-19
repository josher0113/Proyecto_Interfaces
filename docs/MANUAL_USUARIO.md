# Manual de usuario · Prototipo de interfaces

Este borrador describe el prototipo de LinguaPlay LSM en `Manuel`, incluido el reconocimiento del abecedario en la revisión `c45788d`.

| Pantalla | Cómo usarla |
| --- | --- |
| Bienvenida | Selecciona **Comenzar** para entrar a Inicio. |
| Inicio | Usa **Explorar abecedario** para entrar al índice o **Abrir traductor** para ir a la consulta. |
| Aprender | Usa **Explorar abecedario** para consultar las letras o **Ver unidad** para abrir otra unidad en vista previa. |
| Abecedario | Elige cualquiera de las 27 letras. La etiqueta **Foto** o **Video** indica el tipo de demostración. Desde el índice también puedes abrir el **Ejercicio de A, B y C**. |
| Lección | Usa **Anterior** y **Siguiente** para pasar de una letra a otra. Las fichas con video tienen controles de reproducción integrados. Para volver al índice, selecciona **Abecedario**. |
| Ejercicio | Selecciona una letra por cada configuración de la mano y pulsa **Comprobar respuestas**. Puedes corregir tus opciones o usar **Repasar desde A**. |
| Práctica | Consulta la referencia junto a tu cámara y registra un acierto en cualquiera de las 27 letras. Usa **Volver a la lección** para regresar a la ficha. |
| Traductor | Escribe una frase y selecciona **Traducir** para consultar el estado de la demostración. |
| Progreso | Consulta el número de letras aprendidas y los días registrados por letra. Selecciona una letra para volver a practicarla. Las estadísticas generales son de ejemplo. |

En escritorio, los apartados principales aparecen en la barra lateral. En móvil, aparecen en la barra inferior. Usa **Tab** y **Mayús + Tab** para recorrer los controles. Al principio de la página, **Saltar al contenido** lleva al área principal. Al cambiar de pantalla, el foco pasa al contenido de la nueva vista.

## Comprobación de navegación

Se ejecutó una prueba automatizada en Microsoft Edge con anchos de 320, 390, 800, 801 y 1280 píxeles. Se comprobó que las siete vistas se cargaran sin desbordamiento horizontal y que cada vista interna tuviera una sección de navegación activa. También se probaron el enlace de salto con Tab y Enter, el foco tras entrar en Inicio y la apertura y el retorno de las cuatro unidades de vista previa.

Quedan pendientes las pruebas con lector de pantalla, con un dispositivo táctil y la revisión visual de contraste.

## Completar la lección piloto

Recorre las fichas de A, B y C con **Siguiente**. En la letra C o en el índice, selecciona **Ejercicio de A, B y C**. El formulario pide una respuesta por imagen y permite volver a intentar tras ver el resultado. Al acertar las tres, aparece **Lección completada** y puedes volver a la ruta. Durante esa visita, la unidad muestra **Piloto completado**. Recargar la página reinicia este estado.

En Edge se comprobaron la carga de las tres fotos, la validación de respuestas obligatorias, el reintento tras un error, la finalización y el regreso a Aprender. También se verificó que el ejercicio se cargara sin desplazamiento horizontal en los cinco anchos indicados arriba.

Se comprobó además que se abren las 27 fichas desde el índice, cargan las 21 fotografías y se reproducen los videos de J, Ñ, P, Q, X y Z en Edge.

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
