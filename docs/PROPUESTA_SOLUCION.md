# Propuesta de solución · Borrador del reporte

LinguaPlay LSM propone una ruta de estudio y práctica para personas que empiezan a aprender Lengua de Señas Mexicana. El objetivo del piloto es que la persona pueda observar y distinguir las configuraciones de A, B y C del alfabeto manual, y comprobar su identificación en un ejercicio breve.

## Requisitos y estado

| Requisito | Criterio de comprobación | Estado |
| --- | --- | --- |
| Consultar demostraciones de A, B y C | Cada ficha muestra la fotografía, una descripción y el crédito de la fuente. | Implementado en el piloto. |
| Recibir retroalimentación | El ejercicio solicita tres respuestas, comunica los aciertos, permite reintentar y confirma la finalización. | Implementado en el piloto. |
| Retomar y consultar el avance | La aplicación recupera el progreso después de regresar o recargar. | Pendiente. La finalización del piloto se conserva durante la visita. |
| Introducir una consulta mediante voz | La frase dictada aparece en español en un campo editable, con estados para permisos y errores. | Pendiente. |
| Practicar con una interacción gestual | El sistema usa la cámara para reconocer configuraciones acordadas y ofrece retroalimentación. | Pendiente. |

## Arquitectura e infraestructura

El piloto usa HTML, CSS, JavaScript y fotografías locales. La navegación por fragmentos de URL abre cada ficha y el ejercicio en un navegador de escritorio o móvil. El formulario comprueba las respuestas en el dispositivo. Las imágenes se guardan junto con el prototipo para poder estudiar las fichas sin conexión.

Para cumplir el requisito académico de dos interacciones adicionales, el **dictado** usará un dispositivo con micrófono para introducir consultas en español. La **práctica gestual** usará una cámara para ensayar las configuraciones con retroalimentación. Ambas modalidades se evaluarán por separado. Queda por definir la compatibilidad de navegador, el manejo de permisos y el método de reconocimiento.

## Material del piloto

Las fotografías proceden del recurso educativo abierto *LSM Biblioteca: Alfabeto de Lengua de Señas Mexicana*, de la Biblioteca Universitaria UABCS (2025). La fuente acredita el material del alfabeto a Yahilyn Rodriguez, Michelle Bocanegra y Kenya Sanchez e informa que contó con asesoría de profesionales y de la comunidad sorda. Se redimensionaron las tres fotografías y se conserva su licencia CC BY-SA 4.0. [Recurso original](https://biblio.uabcs.mx/recursosedu/lsm/) · [Licencia](https://creativecommons.org/licenses/by-sa/4.0/)
