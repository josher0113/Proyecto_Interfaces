# Propuesta de solución · Borrador del reporte

LinguaPlay LSM propone una ruta de estudio y práctica para personas que empiezan a aprender Lengua de Señas Mexicana. El objetivo del piloto es que la persona pueda observar y distinguir las configuraciones de A, B y C del alfabeto manual, y comprobar su identificación en un ejercicio breve.

## Requisitos y estado

| Requisito | Criterio de comprobación | Estado |
| --- | --- | --- |
| Consultar demostraciones del abecedario | Cada una de las 27 fichas muestra una foto o un video local y el crédito de la fuente. | Implementado. |
| Recibir retroalimentación | El ejercicio solicita tres respuestas, comunica los aciertos, permite reintentar y confirma la finalización. | Implementado en el piloto. |
| Retomar y consultar el avance | La aplicación recupera el progreso después de regresar o recargar. | Pendiente. La finalización del piloto se conserva durante la visita. |
| Introducir una consulta mediante voz | La frase dictada aparece en español en un campo editable, con estados para permisos y errores. | Pendiente. |
| Practicar con una interacción gestual | El sistema usa la cámara para reconocer configuraciones acordadas y ofrece retroalimentación. | Pendiente. |

## Arquitectura e infraestructura

El piloto usa HTML, CSS, JavaScript y archivos multimedia locales. La navegación por fragmentos de URL abre cada ficha y el ejercicio en un navegador de escritorio o móvil. El formulario comprueba las respuestas en el dispositivo. Las imágenes y videos se guardan junto con el prototipo para poder estudiar las fichas sin conexión.

Para cumplir el requisito académico de dos interacciones adicionales, el **dictado** usará un dispositivo con micrófono para introducir consultas en español. La **práctica gestual** usará una cámara para ensayar las configuraciones con retroalimentación. Ambas modalidades se evaluarán por separado. Queda por definir la compatibilidad de navegador, el manejo de permisos y el método de reconocimiento.

## Material del piloto

Las fotos y los videos proceden del recurso educativo abierto *LSM Biblioteca: Alfabeto de Lengua de Señas Mexicana*, de la Biblioteca Universitaria UABCS (2025). La fuente acredita el material del alfabeto a Yahilyn Rodriguez, Michelle Bocanegra y Kenya Sanchez e informa que contó con asesoría de profesionales y de la comunidad sorda. Se redimensionaron las 21 fotografías y se conservó el formato original de los seis videos. El material conserva su licencia CC BY-SA 4.0. [Recurso original](https://biblio.uabcs.mx/recursosedu/lsm/) · [Licencia](https://creativecommons.org/licenses/by-sa/4.0/)

### Sustitución por material del equipo

En `Manuel`, los archivos están en `assets/abecedario/` y se identifican por letra. Al incorporar una toma propia, registrar quién la realizó, quién revisó la seña y qué permiso tiene el proyecto para publicarla. Ajustar el crédito de esa ficha y conservar la atribución de los archivos de la UABCS que sigan en uso. Si una letra cambia de foto a video o viceversa, actualizar el conjunto `motionLetters` en `app.js`. Verificar la visualización en móvil y escritorio y, cuando cambien A, B o C, comprobar también el ejercicio.
