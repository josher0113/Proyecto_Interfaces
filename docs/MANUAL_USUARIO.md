# Manual de usuario · Prototipo de interfaces

Este borrador describe el prototipo de LinguaPlay LSM en la rama `Manuel`, incluida la lección piloto de la revisión `5c6f082`.

| Pantalla | Cómo usarla |
| --- | --- |
| Bienvenida | Selecciona **Comenzar** para entrar a Inicio. |
| Inicio | Usa **Comenzar lección** para abrir la letra A o **Abrir traductor** para ir a la consulta. |
| Aprender | Usa **Comenzar piloto** para estudiar A, B y C o **Ver unidad** para abrir otra unidad en vista previa. |
| Lección | Usa **Anterior** y **Siguiente** para recorrer los pasos, **Ir a práctica** para ver el encuadre o **Ruta de aprendizaje** para regresar. |
| Ejercicio | Selecciona una letra por cada configuración de la mano y pulsa **Comprobar respuestas**. Puedes corregir tus opciones o usar **Repasar desde A**. |
| Práctica | En el piloto puedes consultar la fotografía de la letra. Usa **Volver a la lección** para retomar el mismo paso. |
| Traductor | Escribe una frase y selecciona **Traducir** para consultar el estado de la demostración. |
| Progreso | Consulta la racha, los logros y el calendario de ejemplo. |

En escritorio, los apartados principales aparecen en la barra lateral. En móvil, aparecen en la barra inferior. Usa **Tab** y **Mayús + Tab** para recorrer los controles. Al principio de la página, **Saltar al contenido** lleva al área principal. Al cambiar de pantalla, el foco pasa al contenido de la nueva vista.

## Comprobación de navegación

Se ejecutó una prueba automatizada en Microsoft Edge con anchos de 320, 390, 800, 801 y 1280 píxeles. Se comprobó que las siete vistas se cargaran sin desbordamiento horizontal y que cada vista interna tuviera una sección de navegación activa. También se probaron el enlace de salto con Tab y Enter, el foco tras entrar en Inicio y la apertura y el retorno de las cuatro unidades de vista previa.

Quedan pendientes las pruebas con lector de pantalla, con un dispositivo táctil y la revisión visual de contraste.

## Completar la lección piloto

Recorre las fichas de A, B y C con **Siguiente**. En la letra C, selecciona **Ir al ejercicio**. El formulario pide una respuesta por imagen y permite volver a intentar tras ver el resultado. Al acertar las tres, aparece **Lección completada** y puedes volver a la ruta. Durante esa visita, la unidad muestra **Piloto completado**. Recargar la página reinicia este estado.

En Edge se comprobaron la carga de las tres fotos, la validación de respuestas obligatorias, el reintento tras un error, la finalización y el regreso a Aprender. También se verificó que el ejercicio se cargara sin desplazamiento horizontal en los cinco anchos indicados arriba.
