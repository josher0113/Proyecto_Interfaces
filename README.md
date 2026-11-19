# LinguaPlay LSM

LinguaPlay LSM es un proyecto educativo para empezar a aprender Lengua de Señas Mexicana (LSM). Propone una ruta de lecciones breves, práctica guiada y un espacio de consulta de expresiones. El objetivo es facilitar el estudio autónomo y ayudar a que cada persona pueda retomar su avance.

## Probar el prototipo

Para probar la versión actual, cambia a `Manuel`. Puedes abrir `index.html` directamente para recorrer el prototipo. Sirve esa misma carpeta mediante `localhost` o HTTPS para probar la cámara y el dictado. Los pasos están en el [manual](docs/MANUAL_USUARIO.md).

1. En la bienvenida, selecciona **Comenzar** para entrar al inicio.
2. En **Aprender**, abre una unidad y recorre sus pasos o entra a **Práctica** desde una lección.
3. En **Traductor**, escribe o dicta una frase en español, revisa el texto y selecciona **Traducir** para ver el estado de la consulta.
4. En **Progreso**, consulta las estadísticas, los logros y el calendario con datos de ejemplo.

## Métodos de trabajo

- **Prototipado por etapas.** La primera versión reúne siete pantallas enlazadas para revisar el recorrido, la claridad de los controles y la retroalimentación. El diseño usa navegación lateral en escritorio y navegación inferior en móvil.
- **Implementación web estática.** HTML define la entrada, CSS adapta el diseño a distintos tamaños y JavaScript organiza las vistas, reutiliza componentes y gestiona la navegación mediante el fragmento de URL.
- **Contenido educativo validado.** Las demostraciones de señas se incorporarán después de revisar sus fuentes. El traductor educativo se planteará como un catálogo de expresiones validadas que respete la gramática de la LSM.
- **Interacción por voz y gestos.** Traductor usa el servicio de voz del navegador para introducir texto en español de México. Práctica reconoce experimentalmente las 27 letras del abecedario y registra el avance por días. La validación con participantes y dispositivos físicos sigue pendiente.

## Archivos y seguimiento

| Archivo | Contenido |
| --- | --- |
| [index.html](index.html) | Entrada del prototipo |
| [styles.css](styles.css) | Identidad visual y diseño adaptable |
| [app.js](app.js) | Vistas, navegación y datos de ejemplo |
| [Bitácora](CHANGELOG.md) | Cambios registrados desde el prototipo inicial |
| [Pendientes](docs/PENDIENTES.md) | Trabajo por completar y criterios de revisión |
| [Manual de usuario](docs/MANUAL_USUARIO.md) | Recorrido del prototipo y comprobaciones de navegación |
| [Propuesta de solución](docs/PROPUESTA_SOLUCION.md) | Requisitos, arquitectura, infraestructura y fuentes del piloto |
